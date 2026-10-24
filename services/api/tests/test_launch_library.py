import httpx
import pytest

from app.clients.launch_library import LaunchLibraryError, get_upcoming_launches, parse_launch


def test_parse_launch_normalizes_an_upstream_launch() -> None:
    launch = parse_launch(
        {
            "id": "launch-123",
            "name": "Example rocket | Example mission",
            "net": "2026-10-20T12:00:00Z",
            "status": {"name": "Go"},
            "launch_service_provider": {"name": "Example Space Agency"},
            "rocket": {"configuration": {"full_name": "Example Rocket"}},
            "url": "https://ll.thespacedevs.com/2.3.0/launches/launch-123/",
            "mission": {"name": "Example mission", "description": "A science mission."},
            "pad": {"name": "Pad A", "location": {
                "name": "Example spaceport", "timezone_name": "America/Los_Angeles"
            }},
            "window_start": "2026-10-20T12:00:00Z",
            "window_end": "2026-10-20T13:00:00Z",
        }
    )

    assert launch.id == "launch-123"
    assert launch.status == "Go"
    assert launch.agency == "Example Space Agency"
    assert launch.vehicle == "Example Rocket"
    assert launch.source_url == "https://ll.thespacedevs.com/2.3.0/launches/launch-123/"
    assert launch.mission_name == "Example mission"
    assert launch.mission_description == "A science mission."
    assert launch.pad_name == "Pad A"
    assert launch.location_name == "Example spaceport"
    assert launch.launch_timezone == "America/Los_Angeles"
    assert launch.window_start.isoformat() == "2026-10-20T12:00:00+00:00"
    assert launch.window_end.isoformat() == "2026-10-20T13:00:00+00:00"


@pytest.mark.parametrize("optional_fields", [{}, {"mission": None, "pad": None}, {
    "mission": {"description": ""}, "pad": {"location": None},
    "window_start": None, "window_end": None,
}])
def test_missing_mission_details_remain_unknown(optional_fields) -> None:
    launch = parse_launch({
        "id": "unknown-details", "name": "Example", "net": "2026-10-20T12:00:00Z",
        **optional_fields,
    })
    assert launch.mission_name is None
    assert launch.mission_description is None
    assert launch.pad_name is None
    assert launch.location_name is None
    assert launch.launch_timezone is None
    assert launch.window_start is None
    assert launch.window_end is None


def test_rate_limit_preserves_retry_after_without_retrying(monkeypatch) -> None:
    calls = []

    def limited_get(url, **kwargs):
        calls.append(url)
        return httpx.Response(429, headers={"Retry-After": "3600"})

    monkeypatch.setattr("app.clients.launch_library.httpx.get", limited_get)
    with pytest.raises(LaunchLibraryError) as error:
        get_upcoming_launches()
    assert error.value.retry_after == "3600"
    assert len(calls) == 1


def test_vehicle_image_is_preferred_and_attribution_preserved() -> None:
    image = {
        "name": "Falcon 9 liftoff",
        "image_url": "https://images.example.com/falcon.jpg",
        "credit": "SpaceX",
        "license": {"name": "CC BY-NC 2.0", "link": "https://creativecommons.org/licenses/by-nc/2.0/"},
    }
    launch = parse_launch({
        "id": "image-example", "name": "Falcon 9 | Example", "net": "2099-01-01T12:00:00Z",
        "rocket": {"configuration": {"image": image}},
        "image": {"image_url": "https://images.example.com/mission.jpg"},
    })
    assert launch.image_url == image["image_url"]
    assert launch.image_credit == "SpaceX"
    assert launch.image_license == "CC BY-NC 2.0"
    assert launch.image_license_url == "https://creativecommons.org/licenses/by-nc/2.0/"
    assert launch.image_kind == "vehicle"
    assert launch.image_title == "Falcon 9 liftoff"


@pytest.mark.parametrize("vehicle_image", [None, "invalid", {
    "image_url": "javascript:alert(1)"
}])
def test_invalid_or_missing_vehicle_image_uses_mission_image(vehicle_image) -> None:
    launch = parse_launch({
        "id": "image-fallback", "name": "Example", "net": "2099-01-01T12:00:00Z",
        "rocket": {"configuration": {"image": vehicle_image}},
        "image": {"image_url": "https://images.example.com/mission.jpg", "license": None},
    })
    assert launch.image_kind == "launch"
    assert launch.image_url == "https://images.example.com/mission.jpg"
    assert launch.image_license is None


def test_missing_or_unsafe_image_remains_unknown() -> None:
    launch = parse_launch({
        "id": "no-image", "name": "Example", "net": "2099-01-01T12:00:00Z",
        "image": {"image_url": "data:text/html,unsafe"},
    })
    assert launch.image_url is None
    assert launch.image_kind is None


def test_video_links_are_validated_deduplicated_and_not_inferred_from_launch_time():
    launch = parse_launch({
        "id": "stream", "name": "Mission", "net": "2026-01-01T12:00:00Z",
        "webcast_live": True,
        "vid_urls": [None, {"url": "javascript:alert(1)"},
                     {"url": "https://user:pass@example.com/video"},
                     {"url": "https://example.com/watch", "publisher": "Channel", "live": False,
                      "start_time": "2099-01-01T12:00:00Z", "priority": 1},
                     {"url": "https://example.com/watch", "live": True},
                     {"url": "https://example.com/other", "live": "true", "start_time": "invalid"}],
        "info_urls": [{"url": "https://example.com/mission", "title": "Mission page"}],
    })
    assert len(launch.streams) == 2
    assert launch.streams[0]["live"] is False
    assert launch.streams[0]["publisher"] == "Channel"
    assert launch.streams[1]["live"] is None
    assert launch.streams[1]["start_time"] is None
    assert launch.mission_links[0]["title"] == "Mission page"


def test_sync_requests_detailed_mode_once(monkeypatch):
    calls = []

    def get(url, **kwargs):
        calls.append(kwargs)
        return httpx.Response(200, json={"results": []}, request=httpx.Request("GET", url))

    monkeypatch.setattr("app.clients.launch_library.httpx.get", get)
    assert get_upcoming_launches() == []
    assert len(calls) == 1
    assert calls[0]["params"]["mode"] == "detailed"


@pytest.mark.parametrize("failure", ["timeout", "network", 500, 502, 503, 504])
def test_transient_failure_retries_once_then_recovers(monkeypatch, caplog, failure):
    calls, sleeps = [], []

    def get(url, **kwargs):
        calls.append(kwargs)
        request = httpx.Request("GET", url)
        if len(calls) == 1:
            if failure == "timeout":
                raise httpx.ReadTimeout("secret body must not be logged", request=request)
            if failure == "network":
                raise httpx.ConnectError("secret", request=request)
            return httpx.Response(failure, request=request)
        return httpx.Response(200, json={"results": []}, request=request)

    monkeypatch.setattr("app.clients.launch_library.httpx.get", get)
    monkeypatch.setattr("app.clients.launch_library.time.sleep", sleeps.append)
    assert get_upcoming_launches() == []
    assert len(calls) == 2
    assert sleeps == [5]
    assert "secret" not in caplog.text
    assert "retry=True" in caplog.text


@pytest.mark.parametrize("status", [400, 401, 403, 404, 429, 501])
def test_non_transient_http_errors_never_retry(monkeypatch, status):
    calls = []

    def get(url, **kwargs):
        calls.append(url)
        return httpx.Response(status, request=httpx.Request("GET", url))

    monkeypatch.setattr("app.clients.launch_library.httpx.get", get)
    with pytest.raises(LaunchLibraryError) as error:
        get_upcoming_launches()
    assert error.value.http_status == status
    assert len(calls) == 1


def test_repeated_timeout_stops_after_two_attempts(monkeypatch):
    calls = []

    def get(url, **kwargs):
        calls.append(url)
        raise httpx.ReadTimeout("private")

    monkeypatch.setattr("app.clients.launch_library.httpx.get", get)
    monkeypatch.setattr("app.clients.launch_library.time.sleep", lambda _: None)
    with pytest.raises(LaunchLibraryError) as error:
        get_upcoming_launches()
    assert error.value.category == "timeout"
    assert len(calls) == 2


@pytest.mark.parametrize("payload", [{}, {"results": {}}, {"results": [None]},
                                    {"results": [{"id": "incomplete"}]}])
def test_invalid_payload_is_classified_without_retry(monkeypatch, payload):
    calls = []

    def get(url, **kwargs):
        calls.append(url)
        return httpx.Response(200, json=payload, request=httpx.Request("GET", url))

    monkeypatch.setattr("app.clients.launch_library.httpx.get", get)
    with pytest.raises(LaunchLibraryError) as error:
        get_upcoming_launches()
    assert error.value.category == "invalid_payload"
    assert len(calls) == 1


def test_service_retry_after_is_deferred_to_shared_cooldown(monkeypatch):
    calls = []

    def get(url, **kwargs):
        calls.append(url)
        return httpx.Response(503, headers={"Retry-After": "3600"},
                              request=httpx.Request("GET", url))

    monkeypatch.setattr("app.clients.launch_library.httpx.get", get)
    with pytest.raises(LaunchLibraryError) as error:
        get_upcoming_launches()
    assert error.value.retry_after == "3600"
    assert len(calls) == 1

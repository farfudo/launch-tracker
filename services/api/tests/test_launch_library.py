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

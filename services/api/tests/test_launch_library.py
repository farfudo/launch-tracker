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
            "pad": {"name": "Pad A", "location": {"name": "Example spaceport"}},
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

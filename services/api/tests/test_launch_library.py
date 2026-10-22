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
        }
    )

    assert launch.id == "launch-123"
    assert launch.status == "Go"
    assert launch.agency == "Example Space Agency"
    assert launch.vehicle == "Example Rocket"
    assert launch.source_url == "https://ll.thespacedevs.com/2.3.0/launches/launch-123/"


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

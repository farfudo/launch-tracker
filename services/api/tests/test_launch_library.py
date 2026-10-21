from app.clients.launch_library import parse_launch


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

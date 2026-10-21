from app.clients.launch_library import LaunchSummary
from app.models import Launch
from app.repositories import upsert_launches


def test_health_returns_ok(client) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_launches_exposes_the_cached_contract(client, db_session) -> None:
    upsert_launches(
        db_session,
        [
            LaunchSummary(
                id="example-launch-1",
                name="Example mission",
                status="Go",
                net="2026-10-20T12:00:00Z",
                agency="Example agency",
                vehicle="Example rocket",
            )
        ],
    )
    response = client.get("/api/v1/launches")

    assert response.status_code == 200
    launch = response.json()[0]
    assert {"id", "name", "status", "net", "agency", "vehicle", "source_updated_at"} <= launch.keys()


def test_launches_can_be_searched_filtered_and_opened(client, db_session) -> None:
    upsert_launches(
        db_session,
        [
            LaunchSummary(
                id="example-launch-search",
                name="Artemis demonstration",
                status="Go",
                net="2026-10-22T12:00:00Z",
                agency="NASA",
                vehicle="SLS",
            ),
            LaunchSummary(
                id="example-launch-other",
                name="Commercial mission",
                status="Go",
                net="2026-10-23T12:00:00Z",
                agency="Example agency",
                vehicle="Example rocket",
            ),
        ],
    )

    response = client.get("/api/v1/launches", params={"q": "Artemis", "agency": "NASA"})

    assert response.status_code == 200
    assert [launch["id"] for launch in response.json()] == ["example-launch-search"]
    assert client.get("/api/v1/launches/example-launch-search").status_code == 200
    assert client.get("/api/v1/launches/missing").status_code == 404
    assert client.get("/api/v1/launches/filter-options").json() == {
        "agencies": ["Example agency", "NASA"],
        "vehicles": ["Example rocket", "SLS"],
    }


def test_sync_populates_the_cache(client, db_session, monkeypatch) -> None:
    monkeypatch.setattr(
        "app.main.get_upcoming_launches",
        lambda *, limit: [
            LaunchSummary(
                id="example-launch-2",
                name="Synced mission",
                status="Go",
                net="2026-10-21T12:00:00Z",
            )
        ],
    )

    response = client.post("/api/v1/launches/sync")

    assert response.status_code == 200
    assert response.json() == {"imported": 1}
    assert db_session.get(Launch, "example-launch-2") is not None

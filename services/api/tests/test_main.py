from datetime import UTC, datetime, timedelta

from app.clients.launch_library import LaunchSummary
from app.models import Launch
from app.repositories import upsert_launches


def test_health_returns_ok(client) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_mission_details_are_persisted_and_updated(client, db_session) -> None:
    summary = LaunchSummary(
        id="mission-detail", name="Example launch", status="Go", net="2099-01-01T12:00:00Z",
        mission_name="Science mission", mission_description="First description.",
        pad_name="Pad 1", location_name="Example spaceport",
        window_start="2099-01-01T12:00:00Z", window_end="2099-01-01T13:00:00Z",
    )
    upsert_launches(db_session, [summary])
    db_session.expire_all()
    detail = client.get("/api/v1/launches/mission-detail").json()
    assert detail["mission_description"] == "First description."
    assert detail["mission_name"] == "Science mission"
    assert detail["location_name"] == "Example spaceport"
    assert detail["pad_name"] == "Pad 1"
    assert detail["window_start"].startswith("2099-01-01T12:00:00")
    assert detail["window_end"].startswith("2099-01-01T13:00:00")
    assert "mission_description" not in client.get("/api/v1/launches").json()[0]

    summary.mission_description = "Updated description."
    summary.window_end = None
    upsert_launches(db_session, [summary])
    db_session.expire_all()
    updated = client.get("/api/v1/launches/mission-detail").json()
    assert updated["mission_description"] == "Updated description."
    assert updated["window_end"] is None


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
    assert {
        "id", "name", "status", "net", "agency", "vehicle", "source_url", "source_updated_at"
    } <= launch.keys()
    detail = client.get("/api/v1/launches/example-launch-1").json()
    assert detail["mission_description"] is None
    assert detail["location_name"] is None
    assert detail["window_start"] is None


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
    monkeypatch.setenv("SYNC_TOKEN", "test-only-token")
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

    response = client.post("/api/v1/launches/sync", headers={"X-Sync-Token": "test-only-token"})

    assert response.status_code == 200
    assert response.json() == {"imported": 1}
    assert db_session.get(Launch, "example-launch-2") is not None



def test_public_requests_cannot_trigger_upstream_sync(client, monkeypatch) -> None:
    def unexpected_fetch(**kwargs):
        raise AssertionError("Unauthorized requests must not call the external provider")

    monkeypatch.setattr("app.main.get_upcoming_launches", unexpected_fetch)
    monkeypatch.delenv("SYNC_TOKEN", raising=False)
    assert client.post("/api/v1/launches/sync").status_code == 503
    monkeypatch.setenv("SYNC_TOKEN", "test-only-token")
    assert client.post("/api/v1/launches/sync").status_code == 401
    assert client.post(
        "/api/v1/launches/sync", headers={"X-Sync-Token": "wrong-token"}
    ).status_code == 401


def test_data_status_distinguishes_empty_fresh_and_stale_cache(client, db_session) -> None:
    empty = client.get("/api/v1/data-status").json()
    assert empty["cached_launches"] == 0
    assert empty["last_updated_at"] is None
    assert empty["stale"] is True

    upsert_launches(db_session, [LaunchSummary(
        id="status-example", name="Example", status="Go", net="2099-01-01T12:00:00Z"
    )])
    fresh = client.get("/api/v1/data-status").json()
    assert fresh["cached_launches"] == 1
    assert fresh["last_updated_at"] is not None
    assert fresh["stale"] is False

    launch = db_session.get(Launch, "status-example")
    launch.source_updated_at = datetime.now(UTC) - timedelta(hours=7)
    db_session.commit()
    assert client.get("/api/v1/data-status").json()["stale"] is True

"""Real PostgreSQL reservations; provider responses stay entirely mocked."""
import json
from datetime import UTC, datetime, timedelta
from email.utils import format_datetime

import httpx
import pytest
from sqlalchemy.orm import Session

from app.clients.launch_library import LaunchLibraryError, get_upcoming_launches, request_count
from app.models import SyncControl
from app.sync_service import sync_cache


def observations(caplog):
    return [json.loads(r.message.removeprefix("sync_observation "))
            for r in caplog.records if r.message.startswith("sync_observation ")]


@pytest.mark.parametrize("header_kind", ["seconds", "date"])
def test_retry_after_observation_matches_persisted_shared_deadline(
        pg_database, monkeypatch, caplog, header_kind):
    engine, _ = pg_database
    monkeypatch.setenv("SYNC_MIN_INTERVAL_SECONDS", "2700")
    monkeypatch.setenv("SYNC_FALLBACK_MIN_AGE_SECONDS", "5400")
    start = datetime.now(UTC)
    header = "7200" if header_kind == "seconds" else format_datetime(
        start + timedelta(hours=2), usegmt=True)
    calls = []

    def get(url, **kwargs):
        calls.append(1)
        return httpx.Response(429, headers={"Retry-After": header},
                              request=httpx.Request("GET", url))

    monkeypatch.setattr("app.clients.launch_library.httpx.get", get)
    with Session(engine) as db, pytest.raises(LaunchLibraryError):
        sync_cache(db, get_upcoming_launches)
    monkeypatch.delenv("SYNC_FALLBACK_MIN_AGE_SECONDS")
    with Session(engine) as db:
        deadline = db.get(SyncControl, 1).next_attempt_at
        assert deadline >= start + timedelta(seconds=7199)
        assert sync_cache(db, get_upcoming_launches).reason == "retry_wait"
    failed, skipped = observations(caplog)
    assert datetime.fromisoformat(failed["blocked_until"]) == deadline
    assert failed["retry_after"] is not None
    assert failed["ll2_requests"] == 1
    assert skipped["block"] == "retry_wait"
    assert skipped["ll2_requests"] == 0
    assert skipped["blocked_until"] == failed["blocked_until"]
    assert len(calls) == 1


def test_success_counts_two_attempts_and_cross_session_cooldown(pg_database, monkeypatch, caplog):
    engine, _ = pg_database
    monkeypatch.setenv("SYNC_MIN_INTERVAL_SECONDS", "2700")
    monkeypatch.delenv("SYNC_FALLBACK_MIN_AGE_SECONDS", raising=False)
    calls = []

    def get(url, **kwargs):
        calls.append(1)
        if len(calls) == 1:
            raise httpx.ReadTimeout("must-not-log")
        return httpx.Response(200, json={"results": [{"id": "observed", "name": "Test",
            "net": "2099-01-01T12:00:00Z", "status": {"name": "Go"}}]},
            request=httpx.Request("GET", url))

    monkeypatch.setattr("app.clients.launch_library.httpx.get", get)
    monkeypatch.setattr("app.clients.launch_library.time.sleep", lambda _: None)
    token = request_count.set(17)
    try:
        with Session(engine) as db:
            assert sync_cache(db, get_upcoming_launches).imported == 1
        assert request_count.get() == 17
        with Session(engine) as db:
            assert sync_cache(db, get_upcoming_launches).reason == "recently_updated"
        success, skipped = observations(caplog)
        assert success["imported"] == 1
        assert success["ll2_requests"] == 2
        assert skipped["block"] == "cooldown"
        assert skipped["ll2_requests"] == 0
        assert len(calls) == 2
        assert "must-not-log" not in caplog.text
    finally:
        request_count.reset(token)

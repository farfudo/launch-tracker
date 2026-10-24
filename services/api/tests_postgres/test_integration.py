from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from threading import Event
from unittest.mock import Mock

import pytest
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.clients.launch_library import LaunchLibraryError, LaunchSummary
from app.models import Launch, SyncControl
from app.repositories import upsert_launches
from app.sync_service import acquire_sync_lock, sync_cache


def mission():
    return LaunchSummary(id="test-mission", name="Saved mission", status="Go",
                         net="2099-01-01T12:00:00Z",
                         mission_links=[{"kind": "agency", "url": "https://example.com"}])


def test_real_migration_chain_is_repeatable_and_preserves_launch(pg_database):
    engine, migrate = pg_database
    with Session(engine) as db:
        upsert_launches(db, [mission()])
    migrate("upgrade", "head")
    # Only the latest control-table migration is reversed; launch data must survive.
    migrate("downgrade", "-1")
    assert "sync_control" not in inspect(engine).get_table_names()
    migrate("upgrade", "head")
    assert "sync_control" in inspect(engine).get_table_names()
    with Session(engine) as db:
        assert db.get(Launch, "test-mission").mission_links[0]["kind"] == "agency"
        assert db.scalar(text("SELECT version_num FROM alembic_version")) == "20261023_07"


def test_postgresql_lock_blocks_overlapping_session(pg_database):
    engine, _ = pg_database
    fetch = Mock()
    with Session(engine) as first, Session(engine) as second:
        assert acquire_sync_lock(first)
        assert sync_cache(second, fetch).reason == "in_progress"
        fetch.assert_not_called()
        first.rollback()
        assert acquire_sync_lock(second)


def test_persisted_reservation_blocks_second_sync_during_network_wait(pg_database):
    engine, _ = pg_database
    started, release = Event(), Event()

    def fetch(limit):
        assert limit == 100
        started.set()
        assert release.wait(timeout=10), "Test did not release the simulated provider"
        return [mission()]

    def run_first():
        with Session(engine) as db:
            return sync_cache(db, fetch)

    with ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(run_first)
        try:
            assert started.wait(timeout=10)
            with Session(engine) as db:
                other_fetch = Mock()
                assert sync_cache(db, other_fetch).reason == "retry_wait"
                other_fetch.assert_not_called()
        finally:
            release.set()
        assert future.result(timeout=10).imported == 1
    with Session(engine) as db:
        assert db.get(SyncControl, 1).outcome == "success"
        assert sync_cache(db, Mock()).reason == "recently_updated"


def test_failure_preserves_saved_data_and_retry_after_in_another_session(pg_database):
    engine, _ = pg_database
    previous = datetime.now(UTC) - timedelta(hours=2)
    with Session(engine) as db:
        upsert_launches(db, [mission()])
        db.get(Launch, "test-mission").source_updated_at = previous
        db.commit()
        failure = Mock(side_effect=LaunchLibraryError(
            "limited", retry_after="7200", category="rate_limited", http_status=429))
        before = datetime.now(UTC)
        with pytest.raises(LaunchLibraryError):
            sync_cache(db, failure)
    with Session(engine) as db:
        saved = db.get(Launch, "test-mission")
        assert saved.name == "Saved mission"
        assert saved.source_updated_at == previous
        control = db.get(SyncControl, 1)
        assert control.outcome == "failed"
        assert control.next_attempt_at >= before + timedelta(hours=2)
        fetch = Mock()
        assert sync_cache(db, fetch).reason == "retry_wait"
        fetch.assert_not_called()

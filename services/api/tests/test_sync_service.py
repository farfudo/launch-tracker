from datetime import UTC, datetime, timedelta
from unittest.mock import Mock

import pytest

from app.clients.launch_library import LaunchLibraryError, LaunchSummary
from app.models import Launch
from app.repositories import upsert_launches
from app.sync_service import acquire_sync_lock, sync_cache


def test_lock_requires_postgresql(db_session):
    with pytest.raises(RuntimeError, match="PostgreSQL"):
        acquire_sync_lock(db_session)


@pytest.fixture
def lock(monkeypatch):
    acquire = Mock(return_value=True)
    monkeypatch.setattr("app.sync_service.acquire_sync_lock", acquire)
    return acquire


def test_busy_lock_never_calls_provider(db_session, lock):
    lock.return_value = False
    fetch = Mock()
    assert sync_cache(db_session, fetch).reason == "in_progress"
    fetch.assert_not_called()


def test_success_and_cooldown(db_session, lock):
    fetch = Mock(return_value=[LaunchSummary(
        id="guard-test", name="Test", status="Go", net="2099-01-01T12:00:00Z"
    )])
    assert sync_cache(db_session, fetch).imported == 1
    assert sync_cache(db_session, fetch).reason == "recently_updated"
    fetch.assert_called_once_with(limit=100)
    db_session.get(Launch, "guard-test").source_updated_at = datetime.now(UTC) - timedelta(hours=2)
    db_session.commit()
    assert sync_cache(db_session, fetch).imported == 1
    assert fetch.call_count == 2


def test_failure_rolls_back_and_allows_later_retry(db_session, lock, monkeypatch):
    rollback = Mock(wraps=db_session.rollback)
    monkeypatch.setattr(db_session, "rollback", rollback)
    with pytest.raises(LaunchLibraryError):
        sync_cache(db_session, Mock(side_effect=LaunchLibraryError("rate limited")))
    rollback.assert_called_once()
    assert sync_cache(db_session, Mock(return_value=[LaunchSummary(
        id="retry", name="Test", status="Go", net="2099-01-01T12:00:00Z"
    )])).imported == 1


def test_empty_result_preserves_cache(db_session, lock):
    upsert_launches(db_session, [LaunchSummary(
        id="existing", name="Test", status="Go", net="2099-01-01T12:00:00Z"
    )])
    db_session.get(Launch, "existing").source_updated_at = datetime.now(UTC) - timedelta(hours=2)
    db_session.commit()
    with pytest.raises(ValueError, match="Empty"):
        sync_cache(db_session, Mock(return_value=[]))
    assert db_session.get(Launch, "existing") is not None

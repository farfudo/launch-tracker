from datetime import UTC, datetime, timedelta
from unittest.mock import Mock

import pytest

from app.clients.launch_library import LaunchLibraryError, LaunchSummary
from app.models import Launch, SyncControl
from app.repositories import upsert_launches
from app.sync_service import acquire_sync_lock, retry_deadline, sync_cache, utc


@pytest.fixture
def clock(monkeypatch):
    class Clock(datetime):
        value = datetime(2026, 10, 26, 12, tzinfo=UTC)

        @classmethod
        def now(cls, tz=None):
            return cls.value.astimezone(tz) if tz else cls.value.replace(tzinfo=None)

    monkeypatch.setattr("app.sync_service.datetime", Clock)
    monkeypatch.setattr("app.repositories.datetime", Clock)
    monkeypatch.setenv("SYNC_MIN_INTERVAL_SECONDS", "2700")
    monkeypatch.delenv("SYNC_FALLBACK_MIN_AGE_SECONDS", raising=False)
    return Clock


def saved_mission(db, at):
    upsert_launches(db, [LaunchSummary(
        id="primary", name="Test", status="Go", net="2099-01-01T12:00:00Z"
    )])
    db.get(Launch, "primary").source_updated_at = at
    db.commit()


@pytest.mark.parametrize("age,eligible", [(5399, False), (5400, True)])
def test_fallback_age_boundary_and_shared_budget(db_session, lock, clock, monkeypatch,
                                                age, eligible):
    monkeypatch.setenv("SYNC_FALLBACK_MIN_AGE_SECONDS", "5400")
    previous = clock.value - timedelta(seconds=age)
    saved_mission(db_session, previous)
    fetch = Mock(return_value=[LaunchSummary(
        id="primary", name="Test", status="Go", net="2099-01-01T12:00:00Z"
    )])
    result = sync_cache(db_session, fetch)
    if not eligible:
        assert result.reason == "recently_updated"
        fetch.assert_not_called()
        assert db_session.get(SyncControl, 1) is None
        assert utc(db_session.get(Launch, "primary").source_updated_at) == previous
        return
    assert result.imported == 1
    assert utc(db_session.get(SyncControl, 1).next_attempt_at) == (
        clock.value + timedelta(minutes=45))
    monkeypatch.delenv("SYNC_FALLBACK_MIN_AGE_SECONDS")
    clock.value += timedelta(seconds=2699)
    assert sync_cache(db_session, fetch).reason == "recently_updated"
    assert fetch.call_count == 1
    clock.value += timedelta(seconds=1)
    assert sync_cache(db_session, fetch).imported == 1
    assert fetch.call_count == 2


@pytest.mark.parametrize("value", ["", "invalid", "0", "2699", "86401"])
def test_invalid_fallback_configuration_fails_before_lock(db_session, lock, clock,
                                                         monkeypatch, value):
    monkeypatch.setenv("SYNC_FALLBACK_MIN_AGE_SECONDS", value)
    fetch = Mock()
    with pytest.raises(ValueError):
        sync_cache(db_session, fetch)
    lock.assert_not_called()
    fetch.assert_not_called()
    assert db_session.get(SyncControl, 1) is None


@pytest.mark.parametrize("retry_after,wait", [(None, 2700), ("7200", 7200),
    ("Mon, 26 Oct 2026 14:00:00 GMT", 7200)])
def test_fallback_failure_budget_is_shared_with_primary(db_session, lock, clock,
                                                       monkeypatch, retry_after, wait):
    monkeypatch.setenv("SYNC_FALLBACK_MIN_AGE_SECONDS", "5400")
    with pytest.raises(LaunchLibraryError):
        sync_cache(db_session, Mock(side_effect=LaunchLibraryError(
            "limited", retry_after=retry_after)))
    deadline = clock.value + timedelta(seconds=wait)
    assert utc(db_session.get(SyncControl, 1).next_attempt_at) == deadline
    monkeypatch.delenv("SYNC_FALLBACK_MIN_AGE_SECONDS")
    clock.value = deadline - timedelta(seconds=1)
    fetch = Mock(return_value=[LaunchSummary(
        id="recovered", name="Test", status="Go", net="2099-01-01T12:00:00Z"
    )])
    assert sync_cache(db_session, fetch).reason == "retry_wait"
    fetch.assert_not_called()
    clock.value = deadline
    assert sync_cache(db_session, fetch).imported == 1


def test_legacy_deadline_is_not_shortened(db_session, lock, clock):
    deadline = clock.value + timedelta(minutes=90)
    db_session.add(SyncControl(id=1, last_attempt_at=clock.value,
                               next_attempt_at=deadline, outcome="success"))
    db_session.commit()
    fetch = Mock()
    assert sync_cache(db_session, fetch).reason == "recently_updated"
    fetch.assert_not_called()
    assert utc(db_session.get(SyncControl, 1).next_attempt_at) == deadline


def test_lock_requires_postgresql(db_session):
    with pytest.raises(RuntimeError, match="PostgreSQL"):
        acquire_sync_lock(db_session)


def test_legacy_interval_without_override_still_reserves_ninety_minutes(
        db_session, lock, clock, monkeypatch):
    monkeypatch.setenv("SYNC_MIN_INTERVAL_SECONDS", "5400")
    fetch = Mock(return_value=[LaunchSummary(
        id="legacy", name="Test", status="Go", net="2099-01-01T12:00:00Z"
    )])
    assert sync_cache(db_session, fetch).imported == 1
    assert utc(db_session.get(SyncControl, 1).next_attempt_at) == (
        clock.value + timedelta(minutes=90))


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
    db_session.get(SyncControl, 1).next_attempt_at = datetime.now(UTC) - timedelta(seconds=1)
    db_session.commit()
    assert sync_cache(db_session, fetch).imported == 1
    assert fetch.call_count == 2


def test_failure_rolls_back_and_blocks_immediate_retry(db_session, lock, monkeypatch):
    rollback = Mock(wraps=db_session.rollback)
    monkeypatch.setattr(db_session, "rollback", rollback)
    with pytest.raises(LaunchLibraryError):
        sync_cache(db_session, Mock(side_effect=LaunchLibraryError("rate limited")))
    rollback.assert_called_once()
    fetch = Mock()
    assert sync_cache(db_session, fetch).reason == "retry_wait"
    fetch.assert_not_called()
    db_session.get(SyncControl, 1).next_attempt_at = datetime.now(UTC) - timedelta(seconds=1)
    db_session.commit()
    assert sync_cache(db_session, Mock(return_value=[LaunchSummary(
        id="retry", name="Test", status="Go", net="2099-01-01T12:00:00Z"
    )])).imported == 1


def test_fifteen_minute_configuration_and_persisted_retry_after(db_session, lock, monkeypatch):
    monkeypatch.setenv("SYNC_MIN_INTERVAL_SECONDS", "900")
    before = datetime.now(UTC)
    with pytest.raises(LaunchLibraryError):
        sync_cache(db_session, Mock(side_effect=LaunchLibraryError("limited", retry_after="3600")))
    control = db_session.get(SyncControl, 1)
    deadline = control.next_attempt_at.replace(tzinfo=UTC)
    assert deadline >= before + timedelta(hours=1)
    db_session.expire_all()
    fetch = Mock()
    assert sync_cache(db_session, fetch).reason == "retry_wait"
    fetch.assert_not_called()


def test_interval_configuration_fails_closed(db_session, lock, monkeypatch):
    for value in ["60", "0", "invalid", "90001"]:
        monkeypatch.setenv("SYNC_MIN_INTERVAL_SECONDS", value)
        fetch = Mock()
        with pytest.raises(ValueError):
            sync_cache(db_session, fetch)
        fetch.assert_not_called()


def test_retry_after_dates_invalid_values_and_minimum():
    now = datetime(2026, 10, 23, 12, tzinfo=UTC)
    for value in [None, "bad", "-1", "1", "9" * 100]:
        assert retry_deadline(value, now, 900) == now + timedelta(minutes=15)
    assert retry_deadline("Fri, 23 Oct 2026 13:00:00 GMT", now, 900) == now + timedelta(hours=1)


def test_fallback_defers_to_recent_primary_data(db_session, lock, monkeypatch):
    monkeypatch.setenv("SYNC_MIN_INTERVAL_SECONDS", "5400")
    upsert_launches(db_session, [LaunchSummary(
        id="primary", name="Test", status="Go", net="2099-01-01T12:00:00Z"
    )])
    db_session.get(Launch, "primary").source_updated_at = datetime.now(UTC) - timedelta(minutes=60)
    db_session.commit()
    fetch = Mock()
    assert sync_cache(db_session, fetch).reason == "recently_updated"
    fetch.assert_not_called()


def test_empty_result_preserves_cache(db_session, lock):
    upsert_launches(db_session, [LaunchSummary(
        id="existing", name="Test", status="Go", net="2099-01-01T12:00:00Z"
    )])
    db_session.get(Launch, "existing").source_updated_at = datetime.now(UTC) - timedelta(hours=2)
    db_session.commit()
    with pytest.raises(ValueError, match="Empty"):
        sync_cache(db_session, Mock(return_value=[]))
    assert db_session.get(Launch, "existing") is not None


def test_exhausted_provider_retry_preserves_data_and_shared_budget(db_session, lock, monkeypatch):
    import httpx

    from app.clients.launch_library import get_upcoming_launches

    upsert_launches(db_session, [LaunchSummary(
        id="kept", name="Saved mission", status="Go", net="2099-01-01T12:00:00Z"
    )])
    old_update = datetime.now(UTC) - timedelta(hours=2)
    db_session.get(Launch, "kept").source_updated_at = old_update
    db_session.commit()
    attempts = []

    def get(url, **kwargs):
        attempts.append(url)
        raise httpx.ReadTimeout("must not leak")

    monkeypatch.setattr("app.clients.launch_library.httpx.get", get)
    monkeypatch.setattr("app.clients.launch_library.time.sleep", lambda _: None)
    with pytest.raises(LaunchLibraryError):
        sync_cache(db_session, get_upcoming_launches)
    assert len(attempts) == 2
    assert db_session.get(Launch, "kept").name == "Saved mission"
    assert db_session.get(Launch, "kept").source_updated_at.replace(tzinfo=UTC) == old_update
    assert db_session.get(SyncControl, 1).outcome == "failed"
    assert sync_cache(db_session, get_upcoming_launches).reason == "retry_wait"
    assert len(attempts) == 2

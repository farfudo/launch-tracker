"""Shared PostgreSQL transaction lock for HTTP and scheduled CLI synchronizations."""
import json
import logging
import os
from datetime import UTC, datetime, timedelta
from email.utils import parsedate_to_datetime

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.clients.launch_library import LaunchLibraryError, get_upcoming_launches, request_count
from app.models import SyncControl
from app.repositories import get_data_status, upsert_launches
from app.schemas import SyncResponse

logger = logging.getLogger(__name__)


def log_sync(**fields):
    logger.warning("sync_observation %s", json.dumps(fields, sort_keys=True))


def safe_retry_after(value):
    if not value:
        return None
    try:
        seconds = int(value)
        return seconds if 0 <= seconds <= 31536000 else "invalid"
    except (ValueError, OverflowError):
        try:
            return utc(parsedate_to_datetime(value)).isoformat()
        except (ValueError, TypeError, OverflowError):
            return "invalid"


LOCK_ID = 684923175
MIN_INTERVAL_SECONDS = 2700  # 45 minutes: primary hourly, fallback only when older.


def sync_interval() -> int:
    value = int(os.getenv("SYNC_MIN_INTERVAL_SECONDS", str(MIN_INTERVAL_SECONDS)))
    if not 900 <= value <= 86400:
        raise ValueError("Sync interval must be between 900 and 86400 seconds.")
    return value


def utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def retry_deadline(value: str | None, now: datetime, minimum: int) -> datetime:
    baseline = now + timedelta(seconds=minimum)
    if not value:
        return baseline
    try:
        seconds = int(value)
        return max(baseline, now + timedelta(seconds=max(0, seconds)))
    except (ValueError, OverflowError):
        try:
            return max(baseline, utc(parsedate_to_datetime(value)))
        except (ValueError, TypeError, OverflowError):
            return baseline


def acquire_sync_lock(db: Session) -> bool:
    if db.get_bind().dialect.name != "postgresql":
        raise RuntimeError("Protected synchronization requires PostgreSQL.")
    return bool(db.scalar(text("SELECT pg_try_advisory_xact_lock(:key)"), {"key": LOCK_ID}))


def sync_cache(db: Session, fetch_launches=get_upcoming_launches) -> SyncResponse:
    interval = sync_interval()
    # Eligibility belongs to this caller; the persisted budget remains shared.
    # Omission preserves the previous single-interval configuration contract.
    minimum_age = int(os.getenv("SYNC_FALLBACK_MIN_AGE_SECONDS", str(interval)))
    if not interval <= minimum_age <= 86400:
        raise ValueError("Fallback minimum age must be between sync interval and 86400 seconds.")
    control = None
    reserved = False
    count_token = request_count.set(0)
    try:
        if not acquire_sync_lock(db):
            db.rollback()
            log_sync(outcome="skipped", reason="in_progress", block="lock", ll2_requests=0)
            return SyncResponse(imported=0, skipped=True, reason="in_progress")
        now = datetime.now(UTC)
        control = db.get(SyncControl, 1)
        if control is not None and utc(control.next_attempt_at) > now:
            reason = "recently_updated" if control.outcome == "success" else "retry_wait"
            deadline = utc(control.next_attempt_at).isoformat()
            block = {"attempting": "reservation", "failed": "retry_wait", "success": "cooldown"}.get(control.outcome, "reservation")
            db.rollback()
            log_sync(outcome="skipped", reason=reason, block=block, blocked_until=deadline, ll2_requests=0)
            return SyncResponse(imported=0, skipped=True, reason=reason)
        last = get_data_status(db).last_updated_at
        if last is not None:
            if last.tzinfo is None:
                last = last.replace(tzinfo=UTC)
            if (now - last).total_seconds() < minimum_age:
                db.rollback()
                log_sync(outcome="skipped", reason="recently_updated", block="minimum_age", ll2_requests=0)
                return SyncResponse(imported=0, skipped=True, reason="recently_updated")
        if control is None:
            control = SyncControl(id=1)
            db.add(control)
        control.last_attempt_at = now
        control.next_attempt_at = now + timedelta(seconds=interval)
        control.outcome = "attempting"
        # Persist reservation before network I/O; releasing the advisory lock is safe:
        # every other entry point sees the same budget, even if this process crashes.
        db.commit()
        reserved = True
        launches = fetch_launches(limit=100)
        if not launches:
            raise ValueError("Empty upstream result; existing cache preserved.")
        control.outcome = "success"
        control.next_attempt_at = datetime.now(UTC) + timedelta(seconds=interval)
        imported = upsert_launches(db, launches)
        log_sync(outcome="success", imported=imported, ll2_requests=request_count.get(),
                 blocked_until=utc(control.next_attempt_at).isoformat())
        return SyncResponse(imported=imported)
    except Exception as error:
        db.rollback()
        if reserved:
            control = db.get(SyncControl, 1)
            control.outcome = "failed"
            control.next_attempt_at = retry_deadline(
                error.retry_after if isinstance(error, LaunchLibraryError) else None,
                datetime.now(UTC), interval,
            )
            db.commit()
            provider_error = error if isinstance(error, LaunchLibraryError) else None
            log_sync(outcome="failed", ll2_requests=request_count.get(),
                     category=provider_error.category if provider_error else "sync_error",
                     http_status=provider_error.http_status if provider_error else None,
                     retry_after=safe_retry_after(provider_error.retry_after if provider_error else None),
                     blocked_until=utc(control.next_attempt_at).isoformat())
        raise
    finally:
        request_count.reset(count_token)

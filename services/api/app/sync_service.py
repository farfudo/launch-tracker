"""Shared PostgreSQL transaction lock for HTTP and scheduled CLI synchronizations."""
from datetime import UTC, datetime

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.clients.launch_library import get_upcoming_launches
from app.repositories import get_data_status, upsert_launches
from app.schemas import SyncResponse

LOCK_ID = 684923175
MIN_INTERVAL_SECONDS = 2700  # 45 minutes: primary hourly, fallback only when older.


def acquire_sync_lock(db: Session) -> bool:
    if db.get_bind().dialect.name != "postgresql":
        raise RuntimeError("Protected synchronization requires PostgreSQL.")
    return bool(db.scalar(text("SELECT pg_try_advisory_xact_lock(:key)"), {"key": LOCK_ID}))


def sync_cache(db: Session, fetch_launches=get_upcoming_launches) -> SyncResponse:
    try:
        if not acquire_sync_lock(db):
            db.rollback()
            return SyncResponse(imported=0, skipped=True, reason="in_progress")
        last = get_data_status(db).last_updated_at
        if last is not None:
            if last.tzinfo is None:
                last = last.replace(tzinfo=UTC)
            if (datetime.now(UTC) - last).total_seconds() < MIN_INTERVAL_SECONDS:
                db.rollback()
                return SyncResponse(imported=0, skipped=True, reason="recently_updated")
        launches = fetch_launches(limit=100)
        if not launches:
            raise ValueError("Empty upstream result; existing cache preserved.")
        # upsert commits: data becomes visible atomically as the lock is released.
        return SyncResponse(imported=upsert_launches(db, launches))
    except Exception:
        db.rollback()  # Also releases a held transaction-level advisory lock.
        raise

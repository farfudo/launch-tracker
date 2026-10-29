"""Run daily: python -m app.feedback_retention. Never outputs feedback contents."""
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, update

from app.db import SessionLocal
from app.models import AdminSession, Feedback, FeedbackRateBucket


def purge(db, now=None):
    now = now or datetime.now(UTC)
    db.execute(delete(Feedback).where(Feedback.created_at < now - timedelta(days=180)))
    db.execute(update(Feedback).where(Feedback.created_at < now - timedelta(days=30))
               .values(name=None, email=None, payload_digest="expired"))
    db.execute(delete(FeedbackRateBucket).where(FeedbackRateBucket.expires_at < now))
    db.execute(delete(AdminSession).where(AdminSession.expires_at < now))
    db.commit()


if __name__ == "__main__":
    with SessionLocal() as session:
        purge(session)

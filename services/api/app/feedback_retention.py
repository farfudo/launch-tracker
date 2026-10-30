"""Daily retention. CLI defaults to counts only; --apply explicitly mutates data."""
import argparse
import json
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, func, or_, select, update

from app.db import SessionLocal
from app.models import AdminSession, Feedback, FeedbackRateBucket


def retention_counts(db, now=None):
    now = now or datetime.now(UTC)
    def count(model, *conditions):
        return db.scalar(select(func.count()).select_from(model).where(*conditions))
    return {
        "feedback_to_delete": count(Feedback, Feedback.created_at < now - timedelta(days=180)),
        "feedback_to_redact": count(
            Feedback, Feedback.created_at < now - timedelta(days=30),
            Feedback.created_at >= now - timedelta(days=180),
            or_(Feedback.name.is_not(None), Feedback.email.is_not(None),
                Feedback.payload_digest != "expired")),
        "expired_rate_buckets": count(FeedbackRateBucket, FeedbackRateBucket.expires_at < now),
        "expired_sessions": count(AdminSession, AdminSession.expires_at < now),
    }


def purge(db, now=None):
    now = now or datetime.now(UTC)
    db.execute(delete(Feedback).where(Feedback.created_at < now - timedelta(days=180)))
    db.execute(update(Feedback).where(Feedback.created_at < now - timedelta(days=30))
               .values(name=None, email=None, payload_digest="expired"))
    db.execute(delete(FeedbackRateBucket).where(FeedbackRateBucket.expires_at < now))
    db.execute(delete(AdminSession).where(AdminSession.expires_at < now))
    db.commit()


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Apply irreversible retention cleanup")
    args = parser.parse_args(argv)
    with SessionLocal() as session:
        now = datetime.now(UTC)
        counts = retention_counts(session, now)
        if args.apply:
            purge(session, now)
        print(json.dumps({"mode": "apply" if args.apply else "dry-run", **counts}))


if __name__ == "__main__":
    main()

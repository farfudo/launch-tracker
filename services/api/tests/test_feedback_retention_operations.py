import json
from contextlib import nullcontext
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from sqlalchemy import select

from app import feedback_retention
from app.models import AdminSession, Feedback, FeedbackRateBucket


def test_retention_preview_counts_boundaries_and_default_cli_does_not_write(
    db_session, monkeypatch, capsys,
):
    now = datetime.now(UTC)
    identifiers = []
    for age in (10, 31, 181):
        identifier = str(uuid4())
        identifiers.append(identifier)
        db_session.add(Feedback(
            id=identifier, type="opinion", message="Private test message not to be logged",
            name="Private test name", email="private@example.invalid", status="new",
            payload_digest="a" * 64, created_at=now - timedelta(days=age), updated_at=now,
        ))
    for expired in (True, False):
        expiry = now + timedelta(hours=-1 if expired else 1)
        db_session.add(FeedbackRateBucket(id=str(uuid4()), count=1, expires_at=expiry))
        db_session.add(AdminSession(
            token_digest=("a" if expired else "b") * 64, credential_version="v" * 64,
            created_at=now, last_seen_at=now, expires_at=expiry,
        ))
    db_session.commit()
    counts = feedback_retention.retention_counts(db_session, now)
    assert counts == {"feedback_to_delete": 1, "feedback_to_redact": 1,
                      "expired_rate_buckets": 1, "expired_sessions": 1}
    monkeypatch.setattr(feedback_retention, "SessionLocal", lambda: nullcontext(db_session))
    feedback_retention.main([])
    output = capsys.readouterr().out
    assert json.loads(output)["mode"] == "dry-run"
    assert "Private" not in output and "@" not in output
    db_session.expire_all()
    assert len(db_session.scalars(select(Feedback)).all()) == 3
    assert db_session.get(Feedback, identifiers[1]).email == "private@example.invalid"
    assert len(db_session.scalars(select(AdminSession)).all()) == 2
    feedback_retention.main(["--apply"])
    assert json.loads(capsys.readouterr().out)["mode"] == "apply"
    db_session.expire_all()
    assert db_session.get(Feedback, identifiers[2]) is None
    old = db_session.get(Feedback, identifiers[1])
    assert old.name is None and old.email is None and old.payload_digest == "expired"
    assert db_session.get(Feedback, identifiers[0]).email == "private@example.invalid"
    assert len(db_session.scalars(select(AdminSession)).all()) == 1
    assert len(db_session.scalars(select(FeedbackRateBucket)).all()) == 1
    assert feedback_retention.retention_counts(db_session, now) == dict.fromkeys(counts, 0)


def test_exact_retention_boundaries_are_not_deleted_or_redacted(db_session):
    now = datetime.now(UTC)
    for days in (30, 180):
        db_session.add(Feedback(
            id=str(uuid4()), type="opinion", message="Boundary fixture", status="new",
            payload_digest="a" * 64, created_at=now - timedelta(days=days), updated_at=now,
        ))
    db_session.commit()
    assert feedback_retention.retention_counts(db_session, now)["feedback_to_delete"] == 0
    assert feedback_retention.retention_counts(db_session, now)["feedback_to_redact"] == 1

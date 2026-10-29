from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import func, inspect, select
from sqlalchemy.orm import Session

from app.feedback import FeedbackInput, store_feedback
from app.models import Feedback

SECRET = "postgres-test-secret-not-used-outside-tests"


def test_feedback_migration_and_concurrent_retries(pg_database):
    engine, migrate = pg_database
    assert "feedback" in inspect(engine).get_table_names()
    migrate("downgrade", "20261027_08")
    assert "feedback" not in inspect(engine).get_table_names()
    assert "launches" in inspect(engine).get_table_names()
    migrate("upgrade", "head")
    identifier = str(uuid4())
    payload = FeedbackInput(type="opinion", message="Concurrent anonymous test report")

    def send(_):
        with Session(engine) as db:
            return store_feedback(db, payload, identifier, SECRET)

    with ThreadPoolExecutor(max_workers=4) as workers:
        receipts = list(workers.map(send, range(8)))
    assert all(item == {"id": identifier, "received": True} for item in receipts)
    with Session(engine) as db:
        assert db.scalar(select(func.count()).select_from(Feedback)) == 1
        assert db.get(Feedback, identifier).email is None


def test_postgresql_shared_budget_is_atomic(pg_database, monkeypatch):
    fixed = datetime.now(UTC).replace(second=0, microsecond=0)

    class Clock:
        @staticmethod
        def now(_timezone):
            return fixed

    monkeypatch.setattr("app.feedback.datetime", Clock)
    engine, _ = pg_database
    payload = FeedbackInput(type="suggestion", message="A valid shared budget test message")

    def send(_):
        with Session(engine) as db:
            try:
                store_feedback(db, payload, str(uuid4()), SECRET)
                return 201
            except HTTPException as error:
                return error.status_code

    with ThreadPoolExecutor(max_workers=6) as workers:
        results = list(workers.map(send, range(32)))
    assert results.count(201) == 24
    assert results.count(429) == 8
    with Session(engine) as db:
        assert db.scalar(select(func.count()).select_from(Feedback)) == 24

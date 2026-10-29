from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from sqlalchemy import select

from app.feedback_retention import purge
from app.models import Feedback


@pytest.fixture(autouse=True)
def enable_feedback(monkeypatch):
    monkeypatch.setenv("FEEDBACK_ENABLED", "true")
    monkeypatch.setenv("FEEDBACK_CONTROLLER", "Local test")
    monkeypatch.setenv("FEEDBACK_PRIVACY_CONTACT", "test@example.invalid")
    monkeypatch.setenv("FEEDBACK_SECRET", "local-test-secret-with-at-least-32-characters")


def send(client, payload=None, key=None):
    return client.post("/feedback", json=payload or {"type": "opinion", "message": "A helpful test message"},
                       headers={"Idempotency-Key": key or str(uuid4())})


@pytest.mark.parametrize("contact", [{}, {"name": "Ana"}, {"email": "ana@example.com"},
                                     {"name": "Ana", "email": "ana@example.com"}])
def test_independent_optional_contacts_and_persistence(client, db_session, contact):
    result = send(client, {"type": "suggestion", "message": "Please improve navigation", **contact})
    assert result.status_code == 201
    assert set(result.json()) == {"id", "received"}
    db_session.expire_all()
    item = db_session.get(Feedback, result.json()["id"])
    assert item.message == "Please improve navigation"
    assert item.name == contact.get("name")
    assert item.email == contact.get("email")
    assert item.status == "new"


@pytest.mark.parametrize("changes", [{"email": "invalid"}, {"message": ""}, {"message": "x" * 2001},
                                     {"website": "bot"}, {"status": "resolved"}, {"name": "x" * 101}])
def test_invalid_input_is_generic(client, changes):
    response = send(client, {"type": "bug", "message": "A normal test report", **changes})
    assert response.status_code == 422
    assert "input" not in response.text
    assert "bot" not in response.text


def test_idempotency_retries_and_payload_conflicts(client, db_session):
    key = str(uuid4())
    first, retry = send(client, key=key), send(client, key=key)
    assert first.json() == retry.json()
    assert len(db_session.scalars(select(Feedback)).all()) == 1
    assert send(client, {"type": "bug", "message": "Different report content"}, key).status_code == 409


def test_shared_budget_payload_limit_and_admin_fail_closed(client):
    for _ in range(24):
        assert send(client).status_code == 201
    assert send(client).status_code == 429
    assert client.post('/feedback', content='x' * 16385,
                       headers={'Content-Type': 'application/json'}).status_code == 413
    for path in ('/admin/feedback', '/admin/feedback/anything'):
        assert client.get(path).status_code == 503
    assert client.patch('/admin/feedback/anything', json={'status': 'resolved'}).status_code == 503
    assert client.get('/feedback').status_code == 405


def test_disabled_configuration_and_retention(client, db_session, monkeypatch):
    result = send(client, {"type": "opinion", "message": "Keep accessibility simple", "email": "a@example.com"})
    item = db_session.get(Feedback, result.json()['id'])
    now = datetime.now(UTC)
    item.created_at = now - timedelta(days=31)
    db_session.commit()
    purge(db_session, now)
    db_session.refresh(item)
    assert item.email is None
    item.created_at = now - timedelta(days=181)
    db_session.commit()
    purge(db_session, now)
    assert db_session.scalars(select(Feedback)).all() == []
    monkeypatch.delenv('FEEDBACK_SECRET')
    assert send(client).status_code == 503


def test_database_failure_returns_no_private_diagnostics(client, db_session, monkeypatch):
    from sqlalchemy.exc import SQLAlchemyError

    def fail(*args, **kwargs):
        raise SQLAlchemyError("private database diagnostic")

    monkeypatch.setattr(db_session, "execute", fail)
    response = send(client)
    assert response.status_code == 503
    assert "private" not in response.text


def test_invalid_retry_key_and_inactive_intake_are_rejected(client, monkeypatch):
    assert send(client, key="not-a-uuid").status_code == 422
    monkeypatch.setenv("FEEDBACK_ENABLED", "false")
    assert send(client).status_code == 503

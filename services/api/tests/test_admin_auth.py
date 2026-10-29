from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from sqlalchemy import select

from app.admin_auth import hash_password
from app.models import AdminSession, Feedback

PASSWORD = "local-test-password-not-a-real-credential"
GATEWAY = "test-gateway-only-" * 3


@pytest.fixture(scope="module")
def encoded_password():
    return hash_password(PASSWORD)


@pytest.fixture
def enabled(monkeypatch, encoded_password):
    for key, value in {
        "ADMIN_ENABLED": "true", "ADMIN_USERNAME": "sole-admin",
        "ADMIN_PASSWORD_HASH": encoded_password, "ADMIN_SESSION_SECRET": "test-session-" * 4,
        "ADMIN_BFF_SECRET": GATEWAY, "ADMIN_WEB_ORIGIN": "https://admin.example",
    }.items():
        monkeypatch.setenv(key, value)


def login(client, password=PASSWORD, username="sole-admin"):
    return client.post("/admin/auth/login", json={"username": username, "password": password},
                       headers={"X-Admin-Gateway": GATEWAY})


def authorized(client):
    response = login(client)
    assert response.status_code == 200
    body = response.json()
    return {"Authorization": "Bearer " + body["token"], "X-Admin-Gateway": GATEWAY,
            "X-CSRF-Token": body["csrf"]}, body


def test_no_admin_data_or_login_tokens_without_server_gateway(client, enabled):
    assert client.post('/admin/auth/login', json={"username": "sole-admin", "password": PASSWORD}).status_code == 401
    for path in ('/admin/feedback', '/admin/feedback/anything', '/admin/auth/session'):
        response = client.get(path)
        assert response.status_code == 401
        assert response.headers['cache-control'] == 'no-store'
        assert client.get(path, headers={"X-Admin-Gateway": GATEWAY,
                                        "Authorization": "Bearer " + "x" * 43}).status_code == 401
    assert client.patch('/admin/feedback/anything', json={"status": "resolved"}).status_code == 401


def test_authenticated_filters_state_update_and_csrf(client, db_session, enabled):
    now = datetime.now(UTC)
    identifier = str(uuid4())
    db_session.add(Feedback(id=identifier, type='bug', message='<img src=x> plain report',
                            name=None, email='test@example.invalid', status='new',
                            payload_digest='x' * 64, created_at=now, updated_at=now))
    db_session.commit()
    headers, _ = authorized(client)
    response = client.get('/admin/feedback?type=bug&status=new', headers=headers)
    assert response.status_code == 200
    assert response.json()['pending'] == 1
    assert response.json()['items'][0]['name'] is None
    assert response.json()['items'][0]['email'] == 'test@example.invalid'
    assert 'payload_digest' not in response.text
    assert client.get('/admin/feedback?type=opinion', headers=headers).json()['items'] == []
    assert client.get(f'/admin/feedback/{identifier}', headers=headers).json()['message'] == '<img src=x> plain report'
    no_csrf = {k: v for k, v in headers.items() if k != 'X-CSRF-Token'}
    assert client.patch(f'/admin/feedback/{identifier}', headers=no_csrf,
                        json={'status': 'planned'}).status_code == 403
    assert client.patch(f'/admin/feedback/{identifier}', headers={**headers, 'X-CSRF-Token': 'wrong'},
                        json={'status': 'planned'}).status_code == 403
    assert client.patch(f'/admin/feedback/{identifier}', headers=headers,
                        json={'status': 'planned'}).status_code == 200
    assert client.get('/admin/feedback?status=planned', headers=headers).json()['pending'] == 0
    assert client.get('/admin/feedback?status=invalid', headers=headers).status_code == 422


def test_logout_revokes_replay_and_session_storage_is_hashed(client, db_session, enabled):
    headers, body = authorized(client)
    stored = db_session.scalars(select(AdminSession)).one()
    assert stored.token_digest != body['token']
    assert len(stored.token_digest) == 64
    no_csrf = {k: v for k, v in headers.items() if k != 'X-CSRF-Token'}
    assert client.post('/admin/auth/logout', headers=no_csrf).status_code == 403
    assert client.get('/admin/auth/session', headers=headers).status_code == 200
    assert client.post('/admin/auth/logout', headers=headers).status_code == 204
    assert client.get('/admin/feedback', headers=headers).status_code == 401
    assert db_session.scalars(select(AdminSession)).all() == []


@pytest.mark.parametrize('kind', ['absolute', 'idle'])
def test_expired_sessions_are_rejected(client, db_session, enabled, kind):
    headers, _ = authorized(client)
    stored = db_session.scalars(select(AdminSession)).one()
    if kind == 'absolute':
        stored.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    else:
        stored.last_seen_at = datetime.now(UTC) - timedelta(minutes=31)
    db_session.commit()
    assert client.get('/admin/feedback', headers=headers).status_code == 401


def test_password_rotation_and_disable_fail_closed(client, enabled, monkeypatch):
    headers, _ = authorized(client)
    monkeypatch.setenv('ADMIN_PASSWORD_HASH', hash_password('another-local-test-password'))
    assert client.get('/admin/feedback', headers=headers).status_code == 401
    monkeypatch.setenv('ADMIN_ENABLED', 'false')
    assert client.get('/admin/feedback', headers=headers).status_code == 503


def test_shared_login_budget_counts_failures_and_hides_credentials(client, enabled):
    for i in range(5):
        response = login(client, password='incorrect', username='sole-admin' if i % 2 else 'unknown')
        assert response.status_code == 401
        assert 'incorrect' not in response.text and 'unknown' not in response.text
    assert login(client).status_code == 429


def test_login_validation_and_password_hash(client, enabled, encoded_password):
    assert PASSWORD not in encoded_password
    assert encoded_password.startswith('scrypt$32768$8$3$')
    assert client.post('/admin/auth/login', headers={'X-Admin-Gateway': GATEWAY},
                       json={'username': 'sole-admin', 'password': 'x', 'role': 'admin'}).status_code == 400
    assert client.post('/admin/auth/login', headers={'X-Admin-Gateway': GATEWAY,
                       'Content-Type': 'application/json'}, content='x' * 4097).status_code == 413

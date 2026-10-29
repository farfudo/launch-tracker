from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime

from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.admin_auth import hash_password, login_budget
from app.db import get_db
from app.main import app
from app.models import AdminSession


def test_postgresql_session_persists_and_logout_revokes(pg_database, monkeypatch):
    engine, _ = pg_database
    password = 'postgres-local-test-password-only'
    gateway = 'postgres-test-gateway-' * 3
    for key, value in {
        'ADMIN_ENABLED': 'true', 'ADMIN_USERNAME': 'test-admin',
        'ADMIN_PASSWORD_HASH': hash_password(password),
        'ADMIN_SESSION_SECRET': 'postgres-test-session-' * 3,
        'ADMIN_BFF_SECRET': gateway, 'ADMIN_WEB_ORIGIN': 'https://admin.example',
    }.items():
        monkeypatch.setenv(key, value)

    def database():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = database
    try:
        with TestClient(app) as client:
            result = client.post('/admin/auth/login', json={'username': 'test-admin',
                                 'password': password}, headers={'X-Admin-Gateway': gateway})
            assert result.status_code == 200
            body = result.json()
            headers = {'X-Admin-Gateway': gateway, 'Authorization': 'Bearer ' + body['token'],
                       'X-CSRF-Token': body['csrf']}
            with Session(engine) as db:
                stored = db.scalars(select(AdminSession)).one()
                assert stored.token_digest != body['token']
            assert client.get('/admin/feedback', headers=headers).status_code == 200
            assert client.post('/admin/auth/logout', headers=headers).status_code == 204
            assert client.get('/admin/feedback', headers=headers).status_code == 401
    finally:
        app.dependency_overrides.clear()


def test_postgresql_login_budget_is_shared_across_connections(pg_database):
    engine, _ = pg_database
    now = datetime.now(UTC)

    def attempt(_):
        with Session(engine) as db:
            try:
                login_budget(db, now)
                return 200
            except HTTPException as error:
                return error.status_code

    with ThreadPoolExecutor(max_workers=4) as workers:
        results = list(workers.map(attempt, range(8)))
    assert results.count(200) == 5
    assert results.count(429) == 3

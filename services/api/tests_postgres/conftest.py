"""Disposable schemas only; never use DATABASE_URL as the integration target."""
import os
import subprocess
import sys
from pathlib import Path
from uuid import uuid4

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

API_ROOT = Path(__file__).resolve().parents[1]


def validate_test_url(value):
    url = make_url(value)
    if (url.drivername != "postgresql+psycopg" or url.host not in {"127.0.0.1", "localhost"}
            or url.database != "launch_tracker_test" or url.username != "launch_test"
            or url.query):
        raise ValueError("Integration tests require the dedicated loopback test database/user.")
    return value


@pytest.fixture
def pg_database():
    value = os.environ.get("POSTGRES_TEST_URL")
    if not value:
        pytest.fail("POSTGRES_TEST_URL is required; production DATABASE_URL is never used.")
    value = validate_test_url(value)
    schema = "test_" + uuid4().hex
    admin = create_engine(value)
    engine = None
    try:
        with admin.begin() as connection:
            connection.execute(text(f'CREATE SCHEMA "{schema}"'))
        engine = create_engine(value, connect_args={"options": f"-csearch_path={schema}"})

        def migrate(*args):
            env = {**os.environ, "DATABASE_URL": value, "PGOPTIONS": f"-csearch_path={schema}"}
            subprocess.run([sys.executable, "-m", "alembic", *args], cwd=API_ROOT,
                           env=env, check=True, capture_output=True, timeout=30)

        migrate("upgrade", "head")
        yield engine, migrate
    finally:
        if engine is not None:
            engine.dispose()
        with admin.begin() as connection:
            connection.execute(text(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE'))
        admin.dispose()

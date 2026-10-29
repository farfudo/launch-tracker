"""One configured administrator, revocable opaque sessions and shared login budgets."""
import getpass
import hashlib
import hmac
import os
import re
import secrets
import sys
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from urllib.parse import urlsplit

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from sqlalchemy import delete, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.db import get_db
from app.models import AdminSession, FeedbackRateBucket

router = APIRouter(prefix="/admin/auth", tags=["admin authentication"])
PASSWORD_PREFIX = "scrypt$32768$8$3$"
SESSION_SECONDS = 7200
IDLE_SECONDS = 1800


@dataclass(frozen=True)
class AdminConfig:
    username: str
    password_hash: str
    secret: str
    gateway: str


def configuration():
    username = os.getenv("ADMIN_USERNAME", "")
    encoded = os.getenv("ADMIN_PASSWORD_HASH", "")
    secret = os.getenv("ADMIN_SESSION_SECRET", "")
    gateway = os.getenv("ADMIN_BFF_SECRET", "")
    try:
        origin = urlsplit(os.getenv("ADMIN_WEB_ORIGIN", ""))
    except ValueError:
        raise HTTPException(503, "Administrative access is not enabled.") from None
    local = (os.getenv("ADMIN_ALLOW_INSECURE_LOCAL") == "true"
             and origin.hostname in {"127.0.0.1", "localhost"} and origin.scheme == "http")
    if (os.getenv("ADMIN_ENABLED") != "true" or not 1 <= len(username) <= 100
            or len(secret) < 32 or len(gateway) < 32 or not re.fullmatch(
                r"scrypt\$32768\$8\$3\$[0-9a-f]{32}\$[0-9a-f]{128}", encoded)
            or not origin.netloc or origin.username or origin.password
            or origin.query or origin.fragment or origin.path not in {"", "/"}
            or not (origin.scheme == "https" or local)):
        raise HTTPException(503, "Administrative access is not enabled.")
    return AdminConfig(username, encoded, secret, gateway)


def require_gateway(request, config):
    if not hmac.compare_digest(request.headers.get("x-admin-gateway", "").encode(),
                               config.gateway.encode()):
        raise HTTPException(401, "Authentication required.")


def keyed(config, value):
    return hmac.new(config.secret.encode(), value.encode(), hashlib.sha256).hexdigest()


def hash_password(password):
    if not 16 <= len(password) <= 256:
        raise ValueError("Use a password with 16 to 256 characters.")
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=32768, r=8, p=3,
                            maxmem=64 * 1024 * 1024, dklen=64)
    return f"{PASSWORD_PREFIX}{salt.hex()}${digest.hex()}"


def verify_password(password, encoded):
    salt, expected = encoded.removeprefix(PASSWORD_PREFIX).split("$")
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=32768, r=8, p=3,
                            maxmem=64 * 1024 * 1024, dklen=64)
    return hmac.compare_digest(digest.hex(), expected)


def credential_version(config):
    return keyed(config, "credentials:" + config.username + ":" + config.password_hash)


class LoginInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=256)


def login_budget(db, now):
    # No source IP or username is persisted. All replicas share these aggregate budgets.
    insert = pg_insert if db.get_bind().dialect.name == "postgresql" else sqlite_insert
    bucket = int(now.timestamp()) // 900
    for key, limit, expiry in [
        (f"admin-login:{bucket}", 5, now + timedelta(minutes=30)),
        (now.strftime("admin-day:%Y%m%d"), 30, now + timedelta(days=2)),
    ]:
        db.execute(insert(FeedbackRateBucket).values(id=key, count=0, expires_at=expiry)
                   .on_conflict_do_nothing(index_elements=["id"]))
        used = db.execute(update(FeedbackRateBucket).where(
            FeedbackRateBucket.id == key, FeedbackRateBucket.count < limit
        ).values(count=FeedbackRateBucket.count + 1).returning(FeedbackRateBucket.id)).scalar()
        if used is None:
            db.rollback()
            raise HTTPException(429, "Please try again later.", headers={"Retry-After": "900"})
    db.commit()  # Failed passwords must still consume the shared budget.


def perform_login(db, data, config):
    now = datetime.now(UTC)
    try:
        login_budget(db, now)
        correct_password = verify_password(data.password, config.password_hash)
        correct_user = hmac.compare_digest(data.username.encode(), config.username.encode())
        if not (correct_password and correct_user):
            raise HTTPException(401, "Invalid credentials.")
        token = secrets.token_urlsafe(32)
        expiry = now + timedelta(seconds=SESSION_SECONDS)
        db.execute(delete(AdminSession).where(AdminSession.expires_at <= now)
                   .execution_options(synchronize_session=False))
        db.add(AdminSession(token_digest=keyed(config, "session:" + token),
                            credential_version=credential_version(config), created_at=now,
                            last_seen_at=now, expires_at=expiry))
        db.commit()
        return {"token": token, "csrf": keyed(config, "csrf:" + token),
                "expires_at": expiry.isoformat()}
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(503, "Administrative access is temporarily unavailable.") from None


@router.post("/login")
async def login(request: Request, response: Response, db: Session = Depends(get_db)):
    config = configuration()
    require_gateway(request, config)
    response.headers["Cache-Control"] = "no-store"
    if request.headers.get("content-type", "").split(";")[0] != "application/json":
        raise HTTPException(415, "JSON required.")
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 4096:
            raise HTTPException(413, "Request too large.")
    try:
        data = LoginInput.model_validate_json(body)
    except ValidationError:
        raise HTTPException(400, "Invalid credentials.") from None
    return await run_in_threadpool(perform_login, db, data, config)


@dataclass(frozen=True)
class Principal:
    digest: str
    csrf: str
    expires_at: datetime


def require_admin(request: Request, db: Session = Depends(get_db)):
    config = configuration()
    require_gateway(request, config)
    authorization = request.headers.get("authorization", "")
    if not re.fullmatch(r"Bearer [A-Za-z0-9_-]{43}", authorization):
        raise HTTPException(401, "Authentication required.")
    token = authorization[7:]
    now = datetime.now(UTC)
    digest = keyed(config, "session:" + token)
    try:
        expiry = db.execute(update(AdminSession).where(
            AdminSession.token_digest == digest,
            AdminSession.credential_version == credential_version(config),
            AdminSession.expires_at > now,
            AdminSession.last_seen_at > now - timedelta(seconds=IDLE_SECONDS),
        ).values(last_seen_at=now).returning(AdminSession.expires_at)
            .execution_options(synchronize_session=False)).scalar()
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(503, "Administrative access is temporarily unavailable.") from None
    if expiry is None:
        raise HTTPException(401, "Session expired.")
    csrf = keyed(config, "csrf:" + token)
    if request.method not in {"GET", "HEAD", "OPTIONS"} and not hmac.compare_digest(
        request.headers.get("x-csrf-token", "").encode(), csrf.encode()
    ):
        raise HTTPException(403, "Request denied.")
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=UTC)
    return Principal(digest, csrf, expiry)


@router.get("/session")
def session_info(response: Response, principal: Principal = Depends(require_admin)):
    response.headers["Cache-Control"] = "no-store"
    return {"csrf": principal.csrf, "expires_at": principal.expires_at.isoformat()}


@router.post("/logout", status_code=204)
def logout(response: Response, principal: Principal = Depends(require_admin),
           db: Session = Depends(get_db)):
    db.execute(delete(AdminSession).where(AdminSession.token_digest == principal.digest))
    db.commit()
    response.headers["Cache-Control"] = "no-store"


if __name__ == "__main__":
    if sys.argv[1:] != ["hash-password"]:
        raise SystemExit("Usage: python -m app.admin_auth hash-password")
    first = getpass.getpass("Administrator password (16–256 characters): ")
    if first != getpass.getpass("Confirm password: "):
        raise SystemExit("Passwords do not match.")
    print(hash_password(first))

"""Feedback intake: no request contents or client identifiers are logged or retained."""
import hashlib
import hmac
import json
import os
import re
from datetime import UTC, datetime, timedelta
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator
from sqlalchemy import delete, func, select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.db import get_db
from app.models import Feedback, FeedbackRateBucket

router = APIRouter(tags=["feedback"])


class FeedbackInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    type: Literal["suggestion", "bug", "opinion"]
    message: str = Field(min_length=10, max_length=2000)
    name: str | None = Field(default=None, max_length=100)
    email: str | None = Field(default=None, max_length=254)
    website: str = Field(default="", max_length=200)

    @field_validator("name", "email", mode="before")
    @classmethod
    def empty_optional(cls, value):
        return None if isinstance(value, str) and not value.strip() else value

    @field_validator("email")
    @classmethod
    def email_format(cls, value):
        if value and not re.fullmatch(r"[^\s@<>]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+", value):
            raise ValueError("Invalid email")
        return value


def consume_limits(db: Session, now: datetime):
    """Atomic global budgets shared by all workers; deliberately no IP tracking."""
    insert = pg_insert if db.get_bind().dialect.name == "postgresql" else sqlite_insert
    db.execute(delete(FeedbackRateBucket).where(FeedbackRateBucket.expires_at < now))
    for key, limit, expiry in [
        (now.strftime("minute:%Y%m%d%H%M"), 24, now + timedelta(minutes=2)),
        (now.strftime("day:%Y%m%d"), 500, now + timedelta(days=2)),
    ]:
        db.execute(insert(FeedbackRateBucket).values(id=key, count=0, expires_at=expiry)
                   .on_conflict_do_nothing(index_elements=["id"]))
        used = db.execute(update(FeedbackRateBucket).where(
            FeedbackRateBucket.id == key, FeedbackRateBucket.count < limit
        ).values(count=FeedbackRateBucket.count + 1).returning(FeedbackRateBucket.id)).scalar()
        if used is None:
            raise HTTPException(429, "Please try again later.", headers={"Retry-After": "60"})


def store_feedback(db: Session, data: FeedbackInput, identifier: str, secret: str):
    now = datetime.now(UTC)
    digest = hmac.new(secret.encode(), json.dumps(data.model_dump(), sort_keys=True).encode(),
                      hashlib.sha256).hexdigest()
    try:
        consume_limits(db, now)
        existing = db.get(Feedback, identifier)
        if existing:
            if not hmac.compare_digest(existing.payload_digest, digest):
                raise HTTPException(409, "Please start a new submission.")
        else:
            insert = pg_insert if db.get_bind().dialect.name == "postgresql" else sqlite_insert
            db.execute(insert(Feedback).values(
                id=identifier, type=data.type, message=data.message, name=data.name, email=data.email,
                status="new", payload_digest=digest, created_at=now, updated_at=now,
            ).on_conflict_do_nothing(index_elements=["id"]))
            stored = db.get(Feedback, identifier)
            if stored is None or not hmac.compare_digest(stored.payload_digest, digest):
                raise HTTPException(409, "Please start a new submission.")
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(503, "Feedback is temporarily unavailable.") from None
    return {"id": identifier, "received": True}


@router.post("/feedback", status_code=201)
async def submit_feedback(request: Request, db: Session = Depends(get_db)):
    secret = os.getenv("FEEDBACK_SECRET", "")
    if (os.getenv("FEEDBACK_ENABLED") != "true" or len(secret) < 32
            or not os.getenv("FEEDBACK_CONTROLLER") or not os.getenv("FEEDBACK_PRIVACY_CONTACT")):
        raise HTTPException(503, "Feedback is temporarily unavailable.")
    if request.headers.get("content-type", "").split(";")[0] != "application/json":
        raise HTTPException(415, "JSON required.")
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 16384:
            raise HTTPException(413, "Submission is too large.")
    try:
        key = UUID(request.headers.get("idempotency-key", ""))
        if key.version != 4:
            raise ValueError("Invalid submission key")
        identifier = str(key)
        data = FeedbackInput.model_validate_json(body)
    except (ValueError, ValidationError):
        raise HTTPException(422, "Please check your submission.") from None
    if data.website:
        raise HTTPException(422, "Please check your submission.")
    return await run_in_threadpool(store_feedback, db, data, identifier, secret)


def admin_unavailable():
    # No secure administrative identity exists in this application yet. Fail closed.
    raise HTTPException(503, "Administrative access is not enabled.")


admin = APIRouter(prefix="/admin/feedback", dependencies=[Depends(admin_unavailable)],
                  tags=["feedback administration"])


class StatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: Literal["new", "reviewed", "planned", "resolved"]


def public_admin_item(item: Feedback):
    return {key: getattr(item, key) for key in
            ("id", "type", "message", "name", "email", "status", "created_at", "updated_at")}


@admin.get("")
def list_feedback(status: str | None = None, type: str | None = None,
                  offset: int = 0, db: Session = Depends(get_db)):
    query = select(Feedback)
    if status:
        query = query.where(Feedback.status == status)
    if type:
        query = query.where(Feedback.type == type)
    items = db.scalars(query.order_by(Feedback.created_at.desc(), Feedback.id).offset(
        max(0, offset)).limit(50)).all()
    pending = db.scalar(select(func.count()).select_from(Feedback).where(Feedback.status == "new"))
    return {"items": [public_admin_item(item) for item in items], "pending": pending}


@admin.get("/{identifier}")
def get_feedback(identifier: str, db: Session = Depends(get_db)):
    item = db.get(Feedback, identifier)
    if not item:
        raise HTTPException(404, "Not found.")
    return public_admin_item(item)


@admin.patch("/{identifier}")
def update_feedback(identifier: str, data: StatusUpdate, db: Session = Depends(get_db)):
    item = db.get(Feedback, identifier)
    if not item:
        raise HTTPException(404, "Not found.")
    item.status, item.updated_at = data.status, datetime.now(UTC)
    db.commit()
    return public_admin_item(item)

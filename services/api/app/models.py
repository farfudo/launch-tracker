from datetime import datetime

from sqlalchemy import JSON, CheckConstraint, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class SyncControl(Base):
    __tablename__ = "sync_control"

    id: Mapped[int] = mapped_column(primary_key=True)
    last_attempt_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    next_attempt_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    outcome: Mapped[str] = mapped_column(String(32))


class Launch(Base):
    __tablename__ = "launches"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(300))
    status: Mapped[str] = mapped_column(String(100))
    net: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    net_precision: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    agency: Mapped[str | None] = mapped_column(String(200), nullable=True, index=True)
    vehicle: Mapped[str | None] = mapped_column(String(200), nullable=True, index=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    mission_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    mission_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    pad_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    location_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    launch_timezone: Mapped[str | None] = mapped_column(Text, nullable=True)
    window_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    window_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_credit: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_license: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_license_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_kind: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_title: Mapped[str | None] = mapped_column(Text, nullable=True)
    streams: Mapped[list] = mapped_column(JSON, default=list, server_default="[]")
    mission_links: Mapped[list] = mapped_column(JSON, default=list, server_default="[]")
    source_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class Feedback(Base):
    __tablename__ = "feedback"
    __table_args__ = (
        CheckConstraint("type IN ('suggestion','bug','opinion')", name="feedback_type"),
        CheckConstraint("status IN ('new','reviewed','planned','resolved')", name="feedback_status"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    type: Mapped[str] = mapped_column(String(16))
    message: Mapped[str] = mapped_column(Text)
    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    email: Mapped[str | None] = mapped_column(String(254), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="new", index=True)
    payload_digest: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class FeedbackRateBucket(Base):
    __tablename__ = "feedback_rate_buckets"

    id: Mapped[str] = mapped_column(String(48), primary_key=True)
    count: Mapped[int] = mapped_column(default=0)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    token_digest: Mapped[str] = mapped_column(String(64), primary_key=True)
    credential_version: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)

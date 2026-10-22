from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Launch(Base):
    __tablename__ = "launches"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(300))
    status: Mapped[str] = mapped_column(String(100))
    net: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
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
    source_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

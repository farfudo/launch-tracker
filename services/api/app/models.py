from datetime import datetime

from sqlalchemy import DateTime, String
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
    source_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

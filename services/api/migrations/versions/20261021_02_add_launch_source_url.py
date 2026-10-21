"""add launch source url

Revision ID: 20261021_02
Revises: 20261021_01
Create Date: 2026-10-21 20:05:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20261021_02"
down_revision: str | None = "20261021_01"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("launches", sa.Column("source_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("launches", "source_url")

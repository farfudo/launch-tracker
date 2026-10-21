"""Create launches table.

Revision ID: 20261021_01
Revises:
Create Date: 2026-10-21
"""

from alembic import op
import sqlalchemy as sa

revision = "20261021_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "launches",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=300), nullable=False),
        sa.Column("status", sa.String(length=100), nullable=False),
        sa.Column("net", sa.DateTime(timezone=True), nullable=False),
        sa.Column("agency", sa.String(length=200), nullable=True),
        sa.Column("vehicle", sa.String(length=200), nullable=True),
        sa.Column("source_updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_launches_net", "launches", ["net"])
    op.create_index("ix_launches_agency", "launches", ["agency"])
    op.create_index("ix_launches_vehicle", "launches", ["vehicle"])


def downgrade() -> None:
    op.drop_index("ix_launches_vehicle", table_name="launches")
    op.drop_index("ix_launches_agency", table_name="launches")
    op.drop_index("ix_launches_net", table_name="launches")
    op.drop_table("launches")

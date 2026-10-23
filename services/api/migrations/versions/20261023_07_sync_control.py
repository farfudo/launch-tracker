"""Persist a shared retry budget before contacting the upstream provider."""
import sqlalchemy as sa
from alembic import op

revision = "20261023_07"
down_revision = "20261022_06"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sync_control",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("last_attempt_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("outcome", sa.String(32), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("sync_control")

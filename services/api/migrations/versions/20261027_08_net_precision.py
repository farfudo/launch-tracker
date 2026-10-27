"""Preserve source precision; legacy records remain unknown (no backfill)."""
import sqlalchemy as sa
from alembic import op

revision = "20261027_08"
down_revision = "20261023_07"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("launches", sa.Column("net_precision", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("launches", "net_precision")

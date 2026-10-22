"""Store the launch site's IANA timezone supplied by Launch Library."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20261022_04"
down_revision: str | None = "20261022_03"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("launches", sa.Column("launch_timezone", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("launches", "launch_timezone")

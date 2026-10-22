"""Add optional mission, location and launch window details."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20261022_03"
down_revision: str | None = "20261021_02"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    for name in ("mission_name", "mission_description", "pad_name", "location_name"):
        op.add_column("launches", sa.Column(name, sa.Text(), nullable=True))
    for name in ("window_start", "window_end"):
        op.add_column("launches", sa.Column(name, sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    for name in (
        "window_end", "window_start", "location_name", "pad_name",
        "mission_description", "mission_name",
    ):
        op.drop_column("launches", name)

"""Store reference images and source attribution for launch detail pages."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20261022_05"
down_revision: str | None = "20261022_04"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

columns = (
    "image_url", "image_credit", "image_license", "image_license_url", "image_kind", "image_title"
)


def upgrade() -> None:
    for name in columns:
        op.add_column("launches", sa.Column(name, sa.Text(), nullable=True))


def downgrade() -> None:
    for name in reversed(columns):
        op.drop_column("launches", name)

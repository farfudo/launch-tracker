"""Cache source-provided video and mission links."""
import sqlalchemy as sa
from alembic import op

revision = "20261022_06"
down_revision = "20261022_05"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("launches", sa.Column("streams", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("launches", sa.Column("mission_links", sa.JSON(), nullable=False, server_default="[]"))


def downgrade() -> None:
    op.drop_column("launches", "mission_links")
    op.drop_column("launches", "streams")

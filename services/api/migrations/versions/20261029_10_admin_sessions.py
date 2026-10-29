"""Revocable single-administrator sessions; no account table or plaintext tokens."""
import sqlalchemy as sa
from alembic import op

revision = "20261029_10"
down_revision = "20261029_09"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("admin_sessions",
        sa.Column("token_digest", sa.String(64), primary_key=True),
        sa.Column("credential_version", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False))
    op.create_index("ix_admin_sessions_expires_at", "admin_sessions", ["expires_at"])


def downgrade():
    op.drop_table("admin_sessions")

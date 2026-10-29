"""Anonymous feedback and shared, identifier-free abuse limits."""
import sqlalchemy as sa
from alembic import op

revision = "20261029_09"
down_revision = "20261027_08"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("feedback",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("type", sa.String(16), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("name", sa.String(100), nullable=True),
        sa.Column("email", sa.String(254), nullable=True),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("payload_digest", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("type IN ('suggestion','bug','opinion')", name="feedback_type"),
        sa.CheckConstraint("status IN ('new','reviewed','planned','resolved')", name="feedback_status"))
    op.create_index("ix_feedback_status", "feedback", ["status"])
    op.create_index("ix_feedback_created_at", "feedback", ["created_at"])
    op.create_table("feedback_rate_buckets",
        sa.Column("id", sa.String(48), primary_key=True),
        sa.Column("count", sa.Integer(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False))
    op.create_index("ix_feedback_rate_buckets_expires_at", "feedback_rate_buckets", ["expires_at"])


def downgrade():
    op.drop_table("feedback_rate_buckets")
    op.drop_table("feedback")

"""make notification created_at timezone aware

Revision ID: e5ca74028c03
Revises: 29282a7d608b
Create Date: 2026-09-02 15:32:25.132802
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e5ca74028c03"
down_revision: Union[str, Sequence[str], None] = "29282a7d608b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "notifications",
        "created_at",
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "notifications",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )
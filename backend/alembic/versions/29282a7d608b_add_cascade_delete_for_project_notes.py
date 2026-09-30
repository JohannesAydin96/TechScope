"""Add cascade delete for project notes

Revision ID: 29282a7d608b
Revises: 8d4b0c794e96
Create Date: 2026-07-30 17:03:07.282744
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "29282a7d608b"
down_revision: Union[str, Sequence[str], None] = "8d4b0c794e96"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add cascade delete from projects to notes."""
    op.drop_constraint(
        "notes_project_id_fkey",
        "notes",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "notes_project_id_fkey",
        "notes",
        "projects",
        ["project_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Restore the original project-to-note foreign key."""
    op.drop_constraint(
        "notes_project_id_fkey",
        "notes",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "notes_project_id_fkey",
        "notes",
        "projects",
        ["project_id"],
        ["id"],
    )
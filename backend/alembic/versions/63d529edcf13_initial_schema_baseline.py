"""Initial schema baseline

Revision ID: 63d529edcf13
Revises:
Create Date: 2026-07-22 12:21:49.408318

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "63d529edcf13"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the initial TechScope database schema."""

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id", name="users_pkey"),
    )

    op.create_index(
        "ix_users_email",
        "users",
        ["email"],
        unique=True,
    )
    op.create_index(
        "ix_users_id",
        "users",
        ["id"],
        unique=False,
    )

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("tech_stack", sa.Text(), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
            name="projects_owner_id_fkey",
        ),
        sa.PrimaryKeyConstraint("id", name="projects_pkey"),
    )

    op.create_index(
        "ix_projects_id",
        "projects",
        ["id"],
        unique=False,
    )

    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("priority", sa.String(), nullable=True),
        sa.Column("due_date", sa.DateTime(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column(
            "labels",
            sa.JSON(),
            server_default=sa.text("'[]'::json"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            name="tasks_project_id_fkey",
        ),
        sa.PrimaryKeyConstraint("id", name="tasks_pkey"),
    )

    op.create_index(
        "ix_tasks_id",
        "tasks",
        ["id"],
        unique=False,
    )

    op.create_table(
        "notes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            name="notes_project_id_fkey",
        ),
        sa.PrimaryKeyConstraint("id", name="notes_pkey"),
    )

    op.create_index(
        "ix_notes_id",
        "notes",
        ["id"],
        unique=False,
    )

    op.create_table(
        "task_activities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("field_name", sa.String(), nullable=True),
        sa.Column("old_value", sa.Text(), nullable=True),
        sa.Column("new_value", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["task_id"],
            ["tasks.id"],
            name="task_activities_task_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="task_activities_pkey"),
    )

    op.create_index(
        "idx_task_activities_task_id",
        "task_activities",
        ["task_id"],
        unique=False,
    )

    op.create_table(
        "task_attachments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("original_filename", sa.String(), nullable=False),
        sa.Column("stored_filename", sa.String(), nullable=False),
        sa.Column("file_path", sa.String(), nullable=False),
        sa.Column("content_type", sa.String(), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["task_id"],
            ["tasks.id"],
            name="task_attachments_task_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="task_attachments_user_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="task_attachments_pkey"),
        sa.UniqueConstraint(
            "stored_filename",
            name="task_attachments_stored_filename_key",
        ),
    )

    op.create_index(
        "idx_task_attachments_task_id",
        "task_attachments",
        ["task_id"],
        unique=False,
    )
    op.create_index(
        "idx_task_attachments_user_id",
        "task_attachments",
        ["user_id"],
        unique=False,
    )

    # Legacy indexes present before revision 8d4b0c794e96.
    op.create_index(
        "ix_task_attachments_id",
        "task_attachments",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_task_attachments_task_id",
        "task_attachments",
        ["task_id"],
        unique=False,
    )
    op.create_index(
        "ix_task_attachments_user_id",
        "task_attachments",
        ["user_id"],
        unique=False,
    )

    op.create_table(
        "task_comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["task_id"],
            ["tasks.id"],
            name="task_comments_task_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="task_comments_user_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="task_comments_pkey"),
    )

    op.create_index(
        "idx_task_comments_task_id",
        "task_comments",
        ["task_id"],
        unique=False,
    )
    op.create_index(
        "idx_task_comments_user_id",
        "task_comments",
        ["user_id"],
        unique=False,
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), nullable=True),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("message", sa.String(), nullable=False),
        sa.Column(
            "is_read",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["task_id"],
            ["tasks.id"],
            name="notifications_task_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="notifications_user_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="notifications_pkey"),
    )

    op.create_index(
        "idx_notifications_created",
        "notifications",
        ["created_at"],
        unique=False,
    )
    op.create_index(
        "idx_notifications_read",
        "notifications",
        ["is_read"],
        unique=False,
    )
    op.create_index(
        "idx_notifications_task",
        "notifications",
        ["task_id"],
        unique=False,
    )
    op.create_index(
        "idx_notifications_user",
        "notifications",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove the initial TechScope database schema."""

    op.drop_index(
        "idx_notifications_user",
        table_name="notifications",
    )
    op.drop_index(
        "idx_notifications_task",
        table_name="notifications",
    )
    op.drop_index(
        "idx_notifications_read",
        table_name="notifications",
    )
    op.drop_index(
        "idx_notifications_created",
        table_name="notifications",
    )
    op.drop_table("notifications")

    op.drop_index(
        "idx_task_comments_user_id",
        table_name="task_comments",
    )
    op.drop_index(
        "idx_task_comments_task_id",
        table_name="task_comments",
    )
    op.drop_table("task_comments")

    op.drop_index(
        "ix_task_attachments_user_id",
        table_name="task_attachments",
    )
    op.drop_index(
        "ix_task_attachments_task_id",
        table_name="task_attachments",
    )
    op.drop_index(
        "ix_task_attachments_id",
        table_name="task_attachments",
    )
    op.drop_index(
        "idx_task_attachments_user_id",
        table_name="task_attachments",
    )
    op.drop_index(
        "idx_task_attachments_task_id",
        table_name="task_attachments",
    )
    op.drop_table("task_attachments")

    op.drop_index(
        "idx_task_activities_task_id",
        table_name="task_activities",
    )
    op.drop_table("task_activities")

    op.drop_index(
        "ix_notes_id",
        table_name="notes",
    )
    op.drop_table("notes")

    op.drop_index(
        "ix_tasks_id",
        table_name="tasks",
    )
    op.drop_table("tasks")

    op.drop_index(
        "ix_projects_id",
        table_name="projects",
    )
    op.drop_table("projects")

    op.drop_index(
        "ix_users_id",
        table_name="users",
    )
    op.drop_index(
        "ix_users_email",
        table_name="users",
    )
    op.drop_table("users")
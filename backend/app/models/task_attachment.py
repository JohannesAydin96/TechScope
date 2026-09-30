"""
Database model for task attachments in TechScope.

Stores attachment metadata and file references, along with
relationships to the associated task and uploading user.

"""

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class TaskAttachment(Base):
    __tablename__ = "task_attachments"

    __table_args__ = (
        Index(
            "idx_task_attachments_task_id",
            "task_id",
        ),
        Index(
            "idx_task_attachments_user_id",
            "user_id",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
    )

    original_filename = Column(
        String,
        nullable=False,
    )

    stored_filename = Column(
        String,
        nullable=False,
        unique=True,
    )

    file_path = Column(
        String,
        nullable=False,
    )

    content_type = Column(
        String,
        nullable=True,
    )

    file_size = Column(
        Integer,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    task_id = Column(
        Integer,
        ForeignKey(
            "tasks.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    task = relationship(
        "Task",
        back_populates="attachments",
    )

    user = relationship(
        "User",
        back_populates="task_attachments",
    )
"""
Database model for task comments in TechScope.

Stores comment content and timestamps, along with
relationships to the associated task and authoring user.

"""

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class TaskComment(Base):
    __tablename__ = "task_comments"

    __table_args__ = (
        Index(
            "idx_task_comments_task_id",
            "task_id",
        ),
        Index(
            "idx_task_comments_user_id",
            "user_id",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
    )

    content = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
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
        back_populates="comments",
    )

    user = relationship(
        "User",
        back_populates="task_comments",
    )
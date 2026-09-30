"""
Database model for user notifications in TechScope.

Defines notification content, read status, and timestamps,
along with relationships to users and associated tasks.

"""

from sqlalchemy import (
    Boolean,
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


class Notification(Base):
    __tablename__ = "notifications"

    __table_args__ = (
        Index(
            "idx_notifications_created",
            "created_at",
        ),
        Index(
            "idx_notifications_read",
            "is_read",
        ),
        Index(
            "idx_notifications_task",
            "task_id",
        ),
        Index(
            "idx_notifications_user",
            "user_id",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    task_id = Column(
        Integer,
        ForeignKey(
            "tasks.id",
            ondelete="CASCADE",
        ),
        nullable=True,
    )

    type = Column(
        String,
        nullable=False,
    )

    title = Column(
        String,
        nullable=False,
    )

    message = Column(
        String,
        nullable=False,
    )

    is_read = Column(
        Boolean,
        server_default="false",
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="notifications",
    )

    task = relationship(
        "Task",
        back_populates="notifications",
    )
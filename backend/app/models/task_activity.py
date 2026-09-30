"""
Database model for task activity history in TechScope.

Stores changes and actions performed on tasks, including
previous and updated values for tracked fields.

"""

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class TaskActivity(Base):
    __tablename__ = "task_activities"

    __table_args__ = (
        Index(
            "idx_task_activities_task_id",
            "task_id",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
    )

    action = Column(
        String,
        nullable=False,
    )

    field_name = Column(
        String,
        nullable=True,
    )

    old_value = Column(
        Text,
        nullable=True,
    )

    new_value = Column(
        Text,
        nullable=True,
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

    task = relationship(
        "Task",
        back_populates="activities",
    )
"""
Database model for project tasks in TechScope.

Defines task details, status, priority, labels, and due dates,
along with relationships to projects and task-related resources.

"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    status = Column(String, default="todo")
    priority = Column(String, default="medium")
    labels = Column(JSON, default=list)

    due_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="tasks")

    activities = relationship(
        "TaskActivity",
        back_populates="task",
        cascade="all, delete-orphan",
    )

    comments = relationship(
        "TaskComment",
        back_populates="task",
        cascade="all, delete-orphan",
    )

    attachments = relationship(
        "TaskAttachment",
        back_populates="task",
        cascade="all, delete-orphan",
    )

    notifications = relationship(
        "Notification",
        back_populates="task",
        cascade="all, delete-orphan",
    )

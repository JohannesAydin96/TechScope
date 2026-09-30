"""
Database model for users in TechScope.

Defines user account information and relationships to owned projects,
task attachments, task comments, and notifications.

"""

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    projects = relationship(
        "Project",
        back_populates="owner",
    )

    task_attachments = relationship(
        "TaskAttachment",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    task_comments = relationship(
        "TaskComment",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )
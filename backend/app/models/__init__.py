"""
SQLAlchemy model exports for the TechScope backend.

Imports the application's database models in one place so they
can be registered and accessed consistently throughout the backend.

"""

from .user import User
from .project import Project
from .task import Task
from .note import Note
from .task_activity import TaskActivity
from .task_comment import TaskComment
from .task_attachment import TaskAttachment
from .notification import Notification
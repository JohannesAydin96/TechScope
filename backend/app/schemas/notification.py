"""
Notification schemas for the TechScope API.

Defines notification response data and the result returned
when all project notifications are marked as read.

"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.common import MessageResponse


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    task_id: int | None = None
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MarkAllNotificationsReadResponse(MessageResponse):
    updated_count: int
"""
Task attachment schemas for the TechScope API.

Defines the response model used to return attachment metadata
and its associated task and user references.

"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TaskAttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    content_type: str | None
    file_size: int
    created_at: datetime
    task_id: int
    user_id: int
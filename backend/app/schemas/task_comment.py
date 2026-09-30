"""
Task comment schemas for the TechScope API.

Defines request and response models for creating, updating,
and returning comments associated with project tasks.

"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class TaskCommentUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class TaskCommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    created_at: datetime
    updated_at: datetime
    task_id: int
    user_id: int
    username: str
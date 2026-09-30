"""
Task schemas for the TechScope API.

Defines request and response models for creating, returning,
and updating project tasks.

"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: str | None = "medium"
    due_date: datetime | None = None
    labels: list[str] | None = Field(default_factory=list)


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: str
    priority: str
    due_date: datetime | None
    labels: list[str] = Field(default_factory=list)
    created_at: datetime
    project_id: int


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    due_date: datetime | None = None
    labels: list[str] | None = None
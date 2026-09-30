"""
Project schemas for the TechScope API.

Defines request and response models for creating, returning,
and updating projects.

"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    tech_stack: str | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    tech_stack: str | None
    owner_id: int
    created_at: datetime


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    tech_stack: str | None = None
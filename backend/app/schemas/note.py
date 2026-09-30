"""
Note schemas for the TechScope API.

Defines the request and response models used when creating
and returning project notes.

"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NoteCreate(BaseModel):
    title: str
    content: str


class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    project_id: int
    created_at: datetime
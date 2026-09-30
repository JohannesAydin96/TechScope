"""
Task activity schemas for the TechScope API.

Defines the response model used to return recorded task
activity and field change history.

"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TaskActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    action: str
    field_name: str | None
    old_value: str | None
    new_value: str | None
    created_at: datetime
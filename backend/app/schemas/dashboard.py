"""
Dashboard response schemas for the TechScope API.

Defines the aggregated project statistics and recent task data
returned by the project dashboard endpoint.

"""

from pydantic import BaseModel

from app.schemas.task import TaskResponse


class ProjectDashboardResponse(BaseModel):
    project_id: int

    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    todo_tasks: int

    high_priority_tasks: int

    recent_tasks: list[TaskResponse]
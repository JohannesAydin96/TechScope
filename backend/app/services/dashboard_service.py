"""
Dashboard service for TechScope.

Builds project dashboard data by aggregating task statistics
and retrieving the project's most recent tasks.

"""

from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.dashboard import ProjectDashboardResponse
from app.services.task_service import get_project_for_user


def get_project_dashboard(
    db: Session,
    project_id: int,
    user_id: int,
) -> ProjectDashboardResponse:
    get_project_for_user(db, project_id, user_id)

    tasks = (
        db.query(Task)
        .filter(Task.project_id == project_id)
        .order_by(Task.created_at.desc())
        .all()
    )

    total_tasks = len(tasks)

    completed_tasks = len(
        [task for task in tasks if task.status == "completed"]
    )
    in_progress_tasks = len(
        [task for task in tasks if task.status == "in_progress"]
    )
    todo_tasks = len(
        [task for task in tasks if task.status == "todo"]
    )
    high_priority_tasks = len(
        [task for task in tasks if task.priority == "high"]
    )

    recent_tasks = tasks[:5]

    return ProjectDashboardResponse(
        project_id=project_id,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        in_progress_tasks=in_progress_tasks,
        todo_tasks=todo_tasks,
        high_priority_tasks=high_priority_tasks,
        recent_tasks=recent_tasks,
    )
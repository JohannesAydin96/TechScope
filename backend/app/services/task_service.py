"""
Task service for TechScope.

Handles task creation, retrieval, updates, and deletion,
including project access checks, activity logging, and notifications.

"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.notification_service import NotificationService
from app.services.task_activity_service import create_task_activity


def get_project_for_user(
    db: Session,
    project_id: int,
    user_id: int,
) -> Project:
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == user_id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project


def create_task(
    db: Session,
    project_id: int,
    task_data: TaskCreate,
    user_id: int,
) -> Task:
    get_project_for_user(
        db,
        project_id,
        user_id,
    )

    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        due_date=task_data.due_date,
        labels=task_data.labels or [],
        project_id=project_id,
    )

    db.add(task)
    db.flush()

    create_task_activity(
        db=db,
        task_id=task.id,
        action="task_created",
        field_name=None,
        old_value=None,
        new_value=task.title,
    )

    db.commit()
    db.refresh(task)

    return task


def get_project_tasks(
    db: Session,
    project_id: int,
    user_id: int,
) -> list[Task]:
    get_project_for_user(
        db,
        project_id,
        user_id,
    )

    return (
        db.query(Task)
        .filter(Task.project_id == project_id)
        .all()
    )


def get_task_for_user(
    db: Session,
    project_id: int,
    task_id: int,
    user_id: int,
) -> Task:
    get_project_for_user(
        db,
        project_id,
        user_id,
    )

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.project_id == project_id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task


def update_task(
    db: Session,
    project_id: int,
    task_id: int,
    task_data: TaskUpdate,
    user_id: int,
) -> Task:
    task = get_task_for_user(
        db,
        project_id,
        task_id,
        user_id,
    )

    update_data = task_data.model_dump(exclude_unset=True)

    status_changed = False
    old_status = None
    new_status = None

    for field, new_value in update_data.items():
        old_value = getattr(task, field)

        if old_value == new_value:
            continue

        create_task_activity(
            db=db,
            task_id=task.id,
            action="task_updated",
            field_name=field,
            old_value=old_value,
            new_value=new_value,
        )

        if field == "status":
            status_changed = True
            old_status = old_value
            new_status = new_value

        setattr(task, field, new_value)

    if status_changed:
        NotificationService.create_notification(
            db=db,
            user_id=user_id,
            task_id=task.id,
            notification_type="task_status_changed",
            title="Task status updated",
            message=(
                f'Task "{task.title}" changed status '
                f'from "{old_status}" to "{new_status}".'
            ),
            commit=False,
        )

    db.commit()
    db.refresh(task)

    return task


def delete_task(
    db: Session,
    project_id: int,
    task_id: int,
    user_id: int,
) -> None:
    task = get_task_for_user(
        db,
        project_id,
        task_id,
        user_id,
    )

    db.delete(task)
    db.commit()
"""
Task activity service for TechScope.

Creates and retrieves task activity records and serializes
changed values for storage in the activity history.

"""

import json
from typing import Any

from sqlalchemy.orm import Session

from app.models.task_activity import TaskActivity


def serialize_activity_value(value: Any) -> str | None:

    """
    Converts task values into text that can be stored
    in the activity log.

    """

    if value is None:
        return None

    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False)

    return str(value)


def create_task_activity(
    db: Session,
    task_id: int,
    action: str,
    field_name: str | None = None,
    old_value: Any = None,
    new_value: Any = None,
) -> TaskActivity:
    
    """
    Creates an activity record for a task.

    The caller controls when the database transaction
    is committed.

    """

    activity = TaskActivity(
        task_id=task_id,
        action=action,
        field_name=field_name,
        old_value=serialize_activity_value(old_value),
        new_value=serialize_activity_value(new_value),
    )

    db.add(activity)

    return activity


def get_task_activities(
    db: Session,
    task_id: int,
) -> list[TaskActivity]:
    
    """
    Returns all activities for a task,
    ordered from newest to oldest.

    """

    return (
        db.query(TaskActivity)
        .filter(TaskActivity.task_id == task_id)
        .order_by(TaskActivity.created_at.desc())
        .all()
    )
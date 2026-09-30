"""
Task comment service for TechScope.

Handles creation, retrieval, updates, and deletion of task comments,
including ownership checks and related task activity logging.

"""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.task_comment import TaskComment
from app.schemas.task_comment import (
    TaskCommentCreate,
    TaskCommentUpdate,
)
from app.services.task_activity_service import create_task_activity
from app.services.task_service import get_task_for_user


def create_task_comment(
    db: Session,
    project_id: int,
    task_id: int,
    comment_data: TaskCommentCreate,
    user_id: int,
) -> TaskComment:
    get_task_for_user(
        db,
        project_id,
        task_id,
        user_id,
    )

    content = comment_data.content.strip()

    comment = TaskComment(
        content=content,
        task_id=task_id,
        user_id=user_id,
    )

    db.add(comment)
    db.flush()

    create_task_activity(
        db=db,
        task_id=task_id,
        action="comment_added",
        field_name="comment",
        old_value=None,
        new_value=content,
    )

    db.commit()
    db.refresh(comment)

    return comment


def get_task_comments(
    db: Session,
    project_id: int,
    task_id: int,
    user_id: int,
) -> list[TaskComment]:
    get_task_for_user(
        db,
        project_id,
        task_id,
        user_id,
    )

    return (
        db.query(TaskComment)
        .filter(TaskComment.task_id == task_id)
        .order_by(TaskComment.created_at.asc())
        .all()
    )


def get_comment_for_user(
    db: Session,
    project_id: int,
    task_id: int,
    comment_id: int,
    user_id: int,
) -> TaskComment:
    get_task_for_user(
        db,
        project_id,
        task_id,
        user_id,
    )

    comment = (
        db.query(TaskComment)
        .filter(
            TaskComment.id == comment_id,
            TaskComment.task_id == task_id,
        )
        .first()
    )

    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Comment not found",
        )

    return comment


def update_task_comment(
    db: Session,
    project_id: int,
    task_id: int,
    comment_id: int,
    comment_data: TaskCommentUpdate,
    user_id: int,
) -> TaskComment:
    comment = get_comment_for_user(
        db,
        project_id,
        task_id,
        comment_id,
        user_id,
    )

    if comment.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own comments",
        )

    new_content = comment_data.content.strip()
    old_content = comment.content

    if old_content == new_content:
        return comment

    comment.content = new_content

    create_task_activity(
        db=db,
        task_id=task_id,
        action="comment_updated",
        field_name="comment",
        old_value=old_content,
        new_value=new_content,
    )

    db.commit()
    db.refresh(comment)

    return comment


def delete_task_comment(
    db: Session,
    project_id: int,
    task_id: int,
    comment_id: int,
    user_id: int,
) -> None:
    comment = get_comment_for_user(
        db,
        project_id,
        task_id,
        comment_id,
        user_id,
    )

    if comment.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own comments",
        )

    deleted_content = comment.content

    create_task_activity(
        db=db,
        task_id=task_id,
        action="comment_deleted",
        field_name="comment",
        old_value=deleted_content,
        new_value=None,
    )

    db.delete(comment)
    db.commit()


def get_comment_response(
    comment: TaskComment,
) -> dict[str, object]:
    username = (
        comment.user.username
        if comment.user
        else "Unknown user"
    )

    return {
        "id": comment.id,
        "content": comment.content,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "task_id": comment.task_id,
        "user_id": comment.user_id,
        "username": username,
    }
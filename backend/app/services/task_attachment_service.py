"""
Task attachment service for TechScope.

Handles validation, storage, retrieval, and deletion of task
attachments, including related activity logging and file cleanup.

"""

import logging
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.task_attachment import TaskAttachment
from app.services.file_storage_service import delete_file_if_exists
from app.services.task_activity_service import create_task_activity
from app.services.task_service import get_task_for_user


logger = logging.getLogger(__name__)


BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIRECTORY = BASE_DIR / "uploads" / "task_attachments"

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/plain",
    "text/csv",
    "application/json",
    "application/zip",
}


def ensure_upload_directory() -> None:
    UPLOAD_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True,
    )


def validate_attachment(
    file: UploadFile,
    file_size: int,
) -> None:
    if file_size <= 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty",
        )

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the 10 MB limit",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="File type is not allowed",
        )


async def create_task_attachment(
    db: Session,
    project_id: int,
    task_id: int,
    file: UploadFile,
    user_id: int,
) -> TaskAttachment:
    get_task_for_user(
        db,
        project_id,
        task_id,
        user_id,
    )

    ensure_upload_directory()

    file_content = await file.read()
    file_size = len(file_content)

    validate_attachment(
        file,
        file_size,
    )

    original_filename = file.filename or "attachment"
    suffix = Path(original_filename).suffix.lower()

    stored_filename = f"{uuid4().hex}{suffix}"
    file_path = UPLOAD_DIRECTORY / stored_filename

    try:
        file_path.write_bytes(file_content)

        attachment = TaskAttachment(
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=str(file_path),
            content_type=file.content_type,
            file_size=file_size,
            task_id=task_id,
            user_id=user_id,
        )

        db.add(attachment)
        db.flush()

        create_task_activity(
            db=db,
            task_id=task_id,
            action="attachment_added",
            field_name="attachment",
            old_value=None,
            new_value=original_filename,
        )

        db.commit()
        db.refresh(attachment)

        logger.info(
            (
                "Task attachment created: "
                "attachment_id=%s task_id=%s user_id=%s "
                "file_size=%s content_type=%s"
            ),
            attachment.id,
            task_id,
            user_id,
            file_size,
            file.content_type,
        )

        return attachment

    except Exception:
        db.rollback()

        logger.exception(
            (
                "Failed to create task attachment: "
                "project_id=%s task_id=%s user_id=%s"
            ),
            project_id,
            task_id,
            user_id,
        )

        delete_file_if_exists(file_path)

        raise


def get_task_attachments(
    db: Session,
    project_id: int,
    task_id: int,
    user_id: int,
) -> list[TaskAttachment]:
    get_task_for_user(
        db,
        project_id,
        task_id,
        user_id,
    )

    return (
        db.query(TaskAttachment)
        .filter(TaskAttachment.task_id == task_id)
        .order_by(TaskAttachment.created_at.desc())
        .all()
    )


def get_task_attachment(
    db: Session,
    project_id: int,
    task_id: int,
    attachment_id: int,
    user_id: int,
) -> TaskAttachment:
    get_task_for_user(
        db,
        project_id,
        task_id,
        user_id,
    )

    attachment = (
        db.query(TaskAttachment)
        .filter(
            TaskAttachment.id == attachment_id,
            TaskAttachment.task_id == task_id,
        )
        .first()
    )

    if not attachment:
        raise HTTPException(
            status_code=404,
            detail="Attachment not found",
        )

    return attachment


def delete_task_attachment(
    db: Session,
    project_id: int,
    task_id: int,
    attachment_id: int,
    user_id: int,
) -> None:
    attachment = get_task_attachment(
        db,
        project_id,
        task_id,
        attachment_id,
        user_id,
    )

    if attachment.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own attachments",
        )

    file_path = Path(attachment.file_path)
    original_filename = attachment.original_filename

    create_task_activity(
        db=db,
        task_id=task_id,
        action="attachment_deleted",
        field_name="attachment",
        old_value=original_filename,
        new_value=None,
    )

    db.delete(attachment)
    db.commit()

    delete_file_if_exists(file_path)

    logger.info(
        (
            "Task attachment deleted: "
            "attachment_id=%s task_id=%s user_id=%s"
        ),
        attachment_id,
        task_id,
        user_id,
    )
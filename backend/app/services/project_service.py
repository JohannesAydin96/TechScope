"""
Project service for TechScope.

Handles project creation, retrieval, updates, and deletion,
including cleanup of stored attachment files for deleted projects.

"""

import logging
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.file_storage_service import delete_file_if_exists


logger = logging.getLogger(__name__)


def create_project(
    db: Session,
    project: ProjectCreate,
    current_user: User,
) -> Project:
    new_project = Project(
        name=project.name,
        description=project.description,
        tech_stack=project.tech_stack,
        owner_id=current_user.id,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


def get_projects_for_user(
    db: Session,
    current_user: User,
) -> list[Project]:
    return (
        db.query(Project)
        .filter(Project.owner_id == current_user.id)
        .all()
    )


def get_project_by_id_for_user(
    db: Session,
    project_id: int,
    current_user: User,
) -> Project | None:
    return (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )


def update_project_for_user(
    db: Session,
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User,
) -> Project | None:
    project = get_project_by_id_for_user(
        db,
        project_id,
        current_user,
    )

    if not project:
        return None

    if project_update.name is not None:
        project.name = project_update.name

    if project_update.description is not None:
        project.description = project_update.description

    if project_update.tech_stack is not None:
        project.tech_stack = project_update.tech_stack

    db.commit()
    db.refresh(project)

    return project


def delete_project_for_user(
    db: Session,
    project_id: int,
    current_user: User,
) -> bool:
    project = get_project_by_id_for_user(
        db,
        project_id,
        current_user,
    )

    if not project:
        return False

    attachment_paths = [
        Path(attachment.file_path)
        for task in project.tasks
        for attachment in task.attachments
    ]

    try:
        db.delete(project)
        db.commit()

    except Exception:
        db.rollback()

        logger.exception(
            (
                "Failed to delete project: "
                "project_id=%s user_id=%s"
            ),
            project_id,
            current_user.id,
        )

        raise

    for attachment_path in attachment_paths:
        delete_file_if_exists(attachment_path)

    logger.info(
        (
            "Project deleted: "
            "project_id=%s user_id=%s "
            "attachment_files_processed=%s"
        ),
        project_id,
        current_user.id,
        len(attachment_paths),
    )

    return True
"""
Note service for TechScope.

Handles creation and retrieval of notes associated
with a specific project.

"""

from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.project import Project
from app.schemas.note import NoteCreate


def create_note_for_project(
    db: Session,
    project: Project,
    note: NoteCreate,
) -> Note:
    new_note = Note(
        title=note.title,
        content=note.content,
        project_id=project.id,
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


def get_notes_for_project(
    db: Session,
    project: Project,
) -> list[Note]:
    return (
        db.query(Note)
        .filter(Note.project_id == project.id)
        .all()
    )
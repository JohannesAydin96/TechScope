"""
Database dependencies for the TechScope backend.

Provides database sessions to API endpoints and ensures
that each session is properly closed after use.

"""

from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
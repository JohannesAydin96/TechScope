import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base
from app.models import (
    note,
    notification,
    project,
    task,
    task_activity,
    task_attachment,
    task_comment,
    user,
)


load_dotenv(".env.test")

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

if not TEST_DATABASE_URL:
    raise RuntimeError(
        "TEST_DATABASE_URL is not configured in .env.test"
    )

if "techscope_test" not in TEST_DATABASE_URL:
    raise RuntimeError(
        "Refusing to run tests against a non-test database."
    )

engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
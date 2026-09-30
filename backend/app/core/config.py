"""
Application configuration for the TechScope backend.

Loads environment variables from the backend .env file and exposes
the database connection URL and secret key through shared settings.

"""

from pathlib import Path
import os

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)


class Settings:
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")
    SECRET_KEY: str | None = os.getenv("SECRET_KEY")


settings = Settings()
"""
Main FastAPI application entry point for TechScope.

Configures logging, exception handling, CORS middleware,
and registers the application's API routes.

"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.exception_handlers import register_exception_handlers
from app.core.logging_config import configure_logging


configure_logging()

app = FastAPI(title="TechScope API")

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router)
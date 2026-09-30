"""
Global exception handling for the TechScope backend.

Registers a fallback handler that logs unexpected application errors
and returns a consistent HTTP 500 response to the client.

"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(Exception)
    async def unexpected_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        logger.exception(
            "Unexpected error while processing %s %s",
            request.method,
            request.url.path,
        )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "An unexpected server error occurred",
            },
        )
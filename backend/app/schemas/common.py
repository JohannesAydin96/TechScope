"""
Shared response schemas for the TechScope API.

Contains reusable Pydantic models for common API responses.

"""

from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str
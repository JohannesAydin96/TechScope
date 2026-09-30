"""
User and authentication schemas for the TechScope API.

Defines request and response models for registration, login,
user data, and access tokens.

"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str
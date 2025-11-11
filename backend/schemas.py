"""
Pydantic schemas for API request/response validation.

This module defines the validation schemas used by FastAPI endpoints
for request body validation and response serialization.
"""

import re
from typing import Optional

from pydantic import BaseModel, field_validator

from .constants import DATE_REGEX_PATTERN


class CategoryCreate(BaseModel):
    """Schema for creating a new category."""
    
    name: str
    icon: Optional[str] = None
    type: Optional[str] = "normal"
    unit: str
    auto_create: Optional[bool] = False


class CategoryUpdate(BaseModel):
    """Schema for updating an existing category (all fields optional)."""
    
    name: Optional[str] = None
    icon: Optional[str] = None
    type: Optional[str] = None
    unit: Optional[str] = None
    auto_create: Optional[bool] = None


class CategoryRead(BaseModel):
    """Schema for category response (read from database)."""
    
    id: int
    name: str
    icon: Optional[str] = None
    type: str
    unit: Optional[str] = None
    auto_create: bool

    model_config = {"from_attributes": True}


class EntryCreate(BaseModel):
    """Schema for creating a new entry."""
    
    category_id: int
    date: str  # YYYY-MM
    value: Optional[float] = 0.0
    deposit: Optional[float] = None
    comment: Optional[str] = None
    auto_generated: Optional[bool] = False

    @field_validator("date")
    @classmethod
    def date_must_be_yyyy_mm(cls, v: str) -> str:
        """Validate that date is in YYYY-MM format."""
        if not re.match(DATE_REGEX_PATTERN, v):
            raise ValueError("date must be in YYYY-MM format")
        return v


class EntryUpdate(BaseModel):
    """Schema for updating an existing entry (all fields optional)."""
    
    category_id: Optional[int] = None
    date: Optional[str] = None
    value: Optional[float] = None
    deposit: Optional[float] = None
    comment: Optional[str] = None
    auto_generated: Optional[bool] = None

    @field_validator("date")
    @classmethod
    def date_must_be_yyyy_mm(cls, v: Optional[str]) -> Optional[str]:
        """Validate that date is in YYYY-MM format (if provided)."""
        if v is None:
            return v
        if not re.match(DATE_REGEX_PATTERN, v):
            raise ValueError("date must be in YYYY-MM format")
        return v


class EntryRead(BaseModel):
    """Schema for entry response (read from database)."""
    
    id: int
    category_id: int
    date: str
    value: float
    deposit: Optional[float] = None
    comment: Optional[str] = None
    auto_generated: bool

    model_config = {"from_attributes": True}
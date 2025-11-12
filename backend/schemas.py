"""
Pydantic schemas for API request/response validation.

This module defines the validation schemas used by FastAPI endpoints
for request body validation and response serialization.
"""

import re
from typing import Optional, Union

from pydantic import BaseModel, field_validator

from .constants import DATE_REGEX_PATTERN
from .utils import parse_flexible_float


class CategoryCreate(BaseModel):
    """Schema for creating a new category."""
    
    name: str
    type: Optional[str] = "normal"
    unit: str
    auto_create: Optional[bool] = False


class CategoryUpdate(BaseModel):
    """Schema for updating an existing category (all fields optional)."""
    
    name: Optional[str] = None
    type: Optional[str] = None
    unit: Optional[str] = None
    auto_create: Optional[bool] = None


class CategoryRead(BaseModel):
    """Schema for category response (read from database)."""
    
    id: int
    name: str
    type: str
    unit: Optional[str] = None
    auto_create: bool

    model_config = {"from_attributes": True}


class EntryCreate(BaseModel):
    """Schema for creating a new entry."""
    
    category_id: int
    date: str  # YYYY-MM
    value: Optional[Union[float, str]] = 0.0
    deposit: Optional[Union[float, str]] = None
    comment: Optional[str] = None
    auto_generated: Optional[bool] = False

    @field_validator("date")
    @classmethod
    def date_must_be_yyyy_mm(cls, v: str) -> str:
        """Validate that date is in YYYY-MM format."""
        if not re.match(DATE_REGEX_PATTERN, v):
            raise ValueError("date must be in YYYY-MM format")
        return v
    
    @field_validator("value", mode="before")
    @classmethod
    def parse_value(cls, v: Optional[Union[float, str]]) -> float:
        """Parse value with flexible decimal separator (comma or dot)."""
        if v is None:
            return 0.0
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            try:
                return parse_flexible_float(v)
            except ValueError as e:
                raise ValueError(f"Invalid value format: {e}")
        raise ValueError(f"Invalid value type: {type(v)}")
    
    @field_validator("deposit", mode="before")
    @classmethod
    def parse_deposit(cls, v: Optional[Union[float, str]]) -> Optional[float]:
        """Parse deposit with flexible decimal separator (comma or dot)."""
        if v is None:
            return None
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            try:
                return parse_flexible_float(v)
            except ValueError as e:
                raise ValueError(f"Invalid deposit format: {e}")
        raise ValueError(f"Invalid deposit type: {type(v)}")


class EntryUpdate(BaseModel):
    """Schema for updating an existing entry (all fields optional)."""
    
    category_id: Optional[int] = None
    date: Optional[str] = None
    value: Optional[Union[float, str]] = None
    deposit: Optional[Union[float, str]] = None
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
    
    @field_validator("value", mode="before")
    @classmethod
    def parse_value(cls, v: Optional[Union[float, str]]) -> Optional[float]:
        """Parse value with flexible decimal separator (comma or dot)."""
        if v is None:
            return None
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            try:
                return parse_flexible_float(v)
            except ValueError as e:
                raise ValueError(f"Invalid value format: {e}")
        raise ValueError(f"Invalid value type: {type(v)}")
    
    @field_validator("deposit", mode="before")
    @classmethod
    def parse_deposit(cls, v: Optional[Union[float, str]]) -> Optional[float]:
        """Parse deposit with flexible decimal separator (comma or dot)."""
        if v is None:
            return None
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            try:
                return parse_flexible_float(v)
            except ValueError as e:
                raise ValueError(f"Invalid deposit format: {e}")
        raise ValueError(f"Invalid deposit type: {type(v)}")


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
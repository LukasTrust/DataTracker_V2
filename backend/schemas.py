from pydantic import BaseModel, field_validator
from typing import Optional
import re

DATE_RE = re.compile(r"^\d{4}-\d{2}$")  # YYYY-MM

class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    type: Optional[str] = "normal"
    unit: str
    auto_create: Optional[bool] = False

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    type: Optional[str] = None
    unit: Optional[str] = None
    auto_create: Optional[bool] = None

class EntryCreate(BaseModel):
    category_id: int
    date: str  # YYYY-MM
    value: Optional[float] = 0.0
    deposit: Optional[float] = None
    comment: Optional[str] = None
    auto_generated: Optional[bool] = False

    @field_validator("date")
    @classmethod
    def date_must_be_yyyy_mm(cls, v):
        if not DATE_RE.match(v):
            raise ValueError("date must be in YYYY-MM format")
        return v

class EntryUpdate(BaseModel):
    category_id: Optional[int] = None
    date: Optional[str] = None
    value: Optional[float] = None
    deposit: Optional[float] = None
    comment: Optional[str] = None
    auto_generated: Optional[bool] = None

    @field_validator("date")
    @classmethod
    def date_must_be_yyyy_mm(cls, v):
        if v is None:
            return v
        if not DATE_RE.match(v):
            raise ValueError("date must be in YYYY-MM format")
        return v

# --- Neue Pydantic Response-Modelle (from_attributes für SQLModel-Objekte) ---
class CategoryRead(BaseModel):
    id: int
    name: str
    type: str
    unit: Optional[str] = None
    auto_create: bool

    model_config = {"from_attributes": True}

class EntryRead(BaseModel):
    id: int
    category_id: int
    date: str
    value: float
    deposit: Optional[float] = None
    comment: Optional[str] = None
    auto_generated: bool

    model_config = {"from_attributes": True}
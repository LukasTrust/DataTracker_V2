"""
SQLModel database models.

This module defines the database tables and relationships
for the Data Tracker application.
"""

from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Category(SQLModel, table=True):
    """
    Category model for organizing entries.
    
    Categories can be:
    - "normal": Regular data tracking (e.g., exercise, water intake)
    - "sparen": Financial/savings tracking with deposit tracking
    
    Attributes:
        id: Primary key
        name: Category name
        icon: Optional icon identifier for UI
        type: Category type ("normal" or "sparen")
        unit: Measurement unit (e.g., "€", "km", "l")
        auto_create: Whether to auto-create zero entries monthly
        entries: Related Entry objects (back-populated)
    """
    
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    icon: Optional[str] = None
    type: str = "normal"  # "normal" or "sparen"
    unit: str
    auto_create: bool = False
    
    # Relationships
    entries: List["Entry"] = Relationship(back_populates="category")


class Entry(SQLModel, table=True):
    """
    Entry model for storing data points within a category.
    
    Each entry represents a data point for a specific month.
    
    Attributes:
        id: Primary key
        category_id: Foreign key to Category
        date: Month in YYYY-MM format
        value: The primary data value
        deposit: Optional deposit value (for "sparen" categories)
        comment: Optional comment/note
        auto_generated: Whether entry was auto-created by scheduler
        category: Related Category object (back-populated)
    """
    
    __tablename__ = "entries"

    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="categories.id")
    date: str  # YYYY-MM format
    value: float = 0.0
    deposit: Optional[float] = None
    comment: Optional[str] = None
    auto_generated: bool = False
    
    # Relationships
    category: Optional[Category] = Relationship(back_populates="entries")
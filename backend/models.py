from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Category(SQLModel, table=True):
    # set explicit table name to match migrations (categories)
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str = "normal"   # "normal" or "sparen"
    unit: Optional[str] = None
    auto_create: bool = False
    entries: List["Entry"] = Relationship(back_populates="category")

class Entry(SQLModel, table=True):
    # set explicit table name to match migrations (entries)
    __tablename__ = "entries"

    id: Optional[int] = Field(default=None, primary_key=True)
    # update foreign key to reference plural table name
    category_id: int = Field(foreign_key="categories.id")
    date: str              # YYYY-MM
    value: float = 0.0
    deposit: Optional[float] = None
    comment: Optional[str] = None
    auto_generated: bool = False
    category: Optional[Category] = Relationship(back_populates="entries")
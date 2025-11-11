from sqlmodel import select
from .db import get_session
from .models import Category, Entry
from typing import List, Optional
from datetime import datetime
import calendar

def create_category(category: Category) -> Category:
    with get_session() as s:
        s.add(category)
        s.commit()
        s.refresh(category)
        return category

def list_categories() -> List[Category]:
    with get_session() as s:
        return s.exec(select(Category)).all()

def get_category(category_id: int) -> Optional[Category]:
    with get_session() as s:
        return s.exec(select(Category).where(Category.id == category_id)).first()

def update_category(category_id: int, data: Category) -> Optional[Category]:
    with get_session() as s:
        cat = s.exec(select(Category).where(Category.id == category_id)).first()
        if not cat:
            return None
        # update allowed fields
        if data.name is not None:
            cat.name = data.name
        if data.type is not None:
            cat.type = data.type
        if data.unit is not None:
            cat.unit = data.unit
        if data.auto_create is not None:
            cat.auto_create = data.auto_create
        s.add(cat)
        s.commit()
        s.refresh(cat)
        return cat

def delete_category(category_id: int) -> bool:
    with get_session() as s:
        cat = s.exec(select(Category).where(Category.id == category_id)).first()
        if not cat:
            return False
        # delete entries for category
        entries = s.exec(select(Entry).where(Entry.category_id == category_id)).all()
        for e in entries:
            s.delete(e)
        s.delete(cat)
        s.commit()
        return True

def duplicate_category(category_id: int) -> Optional[Category]:
    """
    Duplicate a category with all its entries.
    The new category will have the name appended with ' (Kopie)'.
    """
    with get_session() as s:
        # Get original category
        original_cat = s.exec(select(Category).where(Category.id == category_id)).first()
        if not original_cat:
            return None
        
        # Create new category with modified name
        new_cat = Category(
            name=f"{original_cat.name} (Kopie)",
            type=original_cat.type,
            unit=original_cat.unit,
            auto_create=original_cat.auto_create
        )
        s.add(new_cat)
        s.commit()
        s.refresh(new_cat)
        
        # Copy all entries
        original_entries = s.exec(select(Entry).where(Entry.category_id == category_id)).all()
        for original_entry in original_entries:
            new_entry = Entry(
                category_id=new_cat.id,
                date=original_entry.date,
                value=original_entry.value,
                deposit=original_entry.deposit,
                comment=original_entry.comment,
                auto_generated=original_entry.auto_generated
            )
            s.add(new_entry)
        
        s.commit()
        s.refresh(new_cat)
        return new_cat

def create_entry(entry: Entry) -> Entry:
    with get_session() as s:
        s.add(entry)
        s.commit()
        s.refresh(entry)
        return entry

def list_entries_for_category(category_id: int):
    with get_session() as s:
        return s.exec(select(Entry).where(Entry.category_id == category_id).order_by(Entry.date)).all()

def get_entry(entry_id: int) -> Optional[Entry]:
    with get_session() as s:
        return s.exec(select(Entry).where(Entry.id == entry_id)).first()

def update_entry(entry_id: int, data: Entry) -> Optional[Entry]:
    with get_session() as s:
        ent = s.exec(select(Entry).where(Entry.id == entry_id)).first()
        if not ent:
            return None
        # update allowed fields
        if data.category_id is not None:
            ent.category_id = data.category_id
        if data.date is not None:
            ent.date = data.date
        if data.value is not None:
            ent.value = data.value
        # deposit may be None intentionally; only set if provided (we allow explicit None)
        ent.deposit = data.deposit
        if data.comment is not None:
            ent.comment = data.comment
        if data.auto_generated is not None:
            ent.auto_generated = data.auto_generated
        s.add(ent)
        s.commit()
        s.refresh(ent)
        return ent

def delete_entry(entry_id: int) -> bool:
    with get_session() as s:
        ent = s.exec(select(Entry).where(Entry.id == entry_id)).first()
        if not ent:
            return False
        s.delete(ent)
        s.commit()
        return True

def find_last_entry_for_category(category_id: int) -> Optional[Entry]:
    with get_session() as s:
        return s.exec(
            select(Entry).where(Entry.category_id == category_id).order_by(Entry.date.desc())
        ).first()

def entry_exists_for_month(category_id: int, yyyy_mm: str) -> bool:
    with get_session() as s:
        return s.exec(
            select(Entry).where(Entry.category_id == category_id, Entry.date == yyyy_mm)
        ).first() is not None

def search_entries(
    category_ids: Optional[List[int]] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    comment_contains: Optional[str] = None,
    type_filter: Optional[str] = None,
) -> List[Entry]:
    """
    Search entries with optional filters.
    - category_ids: list of category ids to include
    - from_date / to_date: YYYY-MM strings (inclusive)
    - comment_contains: substring to search in comment
    - type_filter: category.type (e.g. "normal" or "sparen")
    """
    with get_session() as s:
        stmt = select(Entry).join(Category)
        if category_ids:
            stmt = stmt.where(Entry.category_id.in_(category_ids))
        if from_date:
            stmt = stmt.where(Entry.date >= from_date)
        if to_date:
            stmt = stmt.where(Entry.date <= to_date)
        if comment_contains:
            stmt = stmt.where(Entry.comment.contains(comment_contains))
        if type_filter:
            stmt = stmt.where(Category.type == type_filter)
        stmt = stmt.order_by(Entry.date)
        return s.exec(stmt).all()

# --- Neue Aggregationsfunktionen für Stats/Charts ---
def aggregate_entries(
    category_ids: Optional[List[int]] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> dict:
    """
    Returns simple aggregates across matching entries:
    { count, sum, avg, min, max, total_deposit }
    """
    with get_session() as s:
        stmt = select(Entry)
        if category_ids:
            stmt = stmt.where(Entry.category_id.in_(category_ids))
        if from_date:
            stmt = stmt.where(Entry.date >= from_date)
        if to_date:
            stmt = stmt.where(Entry.date <= to_date)
        entries = s.exec(stmt).all()

        if not entries:
            return {"count": 0, "sum": 0.0, "avg": 0.0, "min": None, "max": None, "total_deposit": 0.0}

        values = [e.value for e in entries]
        deposits = [e.deposit if e.deposit is not None else 0.0 for e in entries]
        return {
            "count": len(values),
            "sum": sum(values),
            "avg": sum(values) / len(values),
            "min": min(values),
            "max": max(values),
            "total_deposit": sum(deposits),
        }

def monthly_by_year(
    category_id: int,
    from_year: Optional[int] = None,
    to_year: Optional[int] = None,
) -> dict:
    """
    Returns per-year, per-month aggregates for one category.
    Result shape:
    { "years": { "2023": {"values": [12 floats], "deposits": [12 floats]}, ... } }
    """
    with get_session() as s:
        stmt = select(Entry).where(Entry.category_id == category_id)
        if from_year:
            stmt = stmt.where(Entry.date >= f"{from_year:04d}-01")
        if to_year:
            stmt = stmt.where(Entry.date <= f"{to_year:04d}-12")
        entries = s.exec(stmt.order_by(Entry.date)).all()

        years = {}
        for e in entries:
            try:
                y_str, m_str = e.date.split("-")
                y = int(y_str); m = int(m_str)
            except Exception:
                continue
            if from_year and y < from_year:
                continue
            if to_year and y > to_year:
                continue
            ys = str(y)
            if ys not in years:
                years[ys] = {"values": [0.0]*12, "deposits": [0.0]*12}
            years[ys]["values"][m-1] += float(e.value or 0.0)
            years[ys]["deposits"][m-1] += float(e.deposit or 0.0)
        return {"category_id": category_id, "years": years}

def auto_create_entries_for_month(yyyy_mm: Optional[str] = None) -> List[dict]:
    """
    Create zero-value entries for categories with auto_create=True for the given month.
    If yyyy_mm is None, uses current month.
    Returns list of created items: {"category_id": int, "entry_id": int}
    """
    from datetime import date
    if yyyy_mm is None:
        today = date.today()
        yyyy_mm = f"{today.year:04d}-{today.month:02d}"

    created = []
    with get_session() as s:
        cats = s.exec(select(Category).where(Category.auto_create == True)).all()
        for c in cats:
            exists = s.exec(select(Entry).where(Entry.category_id == c.id, Entry.date == yyyy_mm)).first()
            if exists:
                continue
            deposit = None
            if c.type == "sparen":
                last = s.exec(select(Entry).where(Entry.category_id == c.id).order_by(Entry.date.desc())).first()
                if last and last.deposit is not None:
                    deposit = last.deposit
            e = Entry(category_id=c.id, date=yyyy_mm, value=0.0, deposit=deposit, auto_generated=True)
            s.add(e)
            s.commit()
            s.refresh(e)
            created.append({"category_id": c.id, "entry_id": e.id})
    return created
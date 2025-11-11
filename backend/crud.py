"""
CRUD operations for database entities.

This module provides Create, Read, Update, Delete operations for
Category and Entry models with proper error handling and logging.
"""

from typing import List, Optional
from sqlmodel import select

from .db import get_session
from .models import Category, Entry
from .constants import CategoryType, DUPLICATE_SUFFIX, SPAREN_DEFAULT_UNIT
from .logger import get_logger
from .utils import get_current_month, parse_month_string


logger = get_logger("crud")

logger = get_logger("crud")


# ============================================================================
# Category CRUD Operations
# ============================================================================

def create_category(category: Category) -> Category:
    """
    Create a new category in the database.
    
    Args:
        category: Category object to create
        
    Returns:
        Created category with assigned ID
        
    Raises:
        Exception: If database operation fails
    """
    try:
        with get_session() as s:
            s.add(category)
            s.commit()
            s.refresh(category)
            logger.info(f"Created category: {category.name} (ID: {category.id})")
            return category
    except Exception as e:
        logger.error(f"Failed to create category: {e}")
        raise


def list_categories() -> List[Category]:
    """
    Retrieve all categories from the database.
    
    Returns:
        List of all Category objects
    """
    try:
        with get_session() as s:
            categories = s.exec(select(Category)).all()
            logger.debug(f"Retrieved {len(categories)} categories")
            return categories
    except Exception as e:
        logger.error(f"Failed to list categories: {e}")
        raise


def get_category(category_id: int) -> Optional[Category]:
    """
    Retrieve a single category by ID.
    
    Args:
        category_id: ID of the category to retrieve
        
    Returns:
        Category object or None if not found
    """
    try:
        with get_session() as s:
            category = s.exec(
                select(Category).where(Category.id == category_id)
            ).first()
            if category:
                logger.debug(f"Retrieved category: {category.name} (ID: {category_id})")
            else:
                logger.warning(f"Category not found: ID {category_id}")
            return category
    except Exception as e:
        logger.error(f"Failed to get category {category_id}: {e}")
        raise


def update_category(category_id: int, data: Category) -> Optional[Category]:
    """
    Update an existing category.
    
    Args:
        category_id: ID of the category to update
        data: Category object with updated fields
        
    Returns:
        Updated category or None if not found
        
    Raises:
        Exception: If database operation fails
    """
    try:
        with get_session() as s:
            cat = s.exec(
                select(Category).where(Category.id == category_id)
            ).first()
            
            if not cat:
                logger.warning(f"Cannot update - category not found: ID {category_id}")
                return None
            
            # Update allowed fields
            if data.name is not None:
                cat.name = data.name
            if data.icon is not None:
                cat.icon = data.icon
            if data.type is not None:
                cat.type = data.type
            if data.unit is not None:
                cat.unit = data.unit
            if data.auto_create is not None:
                cat.auto_create = data.auto_create
            
            s.add(cat)
            s.commit()
            s.refresh(cat)
            logger.info(f"Updated category: {cat.name} (ID: {category_id})")
            return cat
    except Exception as e:
        logger.error(f"Failed to update category {category_id}: {e}")
        raise


def delete_category(category_id: int) -> bool:
    """
    Delete a category and all its entries.
    
    Args:
        category_id: ID of the category to delete
        
    Returns:
        True if deleted, False if not found
        
    Raises:
        Exception: If database operation fails
    """
    try:
        with get_session() as s:
            cat = s.exec(
                select(Category).where(Category.id == category_id)
            ).first()
            
            if not cat:
                logger.warning(f"Cannot delete - category not found: ID {category_id}")
                return False
            
            # Delete all entries for this category
            entries = s.exec(
                select(Entry).where(Entry.category_id == category_id)
            ).all()
            
            for entry in entries:
                s.delete(entry)
            
            s.delete(cat)
            s.commit()
            
            logger.info(
                f"Deleted category: {cat.name} (ID: {category_id}) with {len(entries)} entries"
            )
            return True
    except Exception as e:
        logger.error(f"Failed to delete category {category_id}: {e}")
        raise


def duplicate_category(category_id: int) -> Optional[Category]:
    """
    Duplicate a category with all its entries.
    
    The new category will have the name appended with ' (Kopie)'.
    
    Args:
        category_id: ID of the category to duplicate
        
    Returns:
        Duplicated category or None if original not found
        
    Raises:
        Exception: If database operation fails
    """
    try:
        with get_session() as s:
            # Get original category
            original_cat = s.exec(
                select(Category).where(Category.id == category_id)
            ).first()
            
            if not original_cat:
                logger.warning(f"Cannot duplicate - category not found: ID {category_id}")
                return None
            
            # Create new category with modified name
            new_cat = Category(
                name=f"{original_cat.name}{DUPLICATE_SUFFIX}",
                icon=original_cat.icon,
                type=original_cat.type,
                unit=original_cat.unit,
                auto_create=original_cat.auto_create
            )
            s.add(new_cat)
            s.commit()
            s.refresh(new_cat)
            
            # Copy all entries
            original_entries = s.exec(
                select(Entry).where(Entry.category_id == category_id)
            ).all()
            
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
            
            logger.info(
                f"Duplicated category: {original_cat.name} -> {new_cat.name} "
                f"with {len(original_entries)} entries (ID: {new_cat.id})"
            )
            return new_cat
    except Exception as e:
        logger.error(f"Failed to duplicate category {category_id}: {e}")
        raise


# ============================================================================
# Entry CRUD Operations
# ============================================================================

def create_entry(entry: Entry) -> Entry:
    """
    Create a new entry in the database.
    
    Args:
        entry: Entry object to create
        
    Returns:
        Created entry with assigned ID
        
    Raises:
        Exception: If database operation fails
    """
    try:
        with get_session() as s:
            s.add(entry)
            s.commit()
            s.refresh(entry)
            logger.info(
                f"Created entry for category {entry.category_id}: "
                f"date={entry.date}, value={entry.value}"
            )
            return entry
    except Exception as e:
        logger.error(f"Failed to create entry: {e}")
        raise


def list_entries_for_category(category_id: int) -> List[Entry]:
    """
    Retrieve all entries for a specific category, ordered by date.
    
    Args:
        category_id: ID of the category
        
    Returns:
        List of Entry objects
    """
    try:
        with get_session() as s:
            entries = s.exec(
                select(Entry)
                .where(Entry.category_id == category_id)
                .order_by(Entry.date)
            ).all()
            logger.debug(f"Retrieved {len(entries)} entries for category {category_id}")
            return entries
    except Exception as e:
        logger.error(f"Failed to list entries for category {category_id}: {e}")
        raise


def get_entry(entry_id: int) -> Optional[Entry]:
    """
    Retrieve a single entry by ID.
    
    Args:
        entry_id: ID of the entry to retrieve
        
    Returns:
        Entry object or None if not found
    """
    try:
        with get_session() as s:
            entry = s.exec(
                select(Entry).where(Entry.id == entry_id)
            ).first()
            if entry:
                logger.debug(f"Retrieved entry: ID {entry_id}")
            else:
                logger.warning(f"Entry not found: ID {entry_id}")
            return entry
    except Exception as e:
        logger.error(f"Failed to get entry {entry_id}: {e}")
        raise


def update_entry(entry_id: int, data: Entry) -> Optional[Entry]:
    """
    Update an existing entry.
    
    Args:
        entry_id: ID of the entry to update
        data: Entry object with updated fields
        
    Returns:
        Updated entry or None if not found
        
    Raises:
        Exception: If database operation fails
    """
    try:
        with get_session() as s:
            ent = s.exec(
                select(Entry).where(Entry.id == entry_id)
            ).first()
            
            if not ent:
                logger.warning(f"Cannot update - entry not found: ID {entry_id}")
                return None
            
            # Update allowed fields
            if data.category_id is not None:
                ent.category_id = data.category_id
            if data.date is not None:
                ent.date = data.date
            if data.value is not None:
                ent.value = data.value
            # deposit may be None intentionally
            ent.deposit = data.deposit
            if data.comment is not None:
                ent.comment = data.comment
            if data.auto_generated is not None:
                ent.auto_generated = data.auto_generated
            
            s.add(ent)
            s.commit()
            s.refresh(ent)
            logger.info(f"Updated entry: ID {entry_id}")
            return ent
    except Exception as e:
        logger.error(f"Failed to update entry {entry_id}: {e}")
        raise


def delete_entry(entry_id: int) -> bool:
    """
    Delete an entry.
    
    Args:
        entry_id: ID of the entry to delete
        
    Returns:
        True if deleted, False if not found
        
    Raises:
        Exception: If database operation fails
    """
    try:
        with get_session() as s:
            ent = s.exec(
                select(Entry).where(Entry.id == entry_id)
            ).first()
            
            if not ent:
                logger.warning(f"Cannot delete - entry not found: ID {entry_id}")
                return False
            
            s.delete(ent)
            s.commit()
            logger.info(f"Deleted entry: ID {entry_id}")
            return True
    except Exception as e:
        logger.error(f"Failed to delete entry {entry_id}: {e}")
        raise


# ============================================================================
# Query & Search Operations
# ============================================================================

def find_last_entry_for_category(category_id: int) -> Optional[Entry]:
    """
    Find the most recent entry for a category.
    
    Args:
        category_id: ID of the category
        
    Returns:
        Most recent Entry or None if no entries exist
    """
    try:
        with get_session() as s:
            entry = s.exec(
                select(Entry)
                .where(Entry.category_id == category_id)
                .order_by(Entry.date.desc())
            ).first()
            return entry
    except Exception as e:
        logger.error(f"Failed to find last entry for category {category_id}: {e}")
        raise


def entry_exists_for_month(category_id: int, yyyy_mm: str) -> bool:
    """
    Check if an entry exists for a specific month.
    
    Args:
        category_id: ID of the category
        yyyy_mm: Month string in YYYY-MM format
        
    Returns:
        True if entry exists, False otherwise
    """
    try:
        with get_session() as s:
            entry = s.exec(
                select(Entry).where(
                    Entry.category_id == category_id,
                    Entry.date == yyyy_mm
                )
            ).first()
            return entry is not None
    except Exception as e:
        logger.error(
            f"Failed to check entry existence for category {category_id}, "
            f"month {yyyy_mm}: {e}"
        )
        raise


def search_entries(
    category_ids: Optional[List[int]] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    comment_contains: Optional[str] = None,
    type_filter: Optional[str] = None,
) -> List[Entry]:
    """
    Search entries with optional filters.
    
    Args:
        category_ids: List of category IDs to include
        from_date: Start date (YYYY-MM, inclusive)
        to_date: End date (YYYY-MM, inclusive)
        comment_contains: Substring to search in comment
        type_filter: Category type filter ("normal" or "sparen")
        
    Returns:
        List of matching Entry objects, ordered by date
    """
    try:
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
            entries = s.exec(stmt).all()
            
            logger.debug(
                f"Search returned {len(entries)} entries "
                f"(categories={category_ids}, type={type_filter})"
            )
            return entries
    except Exception as e:
        logger.error(f"Failed to search entries: {e}")
        raise


# ============================================================================
# Aggregation & Statistics Operations
# ============================================================================

def aggregate_entries(
    category_ids: Optional[List[int]] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> dict:
    """
    Calculate simple aggregates across matching entries.
    
    Args:
        category_ids: List of category IDs to include
        from_date: Start date (YYYY-MM, inclusive)
        to_date: End date (YYYY-MM, inclusive)
        
    Returns:
        Dictionary with keys: count, sum, avg, min, max, total_deposit
    """
    try:
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
                return {
                    "count": 0,
                    "sum": 0.0,
                    "avg": 0.0,
                    "min": None,
                    "max": None,
                    "total_deposit": 0.0
                }
            
            values = [e.value for e in entries]
            deposits = [e.deposit if e.deposit is not None else 0.0 for e in entries]
            
            result = {
                "count": len(values),
                "sum": sum(values),
                "avg": sum(values) / len(values),
                "min": min(values),
                "max": max(values),
                "total_deposit": sum(deposits),
            }
            
            logger.debug(
                f"Aggregated {len(entries)} entries: sum={result['sum']}, "
                f"avg={result['avg']:.2f}"
            )
            return result
    except Exception as e:
        logger.error(f"Failed to aggregate entries: {e}")
        raise


def monthly_by_year(
    category_id: int,
    from_year: Optional[int] = None,
    to_year: Optional[int] = None,
) -> dict:
    """
    Calculate per-year, per-month aggregates for one category.
    
    Args:
        category_id: ID of the category
        from_year: Start year (inclusive)
        to_year: End year (inclusive)
        
    Returns:
        Dictionary with structure:
        {
            "category_id": int,
            "years": {
                "2023": {"values": [12 floats], "deposits": [12 floats]},
                ...
            }
        }
    """
    try:
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
                    year, month = parse_month_string(e.date)
                except Exception:
                    logger.warning(f"Invalid date format in entry {e.id}: {e.date}")
                    continue
                
                if from_year and year < from_year:
                    continue
                if to_year and year > to_year:
                    continue
                
                year_str = str(year)
                if year_str not in years:
                    years[year_str] = {"values": [0.0] * 12, "deposits": [0.0] * 12}
                
                years[year_str]["values"][month - 1] += float(e.value or 0.0)
                years[year_str]["deposits"][month - 1] += float(e.deposit or 0.0)
            
            logger.debug(
                f"Monthly aggregation for category {category_id}: {len(years)} years"
            )
            return {"category_id": category_id, "years": years}
    except Exception as e:
        logger.error(f"Failed to aggregate monthly data for category {category_id}: {e}")
        raise


# ============================================================================
# Auto-Creation Operations
# ============================================================================

def auto_create_entries_for_month(yyyy_mm: Optional[str] = None) -> List[dict]:
    """
    Create zero-value entries for categories with auto_create=True.
    
    For "sparen" categories, carry over the last deposit value.
    
    Args:
        yyyy_mm: Month string in YYYY-MM format (default: current month)
        
    Returns:
        List of dicts with keys: category_id, entry_id
    """
    if yyyy_mm is None:
        yyyy_mm = get_current_month()
    
    try:
        created = []
        with get_session() as s:
            cats = s.exec(
                select(Category).where(Category.auto_create == True)
            ).all()
            
            logger.info(
                f"Auto-creating entries for {len(cats)} categories "
                f"(month: {yyyy_mm})"
            )
            
            for cat in cats:
                # Check if entry already exists
                exists = s.exec(
                    select(Entry).where(
                        Entry.category_id == cat.id,
                        Entry.date == yyyy_mm
                    )
                ).first()
                
                if exists:
                    logger.debug(
                        f"Entry already exists for category {cat.id}, skipping"
                    )
                    continue
                
                # For sparen categories, carry over last deposit
                deposit = None
                if cat.type == CategoryType.SPAREN.value:
                    last = s.exec(
                        select(Entry)
                        .where(Entry.category_id == cat.id)
                        .order_by(Entry.date.desc())
                    ).first()
                    if last and last.deposit is not None:
                        deposit = last.deposit
                
                # Create entry
                entry = Entry(
                    category_id=cat.id,
                    date=yyyy_mm,
                    value=0.0,
                    deposit=deposit,
                    auto_generated=True
                )
                s.add(entry)
                s.commit()
                s.refresh(entry)
                
                created.append({"category_id": cat.id, "entry_id": entry.id})
                logger.debug(f"Created auto-entry for category {cat.id}: ID {entry.id}")
            
            logger.info(f"Auto-created {len(created)} entries")
            return created
    except Exception as e:
        logger.error(f"Failed to auto-create entries: {e}")
        raise
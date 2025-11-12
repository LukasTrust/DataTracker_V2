"""
FastAPI application main module.

This module defines the FastAPI application, CORS configuration,
and all API endpoints for the Data Tracker application.
"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .constants import CORS_ALLOWED_ORIGINS, CategoryType, SPAREN_DEFAULT_UNIT, EXCEL_DEFAULT_FILENAME
from .db import init_db
from .export import generate_workbook
from .logger import get_logger
from .models import Category, Entry
from .schemas import (
    CategoryCreate,
    CategoryUpdate,
    CategoryRead,
    EntryCreate,
    EntryUpdate,
    EntryRead,
)
from .scheduler import start_scheduler, stop_scheduler
from .utils import parse_comma_separated_ids
from .crud import (
    create_category,
    list_categories,
    get_category,
    update_category,
    delete_category,
    duplicate_category,
    create_entry,
    list_entries_for_category,
    get_entry,
    update_entry,
    delete_entry,
    search_entries,
    auto_create_entries_for_month,
)
from .services.stats_service import (
    get_dashboard_stats,
    get_dashboard_timeseries,
    get_stats_overview,
    get_monthly_stats,
)


logger = get_logger("main")

app = FastAPI(
    title="Local Data Tracker API",
    description="API for tracking personal data across categories",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Lifecycle Events
# ============================================================================

@app.on_event("startup")
def on_startup() -> None:
    """Initialize database and start scheduler on application startup."""
    logger.info("Application starting up")
    
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # Don't crash the app, but log the error
    
    try:
        start_scheduler()
        logger.info("Scheduler started successfully")
    except Exception as e:
        logger.warning(f"Scheduler failed to start: {e}")
        # Scheduler is optional, continue anyway


@app.on_event("shutdown")
def on_shutdown() -> None:
    """Clean up resources on application shutdown."""
    logger.info("Application shutting down")
    
    try:
        stop_scheduler()
        logger.info("Scheduler stopped successfully")
    except Exception as e:
        logger.warning(f"Error stopping scheduler: {e}")


# ============================================================================
# Category Endpoints
# ============================================================================

@app.post("/categories", response_model=CategoryRead, status_code=201)
def api_create_category(cat: CategoryCreate) -> CategoryRead:
    """
    Create a new category.
    
    For "sparen" (savings) categories, the unit is automatically set to "€".
    """
    try:
        # Build category model
        category = Category(
            name=cat.name,
            type=cat.type if cat.type else CategoryType.NORMAL.value,
            unit=cat.unit,
            auto_create=cat.auto_create if cat.auto_create else False
        )
        
        # Force € for sparen categories
        if category.type == CategoryType.SPAREN.value:
            category.unit = SPAREN_DEFAULT_UNIT
        
        created = create_category(category)
        logger.info(f"Created category via API: {created.name} (ID: {created.id})")
        return created
    
    except Exception as e:
        logger.error(f"Failed to create category: {e}")
        raise HTTPException(status_code=500, detail="Failed to create category")


@app.get("/categories", response_model=List[CategoryRead])
def api_list_categories() -> List[CategoryRead]:
    """List all categories."""
    try:
        categories = list_categories()
        return categories
    except Exception as e:
        logger.error(f"Failed to list categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to list categories")

@app.put("/categories/{category_id}", response_model=CategoryRead)
def api_update_category(category_id: int, cat: CategoryUpdate):
    existing = get_category(category_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    # apply updates via crud
    model = Category(**{k: v for k, v in cat.dict().items() if v is not None})
    # If type is being changed to "sparen", force unit to "€"
    if model.type == "sparen":
        model.unit = "€"
    updated = update_category(category_id, model)
    return updated

@app.delete("/categories/{category_id}")
def api_delete_category(category_id: int):
    success = delete_category(category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"deleted": True}

@app.post("/categories/{category_id}/duplicate", response_model=CategoryRead)
def api_duplicate_category(category_id: int):
    duplicated = duplicate_category(category_id)
    if not duplicated:
        raise HTTPException(status_code=404, detail="Category not found")
    return duplicated

@app.post("/categories/{category_id}/entries", response_model=EntryRead)
def api_create_entry(category_id: int, entry: EntryCreate):
    # validate and convert
    if entry.category_id != category_id:
        raise HTTPException(status_code=400, detail="category_id mismatch")
    model = Entry(
        category_id=entry.category_id,
        date=entry.date,
        value=entry.value if entry.value is not None else 0.0,
        deposit=entry.deposit,
        comment=entry.comment,
        auto_generated=entry.auto_generated if entry.auto_generated else False
    )
    return create_entry(model)

@app.get("/categories/{category_id}/entries", response_model=List[EntryRead])
def api_list_entries(category_id: int):
    return list_entries_for_category(category_id)

@app.put("/categories/{category_id}/entries/{entry_id}", response_model=EntryRead)
def api_update_entry(category_id: int, entry_id: int, entry: EntryUpdate):
    existing_ent = get_entry(entry_id)
    if not existing_ent:
        raise HTTPException(status_code=404, detail="Entry not found")
    if existing_ent.category_id != category_id:
        raise HTTPException(status_code=400, detail="entry does not belong to category")
    # build partial model
    update_data = {k: v for k, v in entry.dict().items() if v is not None}
    model = Entry(**update_data)
    # ensure category id remains correct
    model.category_id = category_id
    updated = update_entry(entry_id, model)
    return updated

@app.delete("/categories/{category_id}/entries/{entry_id}")
def api_delete_entry(category_id: int, entry_id: int):
    ent = get_entry(entry_id)
    if not ent:
        raise HTTPException(status_code=404, detail="Entry not found")
    if ent.category_id != category_id:
        raise HTTPException(status_code=400, detail="entry does not belong to category")
    success = delete_entry(entry_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete entry")
    return {"deleted": True}

# search endpoint - response uses EntryRead
@app.get("/entries", response_model=List[EntryRead])
def api_search_entries(
    category_ids: Optional[str] = Query(None, description="Comma-separated category ids (e.g. 1,2)"),
    from_date: Optional[str] = Query(None, description="YYYY-MM"),
    to_date: Optional[str] = Query(None, description="YYYY-MM"),
    comment: Optional[str] = Query(None, description="Substring to search in comments"),
    type: Optional[str] = Query(None, description="Category type filter (e.g. 'normal' or 'sparen')"),
):
    ids = None
    if category_ids:
        try:
            ids = [int(x.strip()) for x in category_ids.split(",") if x.strip()]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid category_ids parameter")
    results = search_entries(
        category_ids=ids,
        from_date=from_date,
        to_date=to_date,
        comment_contains=comment,
        type_filter=type,
    )
    return results

# Stats: einfache Aggregation über Einträge
@app.get("/stats/overview")
def api_stats_overview(
    category_ids: Optional[str] = Query(None, description="Comma-separated category ids (e.g. 1,2)"),
    from_date: Optional[str] = Query(None, description="YYYY-MM"),
    to_date: Optional[str] = Query(None, description="YYYY-MM"),
):
    ids = None
    if category_ids:
        try:
            ids = [int(x.strip()) for x in category_ids.split(",") if x.strip()]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid category_ids parameter")
    stats = aggregate_entries(category_ids=ids, from_date=from_date, to_date=to_date)
    return stats

# Stats: monatliche Aggregation pro Jahr für ein Category (nützlich für Jahresvergleich)
@app.get("/stats/monthly")
def api_stats_monthly(
    category_id: int = Query(..., description="Category id to aggregate"),
    from_year: Optional[int] = Query(None, description="Start year (inclusive)"),
    to_year: Optional[int] = Query(None, description="End year (inclusive)"),
):
    # validate category exists
    cat = get_category(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    data = monthly_by_year(category_id=category_id, from_year=from_year, to_year=to_year)
    return data

@app.post("/auto-create-current-month")
def api_auto_create_current_month():
    """
    Manually trigger creation of zero-value entries for categories with auto_create=True.
    Returns list of created items.
    """
    created = auto_create_entries_for_month()
    return {"created": created}

@app.get("/dashboard/stats")
def api_dashboard_stats():
    """
    Return dashboard statistics including category counts and per-category sums.
    """
    categories = list_categories()
    
    stats = {
        "totalCategories": len(categories),
        "categorySums": []
    }
    
    for cat in categories:
        entries = list_entries_for_category(cat.id)
        
        # For "sparen" categories, use only the last value
        # For other categories, sum all values
        if cat.type == "sparen":
            sorted_entries = sorted(entries, key=lambda x: x.date)
            total_value = sorted_entries[-1].value if sorted_entries else 0
        else:
            total_value = sum(e.value for e in entries)
        
        total_deposits = sum(e.deposit for e in entries if e.deposit is not None)
        
        # Calculate sparkline data (last 10 entries)
        sparkline_data = []
        sorted_entries = sorted(entries, key=lambda x: x.date)
        last_entries = sorted_entries[-10:] if len(sorted_entries) > 10 else sorted_entries
        for e in last_entries:
            sparkline_data.append({
                "date": e.date.isoformat() if hasattr(e.date, 'isoformat') else str(e.date),
                "value": e.value
            })
        
        # Calculate profit/loss for sparen categories
        profit = None
        profit_percentage = None
        if cat.type == "sparen" and total_deposits > 0:
            profit = total_value - total_deposits
            profit_percentage = (profit / total_deposits) * 100 if total_deposits > 0 else 0
        
        stats["categorySums"].append({
            "id": cat.id,
            "name": cat.name,
            "type": cat.type,
            "unit": cat.unit,
            "totalValue": total_value,
            "totalDeposits": total_deposits,
            "entryCount": len(entries),
            "sparklineData": sparkline_data,
            "profit": profit,
            "profitPercentage": profit_percentage
        })
    
    return stats

@app.get("/dashboard/timeseries")
def api_dashboard_timeseries(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    category_type: Optional[str] = Query(None, description="Filter by type: 'sparen' or 'normal'"),
):
    """
    Return timeseries data for dashboard charts.
    For sparen categories, use last value per category.
    For normal categories, sum all values.
    """
    categories = list_categories()
    
    # Filter categories by type if specified
    if category_type and category_type != "all":
        categories = [c for c in categories if c.type == category_type]
    
    # Collect unique dates
    all_dates = set()
    category_entries = {}
    
    for cat in categories:
        entries = list_entries_for_category(cat.id)
        
        # Apply date filter
        if start_date:
            entries = [e for e in entries if str(e.date) >= start_date]
        if end_date:
            entries = [e for e in entries if str(e.date) <= end_date]
        
        category_entries[cat.id] = {
            'type': cat.type,
            'unit': cat.unit,
            'entries': sorted(entries, key=lambda x: x.date)
        }
        
        for entry in entries:
            date_str = entry.date.isoformat() if hasattr(entry.date, 'isoformat') else str(entry.date)
            all_dates.add(date_str)
    
    # Build timeseries data
    all_data = {}
    sparen_data = {}
    
    for date_str in sorted(all_dates):
        total_value = 0
        sparen_value = 0
        sparen_deposits = 0
        
        for cat_id, data in category_entries.items():
            cat_type = data['type']
            cat_unit = data['unit']
            entries = data['entries']
            
            # Only include categories with € unit in total value
            if cat_unit != '€':
                continue
            
            if cat_type == 'sparen':
                # For sparen: use the last value up to this date
                last_entry = None
                for entry in entries:
                    entry_date = entry.date.isoformat() if hasattr(entry.date, 'isoformat') else str(entry.date)
                    if entry_date <= date_str:
                        last_entry = entry
                
                if last_entry:
                    total_value += last_entry.value
                    sparen_value += last_entry.value
                    
                # Sum deposits up to this date
                for entry in entries:
                    entry_date = entry.date.isoformat() if hasattr(entry.date, 'isoformat') else str(entry.date)
                    if entry_date <= date_str and entry.deposit:
                        sparen_deposits += entry.deposit
            else:
                # For normal: sum all values up to this date
                for entry in entries:
                    entry_date = entry.date.isoformat() if hasattr(entry.date, 'isoformat') else str(entry.date)
                    if entry_date <= date_str:
                        total_value += entry.value
        
        all_data[date_str] = {"date": date_str, "value": total_value}
        
        if sparen_value > 0 or sparen_deposits > 0:
            sparen_data[date_str] = {
                "date": date_str,
                "value": sparen_value,
                "deposits": sparen_deposits,
                "profit": sparen_value - sparen_deposits
            }
    # Category comparison
    category_comparison = []
    for cat in categories:
        entries = category_entries[cat.id]['entries']
        cat_type = category_entries[cat.id]['type']
        
        if cat_type == 'sparen':
            # For sparen: use only the last value
            total_value = entries[-1].value if entries else 0
        else:
            # For normal: sum all values
            total_value = sum(e.value for e in entries)
        
        category_comparison.append({
            "name": cat.name,
            "value": total_value,
            "type": cat.type
        })
    
    return {
        "totalValueData": sorted(all_data.values(), key=lambda x: x["date"]),
        "sparenData": sorted(sparen_data.values(), key=lambda x: x["date"]),
        "categoryComparison": category_comparison
    }

@app.get("/export")
def api_export_all():
    """
    Export all categories data as Excel file.
    """
    wb_bytes = generate_workbook()
    return StreamingResponse(
        io.BytesIO(wb_bytes.read()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=datatracker_export.xlsx"}
    )

@app.get("/export/category/{category_id}")
def api_export_category(category_id: int):
    """
    Export single category data as Excel file.
    """
    cat = get_category(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    wb_bytes = generate_workbook(category_ids=[category_id])
    filename = f"{cat.name.replace(' ', '_')}_export.xlsx"
    return StreamingResponse(
        io.BytesIO(wb_bytes.read()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
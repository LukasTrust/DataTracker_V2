"""
FastAPI application main module.

This module defines the FastAPI application, CORS configuration,
and all API endpoints for the Data Tracker application.
"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .constants import (
    CORS_ALLOWED_ORIGINS,
    CategoryType,
    SPAREN_DEFAULT_UNIT,
    EXCEL_DEFAULT_FILENAME,
)
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
    version="2.0.0",
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

    try:
        start_scheduler()
        logger.info("Scheduler started successfully")
    except Exception as e:
        logger.warning(f"Scheduler failed to start: {e}")


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
# Health Check Endpoint
# ============================================================================


@app.get("/health")
def health_check() -> dict:
    """
    Health check endpoint for monitoring and load balancers.
    
    Returns:
        dict: Health status information
    """
    return {
        "status": "healthy",
        "service": "datatracker-backend",
        "version": "2.0.0"
    }


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
            icon=cat.icon,
            type=cat.type if cat.type else CategoryType.NORMAL.value,
            unit=cat.unit,
            auto_create=cat.auto_create if cat.auto_create else False,
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
        return list_categories()
    except Exception as e:
        logger.error(f"Failed to list categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to list categories")


@app.put("/categories/{category_id}", response_model=CategoryRead)
def api_update_category(category_id: int, cat: CategoryUpdate) -> CategoryRead:
    """Update an existing category."""
    existing = get_category(category_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")

    try:
        # Build update model from provided fields
        update_data = {k: v for k, v in cat.dict().items() if v is not None}
        model = Category(**update_data)

        # Force € for sparen categories
        if model.type == CategoryType.SPAREN.value:
            model.unit = SPAREN_DEFAULT_UNIT

        updated = update_category(category_id, model)
        return updated

    except Exception as e:
        logger.error(f"Failed to update category {category_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update category")


@app.delete("/categories/{category_id}")
def api_delete_category(category_id: int) -> dict:
    """Delete a category and all its entries."""
    success = delete_category(category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"deleted": True}


@app.post("/categories/{category_id}/duplicate", response_model=CategoryRead)
def api_duplicate_category(category_id: int) -> CategoryRead:
    """Duplicate a category with all its entries."""
    duplicated = duplicate_category(category_id)
    if not duplicated:
        raise HTTPException(status_code=404, detail="Category not found")
    return duplicated


# ============================================================================
# Entry Endpoints
# ============================================================================


@app.post("/categories/{category_id}/entries", response_model=EntryRead, status_code=201)
def api_create_entry(category_id: int, entry: EntryCreate) -> EntryRead:
    """Create a new entry for a category."""
    if entry.category_id != category_id:
        raise HTTPException(status_code=400, detail="category_id mismatch")

    try:
        model = Entry(
            category_id=entry.category_id,
            date=entry.date,
            value=entry.value if entry.value is not None else 0.0,
            deposit=entry.deposit,
            comment=entry.comment,
            auto_generated=entry.auto_generated if entry.auto_generated else False,
        )
        return create_entry(model)

    except Exception as e:
        logger.error(f"Failed to create entry: {e}")
        raise HTTPException(status_code=500, detail="Failed to create entry")


@app.get("/categories/{category_id}/entries", response_model=List[EntryRead])
def api_list_entries(category_id: int) -> List[EntryRead]:
    """List all entries for a category."""
    try:
        return list_entries_for_category(category_id)
    except Exception as e:
        logger.error(f"Failed to list entries for category {category_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to list entries")


@app.put("/categories/{category_id}/entries/{entry_id}", response_model=EntryRead)
def api_update_entry(category_id: int, entry_id: int, entry: EntryUpdate) -> EntryRead:
    """Update an existing entry."""
    existing_ent = get_entry(entry_id)
    if not existing_ent:
        raise HTTPException(status_code=404, detail="Entry not found")
    if existing_ent.category_id != category_id:
        raise HTTPException(
            status_code=400, detail="entry does not belong to category"
        )

    try:
        # Build update model
        update_data = {k: v for k, v in entry.dict().items() if v is not None}
        model = Entry(**update_data)
        model.category_id = category_id

        updated = update_entry(entry_id, model)
        return updated

    except Exception as e:
        logger.error(f"Failed to update entry {entry_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update entry")


@app.delete("/categories/{category_id}/entries/{entry_id}")
def api_delete_entry(category_id: int, entry_id: int) -> dict:
    """Delete an entry."""
    ent = get_entry(entry_id)
    if not ent:
        raise HTTPException(status_code=404, detail="Entry not found")
    if ent.category_id != category_id:
        raise HTTPException(
            status_code=400, detail="entry does not belong to category"
        )

    success = delete_entry(entry_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete entry")
    return {"deleted": True}


# ============================================================================
# Search & Query Endpoints
# ============================================================================


@app.get("/entries", response_model=List[EntryRead])
def api_search_entries(
    category_ids: Optional[str] = Query(
        None, description="Comma-separated category ids (e.g. 1,2)"
    ),
    from_date: Optional[str] = Query(None, description="YYYY-MM"),
    to_date: Optional[str] = Query(None, description="YYYY-MM"),
    comment: Optional[str] = Query(None, description="Substring to search in comments"),
    type: Optional[str] = Query(
        None, description="Category type filter (e.g. 'normal' or 'sparen')"
    ),
) -> List[EntryRead]:
    """Search entries with optional filters."""
    try:
        ids = parse_comma_separated_ids(category_ids)
        results = search_entries(
            category_ids=ids,
            from_date=from_date,
            to_date=to_date,
            comment_contains=comment,
            type_filter=type,
        )
        return results

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to search entries: {e}")
        raise HTTPException(status_code=500, detail="Failed to search entries")


# ============================================================================
# Statistics & Dashboard Endpoints
# ============================================================================


@app.get("/stats/overview")
def api_stats_overview(
    category_ids: Optional[str] = Query(
        None, description="Comma-separated category ids (e.g. 1,2)"
    ),
    from_date: Optional[str] = Query(None, description="YYYY-MM"),
    to_date: Optional[str] = Query(None, description="YYYY-MM"),
) -> dict:
    """Get overview statistics for entries."""
    try:
        ids = parse_comma_separated_ids(category_ids)
        stats = get_stats_overview(
            category_ids=ids, from_date=from_date, to_date=to_date
        )
        return stats

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate stats overview: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate statistics")


@app.get("/stats/monthly")
def api_stats_monthly(
    category_id: int = Query(..., description="Category id to aggregate"),
    from_year: Optional[int] = Query(None, description="Start year (inclusive)"),
    to_year: Optional[int] = Query(None, description="End year (inclusive)"),
) -> dict:
    """Get monthly statistics by year for a category."""
    # Validate category exists
    cat = get_category(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    try:
        data = get_monthly_stats(
            category_id=category_id, from_year=from_year, to_year=to_year
        )
        return data

    except Exception as e:
        logger.error(f"Failed to generate monthly stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate statistics")


@app.get("/dashboard/stats")
def api_dashboard_stats() -> dict:
    """Return dashboard statistics including category counts and per-category sums."""
    try:
        return get_dashboard_stats()
    except Exception as e:
        logger.error(f"Failed to generate dashboard stats: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to generate dashboard statistics"
        )


@app.get("/dashboard/timeseries")
def api_dashboard_timeseries(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    category_type: Optional[str] = Query(
        None, description="Filter by type: 'sparen' or 'normal'"
    ),
) -> dict:
    """Return timeseries data for dashboard charts."""
    try:
        return get_dashboard_timeseries(
            start_date=start_date, end_date=end_date, category_type=category_type
        )
    except Exception as e:
        logger.error(f"Failed to generate dashboard timeseries: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to generate dashboard timeseries"
        )


# ============================================================================
# Auto-Creation Endpoint
# ============================================================================


@app.post("/auto-create-current-month")
def api_auto_create_current_month() -> dict:
    """
    Manually trigger creation of zero-value entries for categories with auto_create=True.
    """
    try:
        created = auto_create_entries_for_month()
        return {"created": created}
    except Exception as e:
        logger.error(f"Failed to auto-create entries: {e}")
        raise HTTPException(status_code=500, detail="Failed to auto-create entries")


# ============================================================================
# Export Endpoints
# ============================================================================


@app.get("/export")
def api_export_all() -> StreamingResponse:
    """Export all categories data as Excel file."""
    try:
        wb_bytes = generate_workbook()
        return StreamingResponse(
            wb_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename={EXCEL_DEFAULT_FILENAME}"
            },
        )
    except Exception as e:
        logger.error(f"Failed to export all data: {e}")
        raise HTTPException(status_code=500, detail="Failed to export data")


@app.get("/export/category/{category_id}")
def api_export_category(category_id: int) -> StreamingResponse:
    """Export single category data as Excel file."""
    cat = get_category(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    try:
        wb_bytes = generate_workbook(category_ids=[category_id])
        filename = f"{cat.name.replace(' ', '_')}_export.xlsx"
        return StreamingResponse(
            wb_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as e:
        logger.error(f"Failed to export category {category_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to export category")

from fastapi import FastAPI, HTTPException, Query
from datetime import date, timedelta
from typing import List, Optional
from sqlmodel import select
from .db import init_db, get_session
from .models import Category, Entry
from .crud import (
    create_category,
    list_categories,
    create_entry,
    list_entries_for_category,
    find_last_entry_for_category,
    entry_exists_for_month,
    get_category,
    update_category,
    delete_category,
    duplicate_category,
    get_entry,
    update_entry,
    delete_entry,
    search_entries,
    aggregate_entries,
    monthly_by_year,
    auto_create_entries_for_month,
)
from .schemas import (
    CategoryCreate,
    CategoryUpdate,
    EntryCreate,
    EntryUpdate,
    CategoryRead,
    EntryRead,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .export import generate_workbook
import io
from .scheduler import start_scheduler, stop_scheduler

app = FastAPI(title="Local Data Tracker API")

# --- CORS konfigurieren für lokale Frontends (anpassen falls nötig) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    # start scheduler (runs immediate check + schedules monthly job)
    try:
        start_scheduler()
    except Exception:
        pass

@app.on_event("shutdown")
def on_shutdown():
    try:
        stop_scheduler()
    except Exception:
        pass

@app.post("/categories", response_model=CategoryRead)
def api_create_category(cat: CategoryCreate):
    # convert to Category model
    model = Category(
        name=cat.name,
        type=cat.type if cat.type else "normal",
        unit=cat.unit,
        auto_create=cat.auto_create if cat.auto_create else False
    )
    # For "sparen" (financial) categories, always set unit to "€"
    if model.type == "sparen":
        model.unit = "€"
    # For normal categories, use provided unit or default to None
    return create_category(model)

@app.get("/categories", response_model=List[CategoryRead])
def api_list_categories():
    return list_categories()

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
        total_value = sum(e.value for e in entries)
        total_deposits = sum(e.deposit for e in entries if e.deposit is not None)
        
        stats["categorySums"].append({
            "id": cat.id,
            "name": cat.name,
            "type": cat.type,
            "unit": cat.unit,
            "totalValue": total_value,
            "totalDeposits": total_deposits,
            "entryCount": len(entries)
        })
    
    return stats

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
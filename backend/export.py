from typing import List, Optional
from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import Font
from sqlmodel import select
from .db import get_session
from .models import Category, Entry

def _safe_sheet_title(title: str) -> str:
    # Excel sheet title max 31 chars and cannot contain some chars
    invalid = ['\\','/','*','[',']',':','?']
    for c in invalid:
        title = title.replace(c, '_')
    return title[:31]

def generate_workbook(category_ids: Optional[List[int]] = None, from_date: Optional[str] = None, to_date: Optional[str] = None) -> BytesIO:
    wb = Workbook()
    bold = Font(bold=True)
    with get_session() as s:
        if category_ids:
            cats = s.exec(select(Category).where(Category.id.in_(category_ids))).all()
        else:
            cats = s.exec(select(Category)).all()

        # If no categories, create one default sheet
        if not cats:
            ws = wb.active
            ws.title = "No categories"
            ws.append(["Info"])
            return _save_workbook(wb)

        # Remove default sheet if more than 0 cats and default still present
        if "Sheet" in wb.sheetnames and len(cats) > 0:
            wb.remove(wb["Sheet"])

        for c in cats:
            ws = wb.create_sheet(title=_safe_sheet_title(c.name or f"cat_{c.id}"))
            headers = ["Kategorie", "Datum", "Wert", "Einzahlung", "Einheit", "Kommentar", "Auto_generated"]
            ws.append(headers)
            for col_idx, _ in enumerate(headers, start=1):
                ws.cell(row=1, column=col_idx).font = bold

            stmt = select(Entry).where(Entry.category_id == c.id)
            if from_date:
                stmt = stmt.where(Entry.date >= from_date)
            if to_date:
                stmt = stmt.where(Entry.date <= to_date)
            stmt = stmt.order_by(Entry.date)

            entries = s.exec(stmt).all()
            for e in entries:
                ws.append([
                    c.name,
                    e.date,
                    e.value,
                    e.deposit if e.deposit is not None else "",
                    c.unit or "",
                    e.comment or "",
                    bool(e.auto_generated)
                ])

            # auto column width
            for column_cells in ws.columns:
                length = 0
                for cell in column_cells:
                    if cell.value is not None:
                        length = max(length, len(str(cell.value)))
                adjusted = (length + 2)
                col_letter = column_cells[0].column_letter
                ws.column_dimensions[col_letter].width = adjusted

    return _save_workbook(wb)

def _save_workbook(wb: Workbook) -> BytesIO:
    bio = BytesIO()
    wb.save(bio)
    bio.seek(0)
    return bio
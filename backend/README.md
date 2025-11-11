# Backend - Data Tracker V2

## 📁 Projektstruktur (Refaktoriert)

```
backend/
├── __init__.py
├── main.py                 # FastAPI App & API Endpoints
├── models.py               # SQLModel Datenbankmodelle
├── schemas.py              # Pydantic Validierungsschemas
├── crud.py                 # CRUD-Operationen
├── db.py                   # Datenbankverbindung
├── migrate.py              # Migrations-Runner
├── export.py               # Excel-Export
├── scheduler.py            # Background Scheduler
├── constants.py            # Konstanten & Enums ✨ NEU
├── utils.py                # Utility-Funktionen ✨ NEU
├── logger.py               # Logging-Setup ✨ NEU
├── requirements.txt        # Dependencies
├── services/               # Business-Logic Layer ✨ NEU
│   ├── __init__.py
│   └── stats_service.py    # Dashboard & Statistiken
└── migrations/
    ├── 001_init.sql
    ├── 002_add_units_to_sparen.sql
    ├── 003_add_icon_to_categories.sql
    └── 004_make_unit_required.sql
```

## 🎯 Refactoring-Verbesserungen

### 1. **Neue Module**
- **`constants.py`**: Zentrale Konstanten, Enums, Magic Strings
- **`utils.py`**: Wiederverwendbare Utility-Funktionen
- **`logger.py`**: Standardisiertes Logging für alle Module
- **`services/`**: Business-Logic-Layer zwischen API und Datenbank

### 2. **Code-Deduplikation**
- ✅ Query-Parameter-Parsing zentralisiert
- ✅ Date-Handling in utils.py ausgelagert
- ✅ Excel-Sheet-Sanitization wiederverwendbar
- ✅ Session-Management konsistent

### 3. **Konsistenz**
- ✅ Logging in allen Modulen
- ✅ Type-Hints vollständig
- ✅ Docstrings für alle Funktionen
- ✅ Error-Handling standardisiert
- ✅ PEP8-konform

### 4. **Architektur**
- ✅ Service-Layer für Business-Logik
- ✅ API-Layer schlank und fokussiert
- ✅ Klare Trennung von Verantwortlichkeiten

## 🚀 Setup & Installation

### 1. Virtual Environment

```bash
# Erstellen
python -m venv venv

# Aktivieren (Linux/Mac)
source venv/bin/activate

# Aktivieren (Windows)
venv\Scripts\activate
```

### 2. Dependencies installieren

```bash
pip install -r requirements.txt
```

### 3. Development Dependencies (Optional)

```bash
pip install -r requirements-dev.txt
```

## 🏃 Anwendung starten

```bash
# Development-Server mit Auto-Reload
uvicorn backend.main:app --reload --port 8000

# Oder mit dem start.sh Script aus dem Root-Verzeichnis
./start.sh
```

Die API ist dann verfügbar unter: http://localhost:8000

Interaktive API-Dokumentation: http://localhost:8000/docs

## 🧪 Code-Qualität

### Linting & Formatting

```bash
# Code formatieren (black)
black backend/

# Imports sortieren (isort)
isort backend/

# Linting (flake8)
flake8 backend/

# Type-Checking (mypy)
mypy backend/
```

### Pre-Commit Hooks (Empfohlen)

```bash
# Setup
pip install pre-commit
pre-commit install

# Manuell ausführen
pre-commit run --all-files
```

## 📝 API-Übersicht

### Categories
- `POST /categories` - Kategorie erstellen
- `GET /categories` - Alle Kategorien auflisten
- `PUT /categories/{id}` - Kategorie aktualisieren
- `DELETE /categories/{id}` - Kategorie löschen
- `POST /categories/{id}/duplicate` - Kategorie duplizieren

### Entries
- `POST /categories/{id}/entries` - Eintrag erstellen
- `GET /categories/{id}/entries` - Einträge einer Kategorie
- `PUT /categories/{id}/entries/{entry_id}` - Eintrag aktualisieren
- `DELETE /categories/{id}/entries/{entry_id}` - Eintrag löschen
- `GET /entries` - Einträge suchen (mit Filtern)

### Statistics & Dashboard
- `GET /dashboard/stats` - Dashboard-Übersicht
- `GET /dashboard/timeseries` - Zeitreihen-Daten
- `GET /stats/overview` - Statistik-Übersicht
- `GET /stats/monthly` - Monatliche Aggregation

### Export
- `GET /export` - Alle Daten als Excel exportieren
- `GET /export/category/{id}` - Einzelne Kategorie exportieren

### Automation
- `POST /auto-create-current-month` - Manuelle Auto-Erstellung

## 🗄️ Datenbank

SQLite-Datenbank mit Migrations-Support.

### Neue Migration hinzufügen

1. SQL-Datei in `migrations/` erstellen (Nummerierung: `005_description.sql`)
2. SQL-Befehle schreiben
3. Bei nächstem Start wird die Migration automatisch ausgeführt

## 📊 Logging

Alle Module nutzen standardisiertes Logging:

```python
from .logger import get_logger

logger = get_logger("module_name")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
```

## 🔒 Konstanten

Alle Magic Strings und Konfigurationswerte sind in `constants.py` definiert:

```python
from .constants import CategoryType, SPAREN_DEFAULT_UNIT

# Verwendung
if category.type == CategoryType.SPAREN.value:
    category.unit = SPAREN_DEFAULT_UNIT
```

## 🛠️ Utility-Funktionen

Wiederverwendbare Funktionen in `utils.py`:

```python
from .utils import parse_comma_separated_ids, validate_date_format

ids = parse_comma_separated_ids("1,2,3")  # [1, 2, 3]
is_valid = validate_date_format("2024-11")  # True
```

## 📈 Services

Business-Logik in separaten Service-Modulen:

```python
from .services.stats_service import get_dashboard_stats

stats = get_dashboard_stats()
```

## 🐛 Debugging

```bash
# Mit erhöhtem Logging
export LOG_LEVEL=DEBUG
uvicorn backend.main:app --reload --port 8000

# SQL-Queries loggen (in db.py: echo=True)
```

## 📦 Deployment

### Produktion

```bash
# Mit Gunicorn
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🔄 Migration von alter Struktur

Die alte `main.py` wurde als `main_backup.py` gesichert. Alle Funktionalität bleibt erhalten, nur besser strukturiert.

## 📚 Weiterführende Dokumentation

- FastAPI: https://fastapi.tiangolo.com/
- SQLModel: https://sqlmodel.tiangolo.com/
- Pydantic: https://docs.pydantic.dev/
- APScheduler: https://apscheduler.readthedocs.io/

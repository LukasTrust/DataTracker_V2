# DataTracker V2

Eine moderne Web-Anwendung zum Tracken und Visualisieren von persönlichen Daten - Finanzen, Gewohnheiten, Metriken und mehr.

## � Die Idee

DataTracker hilft dir, verschiedene Aspekte deines Lebens zu verfolgen und zu visualisieren:
- **Finanzen tracken** - Sparziele, Einnahmen, Ausgaben mit automatischer Berechnung
- **Gewohnheiten überwachen** - Sport, Wasserkonsum, Produktivität
- **Daten visualisieren** - Interaktive Grafiken und KPIs auf einen Blick
- **Alles exportieren** - Deine Daten jederzeit als Excel-Datei

## ✨ Was kann die App?

- 📊 **Dashboard** mit Übersicht aller Kategorien und Statistiken
- 📁 **Flexible Kategorien** - Erstelle eigene Tracking-Kategorien mit individuellen Einheiten
- 💰 **Sparen-Modus** - Speziell für Finanztracking mit Einzahlungen und Zinsen
- 📈 **Interaktive Charts** - Visualisiere deine Fortschritte monatlich
- 📅 **Automatische Einträge** - Erstellt monatlich automatisch neue Einträge
- 📤 **Excel Export** - Exportiere alle Daten strukturiert

## 🛠️ Technologien

**Backend:**
- FastAPI (Python) - Moderne REST API
- SQLite - Lokale Datenbank
- SQLModel - Type-safe ORM

**Frontend:**
- React + TypeScript - Moderne UI
- Tailwind CSS - Responsive Design
- Recharts - Datenvisualisierung
- Vite - Schneller Build-Prozess

**Deployment:**
- Docker & Docker Compose
- Nginx - Web Server

## � Schnellstart mit Docker

Die einfachste Methode - einfach starten:

```bash
docker-compose up -d
```

Die App läuft dann auf: **http://localhost:3000**

Das war's! 🎉

## � Lokale Entwicklung

### Backend starten

```bash
# Virtual Environment erstellen und aktivieren
python -m venv venv
source venv/bin/activate  # oder auf Windows: venv\Scripts\activate

# Dependencies installieren
cd backend
pip install -r requirements.txt

# Server starten
uvicorn backend.main:app --reload --port 8000
```

Backend läuft auf: http://localhost:8000  
API Docs: http://localhost:8000/docs

### Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Frontend läuft auf: http://localhost:5173

## � Was ist enthalten?

```
DataTracker_V2/
├── backend/          # FastAPI Backend mit SQLite
├── frontend/         # React TypeScript Frontend
└── docker-compose.yml # Docker Setup
```

## � Entwickelt von

**Lukas Trust**  
GitHub: [@LukasTrust](https://github.com/LukasTrust)

---

*Version 2.0 - November 2025*

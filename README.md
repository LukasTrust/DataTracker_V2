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
- 📅 **Automatische Einträge** - Erstellt monatlich automatisch neue Einträge (Details siehe unten)
- 📤 **Excel Export** - Exportiere alle Daten strukturiert

### 🤖 Automatische Eintrags-Erstellung

Kategorien können so konfiguriert werden, dass sie **automatisch** am 1. jeden Monats um 00:05 Uhr einen Platzhalter-Eintrag mit Wert 0 erstellen:

- **Sammlung möglich**: Automatische Einträge sammeln sich an (Oktober, November, Dezember, etc.)
- **Bearbeitung**: Du kannst diese Einträge jederzeit bearbeiten - sie werden dann zu normalen Einträgen
- **Keine Datenverfälschung**: Auto-Einträge erscheinen **NUR** in der Tabelle
- **Keine Berechnungen**: Sie werden **NICHT** in Statistiken, Grafiken oder dem Dashboard berücksichtigt
- **Visuelle Kennzeichnung**: Auto-Einträge sind in der Tabelle mit einem "Auto" Badge markiert

**Beispiel-Workflow:**
1. Du erstellst eine Kategorie "Sport" und aktivierst "Automatische Einträge"
2. Am 1. Oktober wird ein Auto-Eintrag für Oktober erstellt (Wert: 0)
3. Am 1. November wird ein Auto-Eintrag für November erstellt
4. Am 1. Dezember wird ein Auto-Eintrag für Dezember erstellt
5. Du kannst jetzt alle drei Einträge nach und nach ausfüllen
6. Sobald du einen Eintrag bearbeitest, wird er zu einem normalen Eintrag und fließt in alle Auswertungen ein

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

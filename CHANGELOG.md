# DataTracker V2 - Changelog

## ✨ Neue Features (11. November 2025)

### 🎯 Dashboard-Verbesserungen

Das Dashboard zeigt jetzt **detaillierte Informationen pro Kategorie**:

- ✅ Anzahl der Kategorien
- ✅ Summe pro Kategorie (mit Einheit)
- ✅ Anzahl der Einträge pro Kategorie
- ✅ Einzahlungen für Spar-Kategorien
- ✅ Kategorie-Typ wird farblich hervorgehoben (Normal = Blau, Sparen = Grün)

**Neues Layout:**
- Übersichtskarte mit Gesamt-Statistiken
- Grid mit Karten für jede Kategorie
- "Details anzeigen" Button für jede Kategorie
- Leerer Zustand mit direktem Link zum Erstellen

### 📝 Kategorie-Erstellung

Neue Seite zum Erstellen von Kategorien (`/categories/new`):

**Features:**
- ✅ Sauberes Formular im modernen Design
- ✅ Auswahl zwischen "Normal" und "Sparen" mit visuellen Karten
- ✅ Eingabe von Name, Typ, Einheit und Auto-Create-Option
- ✅ Hilfstexte und Tipps in separater Karte
- ✅ Validierung und Fehlerbehandlung
- ✅ Abbrechen-Button kehrt zur Kategorien-Liste zurück

**Form-Felder:**
1. **Name** (Pflichtfeld) - Der Kategorie-Name
2. **Typ** (Pflichtfeld) - Normal oder Sparen (mit Icons)
3. **Einheit** (Optional) - z.B. EUR, kg, Stunden
4. **Auto-Create** (Checkbox) - Automatische monatliche Einträge

### 🔧 Backend-Erweiterung

Neuer API-Endpoint für Dashboard-Statistiken:

```
GET /dashboard/stats
```

**Response:**
```json
{
  "totalCategories": 3,
  "categorySums": [
    {
      "id": 1,
      "name": "Finanzen",
      "type": "sparen",
      "unit": "EUR",
      "totalValue": 15000.50,
      "totalDeposits": 2000.00,
      "entryCount": 12
    }
  ]
}
```

### 🎨 Design-Konsistenz

Alle neuen Komponenten folgen dem bestehenden Design-System:
- Tailwind CSS mit Primary/Neutral Farbpalette
- Inter-Schriftart
- Konsistente Abstände und Rundungen
- Hover-Effekte und Transitions
- Responsive Grid-Layouts

## 🚀 Verwendung

### Dashboard aufrufen
```
http://localhost:5173/
```

### Neue Kategorie erstellen
```
http://localhost:5173/categories/new
```

Oder über die Buttons:
- Dashboard: "Neue Kategorie" Button oben rechts
- Dashboard: "Erste Kategorie erstellen" bei leerem Zustand
- Kategorien-Liste: "Neue Kategorie" Button oben rechts

## 📋 Nächste Schritte

Empfohlene Erweiterungen:
- [ ] Kategorie bearbeiten/löschen mit Bestätigungs-Dialog
- [ ] Einträge für Kategorien anzeigen und verwalten
- [ ] Filter und Sortierung in der Kategorien-Liste
- [ ] Statistik-Charts pro Kategorie
- [ ] Export-Funktion mit Kategorie-Auswahl

## 🐛 Bekannte Issues

- Backend muss laufen, damit das Frontend Daten laden kann
- Noch keine Fehler-Toasts (aktuell nur Browser-Alerts)
- Kategorie-Details-Seite noch nicht implementiert

---

**Stand:** 11. November 2025

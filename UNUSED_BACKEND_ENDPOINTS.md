# 🔌 Nicht genutzte Backend-Endpoints

Diese Endpoints sind im Backend implementiert, werden aber aktuell nicht vom Frontend verwendet.

---

## 📋 Liste ungenutzter Endpoints

### 1. **GET /entries** (Entry Search)
**Backend:** `main.py` Zeile 303-331  
**Status:** ❌ Nicht verwendet  
**Beschreibung:** Suche über alle Entries mit erweiterten Filtern

**Query Parameters:**
- `category_ids`: Comma-separated IDs
- `from_date`: YYYY-MM
- `to_date`: YYYY-MM
- `comment`: Substring-Suche
- `type`: Category-Type Filter

**Potential-Verwendung:**
- Globale Suche über alle Kategorien hinweg
- Advanced Search/Filter-Seite
- Report-Generation

**Beispiel-Code:**
```tsx
// api/entries.ts
export const searchEntries = async (params: EntrySearchParams): Promise<EntryRead[]> => {
  const response = await apiClient.get<EntryRead[]>('/entries', { params })
  return response.data
}

// Verwendung in einer neuen "Search"-Seite:
const SearchPage = () => {
  const [results, setResults] = useState<Entry[]>([])
  const [filters, setFilters] = useState<EntrySearchParams>({
    comment: '',
    from_date: '2024-01',
    to_date: '2024-12',
  })
  
  const handleSearch = async () => {
    const data = await searchEntries(filters)
    setResults(data)
  }
  
  return (
    <div>
      <input onChange={(e) => setFilters({...filters, comment: e.target.value})} />
      <button onClick={handleSearch}>Suchen</button>
      {/* Results anzeigen */}
    </div>
  )
}
```

**Empfehlung:** ✅ Implementieren - Nützlich für Power-User

---

### 2. **GET /stats/overview** (Statistics Overview)
**Backend:** `main.py` Zeile 336-361  
**Status:** ❌ Nicht verwendet  
**Beschreibung:** Aggregierte Statistiken über Entries

**Query Parameters:**
- `category_ids`: Comma-separated IDs
- `from_date`: YYYY-MM
- `to_date`: YYYY-MM

**Return Value:**
```json
{
  "total_entries": 150,
  "sum": 5432.10,
  "average": 36.21,
  "min": 0.0,
  "max": 250.0,
  "categories": [...]
}
```

**Potential-Verwendung:**
- Alternative zu `GET /dashboard/stats`
- Detailliertere Statistiken mit Min/Max/Average
- Category-spezifische Reports

**Beispiel-Code:**
```tsx
// api/stats.ts
export const getStatsOverview = async (params: StatsOverviewParams) => {
  const response = await apiClient.get('/stats/overview', { params })
  return response.data
}

// Verwendung im Dashboard:
const { totalEntries, sum, average, min, max } = await getStatsOverview({
  category_ids: '1,2,3',
  from_date: '2024-01',
  to_date: '2024-12',
})
```

**Empfehlung:** ⚠️ Evaluieren - Überschneidet sich mit Dashboard Stats

---

### 3. **GET /stats/monthly** (Monthly Statistics)
**Backend:** `main.py` Zeile 364-388  
**Status:** ❌ Nicht verwendet  
**Beschreibung:** Monatliche Aggregierung für eine Kategorie

**Query Parameters:**
- `category_id`: Category ID (required)
- `from_year`: Start year (optional)
- `to_year`: End year (optional)

**Return Value:**
```json
{
  "category_id": 1,
  "category_name": "Finanzen",
  "years": {
    "2024": {
      "January": { "count": 5, "sum": 500.0 },
      "February": { "count": 4, "sum": 450.0 },
      ...
    }
  }
}
```

**Potential-Verwendung:**
- Monatliche Reports
- Jahresübersicht für einzelne Kategorie
- Trend-Analyse über Jahre hinweg

**Beispiel-Code:**
```tsx
// api/stats.ts
export const getMonthlyStats = async (params: MonthlyStatsParams) => {
  const response = await apiClient.get('/stats/monthly', { params })
  return response.data
}

// Verwendung in CategoryGraphs:
const MonthlyReport = ({ categoryId }: { categoryId: number }) => {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    getMonthlyStats({ category_id: categoryId, from_year: 2023, to_year: 2024 })
      .then(setData)
  }, [categoryId])
  
  // Render Tabelle oder Chart mit monatlichen Daten
}
```

**Empfehlung:** ✅ Implementieren - Sehr nützlich für Reports

---

### 4. **POST /auto-create-current-month** (Manual Trigger)
**Backend:** `main.py` Zeile 418-432  
**Status:** ❌ Nicht verwendet  
**Beschreibung:** Manuelles Triggern der Auto-Create Funktion

**Return Value:**
```json
{
  "created": 3
}
```

**Potential-Verwendung:**
- Admin/Debug-Funktion
- Manuelles Erstellen von Entries am Monatsanfang
- Settings-Seite mit "Entries jetzt erstellen" Button

**Beispiel-Code:**
```tsx
// api/entries.ts
export const triggerAutoCreate = async (): Promise<{ created: number }> => {
  const response = await apiClient.post('/auto-create-current-month')
  return response.data
}

// Verwendung in Settings:
const SettingsPage = () => {
  const { showSuccess } = useNotification()
  
  const handleAutoCreate = async () => {
    const result = await triggerAutoCreate()
    showSuccess(`${result.created} Einträge erstellt`)
  }
  
  return (
    <div>
      <h2>Auto-Create Funktion</h2>
      <p>Erstellt Einträge für den aktuellen Monat für alle Kategorien mit auto_create=True</p>
      <Button onClick={handleAutoCreate}>
        Jetzt Einträge erstellen
      </Button>
    </div>
  )
}
```

**Empfehlung:** ⚠️ Optional - Nur für Admin/Debug

---

## 📊 Zusammenfassung

### Empfohlene Implementierungen:

| Endpoint | Priorität | Aufwand | Nutzen |
|----------|-----------|---------|--------|
| `GET /entries` (Search) | Hoch | 3h | Globale Suche über alle Kategorien |
| `GET /stats/monthly` | Hoch | 2h | Monatliche Reports & Jahresübersichten |
| `GET /stats/overview` | Mittel | 1h | Detailliertere Statistiken (überschneidet sich mit Dashboard) |
| `POST /auto-create-current-month` | Niedrig | 30min | Admin-Funktion, nur für Power-User |

### Geschätzter Gesamt-Aufwand: ~6,5 Stunden

---

## 🎯 Vorgeschlagene Implementierungs-Reihenfolge

### Phase 1: Monthly Stats (2h)
**Warum zuerst:** Einfach zu implementieren, hoher Nutzen

1. `api/stats.ts` erstellen mit `getMonthlyStats()`
2. Neue Tab in `CategoryGraphs.tsx`: "Monatliche Übersicht"
3. Tabelle oder Chart mit monatlichen Daten
4. Export-Funktion für monatliche Reports

**UI-Mockup:**
```
┌─────────────────────────────────────┐
│ Kategorie: Finanzen                 │
├─────────────────────────────────────┤
│ Tabs: [Daten] [Graphen] [Monatlich]│
├─────────────────────────────────────┤
│                                     │
│  Jahr: 2024 ▼                       │
│                                     │
│  ┌─────────┬───────┬────────┐      │
│  │ Monat   │ Anzahl│ Summe  │      │
│  ├─────────┼───────┼────────┤      │
│  │ Januar  │   5   │ 500 €  │      │
│  │ Februar │   4   │ 450 €  │      │
│  │ ...     │  ...  │  ...   │      │
│  └─────────┴───────┴────────┘      │
│                                     │
└─────────────────────────────────────┘
```

---

### Phase 2: Global Search (3h)
**Warum zweitens:** Hoher Nutzen für Power-User

1. Neue Page: `pages/Search.tsx`
2. `api/entries.ts` erweitern mit `searchEntries()`
3. Filter-UI mit:
   - Kategorie-Auswahl (Multi-Select)
   - Datumsbereich
   - Kommentar-Suche
   - Typ-Filter (normal/sparen)
4. Results-Liste mit Pagination
5. Export-Funktion

**UI-Mockup:**
```
┌─────────────────────────────────────┐
│ Erweiterte Suche                    │
├─────────────────────────────────────┤
│                                     │
│ Kategorien: [Alle ▼]                │
│ Von Datum:  [2024-01-01]            │
│ Bis Datum:  [2024-12-31]            │
│ Kommentar:  [________________]      │
│ Typ:        [Alle ▼]                │
│                                     │
│ [Suchen]  [Reset]  [Export]         │
│                                     │
│ ─────────────────────────────────   │
│ 42 Ergebnisse gefunden:             │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 15.01.2024 - Finanzen           │ │
│ │ Wert: 100 €                     │ │
│ │ Kommentar: Monatliche Zahlung   │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

### Phase 3: Stats Overview (1h)
**Warum drittens:** Evaluieren ob nötig (überschneidet sich mit Dashboard)

1. Entweder:
   - In Dashboard integrieren (als zusätzliche KPIs)
   - Oder: Separate "Analytics"-Seite
2. API-Call `getStatsOverview()` erstellen
3. Anzeige von Min/Max/Average zusätzlich zu Summe

**Empfehlung:** Nur implementieren, wenn User-Feedback danach fragt.

---

### Phase 4: Auto-Create Button (30min)
**Warum zuletzt:** Niedrige Priorität, Admin-Funktion

1. Button in Settings-Seite (muss erst erstellt werden)
2. API-Call `triggerAutoCreate()`
3. Success-Notification mit Anzahl erstellter Entries

---

## 🚀 Quick Wins

### Sofort implementierbar (< 1h):

#### 1. Auto-Create Button im Dashboard
```tsx
// Dashboard.tsx
const handleAutoCreate = async () => {
  try {
    showInfo('Erstelle Einträge...')
    const result = await triggerAutoCreate()
    showSuccess(`${result.created} Einträge wurden erstellt`)
    loadDashboardData() // Refresh
  } catch (error) {
    showError('Fehler beim Erstellen der Einträge')
  }
}

// In PageHeader Actions:
<Button variant="secondary" onClick={handleAutoCreate}>
  Auto-Create
</Button>
```

#### 2. Route für globale Suche vorbereiten
```tsx
// App.tsx
<Route path="/search" element={<Search />} />

// Sidebar.tsx - Link hinzufügen:
{ to: '/search', icon: Search, label: 'Suche' }
```

---

## 📝 Checkliste für neue Endpoints

Wenn ein ungenutzter Endpoint implementiert wird:

- [ ] API-Funktion in `api/` erstellen mit Types
- [ ] Custom Hook erstellen (z.B. `useSearch()`)
- [ ] UI-Komponente/Page erstellen
- [ ] Route in `App.tsx` hinzufügen
- [ ] Link in Sidebar/Navigation hinzufügen
- [ ] Error Handling implementieren
- [ ] Loading States hinzufügen
- [ ] Success-Notifications hinzufügen
- [ ] Tests schreiben (optional)
- [ ] Dokumentation aktualisieren

---

## 🎓 Best Practices für neue Features

### 1. API-First Approach
```tsx
// 1. Type definieren
interface SearchParams { ... }

// 2. API-Funktion
export const searchEntries = async (params: SearchParams) => { ... }

// 3. Custom Hook (optional)
export const useSearch = (params: SearchParams) => { ... }

// 4. Component
const SearchPage = () => {
  const { results, loading } = useSearch(filters)
  return <SearchResults data={results} />
}
```

### 2. Incremental Development
- ✅ Start klein: Basis-Funktion ohne Extras
- ✅ Dann erweitern: Filters, Pagination, Export
- ✅ Feedback einholen: User-Tests
- ✅ Iterieren: Verbesserungen basierend auf Feedback

### 3. Reusability
- ✅ Komponenten wiederverwendbar gestalten
- ✅ Utility-Funktionen extrahieren
- ✅ Custom Hooks für gemeinsame Logik
- ✅ Consistent Naming & Patterns

---

**Fazit:** 4 ungenutzte Endpoints mit viel Potential. Priorität: Monthly Stats > Search > Overview > Auto-Create.

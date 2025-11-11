# Kategorien-Verwaltung - Komponentenstruktur

Diese Dokumentation beschreibt die modulare Struktur der Kategorien-Verwaltung im DataTracker.

## 📁 Dateistruktur

```
frontend/src/
├── types/
│   └── category.ts                     # Gemeinsame TypeScript-Typen
├── components/
│   └── categories/
│       ├── CategoryList.tsx            # Übersichtsliste aller Kategorien
│       ├── CategoryTabs.tsx            # Tab-Navigation (Daten/Graphen/Bearbeitung)
│       ├── CategoryTable.tsx           # Tabellarische Darstellung der Einträge
│       ├── CategoryGraphs.tsx          # Statistische Auswertungen
│       └── CategoryEditForm.tsx        # Bearbeitungsformular für Kategorie-Einstellungen
└── pages/
    └── Categories.tsx                  # Hauptkomponente (koordiniert alles)
```

## 🎯 Komponenten-Übersicht

### 1. **Categories.tsx** (Hauptkomponente)
**Zweck:** Koordiniert den gesamten Ablauf und verwaltet den globalen State.

**Verantwortlichkeiten:**
- State Management (Kategorien, Einträge, aktiver Tab)
- Laden von Daten via API
- Event-Handler für CRUD-Operationen
- Routing zwischen Listen- und Detailansicht

**Props:** Keine (nutzt React Router Hooks)

---

### 2. **CategoryList.tsx**
**Zweck:** Zeigt alle Kategorien in einer übersichtlichen Liste.

**Props:**
```typescript
interface CategoryListProps {
  categories: Category[]
  loading: boolean
  onSelectCategory: (category: Category) => void
  onDeleteCategory: (id: number) => void
  onCreateNew: () => void
}
```

**Features:**
- Loading-State mit Skeleton-Animationen
- Empty-State für keine Kategorien
- Kategorie-Karten mit Typ, Einheit und Auto-Create Badge
- Aktionen: Öffnen & Löschen

---

### 3. **CategoryTabs.tsx**
**Zweck:** Tab-Navigation für die verschiedenen Ansichten.

**Props:**
```typescript
interface CategoryTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}
```

**Tabs:**
- **Daten** (Table2 Icon): Zeigt die Datentabelle
- **Graphen** (BarChart3 Icon): Zeigt statistische Auswertungen
- **Bearbeitung** (Settings Icon): Zeigt das Bearbeitungsformular

---

### 4. **CategoryTable.tsx**
**Zweck:** Tabellarische Darstellung aller Einträge einer Kategorie.

**Props:**
```typescript
interface CategoryTableProps {
  entries: Entry[]
  loading: boolean
  category: Category
  onEntriesChange: () => void
}
```

**Features:**
- Inline-Editing von Einträgen (Wert, Einzahlung, Kommentar)
- Löschen von Einträgen mit Bestätigung
- Speichern/Abbrechen Buttons beim Bearbeiten
- Spezielle Spalte für "Sparen"-Kategorien (Einzahlung)
- Auto-Generated Badge für automatisch erstellte Einträge
- Statistik-Footer mit Gesamtanzahl und aktuellem Stand

---

### 5. **CategoryGraphs.tsx**
**Zweck:** Statistische Auswertungen und Graphen.

**Props:**
```typescript
interface CategoryGraphsProps {
  entries: Entry[]
  category: Category
}
```

**Features:**
- Statistik-Karten: Aktueller Wert, Durchschnitt, Min, Max
- Trend-Analyse (Vergleich erste vs. zweite Hälfte)
- Letzte 5 Einträge Übersicht
- Platzhalter für zukünftige Chart-Bibliothek

---

### 6. **CategoryEditForm.tsx**
**Zweck:** Formular zum Bearbeiten der Kategorie-Einstellungen.

**Props:**
```typescript
interface CategoryEditFormProps {
  formData: CategoryFormData
  onFormChange: (data: CategoryFormData) => void
  onSave: () => void
}
```

**Felder:**
- Kategorie-Name (Text)
- Typ (Select: Normal / Sparen)
- Einheit (Text, optional)
- Auto-Create (Checkbox)

---

### 7. **category.ts** (Types)
**Zweck:** Zentrale Typdefinitionen für TypeScript.

**Typen:**
```typescript
interface Category {
  id: number
  name: string
  type: string
  unit?: string
  auto_create: boolean
}

interface Entry {
  id: number
  category_id: number
  date: string
  value: number
  deposit?: number
  comment?: string
  auto_generated: boolean
}

type TabType = 'data' | 'graphs' | 'settings'

interface CategoryFormData {
  name: string
  type: string
  unit: string
  auto_create: boolean
}
```

---

## 🔄 Datenfluss

```
┌─────────────────────────────────────────────┐
│          Categories.tsx (Main)              │
│                                             │
│  State:                                     │
│  - categories[]                             │
│  - selectedCategory                         │
│  - entries[]                                │
│  - activeTab                                │
│  - editForm                                 │
│                                             │
│  Functions:                                 │
│  - loadCategories()                         │
│  - selectCategory()                         │
│  - handleDeleteCategory()                   │
│  - handleUpdateCategory()                   │
└────────────┬────────────────────────────────┘
             │
             ├─► CategoryList ────► API: fetchCategories()
             │                      API: deleteCategory()
             │
             ├─► CategoryTabs ─────► Updates activeTab state
             │
             ├─► CategoryTable ────► API: fetchEntries()
             │                      API: updateEntry()
             │                      API: deleteEntry()
             │
             ├─► CategoryGraphs ───► Berechnet Statistiken
             │
             └─► CategoryEditForm ─► API: updateCategory()
```

---

## 🎨 Design-Prinzipien

1. **Single Responsibility:** Jede Komponente hat eine klare Aufgabe
2. **Props über State:** Komponenten sind zustandslos wo möglich
3. **Wiederverwendbarkeit:** Komponenten können unabhängig verwendet werden
4. **Typsicherheit:** Alle Props und States sind typisiert
5. **Konsistentes Design:** Alle Komponenten folgen dem Design-System

---

## 🚀 Erweiterbarkeit

### Neue Tab hinzufügen:
1. Typ in `category.ts` erweitern: `type TabType = 'data' | 'graphs' | 'settings' | 'new-tab'`
2. Tab in `CategoryTabs.tsx` zur tabs-Array hinzufügen
3. Neue Komponente erstellen
4. In `Categories.tsx` rendern

### Neue API-Funktion:
1. Funktion in `api/api.ts` definieren
2. In Komponente importieren
3. Event-Handler erstellen
4. Als Prop durchreichen

---

## 📝 Best Practices

### State Management:
- Globaler State in `Categories.tsx`
- Lokaler State nur für UI (z.B. editingId in Table)
- Props für Datenfluss nach unten

### Error Handling:
- Try-Catch Blöcke bei allen API-Calls
- Benutzerfreundliche Alert-Meldungen
- Console.error für Debugging

### Loading States:
- Separate Loading-States für verschiedene Daten
- Skeleton-Komponenten während des Ladens
- Empty-States wenn keine Daten vorhanden

---

## 🔧 Wartung

### Code-Qualität:
- TypeScript strict mode aktiv
- ESLint Regeln werden befolgt
- Props sind klar dokumentiert

### Testing:
- Unit Tests für einzelne Komponenten möglich
- Integration Tests für Datenfluss
- E2E Tests für User-Flows

---

## 📚 Weiterführende Informationen

- API-Dokumentation: `backend/main.py`
- Design-System: `frontend/DESIGN_SYSTEM.md`
- Routing-Struktur: `frontend/src/App.tsx`

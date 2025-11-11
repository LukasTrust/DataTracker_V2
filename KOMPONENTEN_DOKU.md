# Dashboard Komponenten - Übersicht

## 🎯 Neue Komponenten

### 1. **KPICard.tsx**
Interaktive KPI-Karte mit Click-Handler für Dashboard-Filterung.

**Props:**
- `title`: Titel der KPI
- `value`: Hauptwert (string oder number)
- `icon`: Lucide Icon
- `description`: Optionale Beschreibung
- `trend`: Optional - Trend mit Wert, Richtung und Label
- `iconColor`: Icon-Farbe (default: primary-600)
- `iconBgColor`: Icon-Hintergrund (default: primary-50)
- `onClick`: Optional - Click-Handler
- `isActive`: Boolean - Zeigt aktiven Zustand

**Verwendung:**
```tsx
<KPICard
  title="Gesamtwert"
  value="12.345,67 €"
  icon={Activity}
  description="Alle Kategorien"
  iconColor="text-purple-600"
  iconBgColor="bg-purple-50"
  onClick={() => handleFilter('all')}
  isActive={activeFilter === 'all'}
/>
```

---

### 2. **MiniSparkline.tsx**
Kleine Chart-Komponente für Verlaufsdarstellung in Kacheln.

**Props:**
- `data`: Array von `{ date: string, value: number }`
- `color`: Chart-Farbe (default: #3b82f6)
- `height`: Höhe in px (default: 40)

**Features:**
- SVG-basiert für Performance
- Gradient-Fill unter der Linie
- Auto-Skalierung der Y-Achse
- Responsive

**Verwendung:**
```tsx
<MiniSparkline 
  data={[
    { date: '2024-01', value: 100 },
    { date: '2024-02', value: 150 },
  ]} 
  color="#10b981" 
  height={40}
/>
```

---

### 3. **DashboardFilterBar.tsx**
Umfassende Filter-Komponente mit Toggle.

**Props:**
- `filters`: DashboardFilters Objekt
- `onFiltersChange`: Callback bei Filter-Änderung
- `onExport`: Export-Handler
- `onReset`: Reset-Handler

**Filter-Optionen:**
- Start-Datum
- End-Datum
- Kategorie-Typ (all/sparen/normal)

**Verwendung:**
```tsx
<DashboardFilterBar
  filters={filters}
  onFiltersChange={setFilters}
  onExport={handleExport}
  onReset={handleReset}
/>
```

---

### 4. **DashboardCharts.tsx**
Recharts-basierte interaktive Graphen-Komponente.

**Props:**
- `totalValueData`: Array für Gesamtwert-Chart
- `sparenData`: Array für Sparen-Vergleich
- `categoryComparison`: Array für Kategorien-Vergleich

**Charts:**
1. **Area Chart**: Gesamtwertentwicklung
2. **Line Chart**: Einzahlungen vs. Wert (Sparen)
3. **Bar Chart**: Kategorien im Vergleich

**Verwendung:**
```tsx
<DashboardCharts
  totalValueData={[
    { date: '2024-01', value: 1000 }
  ]}
  sparenData={[
    { date: '2024-01', value: 500, deposits: 400, profit: 100 }
  ]}
  categoryComparison={[
    { name: 'Kategorie 1', value: 500, type: 'sparen' }
  ]}
/>
```

---

### 5. **CategoryCard.tsx**
Erweiterte Kategorie-Kachel mit Sparkline und Quick-Actions.

**Props:**
- `category`: CategoryCardData Objekt
- `onClick`: Optional - Click-Handler für Karte

**CategoryCardData Interface:**
```typescript
{
  id: number
  name: string
  type: string
  unit?: string
  totalValue: number
  totalDeposits: number
  entryCount: number
  sparklineData?: { date: string; value: number }[]
  profit?: number
  profitPercentage?: number
}
```

**Features:**
- Typ-spezifische Icons (💰 Sparen / 📊 Normal)
- Mini-Sparkline für Verlauf
- Gewinn/Verlust für Sparen-Kategorien
- Quick-Action Buttons (Details, Graphen)
- Farbcodierung nach Typ

**Verwendung:**
```tsx
<CategoryCard
  category={{
    id: 1,
    name: "Aktien Portfolio",
    type: "sparen",
    unit: "€",
    totalValue: 5000,
    totalDeposits: 4000,
    entryCount: 12,
    sparklineData: [...],
    profit: 1000,
    profitPercentage: 25
  }}
  onClick={() => navigate(\`/categories/\${category.id}\`)}
/>
```

---

## 🎨 Design-System

### Farben für Kategorien-Typen

**Sparen:**
- Primary: `text-green-600` / `bg-green-50`
- Badge: `bg-green-100` / `text-green-700`
- Icon: Wallet

**Normal:**
- Primary: `text-blue-600` / `bg-blue-50`
- Badge: `bg-blue-100` / `text-blue-700`
- Icon: TrendingUp

### Grid-Layout

```tsx
// KPI Cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Charts
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

// Category Cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Spacing
- Cards: `p-6` (24px)
- Sections: `mb-8` (32px)
- Grid-Gap: `gap-6` (24px)

---

## 🔧 Backend-Endpoints

### `/api/dashboard/stats`
Liefert aggregierte Dashboard-Statistiken.

**Response:**
```json
{
  "totalCategories": 10,
  "categorySums": [
    {
      "id": 1,
      "name": "Aktien",
      "type": "sparen",
      "unit": "€",
      "totalValue": 5000,
      "totalDeposits": 4000,
      "entryCount": 12,
      "sparklineData": [...],
      "profit": 1000,
      "profitPercentage": 25
    }
  ]
}
```

### `/api/dashboard/timeseries`
Liefert Zeitreihen-Daten für Charts.

**Query-Parameter:**
- `start_date`: Optional - YYYY-MM-DD
- `end_date`: Optional - YYYY-MM-DD
- `category_type`: Optional - "all" | "sparen" | "normal"

**Response:**
```json
{
  "totalValueData": [
    { "date": "2024-01-01", "value": 1000 }
  ],
  "sparenData": [
    { 
      "date": "2024-01-01", 
      "value": 500, 
      "deposits": 400, 
      "profit": 100 
    }
  ],
  "categoryComparison": [
    { "name": "Aktien", "value": 5000, "type": "sparen" }
  ]
}
```

---

## 📦 Dependencies

```json
{
  "recharts": "^3.4.1",
  "lucide-react": "^0.344.0",
  "clsx": "^2.1.0",
  "react-router-dom": "^6.22.0"
}
```

---

## 🚀 Integration

### 1. Dashboard.tsx importieren
```tsx
import KPICard from '../components/KPICard'
import CategoryCard from '../components/CategoryCard'
import DashboardFilterBar from '../components/DashboardFilterBar'
import DashboardCharts from '../components/DashboardCharts'
```

### 2. State Management
```tsx
const [filters, setFilters] = useState<DashboardFilters>({
  categoryType: 'all',
})
const [activeKPI, setActiveKPI] = useState<string | null>(null)
```

### 3. Data Fetching
```tsx
const statsData = await fetchDashboardStats()
const timeseries = await fetchDashboardTimeseries({
  start_date: filters.startDate,
  end_date: filters.endDate,
  category_type: filters.categoryType,
})
```

---

## ✨ Best Practices

1. **Performance**: Charts nur rendern wenn Daten vorhanden
2. **Error Handling**: Try-Catch mit User-Feedback
3. **Loading States**: Skeleton Screens während Laden
4. **Responsive**: Mobile-First Ansatz
5. **Accessibility**: Keyboard Navigation unterstützen
6. **Type Safety**: Alle Props streng typisiert

---

Alle Komponenten sind vollständig dokumentiert und produktionsbereit! 🎉

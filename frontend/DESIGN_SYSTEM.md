# 🎨 DataTracker Design System

## 📋 Design-Zusammenfassung (Moodboard in Worten)

Das DataTracker-Frontend folgt einem **minimalistischen, datenzentrierten Design** inspiriert von modernen Tools wie Linear, Notion und Vercel. Der Fokus liegt auf:

- **Klare Hierarchie**: Große, prominente Zahlen und Kennzahlen
- **Ruhige Farbpalette**: Neutrale Grautöne mit kühlem Blau als Akzent
- **Großzügige Abstände**: Keine Enge, viel Weißraum
- **Sanfte Interaktionen**: Subtile Hover-Effekte und weiche Übergänge
- **Professionelle Typografie**: Inter als moderne, lesbare Schriftart

## 🎨 Farbpalette

### Primary (Blau) - Für Akzente & Interaktive Elemente
```
50:  #f0f9ff  - Sehr helles Blau (Hover-Hintergründe)
100: #e0f2fe  - Helles Blau
200: #bae6fd  - Leichtes Blau
300: #7dd3fc  - Mittleres Blau
400: #38bdf8  - Aktives Blau
500: #0ea5e9  - Standard-Blau (Primary)
600: #0284c7  - Buttons, Icons
700: #0369a1  - Dunkleres Blau
800: #075985  - Sehr dunkel
900: #0c4a6e  - Fast schwarz
```

### Neutral (Grau) - Für Texte, Hintergründe & Rahmen
```
50:  #fafafa  - App-Hintergrund
100: #f5f5f5  - Card-Hover
200: #e5e5e5  - Borders
300: #d4d4d4  - Schwache Borders
400: #a3a3a3  - Deaktivierte Icons
500: #737373  - Sekundärer Text
600: #525252  - Normaler Text
700: #404040  - Wichtiger Text
800: #262626  - Überschriften
900: #171717  - Primärer Text
```

## 🔤 Typografie

### Schriftart
- **Font-Family**: Inter (modern, clean, professionell)
- **Import**: Google Fonts über `index.html`

### Größen
```
xs:   12px / 0.75rem  - Kleine Hinweise
sm:   14px / 0.875rem - Standard-Text, Buttons
base: 16px / 1rem     - Body-Text
lg:   18px / 1.125rem - Größere Texte
xl:   20px / 1.25rem  - Kleine Überschriften
2xl:  24px / 1.5rem   - Seiten-Titel
3xl:  30px / 1.875rem - Kennzahlen-Werte
```

### Gewichtungen
```
300 - Light     (selten verwendet)
400 - Normal    (Body-Text)
500 - Medium    (Links, Buttons)
600 - Semibold  (Überschriften, Wichtige Elemente)
700 - Bold      (Hervorhebungen)
```

## 📦 Komponenten-Design

### 1. Sidebar
```tsx
className="w-64 bg-white border-r border-neutral-200 flex flex-col"
```

**Features:**
- Feste Breite: `64 * 4px = 256px`
- Weißer Hintergrund mit rechtem Border
- Logo-Bereich oben (64px Höhe)
- Navigation in der Mitte (flex-1)
- Footer am Ende

**NavLink (Aktiv):**
```tsx
className="flex items-center gap-3 px-3 py-2.5 rounded-lg 
           bg-primary-50 text-primary-700"
```

**NavLink (Inaktiv):**
```tsx
className="flex items-center gap-3 px-3 py-2.5 rounded-lg 
           text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
```

### 2. Header (PageHeader)
```tsx
className="bg-white border-b border-neutral-200"
  └─ className="px-8 py-6"
```

**Features:**
- Weißer Hintergrund mit unterem Border
- Titel: `text-2xl font-semibold text-neutral-900`
- Description: `text-sm text-neutral-600`
- Optional: Actions rechts (Buttons)

### 3. Card
```tsx
className="bg-white rounded-xl border border-neutral-200 shadow-soft"
```

**Features:**
- Weißer Hintergrund
- 12px Rundung (`rounded-xl`)
- Subtiler Schatten: `0 2px 8px rgba(0, 0, 0, 0.04)`
- Neutraler Border
- Optional hover: `hover:shadow-medium hover:border-neutral-300`

### 4. StatCard (Kennzahlen-Karte)
```tsx
<Card className="p-6" hover>
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <p className="text-sm font-medium text-neutral-600 mb-1">TITEL</p>
      <p className="text-3xl font-semibold text-neutral-900 mb-2">WERT</p>
      <p className="text-sm text-neutral-500">Beschreibung</p>
    </div>
    <div className="p-3 rounded-lg bg-primary-50">
      <Icon className="w-6 h-6 text-primary-600" />
    </div>
  </div>
</Card>
```

**Features:**
- Prominenter Wert (3xl, semibold)
- Kleiner Titel oben
- Farbiges Icon rechts mit passendem Hintergrund
- Optional: Trend-Indikator mit Pfeil und Prozent

**Icon-Varianten:**
```tsx
// Blau
iconColor="text-blue-600" iconBgColor="bg-blue-50"

// Grün
iconColor="text-green-600" iconBgColor="bg-green-50"

// Lila
iconColor="text-purple-600" iconBgColor="bg-purple-50"

// Orange
iconColor="text-orange-600" iconBgColor="bg-orange-50"
```

### 5. Button

**Primary:**
```tsx
className="inline-flex items-center justify-center gap-2 
           font-medium rounded-lg transition-default 
           bg-primary-600 text-white hover:bg-primary-700 
           shadow-soft px-4 py-2 text-sm"
```

**Secondary:**
```tsx
className="inline-flex items-center justify-center gap-2 
           font-medium rounded-lg transition-default 
           bg-white text-neutral-700 border border-neutral-300 
           hover:bg-neutral-50 shadow-soft px-4 py-2 text-sm"
```

**Ghost:**
```tsx
className="inline-flex items-center justify-center gap-2 
           font-medium rounded-lg transition-default 
           text-neutral-700 hover:bg-neutral-100 px-4 py-2 text-sm"
```

**Größen:**
- `sm`: `px-3 py-1.5 text-sm`
- `md`: `px-4 py-2 text-sm` (Standard)
- `lg`: `px-6 py-3 text-base`

## 📐 Spacing & Layout

### Abstände
```
2:  8px   - Minimale Gaps
3:  12px  - Kleine Abstände
4:  16px  - Standard-Abstände
6:  24px  - Größere Abstände
8:  32px  - Seiten-Padding
```

### Rundungen
```
lg:  8px  - Buttons
xl:  12px - Cards
full: ∞   - Icons, Badges
```

### Schatten
```tsx
shadow-soft:   0 2px 8px rgba(0, 0, 0, 0.04)   // Cards
shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.08)  // Hover
shadow-large:  0 8px 32px rgba(0, 0, 0, 0.12)  // Modals
```

## 🎬 Animationen & Transitions

### Standard-Transition
```tsx
className="transition-all duration-200 ease-out"
```

### Hover-Effekte
```tsx
// Cards
hover:shadow-medium hover:border-neutral-300

// Buttons
hover:bg-primary-700

// Links
hover:bg-neutral-100 hover:text-neutral-900
```

### Keyframe-Animationen
```css
@keyframes fadeIn {
  0%   { opacity: 0 }
  100% { opacity: 1 }
}

@keyframes slideUp {
  0%   { transform: translateY(10px); opacity: 0 }
  100% { transform: translateY(0); opacity: 1 }
}
```

## 🌓 Dark Mode (Optional - Vorbereitet)

Das Design-System ist vorbereitet für Dark Mode:
- Verwende `dark:` Prefix in Tailwind
- Alle Farben sind bereits mit Varianten definiert
- Beispiel: `dark:bg-neutral-900 dark:text-neutral-100`

## 📱 Responsive Design

### Breakpoints
```
sm:  640px
md:  768px  - Tablet
lg:  1024px - Desktop
xl:  1280px - Große Bildschirme
```

### Grid-Beispiele
```tsx
// Kennzahlen
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"

// Zwei-Spalten
className="grid grid-cols-1 lg:grid-cols-2 gap-6"
```

## 🎯 Design-Prinzipien

1. **Clarity First**: Lesbarkeit vor Dekoration
2. **Consistent Spacing**: 4px/8px-Raster durchgehend
3. **Subtle Animations**: Nie ablenkend, immer unterstützend
4. **Hierarchy through Size**: Größe zeigt Wichtigkeit
5. **Color with Purpose**: Farbe hat immer Bedeutung
6. **Touch-Friendly**: Mindestens 44x44px für interaktive Elemente

## 📂 Verwendung im Code

### Beispiel: Neue Seite erstellen
```tsx
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'

function MeinePage() {
  return (
    <>
      <PageHeader 
        title="Meine Seite"
        description="Beschreibung"
        actions={<Button variant="primary">Aktion</Button>}
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            {/* Inhalt */}
          </Card>
        </div>
      </div>
    </>
  )
}
```

## 🔧 Tailwind Config

Die komplette Konfiguration ist in `tailwind.config.js` definiert:
- Erweiterte Farben (primary, neutral)
- Custom Schatten (soft, medium, large)
- Inter als Standard-Font
- Animation-Keyframes

## ✅ Checkliste für neue Komponenten

- [ ] Verwendet `transition-default` für Hover-Effekte
- [ ] Nutzt Design-System-Farben (primary/neutral)
- [ ] Folgt 4px/8px-Spacing-Raster
- [ ] Rundet Ecken mit `rounded-lg` oder `rounded-xl`
- [ ] Nutzt shadow-soft für subtile Tiefe
- [ ] Ist responsive (mobile-first Ansatz)
- [ ] Hat konsistente Typografie (Inter)
- [ ] Zeigt klare Hierarchie durch Größen

---

**Viel Erfolg mit deinem professionellen DataTracker-Frontend! 🚀**

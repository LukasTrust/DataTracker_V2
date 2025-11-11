# DataTracker Frontend

Ein modernes, professionelles Frontend für die DataTracker-Anwendung, gebaut mit React, TypeScript, Vite und Tailwind CSS.

## 🎨 Design-System

### Farbpalette

**Primary (Blau-Töne)**
- 50-900: Professionelles, kühles Blau für Akzente und interaktive Elemente

**Neutral (Grau-Töne)**
- 50-900: Sanfte Graustufen für Hintergründe, Texte und Rahmen

### Typografie

- **Font**: Inter (modern, lesbar, professionell)
- **Größen**: 
  - Text: xs (12px), sm (14px), base (16px)
  - Überschriften: lg (18px), xl (20px), 2xl (24px), 3xl (30px)
- **Gewichtungen**: 300 (light), 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Komponenten

#### Button
- **Varianten**: primary, secondary, ghost
- **Größen**: sm, md, lg
- **Zustände**: hover, active, disabled, focus-ring

#### Card
- Weißer Hintergrund (`bg-white`)
- Abgerundete Ecken (`rounded-xl`)
- Sanfter Schatten (`shadow-soft`)
- Border (`border-neutral-200`)
- Optional: Hover-Effekt für interaktive Karten

#### StatCard
- Für Dashboard-Kennzahlen
- Großer, prominenter Wert
- Icon mit farbigem Hintergrund
- Optional: Trend-Indikator

### Abstände & Layout

- **Padding**: 3-8 (12px-32px) für Karten und Container
- **Gaps**: 2-6 (8px-24px) für Element-Abstände
- **Rundungen**: lg (8px), xl (12px) für Cards und Buttons
- **Schatten**: 
  - `shadow-soft`: subtiler Schatten für normale Elemente
  - `shadow-medium`: stärkerer Schatten für gehobene Elemente
  - `shadow-large`: prominenter Schatten für Modals

### Animationen

- **Transitions**: `transition-all duration-200 ease-out`
- **Hover**: sanfte Farbänderungen und Schatten
- **Fade-In**: 0.2s für schnelles Erscheinen
- **Slide-Up**: 0.3s für sanftes Einblenden von unten

## 🏗️ Struktur

```
frontend/
├── src/
│   ├── api/           # API-Calls und Axios-Konfiguration
│   ├── components/    # Wiederverwendbare UI-Komponenten
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Layout.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Sidebar.tsx
│   │   └── StatCard.tsx
│   ├── pages/         # Seiten-Komponenten
│   │   ├── Dashboard.tsx
│   │   ├── Categories.tsx
│   │   ├── Export.tsx
│   │   ├── Settings.tsx
│   │   └── Help.tsx
│   ├── App.tsx        # Haupt-App-Komponente mit Routing
│   ├── main.tsx       # Entry Point
│   └── index.css      # Tailwind & globale Styles
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Installation & Start

```bash
# Dependencies installieren
npm install

# Development-Server starten
npm run dev

# Build für Produktion
npm run build

# Vorschau des Production-Builds
npm run preview
```

## 🎯 Design-Prinzipien

1. **Minimalismus**: Fokus auf das Wesentliche, keine überladenen Interfaces
2. **Hierarchie**: Klare visuelle Struktur durch Größen, Gewichte und Farben
3. **Konsistenz**: Einheitliches Design-System über alle Komponenten
4. **Lesbarkeit**: Ausreichend Kontrast und großzügige Abstände
5. **Interaktivität**: Sanfte Animationen für besseres Feedback
6. **Responsivität**: Funktioniert auf Desktop und größeren Tablets

## 🔌 API-Integration

Das Frontend kommuniziert mit dem FastAPI-Backend über einen Vite-Proxy:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API-Calls: `/api/*` werden an Backend weitergeleitet

## 📱 Responsive Design

- **Desktop**: Optimiert für Bildschirme ≥ 1024px
- **Tablet**: Adaptive Layouts für mittlere Bildschirme
- **Mobile**: Funktional, aber primär für Desktop konzipiert

## 🎨 Tailwind-Konfiguration

Die `tailwind.config.js` enthält:
- Erweiterte Farbpalette (primary, neutral)
- Custom Schatten (soft, medium, large)
- Animation-Keyframes (fade-in, slide-up)
- Inter als Standard-Schriftart

## 🔧 Nächste Schritte

- [ ] Formular-Komponenten für Kategorie/Eintrag-Erstellung
- [ ] Modal-Komponenten für Dialoge
- [ ] Toast-Notifications für Feedback
- [ ] Loading-States und Skeleton-Screens
- [ ] Error-Handling und Error-Boundaries
- [ ] Dark-Mode-Unterstützung
- [ ] Erweiterte Statistiken und Charts

## 📝 Lizenz

Privates Projekt - Alle Rechte vorbehalten

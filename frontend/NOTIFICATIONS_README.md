# UI-Komponenten für Benachrichtigungen und Bestätigungen

## Übersicht

Diese Dokumentation beschreibt die wiederverwendbaren UI-Komponenten für Benachrichtigungen (Notifications) und Bestätigungsdialoge (ConfirmDialog).

---

## 1. Notification System

Das Notification-System zeigt temporäre Meldungen oben rechts im Bildschirm an.

### Komponenten

- **Notification**: Einzelne Benachrichtigung
- **NotificationContainer**: Container für mehrere Benachrichtigungen
- **NotificationContext**: Context für globale Benachrichtigungsverwaltung

### Typen

```typescript
type NotificationType = 'success' | 'error' | 'warning' | 'info'
```

- **success** (grün): Erfolgreiche Operationen (z.B. "Kategorie kopiert")
- **error** (rot): Fehlgeschlagene Operationen (z.B. "Speichern fehlgeschlagen")
- **warning** (gelb): Warnungen (z.B. "Unvollständige Eingaben")
- **info** (blau): Informationen (z.B. "Neue Version verfügbar")

### Verwendung

#### 1. Provider einbinden (bereits in App.tsx integriert)

```tsx
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <NotificationProvider>
      {/* App Content */}
    </NotificationProvider>
  )
}
```

#### 2. Hook in Komponenten verwenden

```tsx
import { useNotification } from '../contexts/NotificationContext'

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification()

  const handleSave = async () => {
    try {
      await saveData()
      showSuccess('Daten erfolgreich gespeichert!')
    } catch (error) {
      showError('Fehler beim Speichern der Daten')
    }
  }

  return <button onClick={handleSave}>Speichern</button>
}
```

#### 3. Alle verfügbaren Methoden

```tsx
// Standard-Benachrichtigungen (5 Sekunden Dauer)
showSuccess('Erfolgreich gespeichert!')
showError('Ein Fehler ist aufgetreten')
showWarning('Achtung: Prüfen Sie Ihre Eingaben')
showInfo('Hinweis: Neue Version verfügbar')

// Mit eigener Dauer (in Millisekunden)
showSuccess('Gespeichert!', 3000)
showError('Fehler!', 10000)

// Generische Methode
showNotification('success', 'Nachricht', 5000)
```

### Eigenschaften

- **Automatisches Ausblenden**: Nach der angegebenen Dauer (Standard: 5000ms)
- **Manuelles Schließen**: Über das X-Icon
- **Stapelbar**: Mehrere Benachrichtigungen werden untereinander angezeigt
- **Animation**: Slide-in von rechts
- **Accessibility**: Unterstützt `aria-live` für Screen Reader

---

## 2. ConfirmDialog (Bestätigungsdialog)

Der ConfirmDialog zeigt einen modalen Dialog mit einer Frage und Ja/Nein-Buttons.

### Verwendung

```tsx
import { useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import { useNotification } from '../contexts/NotificationContext'

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false)
  const { showSuccess, showInfo } = useNotification()

  const handleDelete = () => {
    setShowDialog(true)
  }

  const handleConfirm = () => {
    setShowDialog(false)
    // Löschvorgang durchführen
    deleteItem()
    showSuccess('Element erfolgreich gelöscht')
  }

  const handleCancel = () => {
    setShowDialog(false)
    showInfo('Löschvorgang abgebrochen')
  }

  return (
    <>
      <button onClick={handleDelete}>Löschen</button>
      
      <ConfirmDialog
        isOpen={showDialog}
        title="Element löschen?"
        message="Diese Aktion kann nicht rückgängig gemacht werden."
        confirmText="Ja, löschen"
        cancelText="Abbrechen"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        variant="danger"
      />
    </>
  )
}
```

### Props

| Prop | Typ | Standard | Beschreibung |
|------|-----|----------|--------------|
| `isOpen` | `boolean` | - | Steuert die Sichtbarkeit des Dialogs |
| `title` | `string` | - | Überschrift des Dialogs |
| `message` | `string \| ReactNode` | - | Nachricht/Frage im Dialog |
| `confirmText` | `string` | `'Ja'` | Text für den Bestätigen-Button |
| `cancelText` | `string` | `'Nein'` | Text für den Abbrechen-Button |
| `onConfirm` | `() => void` | - | Callback beim Klick auf Bestätigen |
| `onCancel` | `() => void` | - | Callback beim Klick auf Abbrechen |
| `variant` | `'danger' \| 'warning' \| 'info'` | `'warning'` | Visuelle Variante des Dialogs |

### Varianten

- **danger** (rot): Gefährliche Aktionen wie Löschen
- **warning** (gelb): Warnungen vor wichtigen Entscheidungen
- **info** (blau): Allgemeine Bestätigungen

### Eigenschaften

- **Modal-Overlay**: Dunkler Hintergrund blockiert Interaktion
- **Zentriert**: Dialog erscheint in der Bildschirmmitte
- **Tastatur-freundlich**: ESC zum Schließen (optional erweiterbar)
- **Animation**: Fade-in Animation
- **Accessibility**: Fokus-Management für Screen Reader

---

## 3. Beispiele

### Beispiel 1: Kategorie löschen

```tsx
const handleDeleteCategory = async (categoryId: string) => {
  setDeleteDialog({ show: true, categoryId })
}

const confirmDelete = async () => {
  try {
    await api.deleteCategory(deleteDialog.categoryId)
    showSuccess('Kategorie erfolgreich gelöscht')
    setDeleteDialog({ show: false, categoryId: '' })
    refreshCategories()
  } catch (error) {
    showError('Fehler beim Löschen der Kategorie')
  }
}

<ConfirmDialog
  isOpen={deleteDialog.show}
  title="Kategorie löschen?"
  message="Alle zugehörigen Einträge werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
  confirmText="Ja, löschen"
  cancelText="Abbrechen"
  onConfirm={confirmDelete}
  onCancel={() => setDeleteDialog({ show: false, categoryId: '' })}
  variant="danger"
/>
```

### Beispiel 2: Formular speichern mit Validierung

```tsx
const handleSave = async () => {
  // Validierung
  if (!name || !value) {
    showWarning('Bitte füllen Sie alle Pflichtfelder aus')
    return
  }

  try {
    await api.saveEntry({ name, value })
    showSuccess('Eintrag erfolgreich gespeichert!')
    navigate('/categories')
  } catch (error) {
    showError('Fehler beim Speichern des Eintrags')
  }
}
```

### Beispiel 3: Multiple Notifications

```tsx
const handleBulkOperation = async () => {
  showInfo('Verarbeite Einträge...')
  
  try {
    await processBulkData()
    showSuccess('Alle Einträge erfolgreich verarbeitet')
  } catch (error) {
    showError('Einige Einträge konnten nicht verarbeitet werden')
  }
}
```

---

## 4. Best Practices

### Notifications

1. **Kurze Nachrichten**: Halten Sie Benachrichtigungen prägnant (max. 1-2 Zeilen)
2. **Richtige Dauer**: 3-5 Sekunden für normale Meldungen, länger für wichtige Fehlermeldungen
3. **Klare Aussagen**: Verwenden Sie aktive Sprache ("Gespeichert" statt "Wurde gespeichert")
4. **Kontext**: Geben Sie genügend Kontext ("Kategorie 'Sport' gelöscht" statt nur "Gelöscht")

### ConfirmDialog

1. **Klare Fragen**: Formulieren Sie eindeutige Fragen
2. **Konsequenzen**: Erklären Sie, was passiert (besonders bei danger-Variante)
3. **Action-Buttons**: Verwenden Sie aktive Verben ("Löschen" statt "OK")
4. **Konsistenz**: Verwenden Sie konsistente Texte app-weit

---

## 5. Demo-Seite

Eine interaktive Demo-Seite ist unter `/demo` verfügbar:

```
http://localhost:5173/demo
```

Hier können Sie alle Komponenten testen und Beispiel-Code sehen.

---

## 6. Technische Details

### Abhängigkeiten

- React 18+
- Tailwind CSS
- lucide-react (für Icons)
- clsx (für bedingte Klassennamen)

### Dateistruktur

```
src/
├── components/
│   ├── Notification.tsx              # Einzelne Benachrichtigung
│   ├── NotificationContainer.tsx     # Container für Benachrichtigungen
│   └── ConfirmDialog.tsx             # Bestätigungsdialog
├── contexts/
│   └── NotificationContext.tsx       # Context & Provider
└── pages/
    └── ComponentDemo.tsx             # Demo-Seite
```

### CSS Animationen

Animationen sind in `src/index.css` definiert:

- `animate-fadeIn`: Für ConfirmDialog
- `animate-slideInRight`: Für Notifications

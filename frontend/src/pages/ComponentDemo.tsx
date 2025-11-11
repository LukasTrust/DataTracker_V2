import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import { useNotification } from '../contexts/NotificationContext'
import { CheckCircle, XCircle, AlertTriangle, Info, Trash2 } from 'lucide-react'

function ComponentDemo() {
  const [showDialog, setShowDialog] = useState(false)
  const [dialogVariant, setDialogVariant] = useState<'danger' | 'warning' | 'info'>('warning')
  const { showSuccess, showError, showWarning, showInfo } = useNotification()

  const handleDeleteConfirm = () => {
    setShowDialog(false)
    showSuccess('Element wurde erfolgreich gelöscht')
  }

  const handleDeleteCancel = () => {
    setShowDialog(false)
    showInfo('Löschvorgang wurde abgebrochen')
  }

  const openDialog = (variant: 'danger' | 'warning' | 'info') => {
    setDialogVariant(variant)
    setShowDialog(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Komponenten Demo"
        description="Testen Sie die Benachrichtigungen und Bestätigungsdialoge"
      />

      {/* Notifications Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Benachrichtigungen (Notifications)</h2>
        <p className="text-neutral-600 mb-6">
          Benachrichtigungen erscheinen oben rechts und verschwinden automatisch nach 5 Sekunden.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="primary"
            onClick={() => showSuccess('Kategorie erfolgreich kopiert!')}
            icon={<CheckCircle className="w-4 h-4" />}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
          >
            Success
          </Button>
          
          <Button
            variant="primary"
            onClick={() => showError('Operation fehlgeschlagen!')}
            icon={<XCircle className="w-4 h-4" />}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            Error
          </Button>
          
          <Button
            variant="primary"
            onClick={() => showWarning('Unvollständige Eingaben!')}
            icon={<AlertTriangle className="w-4 h-4" />}
            className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
          >
            Warning
          </Button>
          
          <Button
            variant="primary"
            onClick={() => showInfo('Neue Informationen verfügbar')}
            icon={<Info className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          >
            Info
          </Button>
        </div>

        <div className="mt-6 p-4 bg-neutral-100 rounded-lg">
          <h3 className="font-semibold mb-2">Verwendung im Code:</h3>
          <pre className="text-sm text-neutral-700 overflow-x-auto">
{`const { showSuccess, showError, showWarning, showInfo } = useNotification()

// Benachrichtigungen anzeigen
showSuccess('Erfolgreich gespeichert!')
showError('Ein Fehler ist aufgetreten')
showWarning('Achtung: Prüfen Sie Ihre Eingaben')
showInfo('Hinweis: Neue Version verfügbar')

// Mit eigener Dauer (in Millisekunden)
showSuccess('Gespeichert!', 3000)`}
          </pre>
        </div>
      </Card>

      {/* Confirm Dialog Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Bestätigungsdialog (ConfirmDialog)</h2>
        <p className="text-neutral-600 mb-6">
          Der Bestätigungsdialog erscheint als Modal und fordert eine Ja/Nein-Entscheidung.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={() => openDialog('danger')}
            icon={<Trash2 className="w-4 h-4" />}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            Danger Dialog
          </Button>
          
          <Button
            variant="primary"
            onClick={() => openDialog('warning')}
            icon={<AlertTriangle className="w-4 h-4" />}
            className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
          >
            Warning Dialog
          </Button>
          
          <Button
            variant="primary"
            onClick={() => openDialog('info')}
            icon={<Info className="w-4 h-4" />}
          >
            Info Dialog
          </Button>
        </div>

        <div className="mt-6 p-4 bg-neutral-100 rounded-lg">
          <h3 className="font-semibold mb-2">Verwendung im Code:</h3>
          <pre className="text-sm text-neutral-700 overflow-x-auto">
{`const [showDialog, setShowDialog] = useState(false)

const handleConfirm = () => {
  setShowDialog(false)
  // Aktion ausführen (z.B. löschen)
  showSuccess('Element gelöscht')
}

const handleCancel = () => {
  setShowDialog(false)
  showInfo('Vorgang abgebrochen')
}

<ConfirmDialog
  isOpen={showDialog}
  title="Element löschen?"
  message="Diese Aktion kann nicht rückgängig gemacht werden."
  confirmText="Ja, löschen"
  cancelText="Abbrechen"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  variant="danger" // 'danger' | 'warning' | 'info'
/>`}
          </pre>
        </div>
      </Card>

      {/* Multiple Notifications Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Mehrere Benachrichtigungen</h2>
        <p className="text-neutral-600 mb-6">
          Mehrere Benachrichtigungen werden untereinander gestapelt angezeigt.
        </p>
        
        <Button
          variant="primary"
          onClick={() => {
            showSuccess('Erste Benachrichtigung')
            setTimeout(() => showInfo('Zweite Benachrichtigung'), 500)
            setTimeout(() => showWarning('Dritte Benachrichtigung'), 1000)
          }}
        >
          Mehrere Benachrichtigungen anzeigen
        </Button>
      </Card>

      {/* ConfirmDialog Component */}
      <ConfirmDialog
        isOpen={showDialog}
        title={
          dialogVariant === 'danger' 
            ? 'Element wirklich löschen?' 
            : dialogVariant === 'warning'
            ? 'Sind Sie sicher?'
            : 'Möchten Sie fortfahren?'
        }
        message={
          dialogVariant === 'danger'
            ? 'Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten werden dauerhaft gelöscht.'
            : dialogVariant === 'warning'
            ? 'Bitte überprüfen Sie Ihre Eingaben, bevor Sie fortfahren.'
            : 'Möchten Sie diese Aktion wirklich durchführen?'
        }
        confirmText={dialogVariant === 'danger' ? 'Ja, löschen' : 'Ja'}
        cancelText="Abbrechen"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant={dialogVariant}
      />
    </div>
  )
}

export default ComponentDemo

import { Settings as SettingsIcon } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

function Settings() {
  return (
    <>
      <PageHeader 
        title="Einstellungen"
        description="Konfiguriere deine Anwendung"
      />

      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center">
            <SettingsIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Einstellungen kommen bald
            </h3>
            <p className="text-sm text-neutral-600">
              Hier kannst du bald Anwendungseinstellungen vornehmen.
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Settings

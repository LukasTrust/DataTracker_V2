import { Download } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'

function Export() {
  const handleExport = () => {
    // TODO: Export-Logik implementieren
    console.log('Export wird durchgeführt...')
  }

  return (
    <>
      <PageHeader 
        title="Daten Export"
        description="Exportiere deine Daten in verschiedenen Formaten"
      />

      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download className="w-8 h-8 text-primary-600" />
            </div>
            
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Daten exportieren
            </h2>
            <p className="text-neutral-600 mb-8">
              Lade alle deine Kategorien und Einträge als Excel-Datei herunter.
            </p>

            <div className="space-y-4">
              <Button 
                variant="primary" 
                size="lg"
                icon={<Download className="w-5 h-5" />}
                onClick={handleExport}
                className="w-full sm:w-auto"
              >
                Excel-Datei herunterladen
              </Button>
              
              <p className="text-sm text-neutral-500">
                Die Datei enthält alle Kategorien mit ihren jeweiligen Einträgen.
              </p>
            </div>
          </Card>

          <Card className="p-6 mt-6">
            <h3 className="font-semibold text-neutral-900 mb-3">
              Export-Informationen
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">✓</span>
                <span>Alle Kategorien werden in separate Arbeitsblätter exportiert</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">✓</span>
                <span>Einträge sind nach Datum sortiert</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">✓</span>
                <span>Automatisch formatierte Spalten für bessere Lesbarkeit</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Export

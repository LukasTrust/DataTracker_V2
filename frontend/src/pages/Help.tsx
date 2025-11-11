import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

function Help() {
  return (
    <>
      <PageHeader 
        title="Hilfe & Support"
        description="Häufig gestellte Fragen"
      />

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Häufig gestellte Fragen (FAQ)
            </h3>
            <div className="space-y-4">
              {[
                {
                  question: 'Wie erstelle ich eine neue Kategorie?',
                  answer: 'Klicke im Dashboard oder in der Sidebar auf "Neue Kategorie". Wähle einen Namen, Typ (Normal oder Sparen), eine Einheit und optional die automatische Erstellung. Nach dem Speichern erscheint die Kategorie in der Sidebar.'
                },
                {
                  question: 'Was ist der Unterschied zwischen Normal- und Spar-Kategorien?',
                  answer: 'Normal-Kategorien können beliebige Einheiten verwenden (€, %, kg, h, etc.). Spar-Kategorien verwenden immer € und bieten zusätzlich die Möglichkeit, Einzahlungen zu erfassen. So kannst du den Gewinn/Verlust deiner Investments oder Sparkonten verfolgen.'
                },
                {
                  question: 'Kann ich meine Daten exportieren?',
                  answer: 'Ja! Du kannst einzelne Kategorien über den Export-Button in der Tabellenansicht exportieren oder alle Daten gleichzeitig über den Export-Button im Dashboard. Die Daten werden als Excel-Datei heruntergeladen.'
                },
                {
                  question: 'Wie funktioniert die automatische Eintrags-Erstellung?',
                  answer: 'Wenn du bei einer Kategorie "Automatische Einträge erstellen" aktivierst, wird zu Beginn jedes neuen Monats automatisch ein Eintrag mit Wert 0 erstellt. Das ist praktisch für monatliche Tracking-Daten.'
                },
                {
                  question: 'Welche Funktionen bietet das Dashboard?',
                  answer: 'Das Dashboard zeigt dir KPI-Karten (Gesamt-Einträge, Gesamtwert, Spar-Gewinn), eine Kategorieübersicht mit Sparklines, Zeitreihen-Diagramme zur Wertentwicklung und Filter-Optionen. Du kannst auf KPI-Karten klicken, um nach Kategorietyp zu filtern.'
                },
                {
                  question: 'Wie bearbeite oder lösche ich Einträge?',
                  answer: 'In der Tabellenansicht einer Kategorie kannst du jeden Eintrag über die Aktions-Buttons bearbeiten oder löschen. Neue Einträge fügst du über die "Neuer Eintrag"-Zeile am Anfang der Tabelle hinzu.'
                },
                {
                  question: 'Was zeigen die Diagramme in der Kategorieansicht?',
                  answer: 'Die Kategorieansicht bietet drei Tabs: Daten (Tabelle mit allen Einträgen), Diagramme (Zeitreihen-Visualisierung deiner Werte) und Einstellungen (zum Bearbeiten der Kategorie). Bei Spar-Kategorien werden zusätzlich Einzahlungen und Gewinn/Verlust angezeigt.'
                },
                {
                  question: 'Kann ich Kategorien duplizieren?',
                  answer: 'Ja, in der Kategorieübersicht findest du bei jeder Kategorie eine Duplikations-Funktion. Dies erstellt eine Kopie der Kategorie mit allen Einstellungen, aber ohne Einträge.'
                },
                {
                  question: 'Wie kann ich nach bestimmten Einträgen suchen?',
                  answer: 'In der Tabellenansicht stehen dir umfangreiche Filter zur Verfügung: Suche nach Kommentar, Filter nach Datum (von/bis) und nach Wert (min/max). Die Ergebnisse werden in Echtzeit aktualisiert.'
                },
              ].map((faq, index) => (
                <div key={index} className="pb-4 border-b border-neutral-200 last:border-0">
                  <h4 className="font-semibold text-neutral-900 mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-sm text-neutral-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Help

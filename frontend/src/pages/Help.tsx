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
                  answer: 'Gehe zu "Kategorien" und klicke auf "Neue Kategorie". Fülle das Formular aus und speichere.'
                },
                {
                  question: 'Kann ich meine Daten exportieren?',
                  answer: 'Ja, in der Tabellenansicht jeder Kategorie findest du einen Export-Button, um die Daten dieser Kategorie als Excel-Datei herunterzuladen.'
                },
                {
                  question: 'Werden meine Daten automatisch gespeichert?',
                  answer: 'Ja, alle Änderungen werden automatisch in der lokalen Datenbank gespeichert.'
                },
                {
                  question: 'Was bedeutet "Auto-Erstellung"?',
                  answer: 'Kategorien mit aktivierter Auto-Erstellung erhalten automatisch einen Eintrag am Monatsanfang, falls noch keiner für den aktuellen Monat existiert.'
                },
                {
                  question: 'Wie funktionieren Spar-Kategorien?',
                  answer: 'Spar-Kategorien verwenden immer Euro (€) als Einheit und können zusätzlich Einzahlungen verfolgen. Der aktuelle Stand wird aus dem letzten Wert ermittelt.'
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

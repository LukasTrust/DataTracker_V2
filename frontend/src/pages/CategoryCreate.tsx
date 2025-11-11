import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, FolderPlus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import { createCategory } from '../api/api'
import { useNotification } from '../contexts/NotificationContext'

function CategoryCreate() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'normal',
    unit: '',
    auto_create: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showError('Bitte gib einen Namen ein')
      return
    }

    try {
      setLoading(true)
      await createCategory({
        name: formData.name.trim(),
        type: formData.type,
        unit: formData.unit.trim() || undefined,
        auto_create: formData.auto_create,
      })
      showSuccess('Kategorie erfolgreich erstellt!')
      navigate('/categories')
    } catch (error) {
      console.error('Fehler beim Erstellen der Kategorie:', error)
      showError('Fehler beim Erstellen der Kategorie')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      // When type changes to "sparen", force unit to "€"
      if (field === 'type' && value === 'sparen') {
        updated.unit = '€'
      }
      // When type changes from "sparen" to "normal", clear unit
      if (field === 'type' && value === 'normal' && prev.type === 'sparen') {
        updated.unit = ''
      }
      return updated
    })
  }

  return (
    <>
      <PageHeader 
        title="Neue Kategorie erstellen"
        description="Erstelle eine neue Kategorie für deine Daten"
      />

      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-default"
                  placeholder="z.B. Finanzen, Sport, Gesundheit"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Der Name deiner Kategorie
                </p>
              </div>

              {/* Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Typ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'normal')}
                    className={`p-4 border-2 rounded-lg transition-default ${
                      formData.type === 'normal'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-center">
                      <FolderPlus className={`w-6 h-6 mx-auto mb-2 ${
                        formData.type === 'normal' ? 'text-primary-600' : 'text-neutral-400'
                      }`} />
                      <p className={`font-medium ${
                        formData.type === 'normal' ? 'text-primary-700' : 'text-neutral-700'
                      }`}>
                        Normal
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Standard-Kategorie
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('type', 'sparen')}
                    className={`p-4 border-2 rounded-lg transition-default ${
                      formData.type === 'sparen'
                        ? 'border-green-500 bg-green-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-center">
                      <FolderPlus className={`w-6 h-6 mx-auto mb-2 ${
                        formData.type === 'sparen' ? 'text-green-600' : 'text-neutral-400'
                      }`} />
                      <p className={`font-medium ${
                        formData.type === 'sparen' ? 'text-green-700' : 'text-neutral-700'
                      }`}>
                        Sparen
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Mit Einzahlungen
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Unit */}
              <div className="mb-6">
                <label htmlFor="unit" className="block text-sm font-medium text-neutral-700 mb-2">
                  Einheit {formData.type === 'normal' && '(optional)'}
                  {formData.type === 'sparen' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className={`w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-default ${
                    formData.type === 'sparen' ? 'bg-neutral-100' : ''
                  }`}
                  placeholder={formData.type === 'sparen' ? '€' : 'z.B. %, Stück, kg, h'}
                  disabled={formData.type === 'sparen'}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {formData.type === 'sparen' 
                    ? 'Finanzkategorien verwenden automatisch € als Einheit'
                    : 'Die Einheit für die Werte in dieser Kategorie (z.B. %, Stück, kg, h)'}
                </p>
              </div>

              {/* Auto Create */}
              <div className="mb-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.auto_create}
                    onChange={(e) => handleChange('auto_create', e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-neutral-700">
                      Automatische Einträge erstellen
                    </span>
                    <span className="block text-xs text-neutral-500 mt-1">
                      Erstellt automatisch einen Eintrag mit Wert 0 für jeden neuen Monat
                    </span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200">
                <Button
                  type="button"
                  variant="ghost"
                  icon={<X className="w-4 h-4" />}
                  onClick={() => navigate('/categories')}
                  disabled={loading}
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Save className="w-4 h-4" />}
                  disabled={loading}
                >
                  {loading ? 'Wird erstellt...' : 'Kategorie erstellen'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Info Card */}
          <Card className="p-6 mt-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
              💡 Tipps zum Erstellen von Kategorien
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>Wähle einen aussagekräftigen Namen für deine Kategorie</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>Nutze den Typ "Sparen" für Kategorien mit Einzahlungen (z.B. Sparkonto)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>Die Einheit hilft bei der Darstellung der Werte (z.B. EUR, kg, Stunden)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>Automatische Einträge erstellen spart Zeit bei monatlichen Datensätzen</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}

export default CategoryCreate

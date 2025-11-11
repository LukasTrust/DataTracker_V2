import Card from '../Card'
import Button from '../Button'
import { CategoryFormData } from '../../types/category'

interface CategoryEditFormProps {
  formData: CategoryFormData
  onFormChange: (data: CategoryFormData) => void
  onSave: () => void
  onDelete?: () => void
  onDuplicate?: () => void
}

function CategoryEditForm({ formData, onFormChange, onSave, onDelete, onDuplicate }: CategoryEditFormProps) {
  const handleChange = (field: keyof CategoryFormData, value: string | boolean) => {
    onFormChange({
      ...formData,
      [field]: value
    })
  }

  return (
    <Card className="p-6 max-w-2xl">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">
        Kategorie-Einstellungen
      </h3>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Kategorie-Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            placeholder="z.B. Gewicht, Umsatz, Ersparnisse"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Typ
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          >
            <option value="normal">Normal</option>
            <option value="sparen">Sparen</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Einheit <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            disabled={formData.type === 'sparen'}
            className={`w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors ${
              formData.type === 'sparen' ? 'bg-neutral-100 cursor-not-allowed text-neutral-500' : ''
            }`}
            placeholder="z.B. kg, €, Stunden"
            required
          />
          {formData.type === 'sparen' && (
            <p className="mt-1 text-xs text-neutral-500">
              Die Einheit kann bei Sparkategorien nicht geändert werden.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="auto_create"
            checked={formData.auto_create}
            onChange={(e) => handleChange('auto_create', e.target.checked)}
            className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="auto_create" className="text-sm text-neutral-700">
            Automatisch neue Einträge für jeden Monat erstellen
          </label>
        </div>

        <div className="pt-4 border-t border-neutral-200 flex items-center gap-3">
          <Button 
            variant="primary"
            onClick={onSave}
          >
            Änderungen speichern
          </Button>
          <p className="text-xs text-neutral-500">
            Letzte Änderung wird sofort gespeichert
          </p>
        </div>

        {(onDelete || onDuplicate) && (
          <div className="pt-4 border-t border-neutral-200 mt-6">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Weitere Aktionen
            </h4>
            <div className="flex items-center gap-3">
              {onDuplicate && (
                <Button 
                  variant="secondary"
                  onClick={onDuplicate}
                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 border-primary-300"
                >
                  Kategorie duplizieren
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="secondary"
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                >
                  Kategorie löschen
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default CategoryEditForm

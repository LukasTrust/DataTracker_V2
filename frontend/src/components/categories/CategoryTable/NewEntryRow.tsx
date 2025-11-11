import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '../../Button'
import { Category } from '../../../types/category'
import { getTodayISO } from '../../../utils/dateFormatter'
import { useNotification } from '../../../contexts/NotificationContext'

interface NewEntryRowProps {
  category: Category
  onSave: (data: NewEntryData) => Promise<void>
  disabled?: boolean
}

export interface NewEntryData {
  date: string // YYYY-MM format
  value: number
  deposit?: number
  comment?: string
}

/**
 * Formular-Zeile zum Erstellen neuer Einträge in CategoryTable
 */
function NewEntryRow({ category, onSave, disabled = false }: NewEntryRowProps) {
  const { showError } = useNotification()
  const [formData, setFormData] = useState<{
    date: string // YYYY-MM-DD for input type="month"
    value: string
    deposit: string
    comment: string
  }>({
    date: getTodayISO(),
    value: '',
    deposit: '',
    comment: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const isSparenCategory = category.type === 'sparen'

  const handleSave = async () => {
    // Validierung
    const valueNum = parseFloat(formData.value)
    if (!formData.value || isNaN(valueNum) || valueNum === 0) {
      showError('Bitte einen gültigen Wert eingeben')
      return
    }

    if (isSparenCategory) {
      const depositNum = parseFloat(formData.deposit)
      if (!formData.deposit || isNaN(depositNum) || depositNum === 0) {
        showError('Bitte eine gültige Einzahlung eingeben')
        return
      }
    }

    setIsSaving(true)
    try {
      // Datum von YYYY-MM-DD zu YYYY-MM konvertieren
      const dateYYYYMM = formData.date.substring(0, 7)

      const entryData: NewEntryData = {
        date: dateYYYYMM,
        value: valueNum,
        deposit: isSparenCategory ? parseFloat(formData.deposit) : undefined,
        comment: formData.comment || undefined,
      }

      await onSave(entryData)

      // Formular zurücksetzen nur bei Erfolg
      setFormData({
        date: getTodayISO(),
        value: '',
        deposit: '',
        comment: '',
      })
    } catch (error) {
      // Fehler wird bereits in CategoryTable behandelt
      console.error('Fehler beim Speichern:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const cellClass = 'px-4 py-3'

  return (
    <tr className="border-b border-neutral-200 bg-green-50">
      {/* Datum */}
      <td className={cellClass}>
        <input
          type="month"
          value={formData.date.substring(0, 7)}
          onChange={(e) => setFormData({ ...formData, date: e.target.value + '-01' })}
          disabled={disabled || isSaving}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-50 text-sm"
        />
      </td>

      {/* Wert */}
      <td className={cellClass}>
        <input
          type="number"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="0.00"
          disabled={disabled || isSaving}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-50 text-sm"
          step="0.01"
        />
      </td>

      {/* Einzahlung (nur Sparen) */}
      {isSparenCategory && (
        <td className={cellClass}>
          <input
            type="number"
            value={formData.deposit}
            onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
            placeholder="0.00"
            disabled={disabled || isSaving}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-50 text-sm"
            step="0.01"
          />
        </td>
      )}

      {/* Kommentar */}
      <td className={cellClass}>
        <input
          type="text"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          placeholder="Kommentar (optional)"
          disabled={disabled || isSaving}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-50 text-sm"
        />
      </td>

      {/* Auto-Generated (leer) */}
      <td className={cellClass}></td>

      {/* Aktionen */}
      <td className={`${cellClass} text-right`}>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleSave}
          disabled={disabled || isSaving}
        >
          {isSaving ? 'Speichert...' : 'Hinzufügen'}
        </Button>
      </td>
    </tr>
  )
}

export default NewEntryRow

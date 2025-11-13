import { useState } from 'react'
import { Edit2, Trash2, X, Check } from 'lucide-react'
import Button from '../../Button'
import { Entry, Category } from '../../../types/category'
import { formatDateGerman } from '../../../utils/dateFormatter'
import { formatNumber, parseFlexibleNumber } from '../../../utils/numberFormatter'

interface CategoryTableRowProps {
  entry: Entry
  category: Category
  isEditing: boolean
  editForm: Partial<Entry>
  onEditStart: (entry: Entry) => void
  onEditCancel: () => void
  onEditSave: () => void
  onEditChange: (field: keyof Entry, value: any) => void
  onDelete: (entryId: number) => void
}

/**
 * Einzelne Zeile in der CategoryTable
 * Unterstützt Inline-Editing
 */
function CategoryTableRow({
  entry,
  category,
  isEditing,
  editForm,
  onEditStart,
  onEditCancel,
  onEditSave,
  onEditChange,
  onDelete,
}: CategoryTableRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [editValueStr, setEditValueStr] = useState<string>('')
  const [editDepositStr, setEditDepositStr] = useState<string>('')

  const cellClass = "px-4 py-3 text-sm"
  const isSparenCategory = category.type === 'sparen'

  // Initialize string values when editing starts
  if (isEditing && editValueStr === '') {
    setEditValueStr(String(editForm.value ?? entry.value))
    if (isSparenCategory && editDepositStr === '') {
      setEditDepositStr(String(editForm.deposit ?? entry.deposit ?? ''))
    }
  }

  // Reset string values when editing ends
  if (!isEditing && editValueStr !== '') {
    setEditValueStr('')
    setEditDepositStr('')
  }

  const handleValueChange = (value: string) => {
    setEditValueStr(value)
    const parsed = parseFlexibleNumber(value)
    if (!isNaN(parsed)) {
      onEditChange('value', parsed)
    }
  }

  const handleDepositChange = (value: string) => {
    setEditDepositStr(value)
    const parsed = parseFlexibleNumber(value)
    if (!isNaN(parsed)) {
      onEditChange('deposit', parsed)
    }
  }

  if (isEditing) {
    // Edit Mode
    return (
      <tr className="border-b border-neutral-200 bg-blue-50">
        {/* Datum */}
        <td className={cellClass}>
          <input
            type="month"
            value={editForm.date || entry.date}
            onChange={(e) => onEditChange('date', e.target.value)}
            className="w-full px-2 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </td>

        {/* Wert */}
        <td className={cellClass}>
          <input
            type="text"
            inputMode="decimal"
            value={editValueStr}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="z.B. 1.50 oder 1,50"
            className="w-full px-2 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </td>

        {/* Einzahlung (nur Sparen) */}
        {isSparenCategory && (
          <td className={cellClass}>
            <input
              type="text"
              inputMode="decimal"
              value={editDepositStr}
              onChange={(e) => handleDepositChange(e.target.value)}
              placeholder="z.B. 1.50 oder 1,50"
              className="w-full px-2 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </td>
        )}

        {/* Kommentar */}
        <td className={cellClass}>
          <input
            type="text"
            value={editForm.comment ?? entry.comment ?? ''}
            onChange={(e) => onEditChange('comment', e.target.value)}
            className="w-full px-2 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="Kommentar..."
          />
        </td>

        {/* Auto-Generated */}
        <td className={`${cellClass} text-center`}>
          {entry.auto_generated && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
              Auto
            </span>
          )}
        </td>

        {/* Aktionen */}
        <td className={`${cellClass} text-right`}>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Check className="w-4 h-4" />}
              onClick={onEditSave}
            >
              Speichern
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={onEditCancel}
            >
              Abbrechen
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  // View Mode
  return (
    <tr
      className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEditStart(entry)}
    >
      {/* Datum */}
      <td className={`${cellClass} font-medium text-neutral-900`}>
        {formatDateGerman(entry.date + '-01')}
      </td>

      {/* Wert */}
      <td className={`${cellClass} font-semibold text-neutral-900`}>
        {formatNumber(entry.value, 2)} {category.unit}
      </td>

      {/* Einzahlung (nur Sparen) */}
      {isSparenCategory && (
        <td className={`${cellClass} text-neutral-700`}>
          {entry.deposit ? `${formatNumber(entry.deposit, 2)} ${category.unit}` : '-'}
        </td>
      )}

      {/* Kommentar */}
      <td className={`${cellClass} text-neutral-600`}>
        {entry.comment || '-'}
      </td>

      {/* Auto-Generated */}
      <td className={`${cellClass} text-center`}>
        {entry.auto_generated && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
            Auto
          </span>
        )}
      </td>

      {/* Aktionen */}
      <td className={`${cellClass} text-right`}>
        <div className={`flex items-center justify-end gap-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit2 className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation() // Verhindert doppeltes Auslösen
              onEditStart(entry)
            }}
          >
            Bearbeiten
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation() // Verhindert, dass onClick der Row ausgelöst wird
              onDelete(entry.id)
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Löschen
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default CategoryTableRow

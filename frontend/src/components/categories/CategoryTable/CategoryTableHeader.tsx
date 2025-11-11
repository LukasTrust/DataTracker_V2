import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

export type SortField = 'date' | 'value' | 'deposit' | 'comment'
export type SortDirection = 'asc' | 'desc'

interface CategoryTableHeaderProps {
  isSparenCategory: boolean
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

/**
 * Header-Komponente für CategoryTable
 * Enthält sortierbare Spalten-Überschriften
 */
function CategoryTableHeader({
  isSparenCategory,
  sortField,
  sortDirection,
  onSort,
}: CategoryTableHeaderProps) {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-neutral-400" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary-600" />
    )
  }

  const headerClass = "px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-50 transition-colors"
  const sortButtonClass = "flex items-center gap-2 w-full"

  return (
    <thead className="bg-neutral-100 border-b border-neutral-200">
      <tr>
        {/* Datum */}
        <th className={headerClass} onClick={() => onSort('date')}>
          <div className={sortButtonClass}>
            <span>Datum</span>
            {getSortIcon('date')}
          </div>
        </th>

        {/* Wert */}
        <th className={headerClass} onClick={() => onSort('value')}>
          <div className={sortButtonClass}>
            <span>Wert</span>
            {getSortIcon('value')}
          </div>
        </th>

        {/* Einzahlung (nur für Sparen-Kategorien) */}
        {isSparenCategory && (
          <th className={headerClass} onClick={() => onSort('deposit')}>
            <div className={sortButtonClass}>
              <span>Einzahlung</span>
              {getSortIcon('deposit')}
            </div>
          </th>
        )}

        {/* Kommentar */}
        <th className={headerClass} onClick={() => onSort('comment')}>
          <div className={sortButtonClass}>
            <span>Kommentar</span>
            {getSortIcon('comment')}
          </div>
        </th>

        {/* Auto-Generated Indicator */}
        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
          <span>Auto</span>
        </th>

        {/* Aktionen */}
        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
          Aktionen
        </th>
      </tr>
    </thead>
  )
}

export default CategoryTableHeader

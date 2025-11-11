import { Search, X } from 'lucide-react'
import Button from '../../Button'

interface CategoryTableFiltersProps {
  searchTerm: string
  dateFrom: string
  dateTo: string
  valueMin: string
  valueMax: string
  onSearchTermChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onValueMinChange: (value: string) => void
  onValueMaxChange: (value: string) => void
  onReset: () => void
  hasActiveFilters: boolean
}

/**
 * Filter-Komponente für die CategoryTable
 * Enthält Suche, Datums- und Wertefilter
 */
function CategoryTableFilters({
  searchTerm,
  dateFrom,
  dateTo,
  valueMin,
  valueMax,
  onSearchTermChange,
  onDateFromChange,
  onDateToChange,
  onValueMinChange,
  onValueMaxChange,
  onReset,
  hasActiveFilters,
}: CategoryTableFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Suche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Suche nach Kommentar..."
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
      </div>

      {/* Filter-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Datum Von */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Datum von
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
          />
        </div>

        {/* Datum Bis */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Datum bis
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
          />
        </div>

        {/* Wert Min */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Wert von
          </label>
          <input
            type="number"
            value={valueMin}
            onChange={(e) => onValueMinChange(e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
          />
        </div>

        {/* Wert Max */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Wert bis
          </label>
          <input
            type="number"
            value={valueMax}
            onChange={(e) => onValueMaxChange(e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
          />
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            icon={<X className="w-4 h-4" />}
            onClick={onReset}
          >
            Filter zurücksetzen
          </Button>
        </div>
      )}
    </div>
  )
}

export default CategoryTableFilters

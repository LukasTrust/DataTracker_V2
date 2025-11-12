import { useState } from 'react'
import { Calendar, Filter, Download, X } from 'lucide-react'
import Button from './Button'
import Card from './Card'

export interface DashboardFilters {
  startDate?: string
  endDate?: string
  categoryType?: 'all' | 'sparen' | 'normal'
}

interface DashboardFilterBarProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  onExport: () => void
  onReset: () => void
}

function DashboardFilterBar({ filters, onFiltersChange, onExport, onReset }: DashboardFilterBarProps) {
  const [showFilters, setShowFilters] = useState(true)

  const handleStartDateChange = (date: string) => {
    onFiltersChange({ ...filters, startDate: date })
  }

  const handleEndDateChange = (date: string) => {
    onFiltersChange({ ...filters, endDate: date })
  }

  const hasActiveFilters = filters.startDate || filters.endDate || filters.categoryType !== 'all'

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filter Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter {hasActiveFilters && '(aktiv)'}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={onReset}
            >
              Zurücksetzen
            </Button>
          )}
        </div>

        {/* Export Button */}
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={onExport}
        >
          Excel exportieren
        </Button>
      </div>

      {/* Expanded Filter Options */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Von Datum
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Bis Datum
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default DashboardFilterBar

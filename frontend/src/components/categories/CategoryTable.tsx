import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Calendar, X, Check, Download, Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import Card from '../Card'
import Button from '../Button'
import ConfirmDialog from '../ConfirmDialog'
import { Category, Entry } from '../../types/category'
import { deleteEntry, updateEntry, exportCategory } from '../../api/api'
import { useNotification } from '../../contexts/NotificationContext'

interface CategoryTableProps {
  entries: Entry[]
  loading: boolean
  category: Category
  onEntriesChange: () => void
}

type SortField = 'date' | 'value' | 'deposit' | 'comment'
type SortDirection = 'asc' | 'desc'

function CategoryTable({ entries, loading, category, onEntriesChange }: CategoryTableProps) {
  const { showSuccess, showError } = useNotification()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Entry>>({})
  const [exporting, setExporting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; entryId: number | null }>({
    isOpen: false,
    entryId: null
  })
  
  // Filter & Suche States
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [valueMin, setValueMin] = useState('')
  const [valueMax, setValueMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Sortierung States
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Funktion zum Formatieren des Datums
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  // Funktion zum Sortieren der Spalten
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Gefilterte und sortierte Einträge
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...entries]

    // Suche nach Kommentar
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.comment?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Datumsfilter
    if (dateFrom) {
      filtered = filtered.filter(entry => entry.date >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter(entry => entry.date <= dateTo)
    }

    // Wertefilter
    if (valueMin !== '') {
      const min = parseFloat(valueMin)
      filtered = filtered.filter(entry => entry.value >= min)
    }
    if (valueMax !== '') {
      const max = parseFloat(valueMax)
      filtered = filtered.filter(entry => entry.value <= max)
    }

    // Sortierung
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'value':
          aValue = a.value
          bValue = b.value
          break
        case 'deposit':
          aValue = a.deposit || 0
          bValue = b.deposit || 0
          break
        case 'comment':
          aValue = a.comment || ''
          bValue = b.comment || ''
          break
        default:
          aValue = a.date
          bValue = b.date
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [entries, searchTerm, dateFrom, dateTo, valueMin, valueMax, sortField, sortDirection])

  // Funktion zum Berechnen der Summe
  const calculateSum = (entryList: Entry[] = filteredAndSortedEntries): number => {
    if (entryList.length === 0) return 0
    
    if (category.type === 'sparen') {
      // Letzter Wert, der nicht 0 ist
      const sortedByDate = [...entries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      for (let i = 0; i < sortedByDate.length; i++) {
        if (sortedByDate[i].value !== 0) {
          return sortedByDate[i].value
        }
      }
      return 0
    } else {
      // Summe aller Werte
      return entryList.reduce((sum, entry) => sum + entry.value, 0)
    }
  }

  // Statistiken berechnen
  const statistics = useMemo(() => {
    const sum = calculateSum()
    const average = filteredAndSortedEntries.length > 0 
      ? filteredAndSortedEntries.reduce((sum, e) => sum + e.value, 0) / filteredAndSortedEntries.length
      : 0
    
    return {
      count: filteredAndSortedEntries.length,
      total: entries.length,
      sum,
      average
    }
  }, [filteredAndSortedEntries, entries, category.type])

  // Wert-Farbklassen basierend auf Kategorie-Typ
  const getValueColorClass = (value: number): string => {
    if (category.type === 'sparen') {
      return 'text-blue-700 font-semibold'
    }
    if (value < 0) {
      return 'text-red-600 font-semibold'
    }
    if (value > 0) {
      return 'text-green-600 font-semibold'
    }
    return 'text-neutral-900'
  }

  // Reset Filter
  const resetFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setValueMin('')
    setValueMax('')
  }

  // Funktion zum Setzen des aktuellen Jahres
  const setCurrentYear = () => {
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    setDateFrom(yearStart.toISOString().split('T')[0])
    setDateTo(now.toISOString().split('T')[0])
  }

  // Funktion zum Setzen des aktuellen Monats
  const setCurrentMonth = () => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    setDateFrom(monthStart.toISOString().split('T')[0])
    setDateTo(now.toISOString().split('T')[0])
  }

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id)
    setEditForm({
      value: entry.value,
      deposit: entry.deposit,
      comment: entry.comment
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (entryId: number) => {
    try {
      await updateEntry(entryId, editForm)
      setEditingId(null)
      setEditForm({})
      onEntriesChange()
      showSuccess('Eintrag erfolgreich aktualisiert')
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Eintrags:', error)
      showError('Fehler beim Aktualisieren des Eintrags')
    }
  }

  const handleDelete = (entryId: number) => {
    setDeleteConfirm({ isOpen: true, entryId })
  }

  const confirmDelete = async () => {
    const entryId = deleteConfirm.entryId
    if (!entryId) return

    try {
      await deleteEntry(entryId)
      onEntriesChange()
      showSuccess('Eintrag erfolgreich gelöscht')
    } catch (error) {
      console.error('Fehler beim Löschen des Eintrags:', error)
      showError('Fehler beim Löschen des Eintrags')
    } finally {
      setDeleteConfirm({ isOpen: false, entryId: null })
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportCategory(category.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const fileName = `${category.name}_export_${new Date().toISOString().split('T')[0]}.xlsx`
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showSuccess('Daten erfolgreich exportiert')
    } catch (error) {
      console.error('Fehler beim Exportieren:', error)
      showError('Fehler beim Exportieren der Daten')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl h-16 border border-neutral-200"></div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Noch keine Einträge
        </h3>
        <p className="text-sm text-neutral-600 mb-6">
          Füge deinen ersten Dateneintrag für diese Kategorie hinzu.
        </p>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
          Ersten Eintrag erstellen
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Einträge</div>
          <div className="text-2xl font-bold text-neutral-900">
            {statistics.count}
            {statistics.count !== statistics.total && (
              <span className="text-sm text-neutral-500 ml-2">
                von {statistics.total}
              </span>
            )}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">
            {category.type === 'sparen' ? 'Aktueller Stand' : 'Summe'}
          </div>
          <div className={`text-2xl font-bold ${getValueColorClass(statistics.sum)}`}>
            {statistics.sum.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {category.unit}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Durchschnitt</div>
          <div className="text-2xl font-bold text-neutral-900">
            {statistics.average.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {category.unit}
          </div>
        </Card>
        
        <Card className="p-4 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            disabled={exporting || entries.length === 0}
            className="w-full"
          >
            {exporting ? 'Exportiere...' : 'Excel Export'}
          </Button>
        </Card>
      </div>

      {/* Filter und Suche */}
      <Card>
        <div className="p-4 border-b border-neutral-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Suchleiste */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Suche nach Kommentar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>
            
            {/* Filter Toggle Button */}
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="sm"
              icon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filter {showFilters ? 'ausblenden' : 'einblenden'}
            </Button>
          </div>
          
          {/* Erweiterte Filter */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              {/* Schnell-Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={setCurrentMonth}
                >
                  Dieser Monat
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={setCurrentYear}
                >
                  Dieses Jahr
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetFilters}
                >
                  Alle anzeigen
                </Button>
              </div>
              
              {/* Filter-Felder */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Datum von
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Datum bis
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Wert min
                </label>
                <input
                  type="number"
                  value={valueMin}
                  onChange={(e) => setValueMin(e.target.value)}
                  placeholder="Minimum"
                  step="0.01"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Wert max
                </label>
                <input
                  type="number"
                  value={valueMax}
                  onChange={(e) => setValueMax(e.target.value)}
                  placeholder="Maximum"
                  step="0.01"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tabelle */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Datum
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                    {sortField !== 'date' && <ArrowUpDown className="w-4 h-4 opacity-30" />}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center gap-2">
                    Wert
                    {sortField === 'value' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                    {sortField !== 'value' && <ArrowUpDown className="w-4 h-4 opacity-30" />}
                  </div>
                </th>
                {category.type === 'sparen' && (
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors hidden md:table-cell"
                    onClick={() => handleSort('deposit')}
                  >
                    <div className="flex items-center gap-2">
                      Einzahlung
                      {sortField === 'deposit' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                      {sortField !== 'deposit' && <ArrowUpDown className="w-4 h-4 opacity-30" />}
                    </div>
                  </th>
                )}
                <th 
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors hidden lg:table-cell"
                  onClick={() => handleSort('comment')}
                >
                  <div className="flex items-center gap-2">
                    Kommentar
                    {sortField === 'comment' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                    {sortField !== 'comment' && <ArrowUpDown className="w-4 h-4 opacity-30" />}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredAndSortedEntries.map((entry) => {
                const isEditing = editingId === entry.id
                
                return (
                  <tr key={entry.id} className={`transition-colors ${isEditing ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.value || ''}
                          onChange={(e) => setEditForm({ ...editForm, value: parseFloat(e.target.value) })}
                          className="w-24 px-2 py-1 border border-primary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          step="0.01"
                        />
                      ) : (
                        <span className={getValueColorClass(entry.value)}>
                          {entry.value.toLocaleString('de-DE')} {category.unit}
                        </span>
                      )}
                    </td>
                    {category.type === 'sparen' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.deposit || ''}
                            onChange={(e) => setEditForm({ ...editForm, deposit: parseFloat(e.target.value) })}
                            className="w-24 px-2 py-1 border border-primary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            step="0.01"
                          />
                        ) : (
                          <span className="text-neutral-600">
                            {entry.deposit ? `${entry.deposit.toLocaleString('de-DE')} ${category.unit}` : '-'}
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm max-w-xs hidden lg:table-cell">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.comment || ''}
                          onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                          className="w-full px-2 py-1 border border-primary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          placeholder="Kommentar..."
                        />
                      ) : (
                        <span className="text-neutral-600 truncate block">
                          {entry.comment || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      {entry.auto_generated && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Auto
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => saveEdit(entry.id)}
                            className="p-1.5 text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                            title="Speichern"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 text-white bg-neutral-500 hover:bg-neutral-600 rounded transition-colors"
                            title="Abbrechen"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(entry)}
                            className="p-1.5 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Info wenn keine Einträge nach Filterung */}
        {filteredAndSortedEntries.length === 0 && entries.length > 0 && (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Keine Einträge gefunden
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              Passe die Filter an, um mehr Ergebnisse zu sehen.
            </p>
            <Button variant="secondary" onClick={resetFilters}>
              Filter zurücksetzen
            </Button>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Eintrag löschen"
        message="Möchtest du diesen Eintrag wirklich löschen?"
        confirmText="Löschen"
        cancelText="Abbrechen"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, entryId: null })}
        variant="danger"
      />
    </div>
  )
}

export default CategoryTable

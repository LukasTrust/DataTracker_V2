import { useState, useMemo, useEffect } from 'react'
import { Download } from 'lucide-react'
import Card from '../Card'
import Button from '../Button'
import ConfirmDialog from '../ConfirmDialog'
import { Category, Entry } from '../../types/category'
import { deleteEntry, updateEntry, exportCategory, createEntry } from '../../api'
import { useNotification } from '../../contexts/NotificationContext'
import { getTodayISO } from '../../utils/dateFormatter'

// Sub-Komponenten
import CategoryTableFilters from './CategoryTable/CategoryTableFilters'
import CategoryTableHeader, { SortField, SortDirection } from './CategoryTable/CategoryTableHeader'
import CategoryTableRow from './CategoryTable/CategoryTableRow'
import CategoryTableSummary from './CategoryTable/CategoryTableSummary'
import NewEntryRow, { NewEntryData } from './CategoryTable/NewEntryRow'

interface CategoryTableProps {
  entries: Entry[]
  loading: boolean
  category: Category
  onLocalUpdate?: (updatedEntries: Entry[]) => void // Callback für KPI-Updates ohne Reload
}

/**
 * Hauptkomponente für CategoryTable
 * Refaktoriert: 799 → ~200 Zeilen durch Aufteilung in Sub-Komponenten
 * 
 * Optimierung: Verwendet lokalen State für sofortige Updates ohne Page-Reload
 */
function CategoryTable({ entries, loading, category, onLocalUpdate }: CategoryTableProps) {
  const { showSuccess, showErrorWithContext } = useNotification()
  
  // Lokaler State für optimistische Updates
  const [localEntries, setLocalEntries] = useState<Entry[]>(entries)
  
  // Synchronisiere lokalen State mit Props wenn sich entries ändern
  useEffect(() => {
    setLocalEntries(entries)
  }, [entries])
  
  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Entry>>({})
  
  // Filter & Suche States
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [valueMin, setValueMin] = useState('')
  const [valueMax, setValueMax] = useState('')
  
  // Sortierung States
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Export & Delete States
  const [exporting, setExporting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; entryId: number | null }>({
    isOpen: false,
    entryId: null
  })

  // Funktion zum Sortieren der Spalten
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Gefilterte und sortierte Einträge - nutzt lokalen State für sofortige Updates
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...localEntries]

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
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      // Handle undefined/null
      if (aVal === undefined || aVal === null) aVal = ''
      if (bVal === undefined || bVal === null) bVal = ''

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal)
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })

    return filtered
  }, [localEntries, searchTerm, dateFrom, dateTo, valueMin, valueMax, sortField, sortDirection])

  // Reset Filter
  const resetFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setValueMin('')
    setValueMax('')
  }

  // Edit Handlers
  const startEdit = (entry: Entry) => {
    setEditingId(entry.id)
    setEditForm({
      date: entry.date,
      value: entry.value,
      deposit: entry.deposit,
      comment: entry.comment
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async () => {
    if (editingId === null) return
    
    try {
      // Optimistisches Update: Sofort lokalen State aktualisieren
      setLocalEntries(prev => 
        prev.map(e => e.id === editingId ? { ...e, ...editForm } as Entry : e)
      )
      
      // Wenn ein auto-generierter Eintrag bearbeitet wird, setze auto_generated auf false
      const editData = { ...editForm, auto_generated: false }
      
      // API Call im Hintergrund
      const updatedEntry = await updateEntry(category.id, editingId, editData)
      
      // Finales Update mit Server-Response
      setLocalEntries(prev => 
        prev.map(e => e.id === editingId ? updatedEntry : e)
      )
      
      setEditingId(null)
      setEditForm({})
      
      // Nur Kategorien-Stats aktualisieren, keine komplette Neu-Ladung
      if (onLocalUpdate) {
        onLocalUpdate(localEntries)
      }
      
      showSuccess('Eintrag erfolgreich aktualisiert')
    } catch (error: any) {
      // Bei Fehler: Rollback zum ursprünglichen State
      setLocalEntries(entries)
      console.error('Fehler beim Aktualisieren des Eintrags:', error)
      showErrorWithContext(error, {
        action: 'update',
        entityType: 'entry',
      })
    }
  }

  const updateEditForm = (field: keyof Entry, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  // New Entry Handler mit optimistischem Update
  const handleSaveNewEntry = async (data: NewEntryData) => {
    try {
      const entryData = {
        category_id: category.id,
        date: data.date,
        value: data.value,
        deposit: data.deposit,
        comment: data.comment
      }
      
      // API Call
      const newEntry = await createEntry(category.id, entryData)
      
      // Optimistisches Update: Neuen Eintrag sofort hinzufügen
      setLocalEntries(prev => [...prev, newEntry])
      
      // Lokales Update für KPI-Berechnungen
      if (onLocalUpdate) {
        onLocalUpdate([...localEntries, newEntry])
      }
      
      showSuccess('Eintrag erfolgreich erstellt')
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Eintrags:', error)
      showErrorWithContext(error, {
        action: 'create',
        entityType: 'entry',
      })
      throw error // Werfe Fehler weiter, damit NewEntryRow ihn abfangen kann
    }
  }

  // Delete Handlers
  const handleDelete = (entryId: number) => {
    setDeleteConfirm({ isOpen: true, entryId })
  }

  const confirmDelete = async () => {
    const entryId = deleteConfirm.entryId
    if (!entryId) return

    try {
      // Optimistisches Update: Eintrag sofort entfernen
      setLocalEntries(prev => prev.filter(e => e.id !== entryId))
      
      // API Call im Hintergrund
      await deleteEntry(category.id, entryId)
      
      // Lokales Update für KPI-Berechnungen
      if (onLocalUpdate) {
        onLocalUpdate(localEntries.filter(e => e.id !== entryId))
      }
      
      showSuccess('Eintrag erfolgreich gelöscht')
    } catch (error: any) {
      // Bei Fehler: Rollback
      setLocalEntries(entries)
      console.error('Fehler beim Löschen des Eintrags:', error)
      showErrorWithContext(error, {
        action: 'delete',
        entityType: 'entry',
      })
    } finally {
      setDeleteConfirm({ isOpen: false, entryId: null })
    }
  }

  // Export Handler
  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportCategory(category.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const fileName = `${category.name}_export_${getTodayISO()}.xlsx`
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showSuccess('Daten erfolgreich exportiert')
    } catch (error) {
      console.error('Fehler beim Exportieren:', error)
      showErrorWithContext(error, {
        action: 'export',
        entityType: 'data',
        entityName: category.name,
      })
    } finally {
      setExporting(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl h-16 border border-neutral-200"></div>
        ))}
      </div>
    )
  }

  const isSparenCategory = category.type === 'sparen'
  const hasEntries = localEntries.length > 0

  return (
    <div className="space-y-6">
      {/* Statistiken - nur wenn Daten vorhanden */}
      {hasEntries && (
        <CategoryTableSummary
          entries={localEntries}
          filteredEntries={filteredAndSortedEntries}
          category={category}
        />
      )}

      {/* Filter & Export - nur wenn Daten vorhanden */}
      {hasEntries && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CategoryTableFilters
            searchTerm={searchTerm}
            dateFrom={dateFrom}
            dateTo={dateTo}
            valueMin={valueMin}
            valueMax={valueMax}
            onSearchTermChange={setSearchTerm}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onValueMinChange={setValueMin}
            onValueMaxChange={setValueMax}
            onReset={resetFilters}
            hasActiveFilters={!!(searchTerm || dateFrom || dateTo || valueMin || valueMax)}
          />
          
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exportiere...' : 'Excel Export'}
          </Button>
        </div>
      )}

      {/* Tabelle */}
      <Card className="overflow-x-auto">
        <table className="w-full">
          <CategoryTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            isSparenCategory={isSparenCategory}
          />
          
          <tbody>
            {/* Neue Zeile */}
            <NewEntryRow
              category={category}
              onSave={handleSaveNewEntry}
            />

            {/* Einträge */}
            {filteredAndSortedEntries.map(entry => (
              <CategoryTableRow
                key={entry.id}
                entry={entry}
                category={category}
                isEditing={editingId === entry.id}
                editForm={editForm}
                onEditStart={startEdit}
                onEditCancel={cancelEdit}
                onEditSave={saveEdit}
                onEditChange={updateEditForm}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>

        {/* Keine Ergebnisse */}
        {!hasEntries && (
          <div className="p-8 text-center text-neutral-500">
            <p className="text-lg font-medium mb-2">Noch keine Einträge vorhanden</p>
            <p className="text-sm">Fügen Sie Ihren ersten Eintrag über das Formular oben hinzu!</p>
          </div>
        )}
        
        {hasEntries && filteredAndSortedEntries.length === 0 && (
          <div className="p-8 text-center text-neutral-500">
            Keine Einträge gefunden. Filter anpassen?
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Eintrag löschen"
        message="Möchten Sie diesen Eintrag wirklich löschen?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, entryId: null })}
      />
    </div>
  )
}

export default CategoryTable

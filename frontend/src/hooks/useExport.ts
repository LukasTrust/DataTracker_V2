import { useState } from 'react'
import { exportData, exportCategory, downloadBlob } from '../api'
import { useNotification } from '../contexts/NotificationContext'

interface UseExportReturn {
  exportAll: () => Promise<void>
  exportSingleCategory: (categoryId: number, categoryName: string) => Promise<void>
  exporting: boolean
}

/**
 * Custom Hook für Export-Funktionalität
 * Vereinfacht Export-Operationen mit automatischem Download und Notifications
 * 
 * @returns Export-Funktionen und Loading-State
 */
export function useExport(): UseExportReturn {
  const [exporting, setExporting] = useState(false)
  const { showSuccess, showError, showInfo } = useNotification()

  const exportAll = async () => {
    try {
      setExporting(true)
      showInfo('Export wird vorbereitet...')
      
      const blob = await exportData()
      downloadBlob(blob, 'datatracker_export.xlsx')
      
      showSuccess('Daten erfolgreich exportiert')
    } catch (error) {
      console.error('Export-Fehler:', error)
      showError('Fehler beim Exportieren')
    } finally {
      setExporting(false)
    }
  }

  const exportSingleCategory = async (categoryId: number, categoryName: string) => {
    try {
      setExporting(true)
      showInfo(`Export von "${categoryName}" wird vorbereitet...`)
      
      const blob = await exportCategory(categoryId)
      const filename = `${categoryName.replace(/\s+/g, '_')}_export.xlsx`
      downloadBlob(blob, filename)
      
      showSuccess(`"${categoryName}" erfolgreich exportiert`)
    } catch (error) {
      console.error('Export-Fehler:', error)
      showError(`Fehler beim Exportieren von "${categoryName}"`)
    } finally {
      setExporting(false)
    }
  }

  return {
    exportAll,
    exportSingleCategory,
    exporting,
  }
}

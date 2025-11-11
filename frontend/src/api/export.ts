import apiClient from './client'

/**
 * Export API Functions
 * Alle Export-bezogenen API-Aufrufe
 */

/**
 * Exportiert alle Kategorien als Excel-Datei
 * @returns Blob mit Excel-Datei
 */
export const exportData = async (): Promise<Blob> => {
  const response = await apiClient.get('/export', {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Exportiert eine einzelne Kategorie als Excel-Datei
 * @param categoryId - Category ID
 * @returns Blob mit Excel-Datei
 */
export const exportCategory = async (categoryId: number): Promise<Blob> => {
  const response = await apiClient.get(`/export/category/${categoryId}`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Hilfsfunktion: Lädt einen Blob als Datei herunter
 * @param blob - Der Blob
 * @param filename - Dateiname
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

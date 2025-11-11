import apiClient from './client'
import { EntryRead, EntryCreate, EntryUpdate, EntrySearchParams } from './types'

/**
 * Entry API Functions
 * Alle Entry-bezogenen API-Aufrufe mit vollständiger Type Safety
 */

/**
 * Lädt alle Entries für eine Kategorie
 * @param categoryId - Category ID
 * @returns Array aller Entries der Kategorie
 */
export const fetchEntries = async (categoryId: number): Promise<EntryRead[]> => {
  const response = await apiClient.get<EntryRead[]>(`/categories/${categoryId}/entries`)
  return response.data
}

/**
 * Erstellt einen neuen Entry
 * @param categoryId - Category ID
 * @param data - Entry-Daten
 * @returns Der erstellte Entry
 */
export const createEntry = async (categoryId: number, data: EntryCreate): Promise<EntryRead> => {
  const response = await apiClient.post<EntryRead>(`/categories/${categoryId}/entries`, data)
  return response.data
}

/**
 * Aktualisiert einen Entry
 * @param categoryId - Category ID
 * @param entryId - Entry ID
 * @param data - Zu aktualisierende Felder
 * @returns Der aktualisierte Entry
 */
export const updateEntry = async (
  categoryId: number,
  entryId: number,
  data: EntryUpdate
): Promise<EntryRead> => {
  const response = await apiClient.put<EntryRead>(
    `/categories/${categoryId}/entries/${entryId}`,
    data
  )
  return response.data
}

/**
 * Löscht einen Entry
 * @param categoryId - Category ID
 * @param entryId - Entry ID
 * @returns Success-Status
 */
export const deleteEntry = async (
  categoryId: number,
  entryId: number
): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/categories/${categoryId}/entries/${entryId}`
  )
  return response.data
}

/**
 * Sucht Entries mit erweiterten Filtern (über alle Kategorien)
 * @param params - Such-Parameter
 * @returns Array der gefundenen Entries
 */
export const searchEntries = async (params: EntrySearchParams): Promise<EntryRead[]> => {
  const response = await apiClient.get<EntryRead[]>('/entries', { params })
  return response.data
}

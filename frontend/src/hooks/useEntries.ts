import { useState, useEffect, useCallback } from 'react'
import { Entry } from '../types/category'
import { fetchEntries as apiFetchEntries, createEntry as apiCreateEntry, updateEntry as apiUpdateEntry, deleteEntry as apiDeleteEntry } from '../api'

interface UseEntriesReturn {
  entries: Entry[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createEntry: (entry: Omit<Entry, 'id' | 'auto_generated'>) => Promise<Entry>
  updateEntry: (entryId: number, data: Partial<Entry>) => Promise<Entry>
  deleteEntry: (entryId: number) => Promise<void>
}

/**
 * Custom Hook für Entry-Management
 * Zentralisiert alle Entry-bezogenen API-Calls und State-Management
 * 
 * @param categoryId - Die ID der Kategorie
 * @returns Entries, Loading-State, Error-State und CRUD-Funktionen
 */
export function useEntries(categoryId: number | null): UseEntriesReturn {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!categoryId) {
      setEntries([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await apiFetchEntries(categoryId)
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch entries'))
      console.error('Error fetching entries:', err)
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const createEntry = useCallback(async (entryData: Omit<Entry, 'id' | 'auto_generated'>) => {
    if (!categoryId) {
      throw new Error('Category ID is required')
    }

    try {
      const newEntry = await apiCreateEntry(categoryId, entryData)
      setEntries(prev => [...prev, newEntry])
      return newEntry
    } catch (err) {
      console.error('Error creating entry:', err)
      throw err
    }
  }, [categoryId])

  const updateEntry = useCallback(async (entryId: number, data: Partial<Entry>) => {
    if (!categoryId) {
      throw new Error('Category ID is required')
    }

    try {
      const updatedEntry = await apiUpdateEntry(categoryId, entryId, data)
      setEntries(prev => prev.map(e => e.id === entryId ? updatedEntry : e))
      return updatedEntry
    } catch (err) {
      console.error('Error updating entry:', err)
      throw err
    }
  }, [categoryId])

  const deleteEntry = useCallback(async (entryId: number) => {
    if (!categoryId) {
      throw new Error('Category ID is required')
    }

    try {
      await apiDeleteEntry(categoryId, entryId)
      setEntries(prev => prev.filter(e => e.id !== entryId))
    } catch (err) {
      console.error('Error deleting entry:', err)
      throw err
    }
  }, [categoryId])

  return {
    entries,
    loading,
    error,
    refetch: fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  }
}

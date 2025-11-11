import { useState, useCallback } from 'react'

interface UseEditFormReturn<T> {
  formData: T
  isDirty: boolean
  updateField: <K extends keyof T>(field: K, value: T[K]) => void
  setFormData: (data: T) => void
  reset: (data?: T) => void
}

/**
 * Custom Hook für Formular-Verwaltung
 * Vereinfacht State-Management für Edit-Formulare
 * 
 * @param initialData - Initiale Formulardaten
 * @returns Form-State und Update-Funktionen
 * 
 * @example
 * const { formData, updateField, isDirty, reset } = useEditForm<CategoryFormData>({
 *   name: '',
 *   type: 'normal',
 *   unit: '',
 *   auto_create: false
 * })
 * 
 * // Feld aktualisieren
 * updateField('name', 'Neue Kategorie')
 * 
 * // Zurücksetzen
 * reset({ name: 'Alte Daten', ... })
 */
export function useEditForm<T extends Record<string, any>>(initialData: T): UseEditFormReturn<T> {
  const [formData, setFormData] = useState<T>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [originalData] = useState<T>(initialData)

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Check if form is dirty (different from original)
      const hasChanges = JSON.stringify(updated) !== JSON.stringify(originalData)
      setIsDirty(hasChanges)
      
      return updated
    })
  }, [originalData])

  const reset = useCallback((data?: T) => {
    setFormData(data ?? originalData)
    setIsDirty(false)
  }, [originalData])

  return {
    formData,
    isDirty,
    updateField,
    setFormData,
    reset,
  }
}

import apiClient from './client'
import { CategoryRead, CategoryCreate, CategoryUpdate } from './types'

/**
 * Category API Functions
 * Alle Category-bezogenen API-Aufrufe mit vollständiger Type Safety
 */

/**
 * Lädt alle Kategorien
 * @returns Array aller Kategorien
 */
export const fetchCategories = async (): Promise<CategoryRead[]> => {
  const response = await apiClient.get<CategoryRead[]>('/categories')
  return response.data
}

/**
 * Lädt eine einzelne Kategorie
 * @param id - Category ID
 * @returns Die Kategorie
 */
export const fetchCategory = async (id: number): Promise<CategoryRead> => {
  const response = await apiClient.get<CategoryRead>(`/categories/${id}`)
  return response.data
}

/**
 * Erstellt eine neue Kategorie
 * @param data - Category-Daten
 * @returns Die erstellte Kategorie
 */
export const createCategory = async (data: CategoryCreate): Promise<CategoryRead> => {
  const response = await apiClient.post<CategoryRead>('/categories', data)
  return response.data
}

/**
 * Aktualisiert eine Kategorie
 * @param id - Category ID
 * @param data - Zu aktualisierende Felder
 * @returns Die aktualisierte Kategorie
 */
export const updateCategory = async (id: number, data: CategoryUpdate): Promise<CategoryRead> => {
  const response = await apiClient.put<CategoryRead>(`/categories/${id}`, data)
  return response.data
}

/**
 * Löscht eine Kategorie
 * @param id - Category ID
 * @returns Success-Status
 */
export const deleteCategory = async (id: number): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(`/categories/${id}`)
  return response.data
}

/**
 * Dupliziert eine Kategorie mit allen Einträgen
 * @param id - Category ID
 * @returns Die duplizierte Kategorie
 */
export const duplicateCategory = async (id: number): Promise<CategoryRead> => {
  const response = await apiClient.post<CategoryRead>(`/categories/${id}/duplicate`)
  return response.data
}

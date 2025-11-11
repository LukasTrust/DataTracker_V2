/**
 * Central API Export
 * 
 * Alle API-Funktionen werden hier re-exportiert für einfache Imports:
 * import { fetchCategories, createEntry } from '@/api'
 */

// Category APIs
export {
  fetchCategories,
  fetchCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  duplicateCategory,
} from './categories'

// Entry APIs
export {
  fetchEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  searchEntries,
} from './entries'

// Dashboard & Stats APIs
export {
  fetchDashboardStats,
  fetchDashboardTimeseries,
  getStatsOverview,
  getMonthlyStats,
  triggerAutoCreate,
} from './dashboard'

// Export APIs
export {
  exportData,
  exportCategory,
  downloadBlob,
} from './export'

// API Client & Types
export { default as apiClient } from './client'
export * from './types'

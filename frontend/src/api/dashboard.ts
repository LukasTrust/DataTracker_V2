import apiClient from './client'
import {
  DashboardStatsResponse,
  DashboardTimeseriesResponse,
  DashboardFiltersParams,
  StatsOverviewParams,
  MonthlyStatsParams,
} from './types'

/**
 * Dashboard & Statistics API Functions
 * Alle Dashboard- und Statistik-bezogenen API-Aufrufe
 */

/**
 * Lädt Dashboard-Statistiken (KPIs, Category Sums)
 * @returns Dashboard-Statistiken
 */
export const fetchDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await apiClient.get<DashboardStatsResponse>('/dashboard/stats')
  return response.data
}

/**
 * Lädt Timeseries-Daten für Dashboard-Charts
 * @param params - Filter-Parameter (optional)
 * @returns Timeseries-Daten
 */
export const fetchDashboardTimeseries = async (
  params?: DashboardFiltersParams
): Promise<DashboardTimeseriesResponse> => {
  const response = await apiClient.get<DashboardTimeseriesResponse>('/dashboard/timeseries', {
    params,
  })
  return response.data
}

/**
 * Lädt Statistik-Übersicht für ausgewählte Kategorien
 * @param params - Filter-Parameter
 * @returns Statistik-Übersicht mit Summe, Durchschnitt, Min, Max
 */
export const getStatsOverview = async (params: StatsOverviewParams): Promise<any> => {
  const response = await apiClient.get('/stats/overview', { params })
  return response.data
}

/**
 * Lädt monatliche Statistiken für eine Kategorie
 * @param params - Parameter mit category_id und optional from_year/to_year
 * @returns Monatliche Aggregierung nach Jahren
 */
export const getMonthlyStats = async (params: MonthlyStatsParams): Promise<any> => {
  const response = await apiClient.get('/stats/monthly', { params })
  return response.data
}

/**
 * Triggert manuell die Auto-Create-Funktion für den aktuellen Monat
 * @returns Anzahl der erstellten Entries
 */
export const triggerAutoCreate = async (): Promise<{ created: number }> => {
  const response = await apiClient.post<{ created: number }>('/auto-create-current-month')
  return response.data
}

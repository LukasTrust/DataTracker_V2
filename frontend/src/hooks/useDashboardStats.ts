import { useState, useEffect, useCallback } from 'react'
import { fetchDashboardStats, fetchDashboardTimeseries } from '../api'

export interface DashboardFilters {
  categoryType?: string
  startDate?: string
  endDate?: string
}

interface DashboardStats {
  totalCategories: number
  categorySums: Array<{
    id: number
    name: string
    type: string
    unit: string
    totalValue: number
    entryCount: number
    totalDeposits: number
    profit?: number
  }>
}

interface TimeseriesData {
  totalValueData: Array<{ date: string; value: number }>
  sparenData: Array<{ date: string; value: number; deposits?: number; profit?: number }>
  categoryComparison: Array<{ name: string; value: number; type: string }>
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null
  timeseriesData: TimeseriesData | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Custom Hook für Dashboard-Statistiken
 * Lädt und verwaltet Dashboard-Stats und Timeseries-Daten
 * 
 * @param filters - Optional: Filter für die Statistiken
 * @returns Stats, Timeseries, Loading-State und Refetch-Funktion
 */
export function useDashboardStats(filters?: DashboardFilters): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch main stats
      const statsData = await fetchDashboardStats()

      // Apply category type filter
      let filteredSums = statsData.categorySums
      if (filters?.categoryType && filters.categoryType !== 'all') {
        filteredSums = filteredSums.filter((cat: any) => cat.type === filters.categoryType)
      }

      setStats({
        totalCategories: statsData.totalCategories,
        categorySums: filteredSums,
      })

      // Fetch timeseries data
      const timeseriesParams = {
        start_date: filters?.startDate,
        end_date: filters?.endDate,
        category_type: filters?.categoryType,
      }
      const timeseries = await fetchDashboardTimeseries(timeseriesParams)
      setTimeseriesData(timeseries)

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load dashboard data'))
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [filters?.categoryType, filters?.startDate, filters?.endDate])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    stats,
    timeseriesData,
    loading,
    error,
    refetch: loadDashboardData,
  }
}

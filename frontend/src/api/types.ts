/**
 * TypeScript Types für API Requests und Responses
 * Diese Types matchen die Backend-Schemas (Pydantic models)
 */

// ============================================================================
// Category Types
// ============================================================================

export interface CategoryBase {
  name: string
  type: 'normal' | 'sparen'
  unit: string
  auto_create: boolean
}

export interface CategoryCreate extends CategoryBase {}

export interface CategoryUpdate extends Partial<CategoryBase> {}

export interface CategoryRead extends CategoryBase {
  id: number
}

// ============================================================================
// Entry Types
// ============================================================================

export interface EntryBase {
  category_id: number
  date: string // YYYY-MM-DD
  value: number
  deposit?: number
  comment?: string
}

export interface EntryCreate extends EntryBase {
  auto_generated?: boolean
}

export interface EntryUpdate {
  date?: string
  value?: number
  deposit?: number
  comment?: string
}

export interface EntryRead extends EntryBase {
  id: number
  auto_generated: boolean
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface CategorySum {
  id: number
  name: string
  type: string
  unit: string
  totalValue: number
  entryCount: number
  totalDeposits: number
  profit?: number
}

export interface DashboardStatsResponse {
  totalCategories: number
  categorySums: CategorySum[]
}

export interface TimeseriesDataPoint {
  date: string
  value: number
  deposits?: number
  profit?: number
}

export interface CategoryComparisonData {
  name: string
  value: number
  type: string
}

export interface DashboardTimeseriesResponse {
  totalValueData: TimeseriesDataPoint[]
  sparenData: TimeseriesDataPoint[]
  categoryComparison: CategoryComparisonData[]
}

export interface DashboardFiltersParams {
  start_date?: string
  end_date?: string
  category_type?: string
}

// ============================================================================
// Search Types
// ============================================================================

export interface EntrySearchParams {
  category_ids?: string // Comma-separated IDs
  from_date?: string // YYYY-MM
  to_date?: string // YYYY-MM
  comment?: string
  type?: 'normal' | 'sparen'
}

export interface StatsOverviewParams {
  category_ids?: string
  from_date?: string
  to_date?: string
}

export interface MonthlyStatsParams {
  category_id: number
  from_year?: number
  to_year?: number
}

// ============================================================================
// Error Response Type
// ============================================================================

export interface ApiErrorResponse {
  detail?: string
  message?: string
  status?: number
}

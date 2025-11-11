export interface Category {
  id: number
  name: string
  icon?: string
  type: 'normal' | 'sparen'
  unit: string
  auto_create: boolean
}

export interface Entry {
  id: number
  category_id: number
  date: string
  value: number
  deposit?: number
  comment?: string
  auto_generated: boolean
}

export type TabType = 'data' | 'graphs' | 'settings'

export interface CategoryFormData {
  name: string
  type: 'normal' | 'sparen'
  unit: string
  auto_create: boolean
}

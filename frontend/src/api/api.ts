import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Categories
export const fetchCategories = async () => {
  const response = await api.get('/categories')
  return response.data
}

export const fetchCategory = async (id: number) => {
  const response = await api.get(`/categories/${id}`)
  return response.data
}

export const createCategory = async (data: any) => {
  const response = await api.post('/categories', data)
  return response.data
}

export const updateCategory = async (id: number, data: any) => {
  const response = await api.put(`/categories/${id}`, data)
  return response.data
}

export const deleteCategory = async (id: number) => {
  const response = await api.delete(`/categories/${id}`)
  return response.data
}

export const duplicateCategory = async (id: number) => {
  const response = await api.post(`/categories/${id}/duplicate`)
  return response.data
}

// Entries
export const fetchEntries = async (categoryId: number) => {
  const response = await api.get(`/categories/${categoryId}/entries`)
  return response.data
}

export const createEntry = async (categoryId: number, data: any) => {
  const response = await api.post(`/categories/${categoryId}/entries`, data)
  return response.data
}

export const updateEntry = async (categoryId: number, entryId: number, data: any) => {
  const response = await api.put(`/categories/${categoryId}/entries/${entryId}`, data)
  return response.data
}

export const deleteEntry = async (categoryId: number, entryId: number) => {
  const response = await api.delete(`/categories/${categoryId}/entries/${entryId}`)
  return response.data
}

// Dashboard Stats
export const fetchDashboardStats = async () => {
  const response = await api.get('/dashboard/stats')
  return response.data
}

export const fetchDashboardTimeseries = async (params?: {
  start_date?: string
  end_date?: string
  category_type?: string
}) => {
  const response = await api.get('/dashboard/timeseries', { params })
  return response.data
}

// Export
export const exportData = async () => {
  const response = await api.get('/export', {
    responseType: 'blob',
  })
  return response.data
}

// Export single category
export const exportCategory = async (categoryId: number) => {
  const response = await api.get(`/export/category/${categoryId}`, {
    responseType: 'blob',
  })
  return response.data
}

export default api

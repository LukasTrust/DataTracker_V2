import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { fetchCategories } from '../api'
import { Category } from '../types/category'

interface CategoryContextType {
  categories: Category[]
  loading: boolean
  refreshCategories: () => Promise<void>
  addCategory: (category: Category) => void
  updateCategoryInList: (category: Category) => void
  removeCategoryFromList: (categoryId: number) => void
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await fetchCategories()
      setCategories(data)
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const refreshCategories = async () => {
    await loadCategories()
  }

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category])
  }

  const updateCategoryInList = (category: Category) => {
    setCategories(prev => prev.map(cat => cat.id === category.id ? category : cat))
  }

  const removeCategoryFromList = (categoryId: number) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
  }

  return (
    <CategoryContext.Provider value={{
      categories,
      loading,
      refreshCategories,
      addCategory,
      updateCategoryInList,
      removeCategoryFromList
    }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return context
}

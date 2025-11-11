import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import CategoryList from '../components/categories/CategoryList'
import CategoryTabs from '../components/categories/CategoryTabs'
import CategoryTable from '../components/categories/CategoryTable'
import CategoryGraphs from '../components/categories/CategoryGraphs'
import CategoryEditForm from '../components/categories/CategoryEditForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { fetchCategories, deleteCategory, fetchEntries, updateCategory, duplicateCategory } from '../api/api'
import { Category, Entry, TabType, CategoryFormData } from '../types/category'
import { useNotification } from '../contexts/NotificationContext'

function Categories() {
  const navigate = useNavigate()
  const { id: categoryIdParam } = useParams<{ id: string }>()
  const { showSuccess, showError } = useNotification()
  
  // State Management
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('data')
  const [loading, setLoading] = useState(true)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; categoryId: number | null }>({ 
    isOpen: false, 
    categoryId: null 
  })
  const [editForm, setEditForm] = useState<CategoryFormData>({
    name: '',
    type: 'normal',
    unit: '',
    auto_create: false
  })

  // Effects
  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (categoryIdParam && categories.length > 0) {
      const category = categories.find(c => c.id === parseInt(categoryIdParam))
      if (category) {
        selectCategory(category)
      }
    }
  }, [categoryIdParam, categories])

  // Data Loading Functions
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

  const selectCategory = async (category: Category) => {
    setSelectedCategory(category)
    setEditForm({
      name: category.name,
      type: category.type,
      unit: category.unit || '',
      auto_create: category.auto_create
    })
    
    // Einträge laden
    try {
      setLoadingEntries(true)
      const entriesData = await fetchEntries(category.id)
      setEntries(entriesData)
    } catch (error) {
      console.error('Fehler beim Laden der Einträge:', error)
    } finally {
      setLoadingEntries(false)
    }
  }

  const handleDoubleClickCategory = async (category: Category) => {
    await selectCategory(category)
    setActiveTab('settings')
  }

  // Event Handlers
  const handleDeleteCategory = (id: number) => {
    setDeleteConfirm({ isOpen: true, categoryId: id })
  }

  const confirmDeleteCategory = async () => {
    const categoryId = deleteConfirm.categoryId
    if (!categoryId) return

    try {
      await deleteCategory(categoryId)
      setCategories(categories.filter(cat => cat.id !== categoryId))
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null)
        setEntries([])
      }
      showSuccess('Die Kategorie wurde erfolgreich gelöscht.')
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      showError('Fehler beim Löschen der Kategorie.')
    } finally {
      setDeleteConfirm({ isOpen: false, categoryId: null })
    }
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return

    try {
      const updated = await updateCategory(selectedCategory.id, editForm)
      setCategories(categories.map(cat => cat.id === updated.id ? updated : cat))
      setSelectedCategory(updated)
      showSuccess('Die Änderungen wurden erfolgreich gespeichert.')
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error)
      showError('Fehler beim Aktualisieren der Kategorie.')
    }
  }

  const handleDeleteCategoryFromSettings = async () => {
    if (!selectedCategory) return
    setDeleteConfirm({ isOpen: true, categoryId: selectedCategory.id })
  }

  const confirmDeleteFromSettings = async () => {
    if (!selectedCategory) return
    
    try {
      await deleteCategory(selectedCategory.id)
      setCategories(categories.filter(cat => cat.id !== selectedCategory.id))
      showSuccess('Die Kategorie wurde erfolgreich gelöscht.')
      handleBackToList()
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      showError('Fehler beim Löschen der Kategorie.')
    } finally {
      setDeleteConfirm({ isOpen: false, categoryId: null })
    }
  }

  const handleDuplicateCategory = async () => {
    if (!selectedCategory) return
    
    try {
      const duplicated = await duplicateCategory(selectedCategory.id)
      setCategories([...categories, duplicated])
      await selectCategory(duplicated)
      showSuccess('Die Kategorie wurde erfolgreich dupliziert.')
    } catch (error) {
      console.error('Fehler beim Duplizieren:', error)
      showError('Fehler beim Duplizieren der Kategorie.')
    }
  }

  const handleBackToList = () => {
    setSelectedCategory(null)
    setEntries([])
    setActiveTab('data')
  }

  const handleCreateNew = () => {
    navigate('/categories/new')
  }

  // Render: Listenansicht (keine Kategorie ausgewählt)
  if (!selectedCategory) {
    return (
      <>
        <PageHeader 
          title="Kategorien"
          description="Verwalte deine Datenkategorien"
          actions={
            <Button 
              variant="primary" 
              icon={<Plus className="w-4 h-4" />}
              onClick={handleCreateNew}
            >
              Neue Kategorie
            </Button>
          }
        />

        <div className="p-8">
          <CategoryList
            categories={categories}
            loading={loading}
            onSelectCategory={selectCategory}
            onDoubleClickCategory={handleDoubleClickCategory}
            onDeleteCategory={handleDeleteCategory}
            onCreateNew={handleCreateNew}
          />
        </div>
      </>
    )
  }

  // Render: Detailansicht mit Tabs
  return (
    <>
      <PageHeader 
        title={selectedCategory.name}
        description={`${selectedCategory.type === 'sparen' ? 'Sparkategorie' : 'Normale Kategorie'}${selectedCategory.unit ? ` • Einheit: ${selectedCategory.unit}` : ''}`}
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToList}
            >
              Zurück zur Übersicht
            </Button>
            <Button 
              variant="primary" 
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {/* TODO: Neuen Eintrag erstellen */}}
            >
              Neuer Eintrag
            </Button>
          </div>
        }
      />

      <CategoryTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-8">
        {activeTab === 'data' && (
          <CategoryTable 
            entries={entries} 
            loading={loadingEntries}
            category={selectedCategory}
            onEntriesChange={() => selectCategory(selectedCategory)}
          />
        )}
        
        {activeTab === 'graphs' && (
          <CategoryGraphs 
            entries={entries}
            category={selectedCategory}
          />
        )}
        
        {activeTab === 'settings' && (
          <CategoryEditForm
            formData={editForm}
            onFormChange={setEditForm}
            onSave={handleUpdateCategory}
            onDelete={handleDeleteCategoryFromSettings}
            onDuplicate={handleDuplicateCategory}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Kategorie löschen"
        message="Möchtest du diese Kategorie wirklich löschen? Alle zugehörigen Einträge werden ebenfalls gelöscht."
        confirmText="Löschen"
        cancelText="Abbrechen"
        onConfirm={selectedCategory ? confirmDeleteFromSettings : confirmDeleteCategory}
        onCancel={() => setDeleteConfirm({ isOpen: false, categoryId: null })}
        variant="danger"
      />
    </>
  )
}

export default Categories

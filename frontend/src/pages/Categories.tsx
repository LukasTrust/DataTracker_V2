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
import { deleteCategory, updateCategory, duplicateCategory } from '../api'
import { Category, TabType, CategoryFormData } from '../types/category'
import { useNotification } from '../contexts/NotificationContext'
import { useCategories } from '../contexts/CategoryContext'
import { useEntries } from '../hooks/useEntries'

function Categories() {
  const navigate = useNavigate()
  const { id: categoryIdParam } = useParams<{ id: string }>()
  const { showSuccess, showErrorWithContext } = useNotification()
  const { categories, loading, updateCategoryInList, removeCategoryFromList, addCategory, refreshCategories } = useCategories()
  
  // State Management
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('data')
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

  // Custom Hook für Entries
  const { entries, loading: loadingEntries } = useEntries(selectedCategory?.id ?? null)

  // Effects
  useEffect(() => {
    if (categoryIdParam && categories.length > 0) {
      const category = categories.find(c => c.id === parseInt(categoryIdParam))
      if (category) {
        selectCategory(category)
      }
    }
  }, [categoryIdParam, categories])

  // Data Loading Functions
  const selectCategory = async (category: Category) => {
    setSelectedCategory(category)
    setEditForm({
      name: category.name,
      type: category.type,
      unit: category.unit,
      auto_create: category.auto_create
    })
    // Entries werden automatisch durch useEntries Hook geladen
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
      removeCategoryFromList(categoryId)
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null)
        // Entries werden automatisch geleert wenn selectedCategory null wird
      }
      showSuccess('Die Kategorie wurde erfolgreich gelöscht.')
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      showErrorWithContext(error, {
        action: 'delete',
        entityType: 'category',
      })
    } finally {
      setDeleteConfirm({ isOpen: false, categoryId: null })
    }
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return

    try {
      const updated = await updateCategory(selectedCategory.id, editForm)
      updateCategoryInList(updated)
      setSelectedCategory(updated)
      showSuccess('Die Änderungen wurden erfolgreich gespeichert.')
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error)
      showErrorWithContext(error, {
        action: 'update',
        entityType: 'category',
        entityName: selectedCategory.name,
      })
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
      removeCategoryFromList(selectedCategory.id)
      showSuccess('Die Kategorie wurde erfolgreich gelöscht.')
      handleBackToList()
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      showErrorWithContext(error, {
        action: 'delete',
        entityType: 'category',
        entityName: selectedCategory.name,
      })
    } finally {
      setDeleteConfirm({ isOpen: false, categoryId: null })
    }
  }

  const handleDuplicateCategory = async () => {
    if (!selectedCategory) return
    
    try {
      const duplicated = await duplicateCategory(selectedCategory.id)
      addCategory(duplicated)
      await selectCategory(duplicated)
      showSuccess('Die Kategorie wurde erfolgreich dupliziert.')
    } catch (error) {
      console.error('Fehler beim Duplizieren:', error)
      showErrorWithContext(error, {
        action: 'duplicate',
        entityType: 'category',
        entityName: selectedCategory.name,
      })
    }
  }

  const handleBackToList = () => {
    setSelectedCategory(null)
    // Entries werden automatisch geleert wenn selectedCategory null wird
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
            onLocalUpdate={async () => {
              // Nur Kategorien-Stats aktualisieren für Sidebar, ohne komplettes Reload
              // Dies passiert asynchron im Hintergrund ohne Scroll-Sprung
              await refreshCategories()
            }}
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

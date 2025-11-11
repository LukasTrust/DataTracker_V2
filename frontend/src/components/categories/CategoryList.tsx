import { Plus, FolderOpen, Eye, Trash2 } from 'lucide-react'
import Card from '../Card'
import Button from '../Button'
import { Category } from '../../types/category'

interface CategoryListProps {
  categories: Category[]
  loading: boolean
  onSelectCategory: (category: Category) => void
  onDoubleClickCategory?: (category: Category) => void
  onDeleteCategory: (id: number) => void
  onCreateNew: () => void
}

function CategoryList({
  categories,
  loading,
  onSelectCategory,
  onDoubleClickCategory,
  onDeleteCategory,
  onCreateNew
}: CategoryListProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl h-20 border border-neutral-200"></div>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FolderOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Noch keine Kategorien
        </h3>
        <p className="text-sm text-neutral-600 mb-6">
          Erstelle deine erste Kategorie, um mit der Datenverwaltung zu beginnen.
        </p>
        <Button 
          variant="primary" 
          icon={<Plus className="w-4 h-4" />}
          onClick={onCreateNew}
        >
          Erste Kategorie erstellen
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <Card 
          key={category.id} 
          className="p-4 cursor-pointer" 
          hover
          onClick={() => onSelectCategory(category)}
          onDoubleClick={() => onDoubleClickCategory?.(category)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">{category.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                    {category.type === 'sparen' ? 'Sparen' : 'Normal'}
                  </span>
                  {category.unit && (
                    <span className="text-xs text-neutral-500">
                      Einheit: {category.unit}
                    </span>
                  )}
                  {category.auto_create && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Auto-Erstellen
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="secondary" 
                size="sm"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => onSelectCategory(category)}
                className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 border-primary-300"
              >
                Öffnen
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => onDeleteCategory(category.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                Löschen
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default CategoryList

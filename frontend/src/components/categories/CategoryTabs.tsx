import { Table2, BarChart3, Settings } from 'lucide-react'
import { TabType } from '../../types/category'

interface CategoryTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

interface Tab {
  id: TabType
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const tabs: Tab[] = [
  { id: 'data', label: 'Daten', icon: Table2 },
  { id: 'graphs', label: 'Graphen', icon: BarChart3 },
  { id: 'settings', label: 'Bearbeitung', icon: Settings }
]

function CategoryTabs({ activeTab, onTabChange }: CategoryTabsProps) {
  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="px-8">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${isActive 
                    ? 'border-primary-600 text-primary-700' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CategoryTabs

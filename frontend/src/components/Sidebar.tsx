import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  HelpCircle,
  BarChart3,
  PiggyBank,
  TrendingUp,
  Plus
} from 'lucide-react'
import clsx from 'clsx'
import { useCategories } from '../contexts/CategoryContext'

interface NavItem {
  to: string
  icon: React.ElementType
  label: string
}

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
]

function Sidebar() {
  const { categories, loading } = useCategories()

  const getCategoryIcon = (type: string) => {
    if (type === 'sparen') {
      return PiggyBank
    }
    return TrendingUp
  }

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-soft">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-neutral-900">DataTracker</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-default',
                    'text-sm font-medium',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className={clsx(
                        'w-5 h-5 transition-default',
                        isActive ? 'text-primary-600' : 'text-neutral-400'
                      )} 
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Neue Kategorie Button */}
        <ul className="space-y-1 mt-1">
          <li>
            <NavLink
              to="/categories/new"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-default',
                  'text-sm font-medium',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Plus 
                    className={clsx(
                      'w-5 h-5 transition-default',
                      isActive ? 'text-primary-600' : 'text-neutral-400'
                    )} 
                  />
                  <span>Neue Kategorie</span>
                </>
              )}
            </NavLink>
          </li>
        </ul>

        {/* Categories Section */}
        <div className="mt-6">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Kategorien
            </h3>
          </div>
          {loading ? (
            <div className="px-3 py-2 text-sm text-neutral-500">Lädt...</div>
          ) : categories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-neutral-500">Keine Kategorien</div>
          ) : (
            <ul className="space-y-1">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.type)
                return (
                  <li key={category.id}>
                    <NavLink
                      to={`/categories/${category.id}`}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-default',
                          'text-sm font-medium',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon 
                            className={clsx(
                              'w-4 h-4 transition-default flex-shrink-0',
                              isActive ? 'text-primary-600' : 'text-neutral-400'
                            )} 
                          />
                          <span className="truncate">{category.name}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200">
        {/* Hilfe & Support Link */}
        <div className="px-3 py-3">
          <NavLink
            to="/help"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-default',
                'text-sm font-medium',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <HelpCircle 
                  className={clsx(
                    'w-5 h-5 transition-default',
                    isActive ? 'text-primary-600' : 'text-neutral-400'
                  )} 
                />
                <span>Hilfe & Support</span>
              </>
            )}
          </NavLink>
        </div>
        
        {/* App Version */}
        <div className="px-6 py-3 text-xs text-neutral-500">
          <p className="font-medium text-neutral-700">DataTracker V2</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

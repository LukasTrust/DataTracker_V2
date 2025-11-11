import { useState, useEffect } from 'react'
import { FolderOpen, TrendingUp, Plus, List } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import { fetchDashboardStats } from '../api/api'

interface CategorySum {
  id: number
  name: string
  type: string
  unit?: string
  totalValue: number
  totalDeposits: number
  entryCount: number
}

interface DashboardStats {
  totalCategories: number
  categorySums: CategorySum[]
}

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalCategories: 0,
    categorySums: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Daten:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (value: number, unit?: string) => {
    if (unit) {
      return `${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })} ${unit}`
    }
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2 })
  }

  if (loading) {
    return (
      <>
        <PageHeader 
          title="Deine persönliche Übersicht"
          description="Behalte deine Daten im Blick"
        />
        <div className="p-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl h-32 border border-neutral-200"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader 
        title="Deine persönliche Übersicht"
        description="Behalte deine Daten im Blick"
        actions={
          <>
            <Button variant="secondary" onClick={loadDashboardData}>
              Aktualisieren
            </Button>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/categories/new')}>
              Neue Kategorie
            </Button>
          </>
        }
      />

      <div className="p-8">
        {/* Overview Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">
                Kategorien-Übersicht
              </h2>
              <p className="text-sm text-neutral-600">
                {stats.totalCategories} {stats.totalCategories === 1 ? 'Kategorie' : 'Kategorien'} mit insgesamt{' '}
                {stats.categorySums.reduce((sum, cat) => sum + cat.entryCount, 0)} Einträgen
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </Card>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.categorySums.map((category) => (
            <Card key={category.id} className="p-6" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-neutral-900">{category.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      category.type === 'sparen' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {category.type === 'sparen' ? 'Sparen' : 'Normal'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">{category.entryCount} Einträge</p>
                </div>
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-neutral-600 mb-1">Gesamtwert</p>
                  <p className="text-2xl font-semibold text-neutral-900">
                    {formatValue(category.totalValue, category.unit)}
                  </p>
                </div>

                {category.type === 'sparen' && category.totalDeposits > 0 && (
                  <div className="pt-3 border-t border-neutral-200">
                    <p className="text-xs font-medium text-neutral-600 mb-1">Einzahlungen</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatValue(category.totalDeposits, category.unit)}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-200">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  icon={<List className="w-4 h-4" />}
                  onClick={() => navigate(`/categories/${category.id}`)}
                >
                  Details anzeigen
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        {stats.categorySums.length === 0 && (
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
              onClick={() => navigate('/categories/new')}
            >
              Erste Kategorie erstellen
            </Button>
          </Card>
        )}
      </div>
    </>
  )
}

export default Dashboard

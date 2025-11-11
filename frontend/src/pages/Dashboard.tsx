import { useState, useEffect } from 'react'
import { 
  FolderOpen, 
  TrendingUp, 
  Plus, 
  Wallet,
  DollarSign,
  Activity 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import KPICard from '../components/KPICard'
import CategoryCard, { CategoryCardData } from '../components/CategoryCard'
import DashboardFilterBar, { DashboardFilters } from '../components/DashboardFilterBar'
import DashboardCharts from '../components/DashboardCharts'
import { fetchDashboardStats, fetchDashboardTimeseries, exportData } from '../api/api'
import { useNotification } from '../contexts/NotificationContext'

interface DashboardStats {
  totalCategories: number
  categorySums: CategoryCardData[]
}

interface TimeseriesData {
  totalValueData: { date: string; value: number }[]
  sparenData: { date: string; value: number; deposits: number; profit: number }[]
  categoryComparison: { name: string; value: number; type: string }[]
}

function Dashboard() {
  const navigate = useNavigate()
  const { showError, showSuccess, showInfo } = useNotification()
  const [stats, setStats] = useState<DashboardStats>({
    totalCategories: 0,
    categorySums: [],
  })
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesData>({
    totalValueData: [],
    sparenData: [],
    categoryComparison: [],
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<DashboardFilters>({
    categoryType: 'all',
  })
  const [activeKPI, setActiveKPI] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [filters])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch main stats
      const statsData = await fetchDashboardStats()
      
      // Apply category type filter
      let filteredSums = statsData.categorySums
      if (filters.categoryType && filters.categoryType !== 'all') {
        filteredSums = filteredSums.filter((cat: CategoryCardData) => 
          cat.type === filters.categoryType
        )
      }
      
      setStats({
        totalCategories: statsData.totalCategories,
        categorySums: filteredSums,
      })
      
      // Fetch timeseries data
      const timeseriesParams = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        category_type: filters.categoryType,
      }
      const timeseries = await fetchDashboardTimeseries(timeseriesParams)
      setTimeseriesData(timeseries)
      
    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Daten:', error)
      showError('Fehler beim Laden der Dashboard-Daten')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      showInfo('Export wird vorbereitet...')
      const blob = await exportData()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'datatracker_export.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showSuccess('Daten erfolgreich exportiert')
    } catch (error) {
      console.error('Export-Fehler:', error)
      showError('Fehler beim Exportieren')
    }
  }

  const handleFilterReset = () => {
    setFilters({ categoryType: 'all' })
    setActiveKPI(null)
  }

  const handleKPIClick = (kpiType: string) => {
    if (activeKPI === kpiType) {
      setActiveKPI(null)
      setFilters({ ...filters, categoryType: 'all' })
    } else {
      setActiveKPI(kpiType)
      if (kpiType === 'sparen') {
        setFilters({ ...filters, categoryType: 'sparen' })
      } else if (kpiType === 'normal') {
        setFilters({ ...filters, categoryType: 'normal' })
      } else {
        setFilters({ ...filters, categoryType: 'all' })
      }
    }
  }

  // Calculate KPIs
  const totalEntries = stats.categorySums.reduce((sum, cat) => sum + cat.entryCount, 0)
  // Only include categories with € unit in total value
  const totalValue = stats.categorySums
    .filter(cat => cat.unit === '€')
    .reduce((sum, cat) => sum + cat.totalValue, 0)
  const sparenCategories = stats.categorySums.filter(cat => cat.type === 'sparen')
  const totalProfit = sparenCategories.reduce((sum, cat) => sum + (cat.profit || 0), 0)
  const totalDeposits = sparenCategories.reduce((sum, cat) => sum + cat.totalDeposits, 0)

  if (loading) {
    return (
      <>
        <PageHeader 
          title="Dashboard"
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
        title="Dashboard"
        description="Deine persönliche Finanz- und Datenübersicht"
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
        {/* Filter Bar */}
        <DashboardFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          onExport={handleExport}
          onReset={handleFilterReset}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Kategorien"
            value={stats.totalCategories}
            icon={FolderOpen}
            description={`${totalEntries} Einträge insgesamt`}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            onClick={() => handleKPIClick('all')}
            isActive={activeKPI === 'all'}
          />
          
          <KPICard
            title="Gesamtwert"
            value={`${totalValue.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`}
            icon={Activity}
            description="Alle Kategorien"
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />
          
          <KPICard
            title="Sparen-Kategorien"
            value={sparenCategories.length}
            icon={Wallet}
            description={`${totalDeposits.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € Einzahlungen`}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
            onClick={() => handleKPIClick('sparen')}
            isActive={activeKPI === 'sparen'}
          />
          
          <KPICard
            title="Gewinn/Verlust"
            value={`${totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`}
            icon={totalProfit >= 0 ? TrendingUp : DollarSign}
            description="Sparen-Kategorien"
            iconColor={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}
            iconBgColor={totalProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}
            trend={totalDeposits > 0 ? {
              value: (totalProfit / totalDeposits) * 100,
              isPositive: totalProfit >= 0,
              label: 'Rendite'
            } : undefined}
          />
        </div>

        {/* Charts */}
        {(timeseriesData.totalValueData.length > 0 || timeseriesData.categoryComparison.length > 0) && (
          <DashboardCharts
            totalValueData={timeseriesData.totalValueData}
            sparenData={timeseriesData.sparenData}
            categoryComparison={timeseriesData.categoryComparison}
          />
        )}

        {/* Category Cards */}
        {stats.categorySums.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                Deine Kategorien
              </h2>
              <p className="text-sm text-neutral-600">
                {stats.categorySums.length} {stats.categorySums.length === 1 ? 'Kategorie' : 'Kategorien'}
                {filters.categoryType !== 'all' && ` (gefiltert nach ${filters.categoryType === 'sparen' ? 'Sparen' : 'Normal'})`}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.categorySums.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => navigate(`/categories/${category.id}`)}
                />
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <FolderOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {filters.categoryType !== 'all' 
                ? `Keine ${filters.categoryType === 'sparen' ? 'Sparen' : 'Normal'}-Kategorien gefunden`
                : 'Noch keine Kategorien'
              }
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              {filters.categoryType !== 'all'
                ? 'Versuche einen anderen Filter oder erstelle eine neue Kategorie.'
                : 'Erstelle deine erste Kategorie, um mit der Datenverwaltung zu beginnen.'
              }
            </p>
            <Button 
              variant="primary" 
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/categories/new')}
            >
              Kategorie erstellen
            </Button>
          </Card>
        )}
      </div>
    </>
  )
}

export default Dashboard

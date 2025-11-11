import { TrendingUp, TrendingDown, Wallet, BarChart3, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from './Card'
import Button from './Button'
import MiniSparkline from './MiniSparkline'
import clsx from 'clsx'

export interface CategoryCardData {
  id: number
  name: string
  type: string
  unit?: string
  totalValue: number
  totalDeposits: number
  entryCount: number
  sparklineData?: { date: string; value: number }[]
  profit?: number
  profitPercentage?: number
}

interface CategoryCardProps {
  category: CategoryCardData
  onClick?: () => void
}

function CategoryCard({ category, onClick }: CategoryCardProps) {
  const navigate = useNavigate()
  const isSparenType = category.type === 'sparen'
  
  const formatValue = (value: number, unit?: string) => {
    if (unit) {
      return `${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })} ${unit}`
    }
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2 })
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/categories/${category.id}?tab=table`)
  }

  const handleViewCharts = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/categories/${category.id}?tab=graphs`)
  }

  return (
    <Card 
      className="p-6 transition-all duration-200 flex flex-col" 
      hover
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-neutral-900">{category.name}</h3>
            <span className={clsx(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              isSparenType 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            )}>
              {isSparenType ? '💰 Sparen' : '📊 Normal'}
            </span>
          </div>
          <p className="text-xs text-neutral-500">{category.entryCount} Einträge</p>
        </div>
        <div className={clsx(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          isSparenType ? 'bg-green-50' : 'bg-blue-50'
        )}>
          {isSparenType ? (
            <Wallet className={clsx('w-5 h-5', 'text-green-600')} />
          ) : (
            <TrendingUp className={clsx('w-5 h-5', 'text-blue-600')} />
          )}
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <p className="text-xs font-medium text-neutral-600 mb-1">Gesamtwert</p>
        <p className="text-2xl font-bold text-neutral-900">
          {formatValue(category.totalValue, category.unit)}
        </p>
      </div>

      {/* Sparkline */}
      {category.sparklineData && category.sparklineData.length > 0 && (
        <div className="mb-4">
          <MiniSparkline 
            data={category.sparklineData} 
            color={isSparenType ? '#10b981' : '#3b82f6'} 
          />
        </div>
      )}

      {/* Sparen Details - flexible height */}
      <div className="flex-grow mb-4">
        {isSparenType && category.totalDeposits > 0 && (
          <div className="space-y-2 p-3 bg-neutral-50 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-neutral-600">Einzahlungen</p>
              <p className="text-sm font-semibold text-green-600">
                {formatValue(category.totalDeposits, category.unit)}
              </p>
            </div>
            
            {category.profit !== undefined && (
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
                <p className="text-xs font-medium text-neutral-600">Gewinn/Verlust</p>
                <div className="flex items-center gap-1">
                  {category.profit >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <p className={clsx(
                    'text-sm font-semibold',
                    category.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {formatValue(category.profit, category.unit)}
                  </p>
                  {category.profitPercentage !== undefined && (
                    <span className={clsx(
                      'text-xs',
                      category.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      ({category.profitPercentage > 0 ? '+' : ''}{category.profitPercentage.toFixed(2)}%)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions - always at the bottom */}
      <div className="flex gap-2 pt-4 border-t border-neutral-200 mt-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1"
          icon={<Eye className="w-4 h-4" />}
          onClick={handleViewDetails}
        >
          Details
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1"
          icon={<BarChart3 className="w-4 h-4" />}
          onClick={handleViewCharts}
        >
          Graphen
        </Button>
      </div>
    </Card>
  )
}

export default CategoryCard

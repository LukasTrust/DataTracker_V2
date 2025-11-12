import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from './Card'
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
    } else {
      // Direkt zur Kategorie-Detailansicht navigieren
      navigate(`/categories/${category.id}`)
    }
  }

  return (
    <Card 
      className={clsx(
        "p-6 transition-all duration-200 flex flex-col cursor-pointer",
        isSparenType 
          ? "border-2 border-green-200 bg-gradient-to-br from-white to-green-50/30 hover:shadow-lg hover:shadow-green-100 hover:border-green-300" 
          : "border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/20 hover:shadow-lg hover:shadow-blue-100 hover:border-blue-200"
      )} 
      hover
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-neutral-900">{category.name}</h3>
            <span className={clsx(
              'text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm',
              isSparenType 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white'
            )}>
              {isSparenType ? '💰 Sparen' : '📊 Normal'}
            </span>
          </div>
          <p className="text-xs text-neutral-500">{category.entryCount} Einträge</p>
        </div>
        <div className={clsx(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm',
          isSparenType ? 'bg-green-600' : 'bg-blue-600'
        )}>
          {isSparenType ? (
            <Wallet className="w-6 h-6 text-white" />
          ) : (
            <TrendingUp className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Main Value */}
      <div className={clsx(
        "mb-4 p-3 rounded-lg",
        isSparenType ? "bg-green-50/50" : "bg-blue-50/50"
      )}>
        <p className="text-xs font-medium text-neutral-600 mb-1">Gesamtwert</p>
        <p className={clsx(
          "text-2xl font-bold",
          isSparenType ? "text-green-700" : "text-blue-700"
        )}>
          {formatValue(category.totalValue, category.unit)}
        </p>
      </div>

      {/* Sparkline */}
      {category.sparklineData && category.sparklineData.length > 0 && (
        <div className="mb-4">
          <MiniSparkline 
            data={category.sparklineData} 
            color={isSparenType ? '#059669' : '#2563eb'} 
          />
        </div>
      )}

      {/* Sparen Details - flexible height */}
      <div className="flex-grow mb-4">
        {isSparenType && category.totalDeposits > 0 && (
          <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-neutral-700">💵 Einzahlungen</p>
              <p className="text-base font-bold text-green-700">
                {formatValue(category.totalDeposits, category.unit)}
              </p>
            </div>
            
            {category.profit !== undefined && (
              <div className={clsx(
                "flex justify-between items-center pt-3 border-t-2",
                category.profit >= 0 ? "border-green-300" : "border-red-300"
              )}>
                <p className="text-xs font-semibold text-neutral-700">📈 Gewinn/Verlust</p>
                <div className="flex items-center gap-1.5">
                  {category.profit >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <p className={clsx(
                    'text-base font-bold',
                    category.profit >= 0 ? 'text-green-700' : 'text-red-700'
                  )}>
                    {formatValue(category.profit, category.unit)}
                  </p>
                  {category.profitPercentage !== undefined && (
                    <span className={clsx(
                      'text-xs font-semibold',
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
    </Card>
  )
}

export default CategoryCard

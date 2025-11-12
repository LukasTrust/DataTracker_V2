import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight } from 'lucide-react'
import Card from './Card'
import clsx from 'clsx'

interface SparenSummaryProps {
  totalValue: number
  totalDeposits: number
  totalProfit: number
  categoryCount: number
  averageReturn?: number
}

function SparenSummaryCard({ 
  totalValue, 
  totalDeposits, 
  totalProfit, 
  categoryCount,
  averageReturn 
}: SparenSummaryProps) {
  const formatValue = (value: number) => {
    return `${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`
  }

  const profitPercentage = totalDeposits > 0 ? (totalProfit / totalDeposits) * 100 : 0
  const isPositive = totalProfit >= 0

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PiggyBank className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-neutral-900">
              Sparen Gesamt
            </h3>
          </div>
          <p className="text-xs text-neutral-600">
            {categoryCount} {categoryCount === 1 ? 'Kategorie' : 'Kategorien'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
          <Wallet className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-4 pb-4 border-b-2 border-green-200">
        <p className="text-xs font-medium text-neutral-600 mb-1">Gesamtwert</p>
        <p className="text-3xl font-bold text-green-700">
          {formatValue(totalValue)}
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Deposits */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-green-100">
          <div className="flex items-center gap-1 mb-1">
            <ArrowUpRight className="w-3 h-3 text-green-600" />
            <p className="text-xs font-medium text-neutral-600">Einzahlungen</p>
          </div>
          <p className="text-lg font-bold text-neutral-900">
            {formatValue(totalDeposits)}
          </p>
        </div>

        {/* Profit/Loss */}
        <div className={clsx(
          'backdrop-blur-sm rounded-lg p-3 border',
          isPositive 
            ? 'bg-green-100/60 border-green-200' 
            : 'bg-red-100/60 border-red-200'
        )}>
          <div className="flex items-center gap-1 mb-1">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <p className="text-xs font-medium text-neutral-600">Gewinn/Verlust</p>
          </div>
          <div className="flex items-baseline gap-1">
            <p className={clsx(
              'text-lg font-bold',
              isPositive ? 'text-green-700' : 'text-red-700'
            )}>
              {formatValue(totalProfit)}
            </p>
            <span className={clsx(
              'text-xs font-semibold',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              ({isPositive ? '+' : ''}{profitPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Return Info */}
      {averageReturn !== undefined && (
        <div className="mt-4 pt-4 border-t-2 border-green-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 font-medium">Durchschnittliche Rendite:</span>
            <span className={clsx(
              'font-bold',
              averageReturn >= 0 ? 'text-green-700' : 'text-red-700'
            )}>
              {averageReturn >= 0 ? '+' : ''}{averageReturn.toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}

export default SparenSummaryCard

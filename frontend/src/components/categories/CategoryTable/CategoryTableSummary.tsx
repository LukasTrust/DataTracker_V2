import { TrendingUp, TrendingDown, DollarSign, Hash } from 'lucide-react'
import { Entry, Category } from '../../../types/category'
import { formatCurrency } from '../../../utils/numberFormatter'

interface CategoryTableSummaryProps {
  entries: Entry[]
  filteredEntries: Entry[]
  category: Category
}

/**
 * Statistik-Karten für CategoryTable
 * Zeigt unterschiedliche Statistiken je nach Kategorie-Typ (normal vs. sparen)
 */
function CategoryTableSummary({ entries, filteredEntries, category }: CategoryTableSummaryProps) {
  // Berechnungen
  const count = filteredEntries.length
  const total = entries.length
  
  const sum = filteredEntries.reduce((acc, entry) => acc + entry.value, 0)
  const average = count > 0 ? sum / count : 0
  
  // Sparen-spezifische Berechnungen
  // WICHTIG: Für Gewinn/Verlust IMMER alle Entries verwenden (nicht nur gefilterte)
  // Aktueller Wert = neuester Eintrag (sortiert nach Datum)
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const currentValue = sortedEntries.length > 0 ? sortedEntries[0].value : 0
  
  // Summe ALLER Einzahlungen
  const totalDeposit = entries.reduce((acc, entry) => acc + (entry.deposit || 0), 0)
  
  // Gewinn/Verlust = Aktueller Wert - Summe aller Einzahlungen
  const profitLoss = currentValue - totalDeposit
  const profitLossPercentage = totalDeposit > 0 ? (profitLoss / totalDeposit) * 100 : 0

  const isSparenCategory = category.type === 'sparen'

  // Farbklasse für Gewinn/Verlust
  const getProfitColorClass = (value: number): string => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-neutral-600'
  }

  if (isSparenCategory) {
    // Statistiken für Sparen-Kategorien
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Anzahl Einträge */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Einträge</p>
              <p className="text-2xl font-bold text-neutral-900">
                {count}
                {count !== total && (
                  <span className="text-sm font-normal text-neutral-500 ml-1">
                    von {total}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Einzahlungen */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Einzahlungen</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalDeposit, category.unit)}
              </p>
            </div>
          </div>
        </div>

        {/* Aktueller Wert */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Aktueller Wert</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(currentValue, category.unit)}
              </p>
            </div>
          </div>
        </div>

        {/* Gewinn/Verlust */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${profitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {profitLoss >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-neutral-600">Gewinn/Verlust</p>
              <p className={`text-2xl font-bold ${getProfitColorClass(profitLoss)}`}>
                {formatCurrency(profitLoss, category.unit)}
              </p>
              <p className={`text-xs ${getProfitColorClass(profitLoss)}`}>
                {profitLossPercentage > 0 ? '+' : ''}
                {profitLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Statistiken für normale Kategorien
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Anzahl Einträge */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Hash className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-600">Einträge</p>
            <p className="text-2xl font-bold text-neutral-900">
              {count}
              {count !== total && (
                <span className="text-sm font-normal text-neutral-500 ml-1">
                  von {total}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Summe */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-600">Summe</p>
            <p className={`text-2xl font-bold ${getProfitColorClass(sum)}`}>
              {formatCurrency(sum, category.unit)}
            </p>
          </div>
        </div>
      </div>

      {/* Durchschnitt */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-600">Durchschnitt</p>
            <p className={`text-2xl font-bold ${getProfitColorClass(average)}`}>
              {formatCurrency(average, category.unit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryTableSummary

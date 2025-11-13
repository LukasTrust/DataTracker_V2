import { useState, useMemo } from 'react'
import { BarChart3, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import Card from '../Card'
import Button from '../Button'
import { Category, Entry } from '../../types/category'
import { formatDateISO, getTodayISO } from '../../utils/dateFormatter'

interface CategoryGraphsProps {
  entries: Entry[]
  category: Category
}

interface Stats {
  total: number
  average: number
  min: number
  max: number
  latest: number
}

function CategoryGraphs({ entries, category }: CategoryGraphsProps) {
  // Datums-Filter State
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  
  // Funktion zum Setzen des aktuellen Jahres
  const setCurrentYear = () => {
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    setStartDate(formatDateISO(yearStart))
    setEndDate(getTodayISO())
  }
  
  // Filtere Einträge basierend auf Datum und sortiere chronologisch (älteste zuerst)
  const filteredEntries = useMemo(() => {
    // Filtere automatisch erstellte Einträge aus
    let filtered = entries.filter(entry => !entry.auto_generated)
    
    // Filter anwenden
    if (startDate || endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date)
        const start = startDate ? new Date(startDate) : new Date(0)
        const end = endDate ? new Date(endDate) : new Date()
        
        return entryDate >= start && entryDate <= end
      })
    }
    
    // Chronologisch sortieren (älteste zuerst) für korrekte Trend-Berechnung
    return [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [entries, startDate, endDate])
  
  // Berechne Statistiken basierend auf gefilterten Einträgen
  const stats: Stats = useMemo(() => ({
    total: filteredEntries.length,
    average: filteredEntries.length > 0 
      ? filteredEntries.reduce((sum, e) => sum + e.value, 0) / filteredEntries.length 
      : 0,
    min: filteredEntries.length > 0 
      ? Math.min(...filteredEntries.map(e => e.value)) 
      : 0,
    max: filteredEntries.length > 0 
      ? Math.max(...filteredEntries.map(e => e.value)) 
      : 0,
    latest: filteredEntries.length > 0 
      ? filteredEntries[filteredEntries.length - 1].value 
      : 0
  }), [filteredEntries])

  // Berechne Sparen-Statistiken (Einzahlung vs. aktueller Wert)
  const sparenStats = useMemo(() => {
    if (category.type !== 'sparen' || filteredEntries.length === 0) {
      return null
    }

    const totalDeposit = filteredEntries.reduce((sum, e) => sum + (e.deposit || 0), 0)
    const currentValue = stats.latest
    const profitLoss = currentValue - totalDeposit
    const profitLossPercentage = totalDeposit > 0 ? (profitLoss / totalDeposit) * 100 : 0

    return {
      totalDeposit,
      currentValue,
      profitLoss,
      profitLossPercentage
    }
  }, [filteredEntries, category.type, stats.latest])

  // Berechne Trend (vom ersten zum letzten Wert)
  const trendAnalysis = useMemo(() => {
    if (filteredEntries.length < 2) {
      return {
        percentageChange: 0,
        absoluteChange: 0,
        direction: 'neutral' as 'up' | 'down' | 'neutral',
        firstValue: 0,
        lastValue: 0,
        trendLine: [] as { x: number; y: number }[]
      }
    }

    const firstValue = filteredEntries[0].value
    const lastValue = filteredEntries[filteredEntries.length - 1].value
    const absoluteChange = lastValue - firstValue
    const percentageChange = firstValue !== 0 ? (absoluteChange / firstValue) * 100 : 0
    
    // Bestimme Richtung mit Toleranz für "stabil"
    let direction: 'up' | 'down' | 'neutral' = 'neutral'
    if (Math.abs(percentageChange) < 0.5) {
      direction = 'neutral'
    } else if (percentageChange > 0) {
      direction = 'up'
    } else {
      direction = 'down'
    }

    // Berechne Trendlinie (lineare Regression)
    const n = filteredEntries.length
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
    
    filteredEntries.forEach((entry, index) => {
      sumX += index
      sumY += entry.value
      sumXY += index * entry.value
      sumX2 += index * index
    })
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    const trendLine = filteredEntries.map((_, index) => ({
      x: index,
      y: slope * index + intercept
    }))

    return {
      percentageChange,
      absoluteChange,
      direction,
      firstValue,
      lastValue,
      trendLine,
      slope
    }
  }, [filteredEntries])
  
  // Bereite Chart-Daten vor mit adaptiver Skalierung
  const chartData = useMemo(() => {
    const values = filteredEntries.map(e => e.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    
    // Erkenne große Sprünge (mehr als 10x Unterschied)
    const hasLargeJumps = max > min * 10 && min > 0
    
    // Für Sparen-Kategorien: berechne kumulative Einzahlungen
    let cumulativeDeposit = 0
    
    return filteredEntries.map((entry, index) => {
      let displayValue = entry.value
      
      // Bei großen Sprüngen: verwende logarithmische oder adaptive Skalierung
      if (hasLargeJumps && range > 1000) {
        // Normalisiere Werte für bessere Darstellung
        if (entry.value === 0) {
          displayValue = 0
        } else {
          // Verwende sanfte Kompression für extreme Werte
          const normalized = (entry.value - min) / range
          displayValue = min + (normalized * normalized * range * 0.5) + (normalized * range * 0.5)
        }
      }
      
      // Kumulative Einzahlung berechnen
      if (category.type === 'sparen' && entry.deposit !== undefined && entry.deposit !== null) {
        cumulativeDeposit += entry.deposit
      }
      
      // Trendlinien-Wert für diesen Punkt
      const trendValue = trendAnalysis.trendLine[index]?.y || entry.value
      
      return {
        date: new Date(entry.date).toLocaleDateString('de-DE', { 
          day: '2-digit', 
          month: '2-digit',
          year: filteredEntries.length > 60 ? undefined : '2-digit'
        }),
        value: entry.value,
        displayValue: displayValue,
        trendValue: trendValue,
        deposit: entry.deposit || 0,
        cumulativeDeposit: cumulativeDeposit,
        profitLoss: entry.value - cumulativeDeposit,
        comment: entry.comment
      }
    })
  }, [filteredEntries, category.type, trendAnalysis.trendLine])
  
  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      // Für Sparen-Kategorien: erweiterte Informationen
      if (category.type === 'sparen') {
        return (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-neutral-200">
            <p className="text-sm font-semibold text-neutral-900 mb-3">{data.date}</p>
            <div className="space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-xs text-neutral-600">Aktueller Wert:</span>
                <span className="text-sm font-bold text-blue-600">
                  {data.value.toLocaleString('de-DE')} {category.unit}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-xs text-neutral-600">Gesamte Einzahlung:</span>
                <span className="text-sm font-semibold text-amber-600">
                  {data.cumulativeDeposit.toLocaleString('de-DE')} {category.unit}
                </span>
              </div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between gap-4">
                <span className="text-xs text-neutral-600">Gewinn / Verlust:</span>
                <span className={`text-sm font-bold ${data.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.profitLoss >= 0 ? '+' : ''}{data.profitLoss.toLocaleString('de-DE')} {category.unit}
                </span>
              </div>
            </div>
            {data.comment && (
              <p className="text-xs text-neutral-600 mt-3 pt-3 border-t border-neutral-200 max-w-xs">
                {data.comment}
              </p>
            )}
          </div>
        )
      }
      
      // Für normale Kategorien: einfache Anzeige
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-neutral-200">
          <p className="text-sm font-semibold text-neutral-900 mb-2">{data.date}</p>
          <p className="text-lg font-bold text-blue-600 mb-1">
            {data.value.toLocaleString('de-DE')} {category.unit}
          </p>
          {data.comment && (
            <p className="text-xs text-neutral-600 mt-2 max-w-xs">
              {data.comment}
            </p>
          )}
        </div>
      )
    }
    return null
  }


  if (entries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <BarChart3 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Keine Daten für Graphen
        </h3>
        <p className="text-sm text-neutral-600">
          Füge Einträge hinzu, um grafische Auswertungen zu sehen.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Datums-Filter */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Zeitraum-Filter
        </h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Startdatum
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Enddatum
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={setCurrentYear}
              variant="secondary"
            >
              Dieses Jahr
            </Button>
            <Button
              onClick={() => {
                setStartDate('')
                setEndDate('')
              }}
              variant="secondary"
            >
              Zurücksetzen
            </Button>
          </div>
        </div>
        {(startDate || endDate) && (
          <div className="mt-3 text-sm text-neutral-600">
            Zeige {filteredEntries.length} von {entries.length} Einträgen
          </div>
        )}
      </Card>

      {filteredEntries.length === 0 ? (
        <Card className="p-12 text-center">
          <BarChart3 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Keine Daten im gewählten Zeitraum
          </h3>
          <p className="text-sm text-neutral-600">
            Wähle einen anderen Zeitraum oder füge Einträge hinzu.
          </p>
        </Card>
      ) : (
        <>
          {/* Statistik-Karten */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {category.type === 'sparen' && sparenStats ? (
              // Sparen-spezifische Statistiken
              <>
                <Card className="p-6">
                  <div className="text-sm text-neutral-600 mb-1">Gesamt Einzahlung</div>
                  <div className="text-2xl font-semibold text-neutral-900">
                    {sparenStats.totalDeposit.toLocaleString('de-DE')} {category.unit}
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-sm text-neutral-600 mb-1">Aktueller Wert</div>
                  <div className="text-2xl font-semibold text-blue-700">
                    {sparenStats.currentValue.toLocaleString('de-DE')} {category.unit}
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-sm text-neutral-600 mb-1">Gewinn / Verlust</div>
                  <div className={`text-2xl font-semibold ${sparenStats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {sparenStats.profitLoss >= 0 ? '+' : ''}{sparenStats.profitLoss.toLocaleString('de-DE')} {category.unit}
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-sm text-neutral-600 mb-1">Rendite</div>
                  <div className={`text-2xl font-semibold ${sparenStats.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {sparenStats.profitLossPercentage >= 0 ? '+' : ''}{sparenStats.profitLossPercentage.toFixed(2)}%
                  </div>
                </Card>
              </>
            ) : (
              // Normale Statistiken
              <>
                <Card className="p-6">
                  <div className="text-sm text-neutral-600 mb-1">Aktueller Wert</div>
                  <div className="text-2xl font-semibold text-neutral-900">
                    {stats.latest.toLocaleString('de-DE')} {category.unit}
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-sm text-neutral-600 mb-1">Durchschnitt</div>
                  <div className="text-2xl font-semibold text-neutral-900">
                    {stats.average.toLocaleString('de-DE', { maximumFractionDigits: 2 })} {category.unit}
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-sm text-neutral-600 mb-1">Minimum</div>
                  <div className="text-2xl font-semibold text-neutral-900">
                    {stats.min.toLocaleString('de-DE')} {category.unit}
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-sm text-neutral-600 mb-1">Maximum</div>
                  <div className="text-2xl font-semibold text-neutral-900">
                    {stats.max.toLocaleString('de-DE')} {category.unit}
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Trend-Karte */}
          {filteredEntries.length >= 2 && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                {trendAnalysis.direction === 'up' && <TrendingUp className="w-5 h-5 text-green-600" />}
                {trendAnalysis.direction === 'down' && <TrendingDown className="w-5 h-5 text-red-600" />}
                {trendAnalysis.direction === 'neutral' && <Minus className="w-5 h-5 text-neutral-500" />}
                Trend-Analyse
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Prozentuale Veränderung - nur für normale Kategorien */}
                {category.type !== 'sparen' && (
                  <div>
                    <div className="text-xs text-neutral-600 mb-2">Entwicklung</div>
                    <div className="flex items-center gap-3">
                      <div className={`text-4xl font-bold ${
                        trendAnalysis.direction === 'up' ? 'text-green-600' : 
                        trendAnalysis.direction === 'down' ? 'text-red-600' : 
                        'text-neutral-500'
                      }`}>
                        {trendAnalysis.direction === 'up' && '↑'}
                        {trendAnalysis.direction === 'down' && '↓'}
                        {trendAnalysis.direction === 'neutral' && '→'}
                        {' '}{Math.abs(trendAnalysis.percentageChange).toFixed(1)}%
                      </div>
                    </div>
                    <div className={`text-sm font-medium mt-2 ${
                      trendAnalysis.direction === 'up' ? 'text-green-700' : 
                      trendAnalysis.direction === 'down' ? 'text-red-700' : 
                      'text-neutral-600'
                    }`}>
                      {trendAnalysis.direction === 'up' && 'Steigender Trend'}
                      {trendAnalysis.direction === 'down' && 'Fallender Trend'}
                      {trendAnalysis.direction === 'neutral' && 'Stabiler Verlauf'}
                    </div>
                  </div>
                )}

                {/* Absolute Veränderung */}
                <div>
                  <div className="text-xs text-neutral-600 mb-2">Absolute Veränderung</div>
                  <div className={`text-2xl font-bold ${
                    trendAnalysis.absoluteChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trendAnalysis.absoluteChange >= 0 ? '+' : ''}{trendAnalysis.absoluteChange.toLocaleString('de-DE', { maximumFractionDigits: 2 })} {category.unit}
                  </div>
                  <div className="text-xs text-neutral-600 mt-2">
                    vom ersten zum letzten Wert
                  </div>
                </div>

                {/* Von-Bis Werte */}
                <div>
                  <div className="text-xs text-neutral-600 mb-2">Zeitraum</div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500">Start:</span>
                      <span className="text-sm font-semibold text-neutral-900">
                        {trendAnalysis.firstValue.toLocaleString('de-DE')} {category.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500">Ende:</span>
                      <span className="text-sm font-semibold text-neutral-900">
                        {trendAnalysis.lastValue.toLocaleString('de-DE')} {category.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Erklärungstext */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-neutral-600">
                  Die Trend-Analyse vergleicht den <span className="font-semibold">ersten</span> mit dem <span className="font-semibold">letzten</span> Wert 
                  im angezeigten Zeitraum ({filteredEntries.length} Einträge).
                  {category.type === 'sparen' && (
                    <span> Für Sparen-Kategorien wird die prozentuale Entwicklung nicht angezeigt, da sie durch unterschiedliche Einzahlungen verzerrt sein kann.</span>
                  )}
                </p>
              </div>
            </Card>
          )}

          {/* Linien-Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">
              {category.type === 'sparen' ? 'Wertentwicklung & Einzahlungen' : 'Verlaufs-Diagramm'}
            </h3>
            <div className="w-full" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#737373' }}
                    stroke="#a3a3a3"
                    angle={chartData.length > 30 ? -45 : 0}
                    textAnchor={chartData.length > 30 ? 'end' : 'middle'}
                    height={chartData.length > 30 ? 80 : 30}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#737373' }}
                    stroke="#a3a3a3"
                    tickFormatter={(value) => value.toLocaleString('de-DE')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {category.type !== 'sparen' && (
                    <ReferenceLine 
                      y={stats.average} 
                      stroke="#9ca3af" 
                      strokeDasharray="5 5"
                      label={{ 
                        value: 'Durchschnitt', 
                        position: 'insideTopRight',
                        fill: '#6b7280',
                        fontSize: 12
                      }}
                    />
                  )}
                  
                  {/* Hauptlinie: Aktueller Wert */}
                  <Line 
                    type="monotone" 
                    dataKey={category.type === 'sparen' ? 'value' : 'displayValue'}
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6, fill: '#2563eb' }}
                    name="Aktueller Wert"
                  />
                  {/* Für Sparen-Kategorien: Zusätzliche Linie für kumulative Einzahlung */}
                  {category.type === 'sparen' && (
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeDeposit" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#f59e0b', r: 3 }}
                      activeDot={{ r: 5, fill: '#d97706' }}
                      name="Gesamte Einzahlung"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legende */}
            {category.type === 'sparen' && (
              <div className="mt-4 flex justify-center flex-wrap gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-blue-600" style={{ height: '3px' }}></div>
                  <span className="text-sm text-neutral-700">Aktueller Wert</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-0.5 bg-amber-600"
                    style={{ 
                      height: '2px',
                      backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 5px, transparent 5px, transparent 10px)'
                    }}
                  ></div>
                  <span className="text-sm text-neutral-700">Gesamte Einzahlung</span>
                </div>
              </div>
            )}
            {chartData.length > 0 && stats.max > stats.min * 10 && stats.min > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  ℹ️ Aufgrund großer Wertunterschiede wurde eine adaptive Skalierung angewendet, um die Darstellung zu optimieren.
                </p>
              </div>
            )}
          </Card>

          {/* Daten-Übersicht */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              {filteredEntries.length > 5 ? 'Letzte 5 Einträge' : 'Alle Einträge'}
            </h3>
            <div className="space-y-3">
              {filteredEntries.slice(-5).reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div>
                    <div className="text-sm text-neutral-900 font-medium">{entry.date}</div>
                    {entry.comment && (
                      <div className="text-xs text-neutral-500 mt-1">{entry.comment}</div>
                    )}
                    {category.type === 'sparen' && entry.deposit !== undefined && entry.deposit !== null && (
                      <div className="text-xs text-neutral-600 mt-1">
                        Einzahlung: {entry.deposit.toLocaleString('de-DE')} {category.unit}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neutral-900">
                      {entry.value.toLocaleString('de-DE')} {category.unit}
                    </div>
                    {category.type === 'sparen' && entry.deposit !== undefined && entry.deposit !== null && (
                      <div className={`text-xs font-medium mt-1 ${entry.value - entry.deposit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.value - entry.deposit >= 0 ? '+' : ''}{(entry.value - entry.deposit).toLocaleString('de-DE')} {category.unit}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default CategoryGraphs

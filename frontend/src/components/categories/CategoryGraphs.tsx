import { useState, useMemo } from 'react'
import { BarChart3, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import Card from '../Card'
import Button from '../Button'
import { Category, Entry } from '../../types/category'

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
    setStartDate(yearStart.toISOString().split('T')[0])
    setEndDate(now.toISOString().split('T')[0])
  }
  
  // Filtere Einträge basierend auf Datum
  const filteredEntries = useMemo(() => {
    if (!startDate && !endDate) return entries
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date)
      const start = startDate ? new Date(startDate) : new Date(0)
      const end = endDate ? new Date(endDate) : new Date()
      
      return entryDate >= start && entryDate <= end
    })
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

  // Berechne Trend (letzten 50% vs. erste 50%)
  const trend = useMemo(() => {
    const halfPoint = Math.floor(filteredEntries.length / 2)
    const firstHalf = filteredEntries.slice(0, halfPoint)
    const secondHalf = filteredEntries.slice(halfPoint)
    
    const firstAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, e) => sum + e.value, 0) / firstHalf.length 
      : 0
    const secondAvg = secondHalf.length > 0 
      ? secondHalf.reduce((sum, e) => sum + e.value, 0) / secondHalf.length 
      : 0
    
    return firstAvg > 0 
      ? ((secondAvg - firstAvg) / firstAvg) * 100 
      : 0
  }, [filteredEntries])
  
  // Bereite Chart-Daten vor mit adaptiver Skalierung
  const chartData = useMemo(() => {
    const values = filteredEntries.map(e => e.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    
    // Erkenne große Sprünge (mehr als 10x Unterschied)
    const hasLargeJumps = max > min * 10 && min > 0
    
    return filteredEntries.map(entry => {
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
      
      return {
        date: new Date(entry.date).toLocaleDateString('de-DE', { 
          day: '2-digit', 
          month: '2-digit',
          year: filteredEntries.length > 60 ? undefined : '2-digit'
        }),
        value: entry.value,
        displayValue: displayValue,
        comment: entry.comment
      }
    })
  }, [filteredEntries])
  
  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
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
          </div>

          {/* Trend-Karte */}
          {filteredEntries.length >= 4 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Trend-Analyse</h3>
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                </div>
                <div className="text-sm text-neutral-600">
                  {trend >= 0 ? 'Steigerung' : 'Rückgang'} im Vergleich zur ersten Hälfte der Daten
                </div>
              </div>
            </Card>
          )}

          {/* Linien-Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Verlaufs-Diagramm</h3>
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
                  <Line 
                    type="monotone" 
                    dataKey="displayValue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
                  </div>
                  <div className="text-sm font-semibold text-neutral-900">
                    {entry.value.toLocaleString('de-DE')} {category.unit}
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

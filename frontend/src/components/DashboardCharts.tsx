import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import Card from './Card'

export interface ChartDataPoint {
  date: string
  value: number
  deposits?: number
  profit?: number
}

interface DashboardChartsProps {
  totalValueData: ChartDataPoint[]
  sparenData: ChartDataPoint[]
  categoryComparison: { name: string; value: number; type: string }[]
}

function DashboardCharts({ totalValueData, sparenData, categoryComparison }: DashboardChartsProps) {
  // Separate categories by type
  const sparenCategories = categoryComparison.filter(cat => cat.type === 'sparen')
  const normalCategories = categoryComparison.filter(cat => cat.type === 'normal')
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Total Value Development */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Gesamtwertentwicklung
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={totalValueData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Sparen: Einzahlungen vs. Wert */}
      {sparenData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Sparen: Einzahlungen vs. Wert
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sparenData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="deposits"
                stroke="#10b981"
                strokeWidth={2}
                name="Einzahlungen"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Aktueller Wert"
                dot={{ r: 3 }}
              />
              {sparenData.some(d => d.profit !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Gewinn/Verlust"
                  dot={{ r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Category Comparison - Sparen */}
      {sparenCategories.length > 0 && (
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Sparen-Kategorien im Vergleich
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sparenCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#10b981" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Category Comparison - Normal */}
      {normalCategories.length > 0 && (
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Normal-Kategorien im Vergleich
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={normalCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}

export default DashboardCharts

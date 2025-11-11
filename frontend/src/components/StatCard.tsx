import { LucideIcon } from 'lucide-react'
import Card from './Card'
import clsx from 'clsx'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  iconColor?: string
  iconBgColor?: string
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-50'
}: StatCardProps) {
  return (
    <Card className="p-6" hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-neutral-900 mb-2">{value}</p>
          
          {description && (
            <p className="text-sm text-neutral-500">{description}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={clsx(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-neutral-500">vs. letzter Monat</span>
            </div>
          )}
        </div>
        
        <div className={clsx('p-3 rounded-lg', iconBgColor)}>
          <Icon className={clsx('w-6 h-6', iconColor)} />
        </div>
      </div>
    </Card>
  )
}

export default StatCard

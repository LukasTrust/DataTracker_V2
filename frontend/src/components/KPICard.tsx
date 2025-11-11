import { LucideIcon } from 'lucide-react'
import Card from './Card'
import clsx from 'clsx'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  iconColor?: string
  iconBgColor?: string
  onClick?: () => void
  isActive?: boolean
}

function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-50',
  onClick,
  isActive = false
}: KPICardProps) {
  return (
    <Card 
      className={clsx(
        'p-6 transition-all duration-200',
        onClick && 'cursor-pointer',
        isActive && 'ring-2 ring-primary-500 shadow-lg'
      )} 
      hover={!!onClick}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mb-2">{value}</p>
          
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
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(2)}%
              </span>
              {trend.label && (
                <span className="text-xs text-neutral-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        
        <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0', iconBgColor)}>
          <Icon className={clsx('w-6 h-6', iconColor)} />
        </div>
      </div>
      
      {onClick && (
        <div className="mt-3 pt-3 border-t border-neutral-200">
          <p className="text-xs text-neutral-500 flex items-center gap-1">
            <span>Klicken zum Filtern</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </p>
        </div>
      )}
    </Card>
  )
}

export default KPICard

import { useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import clsx from 'clsx'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationData {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

interface NotificationProps {
  notification: NotificationData
  onClose: (id: string) => void
}

function Notification({ notification, onClose }: NotificationProps) {
  const { id, type, message, duration = 5000 } = notification

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  }

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600'
  }

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg border shadow-soft animate-slideInRight',
        'min-w-[320px] max-w-md',
        styles[type]
      )}
      role="alert"
    >
      <span className={iconColors[type]}>
        {icons[type]}
      </span>
      <p className="flex-1 text-sm font-medium">
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Schließen"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

export default Notification

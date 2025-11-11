import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import NotificationContainer from '../components/NotificationContainer'
import { NotificationData, NotificationType } from '../components/Notification'

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const showNotification = useCallback((
    type: NotificationType,
    message: string,
    duration: number = 5000
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    const notification: NotificationData = { id, type, message, duration }
    
    setNotifications((prev) => [...prev, notification])
  }, [])

  const showSuccess = useCallback((message: string, duration?: number) => {
    showNotification('success', message, duration)
  }, [showNotification])

  const showError = useCallback((message: string, duration?: number) => {
    showNotification('error', message, duration)
  }, [showNotification])

  const showWarning = useCallback((message: string, duration?: number) => {
    showNotification('warning', message, duration)
  }, [showNotification])

  const showInfo = useCallback((message: string, duration?: number) => {
    showNotification('info', message, duration)
  }, [showNotification])

  const handleClose = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
      }}
    >
      {children}
      <NotificationContainer notifications={notifications} onClose={handleClose} />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification muss innerhalb eines NotificationProvider verwendet werden')
  }
  return context
}

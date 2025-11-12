import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import NotificationContainer from '../components/NotificationContainer'
import { NotificationData, NotificationType } from '../components/Notification'
import { parseError, formatErrorMessage, ErrorContext, FRONTEND_ERRORS } from '../utils/errorMessages'

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
  /** Zeigt einen geparsten Fehler mit Kontext an */
  showErrorWithContext: (error: any, context?: ErrorContext, duration?: number) => void
  /** Zeigt einen vordefinierten Frontend-Fehler an */
  showValidationError: (errorKey: keyof typeof FRONTEND_ERRORS, duration?: number) => void
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

  /**
   * Zeigt einen Fehler mit automatischer Parsing und Kontextualisierung
   * Dies ist die empfohlene Methode für API-Fehler
   * 
   * @example
   * ```ts
   * try {
   *   await createEntry(data)
   * } catch (error) {
   *   showErrorWithContext(error, { action: 'create', entityType: 'entry' })
   * }
   * ```
   */
  const showErrorWithContext = useCallback((error: any, context?: ErrorContext, duration?: number) => {
    const parsed = parseError(error, context)
    const message = formatErrorMessage(parsed)
    showNotification('error', message, duration || 7000) // Längere Duration für komplexe Fehler
  }, [showNotification])

  /**
   * Zeigt einen vordefinierten Frontend-Validierungsfehler an
   * 
   * @example
   * ```ts
   * if (!value || value === '0') {
   *   showValidationError('ZERO_VALUE')
   *   return
   * }
   * ```
   */
  const showValidationError = useCallback((errorKey: keyof typeof FRONTEND_ERRORS, duration?: number) => {
    const errorData = FRONTEND_ERRORS[errorKey] as { message: string; suggestion?: string }
    const message = errorData.suggestion 
      ? `${errorData.message} ${errorData.suggestion}`
      : errorData.message
    showNotification('error', message, duration)
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
        showInfo,
        showErrorWithContext,
        showValidationError,
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

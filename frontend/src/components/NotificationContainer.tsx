import Notification, { NotificationData } from './Notification'

interface NotificationContainerProps {
  notifications: NotificationData[]
  onClose: (id: string) => void
}

function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  if (notifications.length === 0) return null

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-3"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

export default NotificationContainer

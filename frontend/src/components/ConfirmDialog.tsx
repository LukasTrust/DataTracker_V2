import { ReactNode } from 'react'
import Button from './Button'
import Card from './Card'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Ja',
  cancelText = 'Nein',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-primary-600'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="max-w-md w-full p-6 animate-fadeIn">
        <h3 className={`text-lg font-semibold mb-3 ${variantStyles[variant]}`}>
          {title}
        </h3>
        <div className="text-neutral-700 mb-6">
          {message}
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button 
            variant="ghost"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'primary' : 'primary'}
            onClick={onConfirm}
            className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ConfirmDialog

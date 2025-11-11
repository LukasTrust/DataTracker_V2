import { useState } from 'react'

export interface DialogConfig {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => Promise<void> | void
}

interface UseConfirmDialogReturn {
  isOpen: boolean
  config: DialogConfig | null
  confirm: (config: DialogConfig) => void
  handleConfirm: () => Promise<void>
  handleCancel: () => void
}

/**
 * Custom Hook für Confirm-Dialoge
 * Vereinfacht die Verwaltung von Bestätigungs-Dialogen
 * 
 * @returns Dialog-State und Handler-Funktionen
 * 
 * @example
 * const { isOpen, config, confirm, handleConfirm, handleCancel } = useConfirmDialog()
 * 
 * // Dialog öffnen
 * confirm({
 *   title: 'Kategorie löschen?',
 *   message: 'Diese Aktion kann nicht rückgängig gemacht werden.',
 *   variant: 'danger',
 *   onConfirm: async () => {
 *     await deleteCategory(id)
 *   }
 * })
 * 
 * // In JSX
 * <ConfirmDialog
 *   isOpen={isOpen}
 *   title={config?.title}
 *   message={config?.message}
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 *   variant={config?.variant}
 * />
 */
export function useConfirmDialog(): UseConfirmDialogReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<DialogConfig | null>(null)

  const confirm = (dialogConfig: DialogConfig) => {
    setConfig(dialogConfig)
    setIsOpen(true)
  }

  const handleConfirm = async () => {
    if (config?.onConfirm) {
      await config.onConfirm()
    }
    setIsOpen(false)
    setConfig(null)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setConfig(null)
  }

  return {
    isOpen,
    config,
    confirm,
    handleConfirm,
    handleCancel,
  }
}

import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
}

function Card({ children, className, hover = false, onClick, onDoubleClick }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-neutral-200 shadow-soft',
        hover && 'transition-default hover:shadow-medium hover:border-neutral-300',
        className
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  )
}

export default Card

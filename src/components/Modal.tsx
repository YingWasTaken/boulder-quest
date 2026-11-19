import { useEffect, useId, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useBackHandler } from '../native/back'
import './Modal.css'

interface ModalProps {
  title: string
  children: ReactNode
  primaryButtonLabel?: string
  onPrimary?: () => void
  onClose: () => void
}

export function Modal({ title, children, primaryButtonLabel, onPrimary, onClose }: ModalProps) {
  const { t } = useTranslation()
  const titleId = useId()
  useBackHandler(onClose)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title" id={titleId}>{title}</h2>
          <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label={t('close')}>
            <X size={22} strokeWidth={3} aria-hidden />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {primaryButtonLabel && onPrimary && (
          <button type="button" className="btn modal-primary" onClick={onPrimary}>
            {primaryButtonLabel}
          </button>
        )}
      </div>
    </div>
  )
}

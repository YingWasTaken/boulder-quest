import type { ReactNode } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import './Modal.css'

interface ModalProps {
  title: string
  children: ReactNode
  primaryButtonLabel?: string
  onPrimary?: () => void
  onClose: () => void
  showCloseX?: boolean
}

export function Modal({
  title,
  children,
  primaryButtonLabel,
  onPrimary,
  onClose,
  showCloseX = true,
}: ModalProps) {
  const { t } = useTranslation()
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showCloseX && (
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label={t('close')}
            >
              ✕
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {primaryButtonLabel && onPrimary && (
          <div className="modal-footer">
            <button type="button" className="modal-primary-btn" onClick={onPrimary}>
              {primaryButtonLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

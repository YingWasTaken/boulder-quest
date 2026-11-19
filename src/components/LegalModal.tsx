import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { Modal } from './Modal'
import './LegalModal.css'

export type LegalDocument = 'privacy' | 'terms' | 'licenses'

const TITLE_KEYS: Record<LegalDocument, string> = {
  privacy: 'privacyPolicy',
  terms: 'safetyTerms',
  licenses: 'licenses',
}

interface LegalModalProps {
  document: LegalDocument
  onClose: () => void
}

/** Shows the same legal pages that are published on the web. */
export function LegalModal({ document, onClose }: LegalModalProps) {
  const { t } = useTranslation()
  const { lang } = useApp()
  const suffix = document === 'licenses' ? '' : lang === 'es' ? '-es' : '-en'

  return (
    <Modal title={t(TITLE_KEYS[document])} onClose={onClose}>
      <iframe className="legal-frame" src={`/legal/${document}${suffix}.html`} title={t(TITLE_KEYS[document])} />
    </Modal>
  )
}

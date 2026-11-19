import { useState } from 'react'
import { BookOpen, FileText, Scale, ShieldCheck, Volume2, VolumeX } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTranslation, availableLocales } from '../hooks/useTranslation'
import { Modal } from './Modal'
import { LegalModal, type LegalDocument } from './LegalModal'
import './SettingsModal.css'

const APP_VERSION = '1.0.0'

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { t, lang, availableLangs } = useTranslation()
  const { setLang, setScreen, playClick, soundOn, toggleSound } = useApp()
  const [document, setDocument] = useState<LegalDocument | null>(null)

  const openDocument = (next: LegalDocument) => {
    playClick()
    setDocument(next)
  }

  return (
    <>
      <Modal title={t('settings')} onClose={onClose}>
        <section className="settings-section">
          <h3 className="settings-heading">{t('language')}</h3>
          <div className="settings-languages">
            {availableLangs.map((code) => (
              <button
                key={code}
                type="button"
                className={`settings-language ${lang === code ? 'active' : ''}`}
                aria-pressed={lang === code}
                onClick={() => {
                  playClick()
                  setLang(code)
                }}
              >
                <span className="settings-language-code">{code.toUpperCase()}</span>
                {availableLocales[code]?.languageName ?? code}
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-list">
            <button type="button" className="btn btn-quiet" onClick={toggleSound} aria-pressed={soundOn}>
              {soundOn ? <Volume2 size={22} aria-hidden /> : <VolumeX size={22} aria-hidden />}
              {t('sound')}: {soundOn ? t('on') : t('off')}
            </button>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => {
                playClick()
                onClose()
                setScreen('howToPlay')
              }}
            >
              <BookOpen size={22} aria-hidden />
              {t('howToPlay')}
            </button>
            <a
              href="https://discord.gg/WwGSacHA8d"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-quiet btn-sky"
            >
              {t('discordMock')}
            </a>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-heading">{t('legal')}</h3>
          <div className="settings-legal">
            <button type="button" className="settings-legal-link" onClick={() => openDocument('terms')}>
              <ShieldCheck size={20} aria-hidden />
              {t('safetyTerms')}
            </button>
            <button type="button" className="settings-legal-link" onClick={() => openDocument('privacy')}>
              <FileText size={20} aria-hidden />
              {t('privacyPolicy')}
            </button>
            <button type="button" className="settings-legal-link" onClick={() => openDocument('licenses')}>
              <Scale size={20} aria-hidden />
              {t('licenses')}
            </button>
          </div>
          <p className="settings-version" translate="no">Boulder Quest {APP_VERSION}</p>
        </section>
      </Modal>

      {document && <LegalModal document={document} onClose={() => setDocument(null)} />}
    </>
  )
}

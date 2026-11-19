import { useApp } from '../context/AppContext'
import { useTranslation, availableLocales } from '../hooks/useTranslation'
import { Hold } from '../components/Hold'
import './LanguageScreen.css'

export function LanguageScreen() {
  const { t, lang, availableLangs } = useTranslation()
  const { setLang, setScreen, playClick } = useApp()

  return (
    <div className="page language-screen">
      <div className="language-hero">
        <Hold size={132} className="language-logo" />
        <h1 className="language-title" translate="no">
          Boulder<br />Quest
        </h1>
        <p className="language-tagline">{t('tagline')}</p>
      </div>

      <div className="language-select">
        {availableLangs.map((code) => (
          <button
            key={code}
            type="button"
            className={`language-opt ${lang === code ? 'active' : ''}`}
            onClick={() => {
              playClick()
              setLang(code)
            }}
            aria-pressed={lang === code}
          >
            <span className="language-code">{code.toUpperCase()}</span>
            <span>{availableLocales[code]?.languageName ?? code}</span>
          </button>
        ))}
      </div>

      <div className="page-footer">
        <button
          type="button"
          className="btn"
          onClick={() => {
            playClick()
            setScreen('howToPlay')
          }}
        >
          {t('play')}
        </button>
      </div>
    </div>
  )
}

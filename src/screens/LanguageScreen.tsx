import { useApp } from '../context/AppContext'
import { useTranslation, availableLocales } from '../hooks/useTranslation'
import './LanguageScreen.css'

export function LanguageScreen() {
  const { t, lang, availableLangs } = useTranslation()
  const { setLang, setScreen, playClick } = useApp()

  const handlePlay = () => {
    playClick()
    setScreen('howToPlay')
  }

  return (
    <div className="language-screen">
      <img src="/logo.png" alt="Boulder Quest Logo" className="language-logo" />
      <h1 className="language-title">{t('appTitle')}</h1>
      <div className="language-select">
        {availableLangs.map((l) => {
          const dict = availableLocales[l] || {}
          const flag = dict['languageFlag'] || l.toUpperCase()
          const name = dict['languageName'] || l.toUpperCase()
          
          return (
            <button
              key={l}
              type="button"
              className={`language-opt ${lang === l ? 'active' : ''}`}
              onClick={() => {
                playClick()
                setLang(l)
              }}
              aria-pressed={lang === l}
            >
              <span className="language-flag" aria-hidden>{flag}</span>
              <span>{name}</span>
            </button>
          )
        })}
      </div>
      <button type="button" className="language-play" onClick={handlePlay}>
        {t('play')}
      </button>
    </div>
  )
}

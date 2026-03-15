import { useState, useRef, useEffect } from 'react'
import { useTranslation, availableLocales } from '../hooks/useTranslation'
import { useApp } from '../context/AppContext'
import './LanguageDropdown.css'

export function LanguageDropdown() {
  const { lang, availableLangs } = useTranslation()
  const { setLang, playClick } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentFlag = availableLocales[lang]?.['languageFlag'] || lang.toUpperCase()
  const currentName = availableLocales[lang]?.['languageName'] || lang.toUpperCase()

  return (
    <div className="language-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className="language-dropdown-btn"
        onClick={() => {
          playClick()
          setIsOpen(!isOpen)
        }}
        aria-label={currentName}
        title={currentName}
      >
        {currentFlag}
      </button>

      {isOpen && (
        <div className="language-dropdown-menu">
          {availableLangs.map((l) => {
            const flag = availableLocales[l]?.['languageFlag'] || l.toUpperCase()
            const name = availableLocales[l]?.['languageName'] || l.toUpperCase()
            return (
              <button
                key={l}
                type="button"
                className={`language-dropdown-item ${lang === l ? 'active' : ''}`}
                onClick={() => {
                  playClick()
                  setLang(l)
                  setIsOpen(false)
                }}
              >
                <span className="language-dropdown-flag" aria-hidden>{flag}</span>
                <span>{name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

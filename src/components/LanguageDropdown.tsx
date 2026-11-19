import { useEffect, useRef, useState } from 'react'
import { useTranslation, availableLocales } from '../hooks/useTranslation'
import { useApp } from '../context/AppContext'
import './LanguageDropdown.css'

export function LanguageDropdown() {
  const { lang, availableLangs } = useTranslation()
  const { setLang, playClick } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  return (
    <div className="language-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => {
          playClick()
          setIsOpen(!isOpen)
        }}
        aria-expanded={isOpen}
        aria-label={availableLocales[lang]?.languageName}
      >
        {lang.toUpperCase()}
      </button>

      {isOpen && (
        <div className="language-dropdown-menu">
          {availableLangs.map((code) => (
            <button
              key={code}
              type="button"
              className={`language-dropdown-item ${lang === code ? 'active' : ''}`}
              onClick={() => {
                playClick()
                setLang(code)
                setIsOpen(false)
              }}
            >
              {availableLocales[code]?.languageName ?? code}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

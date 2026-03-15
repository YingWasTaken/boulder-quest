import { useState, useRef, useCallback } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useApp } from '../context/AppContext'
import './HowToPlaySlides.css'

const SLIDE_KEYS = ['howToPlaySlide1', 'howToPlaySlide2', 'howToPlaySlide3'] as const

interface HowToPlaySlidesProps {
  onClose: () => void
}

export function HowToPlaySlides({ onClose }: HowToPlaySlidesProps) {
  const { t } = useTranslation()
  const { playClick } = useApp()
  const [index, setIndex] = useState(0)
  const touchStart = useRef(0)
  const touchEnd = useRef(0)

  const goNext = useCallback(() => {
    playClick()
    if (index < SLIDE_KEYS.length - 1) setIndex((i) => i + 1)
  }, [index, playClick])

  const goPrev = useCallback(() => {
    playClick()
    if (index > 0) setIndex((i) => i - 1)
  }, [index, playClick])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    const diff = touchStart.current - touchEnd.current
    const threshold = 50
    if (diff > threshold) goNext()
    else if (diff < -threshold) goPrev()
  }, [goNext, goPrev])

  const isLast = index === SLIDE_KEYS.length - 1

  return (
    <div
      className="how-to-play-slides"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="how-to-play-header">
        <span className="how-to-play-dots">
          {SLIDE_KEYS.map((key, i) => (
            <span
              key={key}
              className={`dot ${i === index ? 'active' : ''}`}
              aria-hidden
            />
          ))}
        </span>
        {isLast && (
          <button
            type="button"
            className="how-to-play-close"
            onClick={() => {
              playClick()
              onClose()
            }}
            aria-label={t('close')}
          >
            ✕
          </button>
        )}
      </div>
      <div
        className="how-to-play-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDE_KEYS.map((key) => (
          <div key={key} className="how-to-play-slide">
            <h2 className="how-to-play-slide-title">{t(`${key}Title`)}</h2>
            <p className="how-to-play-slide-body">{t(`${key}Body`)}</p>
          </div>
        ))}
      </div>
      <div className="how-to-play-footer">
        {!isLast ? (
          <button type="button" className="how-to-play-next" onClick={goNext}>
            →
          </button>
        ) : (
          <button type="button" className="how-to-play-done" onClick={() => {
            playClick()
            onClose()
          }}>
            {t('play')}
          </button>
        )}
      </div>
    </div>
  )
}

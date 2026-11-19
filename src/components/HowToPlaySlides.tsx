import { useRef, useState } from 'react'
import { ArrowRight, Check, Layers, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApp } from '../context/AppContext'
import { Hold } from './Hold'
import { useBackHandler } from '../native/back'
import './HowToPlaySlides.css'

const SLIDES = [
  { key: 'howToPlaySlide1', color: undefined, Icon: null },
  { key: 'howToPlaySlide2', color: '#94D4FF', Icon: Layers },
  { key: 'howToPlaySlide3', color: '#AEFF96', Icon: Check },
]

const SWIPE_THRESHOLD = 50

interface HowToPlaySlidesProps {
  onClose: () => void
}

export function HowToPlaySlides({ onClose }: HowToPlaySlidesProps) {
  const { t } = useTranslation()
  const { playClick } = useApp()
  const [index, setIndex] = useState(0)
  const touchStart = useRef<number | null>(null)

  const isLast = index === SLIDES.length - 1

  useBackHandler(() => (index > 0 ? setIndex(index - 1) : onClose()))

  const goTo = (next: number) => {
    if (next < 0 || next >= SLIDES.length) return
    playClick()
    setIndex(next)
  }

  const finish = () => {
    playClick()
    onClose()
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null) return
    const distance = touchStart.current - event.changedTouches[0].clientX
    touchStart.current = null
    if (distance > SWIPE_THRESHOLD) goTo(index + 1)
    else if (distance < -SWIPE_THRESHOLD) goTo(index - 1)
  }

  return (
    <div
      className="page how-to-play"
      onTouchStart={(e) => (touchStart.current = e.targetTouches[0].clientX)}
      onTouchEnd={handleTouchEnd}
    >
      <div className="how-to-play-header">
        <span className="how-to-play-dots" aria-hidden>
          {SLIDES.map(({ key }, i) => (
            <span key={key} className={`how-to-play-dot ${i === index ? 'active' : ''}`} />
          ))}
        </span>
        <button type="button" className="how-to-play-skip" onClick={finish}>
          {t('skip')}
          <X size={18} strokeWidth={3} aria-hidden />
        </button>
      </div>

      <div className="how-to-play-viewport">
        <div className="how-to-play-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {SLIDES.map(({ key, color, Icon }, i) => (
            <div key={key} className="how-to-play-slide" aria-hidden={i !== index}>
              <Hold size={150} color={color}>
                {Icon && <Icon size={54} strokeWidth={2.75} aria-hidden />}
              </Hold>
              <h2 className="how-to-play-title">{t(`${key}Title`)}</h2>
              <p className="how-to-play-body">{t(`${key}Body`)}</p>
              {i === SLIDES.length - 1 && <p className="how-to-play-safety">{t('safetyNotice')}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="page-footer">
        <button
          type="button"
          className={`btn ${isLast ? '' : 'btn-sky'}`}
          onClick={isLast ? finish : () => goTo(index + 1)}
        >
          {isLast ? t('play') : t('next')}
          {!isLast && <ArrowRight size={24} strokeWidth={3} aria-hidden />}
        </button>
      </div>
    </div>
  )
}

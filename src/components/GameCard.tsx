import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { Card as CardType, CardCategory } from '../types'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { CATEGORY_COLORS, STAT_ICONS } from '../constants/categories'
import useSound from 'use-sound'
import './GameCard.css'

interface GameCardProps {
  card: CardType
  onComplete: () => void
  onFail: () => void
  onDragChange?: (dx: number) => void
}

export function GameCard({ card, onComplete, onFail, onDragChange }: GameCardProps) {
  const { t } = useTranslation()
  const { settings, rerollTwisterColor } = useApp()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-10, 10])

  const [playSwipe] = useSound('/swipe.wav', { volume: 0.5 })

  const handleDrag = (_: any, info: any) => {
    onDragChange?.(info.offset.x)
    // Haptic feedback while dragging
    if (Math.abs(info.delta.x) > 5) {
      if (Math.random() < 0.2) navigator.vibrate?.(10)
    }
  }

  const handleDragEnd = (_: any, info: any) => {
    onDragChange?.(0)
    const threshold = 100
    if (info.offset.x > threshold) {
      navigator.vibrate?.([10, 50, 10])
      playSwipe()
      onComplete()
    } else if (info.offset.x < -threshold) {
      navigator.vibrate?.([10, 50, 10])
      playSwipe()
      onFail()
    }
  }

  const category = card.statType as CardCategory
  const categoryLabel = t(category) || card.statType
  const categoryColor = CATEGORY_COLORS[category] ?? '#6B7280'
  const iconName = STAT_ICONS[category] ?? 'circle'

  const isTwister = settings.mode === 'twister'
  const twisterColorKey = isTwister ? card.description : null
  
  // Mapping of Twister color keys to hex/css colors for visual display
  const TWISTER_COLOR_MAP: Record<string, string> = {
    red: '#ef4444', blue: '#3b82f6', purple: '#a855f7', yellow: '#eab308', 
    pink: '#ec4899', green: '#22c55e', black: '#000000', white: '#ffffff', 
    orange: '#f97316', lightGreen: '#86efac', lightBlue: '#93c5fd', 
    gray: '#9ca3af', brown: '#92400e'
  }
  const displayColor = twisterColorKey ? TWISTER_COLOR_MAP[twisterColorKey] : categoryColor

  return (
    <div className="game-card-wrapper">
      <motion.div
        className="game-card"
        style={{
          x,
          rotate,
          ['--category-color' as string]: categoryColor,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
      >
        <div className="game-card-image-wrap">
          {card.imageSrc ? (
            <img src={card.imageSrc} alt="" className="game-card-image" />
          ) : (
            <div
              className="game-card-image-placeholder"
              style={{ backgroundColor: categoryColor }}
            />
          )}
        </div>
        <div className="game-card-body">
          <h3 className="game-card-title">{isTwister ? t('modeTwister') : card.title}</h3>
          {isTwister ? (
             <div className="game-card-twister-content">
               <div 
                 className="game-card-twister-blob" 
                 style={{ backgroundColor: displayColor, border: displayColor === '#ffffff' ? '1px solid #ccc' : 'none' }} 
               />
               <p className="game-card-twister-label">{t(twisterColorKey!)}</p>
             </div>
          ) : (
            <p className="game-card-desc">{card.description}</p>
          )}
          <div className="game-card-meta">
            <span className="game-card-points">{card.points} {t('points')}</span>
            <span className="game-card-level">Lv.{card.level}</span>
            <span className="game-card-tries">{card.tries} {t('tries')}</span>
          </div>
        </div>
        <div className="game-card-category-bar" style={{ backgroundColor: categoryColor }}>
          <i className={`fa-solid fa-${iconName} game-card-cat-icon`} aria-hidden />
          <span className="game-card-category-name">{categoryLabel}</span>
          <i className={`fa-solid fa-${iconName} game-card-cat-icon`} aria-hidden />
        </div>
      </motion.div>
      <div className="game-card-actions">
        <button
          type="button"
          className="game-card-btn game-card-btn-fail"
          onClick={onFail}
          aria-label={t('failChallenge')}
        >
          <i className="fa-solid fa-xmark" aria-hidden />
        </button>
        {isTwister && (
          <button
            type="button"
            className="game-card-btn game-card-btn-reroll"
            onClick={() => rerollTwisterColor(card.id)}
            aria-label={t('reroll')}
            title={t('reroll')}
          >
            <i className="fa-solid fa-rotate-right" aria-hidden />
          </button>
        )}
        <button
          type="button"
          className="game-card-btn game-card-btn-complete"
          onClick={onComplete}
          aria-label={t('completeChallenge')}
        >
          <i className="fa-solid fa-check" aria-hidden />
        </button>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { motion, useIsPresent, useMotionValue, useTransform, type MotionValue, type PanInfo } from 'framer-motion'
import { Flame, Timer } from 'lucide-react'
import type { Card } from '../types'
import { CATEGORY_COLORS, CATEGORY_ICONS, TWISTER_COLOR_VALUES } from '../constants/categories'
import { useTranslation } from '../hooks/useTranslation'
import { CardArt } from './CardArt'
import { Hold } from './Hold'
import './GameCard.css'

const SWIPE_THRESHOLD = 100

const cardVariants = {
  enter: { scale: 0.92, y: 18, opacity: 0 },
  center: { scale: 1, y: 0, opacity: 1 },
  exit: (direction: number) =>
    direction === 0
      ? { y: 70, scale: 0.9, opacity: 0, transition: { duration: 0.2 } }
      : {
          x: direction * Math.max(window.innerWidth, 500),
          rotate: direction * 16,
          transition: { duration: 0.3, ease: 'easeIn' as const },
        },
}

interface GameCardProps {
  card: Card
  timerSeconds: number | null
  paused: boolean
  dragOffset: MotionValue<number>
  onComplete: () => void
  onFail: () => void
}

export function GameCard({ card, timerSeconds, paused, dragOffset, onComplete, onFail }: GameCardProps) {
  const { t } = useTranslation()
  const isPresent = useIsPresent()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-9, 9])
  const doneStamp = useTransform(x, [24, SWIPE_THRESHOLD], [0, 1])
  const failStamp = useTransform(x, [-SWIPE_THRESHOLD, -24], [1, 0])

  const timeLeft = useCountdown(timerSeconds, paused || !isPresent, onFail)

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    dragOffset.set(0)
    if (info.offset.x > SWIPE_THRESHOLD) onComplete()
    else if (info.offset.x < -SWIPE_THRESHOLD) onFail()
  }

  const isTwister = card.mode === 'twister'
  const category = card.statType
  const color = isTwister ? '#FFF8E9' : CATEGORY_COLORS[category]
  const Icon = CATEGORY_ICONS[category]
  const lowTime = timeLeft !== null && timeLeft <= 5

  return (
    <motion.article
      className="game-card"
      custom={0}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      style={{ x, rotate, ['--category-color' as string]: color }}
      drag={isPresent ? 'x' : false}
      dragSnapToOrigin
      dragElastic={0.75}
      onDrag={(_, info) => dragOffset.set(info.offset.x)}
      onDragEnd={handleDragEnd}
    >
      <div className="game-card-art">
        <CardArt color={color} seed={card.id} />
        <span className="game-card-category">
          {!isTwister && <Icon size={16} strokeWidth={3} aria-hidden />}
          {isTwister ? t('modeTwister') : t(category)}
        </span>
        <span className="game-card-points">+{card.points}</span>

        {timeLeft !== null && (
          <span className={`game-card-countdown ${lowTime ? 'low' : ''}`} role="timer">
            <Timer size={24} strokeWidth={3} aria-hidden />
            {Math.ceil(timeLeft)}
          </span>
        )}
        {isTwister && timeLeft === null && (
          <Hold size="clamp(96px, 28dvh, 210px)" color={TWISTER_COLOR_VALUES[card.description]} className="game-card-twister-hold" />
        )}
      </div>

      {timeLeft !== null && timerSeconds !== null && (
        <div className="game-card-timer" aria-hidden>
          <div
            className={`game-card-timer-bar ${lowTime ? 'low' : ''}`}
            style={{ transform: `scaleX(${timeLeft / timerSeconds})` }}
          />
        </div>
      )}

      <div className="game-card-body">
        {isTwister ? (
          <>
            <h2 className="game-card-title">{t(card.description)}</h2>
            <p className="game-card-desc">{t('twisterPrompt')}</p>
          </>
        ) : (
          <>
            <h2 className="game-card-title">{card.title}</h2>
            <p className="game-card-desc">{card.description}</p>
          </>
        )}

        <dl className="game-card-stats">
          <div>
            <dt>{t('difficulty')}</dt>
            <dd className="game-card-level" aria-label={t(`level${card.level}`)}>
              {[1, 2, 3].map((level) => (
                <Flame
                  key={level}
                  size={18}
                  strokeWidth={2.75}
                  className={level <= card.level ? 'on' : ''}
                  aria-hidden
                />
              ))}
            </dd>
          </div>
          <div>
            <dt>{t('tries')}</dt>
            <dd>{card.tries}</dd>
          </div>
        </dl>
      </div>

      <motion.span className="game-card-stamp done" style={{ opacity: doneStamp }} aria-hidden>
        {t('stampDone')}
      </motion.span>
      <motion.span className="game-card-stamp fail" style={{ opacity: failStamp }} aria-hidden>
        {t('stampFail')}
      </motion.span>
    </motion.article>
  )
}

/** Seconds left on the challenge; calls onTimeUp once when it reaches zero. */
function useCountdown(seconds: number | null, paused: boolean, onTimeUp: () => void) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const remaining = useRef(seconds ?? 0)
  const timeUpHandler = useRef(onTimeUp)

  useEffect(() => {
    timeUpHandler.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    if (seconds === null || paused) return
    let last = performance.now()
    const timer = setInterval(() => {
      const now = performance.now()
      remaining.current = Math.max(0, remaining.current - (now - last) / 1000)
      last = now
      setTimeLeft(remaining.current)
      if (remaining.current === 0) {
        clearInterval(timer)
        timeUpHandler.current()
      }
    }, 100)
    return () => clearInterval(timer)
  }, [seconds, paused])

  return timeLeft
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { Check, Flag, Flame, RefreshCw, Trophy, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { GameCard } from '../components/GameCard'
import { Hold } from '../components/Hold'
import { Modal } from '../components/Modal'
import { MAX_FAIL_PENALTY, REROLL_COST, rankScores } from '../game/logic'
import { readableOn } from '../utils/color'
import type { Player } from '../types'
import './GameScreen.css'

const TURN_OVERLAY_MS = 1300
const SCORE_POP_MS = 900
const HOLD_COLORS = ['#FF5E5E', '#FFE066', '#94D4FF', '#FF96E6', '#AEFF96']

const vibrate = (pattern: number | number[]) => navigator.vibrate?.(pattern)

interface ScorePop {
  id: number
  value: number
}

export function GameScreen() {
  const { t } = useTranslation()
  const {
    turnOrder,
    currentTurnIndex,
    deck,
    nextTurn,
    rerollCard,
    settings,
    endGame,
    scores,
    turnsPlayed,
    totalTurns,
    playClick,
    playSwipe,
  } = useApp()

  const currentPlayer = turnOrder[currentTurnIndex]
  const currentCard = deck[0]
  const isDuelo = settings.mode === 'duelo'
  const score = scores.find((s) => s.player.id === currentPlayer?.id)
  const streak = score?.streak ?? 0

  const [overlayPlayer, setOverlayPlayer] = useState<Player | null>(currentPlayer ?? null)
  const [showEndModal, setShowEndModal] = useState(false)
  const [showRanking, setShowRanking] = useState(false)
  const [exitDirection, setExitDirection] = useState(0)
  const [scorePop, setScorePop] = useState<ScorePop | null>(null)
  const resolving = useRef(false)

  const dragOffset = useMotionValue(0)
  const failGlow = useTransform(dragOffset, [-120, -20], [1, 0])
  const doneGlow = useTransform(dragOffset, [20, 120], [0, 1])

  const playerId = currentPlayer?.id
  useEffect(() => {
    const player = turnOrder.find((p) => p.id === playerId)
    if (!player) return
    setOverlayPlayer(player)
    const timer = setTimeout(() => setOverlayPlayer(null), TURN_OVERLAY_MS)
    return () => clearTimeout(timer)
  }, [playerId, turnOrder])

  useEffect(() => {
    resolving.current = false
  }, [currentCard?.id, turnsPlayed])

  useEffect(() => {
    if (!scorePop) return
    const timer = setTimeout(() => setScorePop(null), SCORE_POP_MS)
    return () => clearTimeout(timer)
  }, [scorePop])

  const closeEndModal = useCallback(() => setShowEndModal(false), [])
  const closeRanking = useCallback(() => setShowRanking(false), [])

  const failCost = Math.min(currentCard?.points ?? 0, MAX_FAIL_PENALTY)

  const resolveCard = useCallback(
    (completed: boolean) => {
      if (resolving.current || !currentCard) return
      resolving.current = true
      setExitDirection(completed ? 1 : -1)
      setScorePop({ id: Date.now(), value: completed ? currentCard.points : -failCost })
      playSwipe()
      if (completed) {
        vibrate(50)
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.7 },
          colors: HOLD_COLORS,
          disableForReducedMotion: true,
        })
      } else {
        vibrate([80, 40, 80])
      }
      nextTurn(completed)
    },
    [currentCard, failCost, nextTurn, playSwipe],
  )

  const handleComplete = useCallback(() => resolveCard(true), [resolveCard])
  const handleFail = useCallback(() => resolveCard(false), [resolveCard])

  if (!currentPlayer || !currentCard) return null

  const handleReroll = () => {
    if (resolving.current) return
    resolving.current = true
    setExitDirection(0)
    setScorePop({ id: Date.now(), value: -REROLL_COST })
    playClick()
    rerollCard()
  }

  const accent = isDuelo ? '#FFE066' : currentPlayer.color
  const playerName = isDuelo ? t('allPlayers') : currentPlayer.nickname
  const overlayColor = isDuelo ? '#FFE066' : overlayPlayer?.color ?? accent
  const challengeNumber = turnsPlayed + 1
  const progress = totalTurns ? Math.min(1, turnsPlayed / totalTurns) : 0

  return (
    <div className="game-screen">
      <motion.div className="game-glow fail" style={{ opacity: failGlow }} aria-hidden />
      <motion.div className="game-glow done" style={{ opacity: doneGlow }} aria-hidden />

      <header className="game-hud">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setShowEndModal(true)}
          aria-label={t('endGameConfirm')}
        >
          <Flag size={20} strokeWidth={2.75} aria-hidden />
        </button>

        <div className="game-player">
          <Hold size={40} color={accent} />
          <div className="game-player-text">
            <span className="game-player-name">{playerName}</span>
            <span className="game-player-points">
              {score?.points ?? 0} {t('pointsShort')}
              {streak >= 3 && (
                <span className="game-streak" title={`${t('streak')}: ${streak}`}>
                  <Flame size={14} strokeWidth={3} aria-hidden />
                  {streak}
                </span>
              )}
            </span>
          </div>

          <AnimatePresence>
            {scorePop && (
              <motion.span
                key={scorePop.id}
                className={`game-score-pop ${scorePop.value > 0 ? 'gain' : 'loss'}`}
                initial={{ opacity: 0, y: 10, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14 }}
              >
                {scorePop.value > 0 ? `+${scorePop.value}` : `−${Math.abs(scorePop.value)}`}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={() => setShowRanking(true)}
          aria-label={t('liveRankingTitle')}
        >
          <Trophy size={20} strokeWidth={2.75} aria-hidden />
        </button>
      </header>

      <div className="game-progress">
        <span className="game-progress-label">
          {t('challenge')} {challengeNumber}
          {totalTurns > 0 && `/${totalTurns}`}
        </span>
        {totalTurns > 0 && (
          <div className="game-progress-track" aria-hidden>
            <div className="game-progress-bar" style={{ transform: `scaleX(${progress})` }} />
          </div>
        )}
      </div>

      <main className="game-stage">
        <div className="game-deck-ghost second" aria-hidden />
        <div className="game-deck-ghost first" aria-hidden />
        <AnimatePresence custom={exitDirection} initial={false}>
          <GameCard
            key={`${currentCard.id}-${turnsPlayed}`}
            card={currentCard}
            timerSeconds={settings.timedMode ? settings.timerSeconds : null}
            paused={!!overlayPlayer || showEndModal || showRanking}
            dragOffset={dragOffset}
            onComplete={handleComplete}
            onFail={handleFail}
          />
        </AnimatePresence>
      </main>

      <div className="game-actions">
        <button type="button" className="game-action fail" onClick={handleFail} aria-label={t('failChallenge')}>
          <X size={30} strokeWidth={3.5} aria-hidden />
          <span>−{failCost}</span>
        </button>
        <button type="button" className="game-action reroll" onClick={handleReroll} aria-label={t(settings.mode === 'twister' ? 'reroll' : 'rerollCard')}>
          <RefreshCw size={22} strokeWidth={3} aria-hidden />
          <span>−{REROLL_COST}</span>
        </button>
        <button type="button" className="game-action done" onClick={handleComplete} aria-label={t('completeChallenge')}>
          <Check size={30} strokeWidth={3.5} aria-hidden />
          <span>+{currentCard.points}</span>
        </button>
      </div>

      {showRanking && (
        <Modal title={t('liveRankingTitle')} onClose={closeRanking}>
          <ol className="game-ranking">
            {rankScores(scores).map((entry, index) => (
              <li key={entry.player.id} className="game-ranking-item">
                <span className="game-ranking-position">{index + 1}</span>
                <Hold size={32} color={entry.player.color} />
                <span className="game-ranking-name">{entry.player.nickname}</span>
                <span className="game-ranking-points">{entry.points} {t('pointsShort')}</span>
              </li>
            ))}
          </ol>
        </Modal>
      )}

      {showEndModal && (
        <Modal title={t('endGameConfirm')} onClose={closeEndModal}>
          <p className="game-end-text">{t('endGameHint')}</p>
          <div className="game-end-actions">
            <button type="button" className="btn btn-quiet" onClick={closeEndModal}>{t('cancel')}</button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                closeEndModal()
                endGame()
              }}
            >
              {t('confirm')}
            </button>
          </div>
        </Modal>
      )}

      <AnimatePresence initial={false}>
        {overlayPlayer && (
          <motion.button
            key={overlayPlayer.id}
            type="button"
            className="game-turn-overlay"
            style={{ backgroundColor: overlayColor, color: readableOn(overlayColor) }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOverlayPlayer(null)}
          >
            <span className="game-turn-label">{t('yourTurn')}</span>
            <motion.span
              className="game-turn-name"
              initial={{ scale: 0.6, rotate: -4 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 240 }}
            >
              {isDuelo ? t('allPlayers') : overlayPlayer.nickname}
            </motion.span>
            {!isDuelo && (
              <span className="game-turn-points">
                {scores.find((s) => s.player.id === overlayPlayer.id)?.points ?? 0} {t('points')}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

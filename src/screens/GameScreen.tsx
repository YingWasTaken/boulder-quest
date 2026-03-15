import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { GameCard } from '../components/GameCard'
import { useVictory } from '../hooks/useVictory'
import './GameScreen.css'

export function GameScreen() {
  const { t } = useTranslation()
  const {
    turnOrder,
    currentTurnIndex,
    deck,
    nextTurn,
    settings,
    endGameInfinite,
    scores,
  } = useApp()
  const { triggerConfetti } = useVictory()
  const [glowDragX, setGlowDragX] = useState(0)
  const [showEndModal, setShowEndModal] = useState(false)
  const [overlayPlayer, setOverlayPlayer] = useState<typeof currentPlayer | null>(null)

  const currentPlayer = turnOrder[currentTurnIndex]
  const currentCard = deck[0]
  const isInfinite = settings.mode === 'infinite'
  const currentScore = scores.find((s) => s.player.id === currentPlayer?.id)
  const streak = currentScore?.streak || 0

  useEffect(() => {
    if (currentPlayer) {
      setOverlayPlayer(currentPlayer)
      const timer = setTimeout(() => setOverlayPlayer(null), 1500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer])

  const handleDragChange = useCallback((dx: number) => {
    setGlowDragX(dx)
  }, [])

  const handleEndGame = () => {
    setShowEndModal(false)
    endGameInfinite()
  }

  if (!currentPlayer) {
    return (
      <div className="game-screen">
        <p>{t('scoreboard')}</p>
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="game-screen">
        <p>No cards in deck.</p>
      </div>
    )
  }

  const handleComplete = () => {
    triggerConfetti(currentPlayer.color)
    nextTurn(true, currentCard.points)
  }

  const handleFail = () => {
    nextTurn(false, currentCard.points)
  }

  const showGreenGlow = glowDragX > 20
  const showRedGlow = glowDragX < -20

  return (
    <div
      className="game-screen"
      style={{
        ['--player-color' as string]: settings.mode === 'duelo' ? '#4338CA' : currentPlayer.color,
      }}
    >
      {/* Glow panels on sides when swiping */}
      <div
        className={`game-glow game-glow-left ${showRedGlow ? 'active' : ''}`}
        style={{ opacity: showRedGlow ? Math.min(1, Math.abs(glowDragX) / 80) : 0 }}
        aria-hidden
      />
      <div
        className={`game-glow game-glow-right ${showGreenGlow ? 'active' : ''}`}
        style={{ opacity: showGreenGlow ? Math.min(1, glowDragX / 80) : 0 }}
        aria-hidden
      />

      <header className="game-header">
        <div className="game-turn-banner">
          <div className="game-turn-semicircle" />
          <span className="game-turn-name">
            {settings.mode === 'duelo' ? t('allPlayers') : currentPlayer.nickname}
            {settings.mode !== 'duelo' && streak >= 3 && <span title={`Racha de ${streak}`}> 🔥</span>}
          </span>
        </div>
        {isInfinite && (
          <button
            type="button"
            className="game-end-btn"
            onClick={() => setShowEndModal(true)}
            aria-label={t('endGameConfirm')}
            title={t('endGameConfirm')}
          >
            <i className="fa-solid fa-flag" aria-hidden />
          </button>
        )}
      </header>

      <div className="game-card-area">
        <GameCard
          card={currentCard}
          onComplete={handleComplete}
          onFail={handleFail}
          onDragChange={handleDragChange}
        />
      </div>

      {showEndModal && (
        <div className="game-end-modal-overlay" onClick={() => setShowEndModal(false)} role="dialog" aria-modal="true">
          <div className="game-end-modal" onClick={(e) => e.stopPropagation()}>
            <p className="game-end-modal-title">{t('endGameConfirm')}</p>
            <div className="game-end-modal-actions">
              <button type="button" className="game-end-modal-btn secondary" onClick={() => setShowEndModal(false)}>
                {t('cancel')}
              </button>
              <button type="button" className="game-end-modal-btn primary" onClick={handleEndGame}>
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {overlayPlayer && (
          <motion.div
            key={overlayPlayer.id}
            className="game-turn-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: settings.mode === 'duelo' ? '#4338CA' : overlayPlayer.color,
              zIndex: 9999,
            }}
          >
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              style={{
                color: 'white',
                fontSize: '4rem',
                fontWeight: '900',
                textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                textAlign: 'center',
                margin: 0,
                padding: '1rem'
              }}
            >
              {settings.mode === 'duelo' ? t('allPlayers') : overlayPlayer.nickname}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { CheckCheck, Share2, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { toBlob } from 'html-to-image'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { Hold } from '../components/Hold'
import { getPositions, getWinners, rankScores } from '../game/logic'
import './ScoreboardScreen.css'

const IMAGE_NAME = 'boulder-quest-results.png'

async function shareImage(blob: Blob) {
  const file = new File([blob], IMAGE_NAME, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Boulder Quest' })
    return
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = IMAGE_NAME
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

export function ScoreboardScreen() {
  const { t } = useTranslation()
  const { scores, playAgain, resetToModes, playClick, players } = useApp()
  const scoreboardRef = useRef<HTMLDivElement>(null)

  const ranked = rankScores(scores)
  const positions = getPositions(ranked)
  const winners = getWinners(scores)
  const isSolo = players.length === 1 || scores.length === 1

  useEffect(() => {
    if (!winners.length) return
    confetti({
      particleCount: 130,
      spread: 100,
      origin: { y: 0.45 },
      colors: ['#FF5E5E', '#FFE066', '#94D4FF', '#FF96E6', '#AEFF96'],
      disableForReducedMotion: true,
    })
    // Celebrate once, when the results appear.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleShare = async () => {
    if (!scoreboardRef.current) return
    playClick()
    try {
      const blob = await toBlob(scoreboardRef.current, {
        backgroundColor: '#FFF8E9',
        pixelRatio: 2,
      })
      if (blob) await shareImage(blob)
    } catch (err) {
      // Closing the system share sheet also lands here.
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error('Error sharing results:', err)
      }
    }
  }

  const headline = isSolo
    ? t('finalResult')
    : winners.length === 1
      ? t('winnerIs').replace('{name}', winners[0].player.nickname)
      : winners.length > 1
        ? t('tie')
        : t('scoreboard')

  return (
    <div className="page scoreboard-screen">
      <div ref={scoreboardRef} className="scoreboard-capture">
        <div className="scoreboard-hero">
          <Hold size={84} color={winners.length === 1 ? winners[0].player.color : undefined} />
          <h1 className="scoreboard-title">{headline}</h1>
        </div>

        <ol className="scoreboard-list">
          {ranked.map((entry, index) => (
            <li key={entry.player.id} className={`scoreboard-item ${positions[index] === 1 ? 'first' : ''}`}>
              <span className="scoreboard-rank">{positions[index]}</span>
              <Hold size={40} color={entry.player.color} />
              <div className="scoreboard-info">
                <span className="scoreboard-name">{entry.player.nickname}</span>
                <span className="scoreboard-meta">
                  <CheckCheck size={15} strokeWidth={3} aria-label={t('completedChallenges')} /> {entry.completed}
                  <X size={15} strokeWidth={3} aria-label={t('failedChallenges')} /> {entry.failed}
                </span>
              </div>
              <span className="scoreboard-points">
                {entry.points}
                <small>{t('pointsShort')}</small>
              </span>
            </li>
          ))}
        </ol>
        <p className="scoreboard-brand" translate="no">Boulder Quest</p>
      </div>

      <div className="scoreboard-actions">
        <button
          type="button"
          className="btn"
          onClick={() => {
            playClick()
            playAgain()
          }}
        >
          {t('playAgain')}
        </button>
        <div className="scoreboard-secondary">
          <button type="button" className="btn btn-quiet btn-sky" onClick={handleShare}>
            <Share2 size={20} strokeWidth={2.75} aria-hidden />
            {t('shareVictory')}
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              playClick()
              resetToModes()
            }}
          >
            {t('backToMenu')}
          </button>
        </div>
      </div>
    </div>
  )
}

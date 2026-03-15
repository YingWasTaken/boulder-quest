import { useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { toPng } from 'html-to-image'
import './ScoreboardScreen.css'

export function ScoreboardScreen() {
  const { t } = useTranslation()
  const { scores, resetScoresAndPlayAgain, resetToModes, playClick } = useApp()
  const scoreboardRef = useRef<HTMLDivElement>(null)

  const sorted = [...scores].sort((a, b) => b.points - a.points)

  const handleShare = async () => {
    if (!scoreboardRef.current) return
    playClick()
    try {
      const dataUrl = await toPng(scoreboardRef.current, {
        backgroundColor: '#ffffff',
        style: {
          padding: '20px',
        }
      })
      const link = document.createElement('a')
      link.download = `boulder-quest-results.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Error sharing results:', err)
    }
  }

  return (
    <div className="scoreboard-screen">
      <div 
        ref={scoreboardRef} 
        className="scoreboard-capture-area"
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '1rem',
          border: 'var(--border-width) solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}
      >
        <img src="/logo.png" alt="Boulder Quest" style={{ width: '120px', marginBottom: '1rem', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
        <h1 className="scoreboard-title">{t('scoreboard')}</h1>
        <ul className="scoreboard-list" style={{ width: '100%' }}>
          {sorted.map((entry, i) => (
            <li 
              key={entry.player.id} 
              className="scoreboard-item"
            >
              <span className="scoreboard-rank">{i + 1}</span>
              <div
                className="scoreboard-avatar"
                style={{ backgroundColor: entry.player.color }}
              />
              <div className="scoreboard-info">
                <span className="scoreboard-name">{entry.player.nickname}</span>
                <span className="scoreboard-meta">
                  {entry.completed} ✓ / {entry.failed} ✕
                </span>
              </div>
              <span className="scoreboard-points">{entry.points}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="scoreboard-actions">
        <button
          type="button"
          className="scoreboard-btn scoreboard-btn-primary"
          onClick={handleShare}
          style={{ backgroundColor: '#10B981', color: '#fff' }}
        >
          <i className="fa-solid fa-share-nodes" style={{ marginRight: '8px' }}></i>
          {t('shareVictory')}
        </button>

        <button
          type="button"
          className="scoreboard-btn scoreboard-btn-primary"
          onClick={() => {
            playClick()
            resetScoresAndPlayAgain()
          }}
        >
          {t('playAgain')}
        </button>
        
        <button
          type="button"
          className="scoreboard-btn scoreboard-btn-secondary"
          onClick={() => {
            playClick()
            resetToModes()
          }}
        >
          {t('backToMenu')}
        </button>
      </div>
    </div>
  )
}

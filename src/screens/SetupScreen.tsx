import { useEffect, useState } from 'react'
import { ArrowRight, Plus, Settings, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { AddPlayerModal } from '../components/AddPlayerModal'
import { Hold } from '../components/Hold'
import { SettingsModal } from '../components/SettingsModal'
import { PLAYER_COLORS, type Player } from '../types'
import './SetupScreen.css'

const UNDO_MS = 5000

export function SetupScreen() {
  const { t } = useTranslation()
  const { setScreen, players, removePlayer, restorePlayer, playClick } = useApp()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [removed, setRemoved] = useState<{ player: Player; index: number } | null>(null)

  useEffect(() => {
    if (!removed) return
    const timer = setTimeout(() => setRemoved(null), UNDO_MS)
    return () => clearTimeout(timer)
  }, [removed])

  const canAddPlayer = players.length < PLAYER_COLORS.length

  return (
    <div className="page setup-screen">
      <header className="setup-header">
        <Hold size={46} className="setup-logo" />
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            playClick()
            setShowSettings(true)
          }}
          aria-label={t('settings')}
        >
          <Settings size={22} strokeWidth={2.75} aria-hidden />
        </button>
      </header>

      <h1 className="setup-title">{t('whoPlays')}</h1>

      {players.length === 0 && (
        <div className="setup-empty">
          <Hold size={72} color="#FFF8E9" />
          <p>{t('noPlayersYet')}</p>
        </div>
      )}

      <ul className="setup-players">
        {players.map((player) => (
          <li key={player.id} className="setup-player">
            <Hold size={46} color={player.color} />
            <span className="setup-player-name">{player.nickname}</span>
            <button
              type="button"
              className="setup-player-remove"
              onClick={() => {
                playClick()
                setRemoved({ player, index: players.indexOf(player) })
                removePlayer(player.id)
              }}
              aria-label={`${t('remove')}: ${player.nickname}`}
            >
              <X size={20} strokeWidth={3} aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {canAddPlayer && (
        <button
          type="button"
          className="setup-add"
          onClick={() => {
            playClick()
            setShowAddModal(true)
          }}
        >
          <Plus size={24} strokeWidth={3} aria-hidden />
          {t('addPlayer')}
        </button>
      )}

      <div className="page-footer">
        <div className="setup-undo-slot" aria-live="polite">
          {removed && (
            <div className="setup-undo">
              <span>{t('playerRemoved').replace('{name}', removed.player.nickname)}</span>
              <button
                type="button"
                onClick={() => {
                  playClick()
                  restorePlayer(removed.player, removed.index)
                  setRemoved(null)
                }}
              >
                {t('undo')}
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          className="btn"
          disabled={players.length === 0}
          onClick={() => {
            playClick()
            setScreen('modes')
          }}
        >
          {t('start')}
          <ArrowRight size={24} strokeWidth={3} aria-hidden />
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {showAddModal && <AddPlayerModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

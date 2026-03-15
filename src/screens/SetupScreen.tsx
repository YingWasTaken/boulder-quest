import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { AddPlayerModal } from '../components/AddPlayerModal'
import { PlayerChip } from '../components/PlayerChip'
import { Modal } from '../components/Modal'
import { LanguageDropdown } from '../components/LanguageDropdown'
import './SetupScreen.css'

export function SetupScreen() {
  const { t } = useTranslation()
  const { setScreen, players, removePlayer, playClick } = useApp()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleStart = () => {
    playClick()
    setScreen('modes')
  }

  return (
    <div className="setup-screen">
      <header className="setup-header">
        <LanguageDropdown />

        <img src="/logo.png" alt="Boulder Quest" className="setup-logo" />

        <button
          type="button"
          className="setup-settings-btn"
          onClick={() => {
            playClick()
            setShowSettings(!showSettings)
          }}
          aria-label={t('settings')}
          title={t('settings')}
        >
          ⚙
        </button>
      </header>

      {showSettings && (
        <Modal title={t('settings')} onClose={() => setShowSettings(false)}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
            <a
              href="https://discord.gg/WwGSacHA8d"
              target="_blank"
              rel="noopener noreferrer"
              className="setup-discord-btn"
              style={{
                backgroundColor: '#5865F2',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fa-brands fa-discord" aria-hidden /> {t('discordMock')}
            </a>
          </div>
        </Modal>
      )}

      <h2 className="setup-title">{t('whoPlays')}</h2>

      <button
        type="button"
        className="setup-add-btn"
        onClick={() => {
          playClick()
          setShowAddModal(true)
        }}
        aria-label={t('addPlayer')}
      >
        +
      </button>

      <div className="setup-players">
        {players.map((player) => (
          <PlayerChip
            key={player.id}
            player={player}
            onRemove={() => {
              playClick()
              removePlayer(player.id)
            }}
          />
        ))}
      </div>

      <button
        type="button"
        className="setup-start-btn"
        disabled={players.length === 0}
        onClick={handleStart}
      >
        {t('start')}
      </button>

      {showAddModal && (
        <AddPlayerModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => { }}
        />
      )}
    </div>
  )
}

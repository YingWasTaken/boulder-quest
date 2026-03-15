import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { ModeModal } from '../components/ModeModal'
import { LanguageDropdown } from '../components/LanguageDropdown'
import type { GameMode } from '../types'
import './ModesScreen.css'

const MODES: { key: GameMode; titleKey: string; descKey: string; icon: string }[] = [
  { key: 'infinite', titleKey: 'modeInfinite', descKey: 'modeInfiniteDesc', icon: 'infinity' },
  { key: 'allVsAll', titleKey: 'modeAllVsAll', descKey: 'modeAllVsAllDesc', icon: 'user-group' },
  { key: 'duelo', titleKey: 'modeDuelo', descKey: 'modeDueloDesc', icon: 'bolt' },
  { key: 'twister', titleKey: 'modeTwister', descKey: 'modeTwisterDesc', icon: 'palette' },
  { key: 'speedrun', titleKey: 'modeSpeedrun', descKey: 'modeSpeedrunDesc', icon: 'clock' },
  // { key: 'teams', titleKey: 'modeTeams', descKey: 'modeTeamsDesc', icon: 'people-group' },
  // { key: 'allToOne', titleKey: 'modeAllToOne', descKey: 'modeAllToOneDesc', icon: 'bullseye' },
]

const CATEGORY_KEYS = [
  'strength', 'speed', 'resistance', 'group', 'team',
  'balance', 'technique', 'coordination', 'specialChallenges', 'flexibility',
] as const

export function ModesScreen() {
  const { t } = useTranslation()
  const {
    setScreen,
    setSettings,
    settings,
    startGame,
    players,
    playClick
  } = useApp()
  const [tab, setTab] = useState<'modes' | 'personalize'>('modes')
  const [modeModal, setModeModal] = useState<GameMode | null>(null)

  const handleModeClick = (mode: GameMode) => {
    playClick()
    setModeModal(mode)
  }

  const handlePlayMode = (mode: GameMode) => {
    playClick()
    setModeModal(null)
    setSettings({ timedMode: mode === 'speedrun' })
    startGame(mode)
  }

  const toggleCategory = (cat: (typeof CATEGORY_KEYS)[number]) => {
    playClick()
    const next = settings.categories.includes(cat)
      ? settings.categories.filter((c) => c !== cat)
      : [...settings.categories, cat]
    setSettings({ categories: next })
  }

  return (
    <div className="modes-screen">
      <header className="modes-header">
        <button
          type="button"
          className="modes-back"
          onClick={() => {
            playClick()
            setScreen('setup')
          }}
          aria-label={t('backToSetup')}
        >
          ← {t('backToSetup')}
        </button>
        <LanguageDropdown />
      </header>

      <div className="modes-tabs">
        <button
          type="button"
          className={`modes-tab ${tab === 'modes' ? 'active' : ''}`}
          onClick={() => setTab('modes')}
        >
          {t('modes')}
        </button>
        <button
          type="button"
          className={`modes-tab ${tab === 'personalize' ? 'active' : ''}`}
          onClick={() => setTab('personalize')}
        >
          {t('personalize')}
        </button>
      </div>

      {tab === 'modes' && (
        <div className="modes-list">
          {MODES.map((m) => {
            const isSingleplayer = players.length === 1 && m.key === 'allVsAll'
            const title = isSingleplayer ? t('modeSingleplayer') : t(m.titleKey)
            return (
              <button
                key={m.key}
                type="button"
                className="modes-mode-btn"
                onClick={() => handleModeClick(m.key)}
              >
                <span>{title}</span>
                <i className={`fa-solid fa-${m.icon} modes-mode-icon`} aria-hidden />
              </button>
            )
          })}
        </div>
      )}

      {tab === 'personalize' && (
        <div className="modes-personalize">
          <section className="modes-section">
            <h3 className="modes-section-title">{t('rounds')}</h3>
            <div className="modes-rounds-row">
              <input
                type="number"
                min={1}
                max={20}
                value={settings.roundsPerPlayer}
                onChange={(e) =>
                  setSettings({
                    roundsPerPlayer: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                  })
                }
              />
              <span>{t('roundsPerPlayer')}</span>
            </div>
          </section>
          <section className="modes-section">
            <h3 className="modes-section-title">{t('difficulty')}</h3>
            <div className="modes-difficulty-row">
              <button
                type="button"
                className={`modes-diff-btn ${settings.difficultyFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSettings({ difficultyFilter: 'all' })}
              >
                {t('allDifficulties')}
              </button>
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`modes-diff-btn ${settings.difficultyFilter === lvl ? 'active' : ''}`}
                  onClick={() => setSettings({ difficultyFilter: lvl as 1 | 2 | 3 })}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </section>
          <section className="modes-section">
            <h3 className="modes-section-title">{t('categories')}</h3>
            <div className="modes-categories">
              {CATEGORY_KEYS.map((key) => (
                <label key={key} className="modes-cat-label">
                  <input
                    type="checkbox"
                    checked={settings.categories.includes(key)}
                    onChange={() => toggleCategory(key)}
                  />
                  <span>{t(key)}</span>
                </label>
              ))}
            </div>
          </section>

          {settings.mode === 'speedrun' && (
            <section className="modes-section">
              <h3 className="modes-section-title">{t('speedrunMode')}</h3>
              <div className="modes-speedrun-row">
                <div className="modes-timer-input">
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={settings.timerSeconds}
                    onChange={(e) => setSettings({ timerSeconds: Number(e.target.value) })}
                  />
                  <span>{t('seconds')}</span>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {modeModal && (() => {
        const modeDef = MODES.find((m) => m.key === modeModal)!
        const isSingleplayer = players.length === 1 && modeModal === 'allVsAll'
        const title = isSingleplayer ? t('modeSingleplayer') : t(modeDef.titleKey)
        return (
          <ModeModal
            title={title}
            description={t(modeDef.descKey)}
            playLabel={t('playMode')}
            onPlay={() => handlePlayMode(modeModal)}
            onClose={() => setModeModal(null)}
          />
        )
      })()}
    </div>
  )
}

import { useState } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  Settings,
  Infinity as InfinityIcon,
  Palette,
  Swords,
  Timer,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { useApp, getCardsPool } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/categories'
import { SettingsModal } from '../components/SettingsModal'
import { useBackHandler } from '../native/back'
import { Modal } from '../components/Modal'
import { Stepper } from '../components/Stepper'
import { filterCards } from '../game/logic'
import { ALL_CATEGORIES, type CardCategory, type GameMode } from '../types'
import './ModesScreen.css'

interface ModeDefinition {
  key: GameMode
  titleKey: string
  descKey: string
  Icon: LucideIcon
  color: string
}

const MODES: ModeDefinition[] = [
  { key: 'allVsAll', titleKey: 'modeAllVsAll', descKey: 'modeAllVsAllDesc', Icon: UsersRound, color: '#FF7A70' },
  { key: 'infinite', titleKey: 'modeInfinite', descKey: 'modeInfiniteDesc', Icon: InfinityIcon, color: '#94D4FF' },
  { key: 'duelo', titleKey: 'modeDuelo', descKey: 'modeDueloDesc', Icon: Swords, color: '#FFE066' },
  { key: 'twister', titleKey: 'modeTwister', descKey: 'modeTwisterDesc', Icon: Palette, color: '#FF96E6' },
  { key: 'speedrun', titleKey: 'modeSpeedrun', descKey: 'modeSpeedrunDesc', Icon: Timer, color: '#AEFF96' },
]

const MIN_ROUNDS = 1
const MAX_ROUNDS = 20
const MIN_TIMER = 10
const MAX_TIMER = 120
const TIMER_STEP = 5

const SOLO_BLOCKED: CardCategory[] = ['team', 'group']

export function ModesScreen() {
  const { t } = useTranslation()
  const { setScreen, setSettings, settings, startGame, players, playClick, lang } = useApp()
  const [tab, setTab] = useState<'modes' | 'personalize'>('modes')
  const [selected, setSelected] = useState<GameMode | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  useBackHandler(() => setScreen('setup'))

  const isSolo = players.length === 1
  const visibleModes = MODES.filter((mode) => !(isSolo && mode.key === 'duelo'))
  const modeTitle = (mode: ModeDefinition) =>
    isSolo && mode.key === 'allVsAll' ? t('modeSingleplayer') : t(mode.titleKey)

  const availableCards = filterCards(getCardsPool(lang), settings, players.length).length
  const selectedMode = MODES.find((mode) => mode.key === selected)

  const toggleCategory = (category: CardCategory) => {
    playClick()
    const isOn = settings.categories.includes(category)
    if (isOn && settings.categories.length === 1) return // Keep at least one active.
    setSettings({
      categories: isOn
        ? settings.categories.filter((c) => c !== category)
        : [...settings.categories, category],
    })
  }

  const roundsStepper = (
    <Stepper
      label={t('rounds')}
      unit={t('roundsPerPlayer')}
      value={settings.roundsPerPlayer}
      min={MIN_ROUNDS}
      max={MAX_ROUNDS}
      onChange={(roundsPerPlayer) => setSettings({ roundsPerPlayer })}
    />
  )

  const timerStepper = (
    <Stepper
      label={t('timerPerCard')}
      unit={t('seconds')}
      value={settings.timerSeconds}
      min={MIN_TIMER}
      max={MAX_TIMER}
      step={TIMER_STEP}
      onChange={(timerSeconds) => setSettings({ timerSeconds })}
    />
  )

  return (
    <div className="page modes-screen">
      <header className="modes-header">
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            playClick()
            setScreen('setup')
          }}
          aria-label={t('backToSetup')}
        >
          <ArrowLeft size={22} strokeWidth={3} aria-hidden />
        </button>
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

      <div className="modes-tabs" role="tablist">
        {(['modes', 'personalize'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`modes-tab ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {tab === 'modes' && (
        <div className="modes-list">
          {visibleModes.map((mode) => (
            <button
              key={mode.key}
              type="button"
              className="mode-card"
              onClick={() => {
                playClick()
                setSelected(mode.key)
              }}
            >
              <span className="mode-card-icon" style={{ backgroundColor: mode.color }}>
                <mode.Icon size={28} strokeWidth={2.75} aria-hidden />
              </span>
              <span className="mode-card-text">
                <span className="mode-card-title">{modeTitle(mode)}</span>
                <span className="mode-card-desc">{t(mode.descKey)}</span>
              </span>
              <ChevronRight size={24} strokeWidth={3} className="mode-card-arrow" aria-hidden />
            </button>
          ))}
        </div>
      )}

      {tab === 'personalize' && (
        <div className="modes-personalize">
          <section className="modes-section">
            <h2 className="modes-section-title">{t('rounds')}</h2>
            {roundsStepper}
          </section>

          <section className="modes-section">
            <h2 className="modes-section-title">{t('timerPerCard')}</h2>
            {timerStepper}
          </section>

          <section className="modes-section">
            <h2 className="modes-section-title">{t('difficulty')}</h2>
            <div className="modes-difficulty">
              {(['all', 1, 2, 3] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={settings.difficultyFilter === level}
                  className={`modes-difficulty-btn ${settings.difficultyFilter === level ? 'active' : ''}`}
                  onClick={() => {
                    playClick()
                    setSettings({ difficultyFilter: level })
                  }}
                >
                  {level === 'all' ? t('allDifficulties') : t(`level${level}`)}
                </button>
              ))}
            </div>
          </section>

          <section className="modes-section">
            <div className="modes-section-heading">
              <h2 className="modes-section-title">{t('categories')}</h2>
              <span className="modes-card-count">
                {availableCards} {t('challenges')}
              </span>
            </div>
            <div className="modes-categories">
              {ALL_CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category]
                const isOn = settings.categories.includes(category)
                const blocked = isSolo && SOLO_BLOCKED.includes(category)
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={isOn && !blocked}
                    disabled={blocked}
                    title={blocked ? t('needsTwoPlayers') : undefined}
                    className={`modes-category ${isOn && !blocked ? 'active' : ''}`}
                    style={{ ['--category-color' as string]: CATEGORY_COLORS[category] }}
                    onClick={() => toggleCategory(category)}
                  >
                    <Icon size={18} strokeWidth={2.75} aria-hidden />
                    {t(category)}
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {selectedMode && (
        <Modal
          title={modeTitle(selectedMode)}
          primaryButtonLabel={t('playMode')}
          onPrimary={() => {
            playClick()
            setSelected(null)
            startGame(selectedMode.key)
          }}
          onClose={() => setSelected(null)}
        >
          <p className="mode-sheet-desc">{t(selectedMode.descKey)}</p>
          {selectedMode.key !== 'infinite' && <div className="mode-sheet-option">{roundsStepper}</div>}
          {selectedMode.key === 'speedrun' && <div className="mode-sheet-option">{timerStepper}</div>}
        </Modal>
      )}
    </div>
  )
}

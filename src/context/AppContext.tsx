import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import useSound from 'use-sound'
import type { Card, GameMode, GameScreen, GameSettings, Lang, Player, PlayerColor } from '../types'
import * as game from '../game/logic'
import { loadState, saveState } from '../game/storage'
import type { GameState } from '../game/logic'

const staticCardsModules = import.meta.glob('../data/cards_*.json', { eager: true })
const dynamicCardsModules = import.meta.glob('../data/dynamic_cards_*.json', { eager: true })

function loadCards(modules: Record<string, unknown>, prefix: string, lang: string): Card[] {
  const found = (modules[`../data/${prefix}_${lang}.json`] ?? modules[`../data/${prefix}_es.json`]) as
    | { default?: Card[] }
    | undefined
  return found?.default ?? []
}

export function getCardsPool(lang: string): Card[] {
  return [
    ...loadCards(staticCardsModules, 'cards', lang),
    ...game.generateDynamicCards(loadCards(dynamicCardsModules, 'dynamic_cards', lang), lang),
  ]
}

type AppContextValue = GameState & {
  setLang: (lang: Lang) => void
  setScreen: (screen: GameScreen) => void
  addPlayer: (nickname: string, color: PlayerColor) => void
  removePlayer: (id: string) => void
  restorePlayer: (player: Player, index: number) => void
  setSettings: (settings: Partial<GameSettings>) => void
  toggleSound: () => void
  startGame: (mode: GameMode) => void
  nextTurn: (completed: boolean) => void
  rerollCard: () => void
  endGame: () => void
  playAgain: () => void
  resetToModes: () => void
  playClick: () => void
  playSwipe: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(loadState)
  const [playClick] = useSound('/click.wav', { volume: 0.5, soundEnabled: state.soundOn })
  const [playSwipe] = useSound('/swipe.wav', { volume: 0.5, soundEnabled: state.soundOn })

  useEffect(() => saveState(state), [state])

  useEffect(() => {
    document.documentElement.lang = state.lang
  }, [state.lang])

  const actions = useMemo(() => {
    const update = (change: (s: GameState) => GameState) => setState(change)
    return {
      setLang: (lang: Lang) => update((s) => ({ ...s, lang })),
      setScreen: (screen: GameScreen) => update((s) => ({ ...s, screen })),
      addPlayer: (nickname: string, color: PlayerColor) => {
        const id = `p-${Date.now()}-${Math.random().toString(36).slice(2)}`
        update((s) => ({
          ...s,
          players: [...s.players, { id, nickname: nickname.trim(), color }],
        }))
      },
      removePlayer: (id: string) =>
        update((s) => ({ ...s, players: s.players.filter((p) => p.id !== id) })),
      restorePlayer: (player: Player, index: number) =>
        update((s) => {
          if (s.players.some((p) => p.id === player.id || p.color === player.color)) return s
          const players = [...s.players]
          players.splice(Math.min(index, players.length), 0, player)
          return { ...s, players }
        }),
      setSettings: (partial: Partial<GameSettings>) =>
        update((s) => ({ ...s, settings: { ...s.settings, ...partial } })),
      toggleSound: () => update((s) => ({ ...s, soundOn: !s.soundOn })),
      startGame: (mode: GameMode) =>
        update((s) => game.startGame(s, mode, getCardsPool(s.lang))),
      nextTurn: (completed: boolean) =>
        update((s) => game.playTurn(s, completed, getCardsPool(s.lang))),
      rerollCard: () => update((s) => game.rerollCard(s, getCardsPool(s.lang))),
      endGame: () => update((s) => ({ ...s, screen: 'scoreboard' })),
      playAgain: () =>
        update((s) => game.startGame(s, s.settings.mode, getCardsPool(s.lang))),
      resetToModes: () =>
        update((s) => ({
          ...s,
          screen: 'modes',
          turnOrder: [],
          currentTurnIndex: 0,
          deck: [],
          roundCount: 0,
          turnsPlayed: 0,
          totalTurns: 0,
          scores: [],
          usedTwisterColors: [],
        })),
    }
  }, [])

  const playClickSound = useCallback(() => playClick(), [playClick])
  const playSwipeSound = useCallback(() => playSwipe(), [playSwipe])

  const value = useMemo<AppContextValue>(
    () => ({ ...state, ...actions, playClick: playClickSound, playSwipe: playSwipeSound }),
    [state, actions, playClickSound, playSwipeSound],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

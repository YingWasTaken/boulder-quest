import { defaultSettings, initialGameState, type GameState } from './logic'

const STORAGE_KEY = 'boulder-quest:v1'
const SUPPORTED_LANGS = ['es', 'en', 'fr', 'ja', 'pt']

function preferredLanguage(): string {
  const languages = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language]
  const match = languages
    .map((tag) => tag.toLowerCase().split('-')[0])
    .find((code) => SUPPORTED_LANGS.includes(code))
  return match ?? initialGameState.lang
}

export function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Private mode or full storage: the game still works, it just won't resume.
  }
}

/** Restores the last session so a reload or a locked phone doesn't lose the game. */
export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...initialGameState, lang: preferredLanguage() }
    const saved = JSON.parse(raw) as Partial<GameState>
    if (!Array.isArray(saved.players)) return initialGameState

    const state: GameState = {
      ...initialGameState,
      ...saved,
      settings: { ...defaultSettings, ...saved.settings },
    }
    const inGame = state.screen === 'game' && state.deck.length > 0 && state.turnOrder.length > 0
    const hasResults = state.screen === 'scoreboard' && state.scores.length > 0
    return inGame || hasResults ? state : { ...state, screen: 'setup' }
  } catch {
    return initialGameState
  }
}

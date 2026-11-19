import type {
  Card,
  CardCategory,
  GameMode,
  GameScreen,
  GameSettings,
  Lang,
  Player,
  PlayerScore,
  TwisterColor,
} from '../types'
import { ALL_CATEGORIES } from '../types'

export const MAX_FAIL_PENALTY = 2
export const REROLL_COST = 1

export interface GameState {
  lang: Lang
  screen: GameScreen
  players: Player[]
  settings: GameSettings
  turnOrder: Player[]
  currentTurnIndex: number
  deck: Card[]
  roundCount: number
  turnsPlayed: number
  /** Total turns in the game; 0 when the game has no limit. */
  totalTurns: number
  scores: PlayerScore[]
  usedTwisterColors: TwisterColor[]
  soundOn: boolean
}

export const defaultSettings: GameSettings = {
  mode: 'allVsAll',
  roundsPerPlayer: 5,
  difficultyFilter: 'all',
  categories: [...ALL_CATEGORIES],
  timedMode: false,
  timerSeconds: 30,
}

export const initialGameState: GameState = {
  lang: 'es',
  screen: 'language',
  players: [],
  settings: defaultSettings,
  turnOrder: [],
  currentTurnIndex: 0,
  deck: [],
  roundCount: 0,
  turnsPlayed: 0,
  totalTurns: 0,
  scores: [],
  usedTwisterColors: [],
  soundOn: true,
}

export const TWISTER_COLORS: TwisterColor[] = [
  'red', 'blue', 'purple', 'yellow', 'pink',
  'green', 'black', 'white', 'orange', 'lightGreen',
  'lightBlue', 'gray', 'brown',
]

const EMPTY_STATS: Record<CardCategory, number> = {
  strength: 0, speed: 0, resistance: 0, balance: 0, technique: 0,
  coordination: 0, flexibility: 0, specialChallenges: 0, group: 0, team: 0,
}

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const isSoloFriendly = (card: Card) => card.statType !== 'group' && card.statType !== 'team'

/** Cards matching the settings, ignoring the order. */
export function filterCards(pool: Card[], settings: GameSettings, playerCount: number): Card[] {
  const playable = playerCount === 1 ? pool.filter(isSoloFriendly) : pool
  return playable.filter(
    (card) =>
      settings.categories.includes(card.statType) &&
      (settings.difficultyFilter === 'all' || card.level === settings.difficultyFilter),
  )
}

/**
 * Shuffled deck for the settings. When the filters leave nothing it relaxes the
 * difficulty, then the categories, but never hands group cards to a solo player.
 */
export function buildDeck(pool: Card[], settings: GameSettings, playerCount: number): Card[] {
  const strict = filterCards(pool, settings, playerCount)
  if (strict.length) return shuffle(strict)

  const anyLevel = filterCards(pool, { ...settings, difficultyFilter: 'all' }, playerCount)
  if (anyLevel.length) return shuffle(anyLevel)

  return shuffle(playerCount === 1 ? pool.filter(isSoloFriendly) : pool)
}

function twisterCard(color: TwisterColor): Card {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: 'Twister',
    description: color, // Holds the colour key, translated when shown.
    level: 1,
    points: 2,
    statType: 'specialChallenges',
    tries: 1,
    imageSrc: null,
    mode: 'twister',
  }
}

function nextTwisterColor(used: TwisterColor[], current?: TwisterColor) {
  const fresh = TWISTER_COLORS.filter((c) => !used.includes(c) && c !== current)
  if (fresh.length) return { color: pickRandom(fresh), used }
  // Every colour has come up: start the cycle again.
  const color = pickRandom(TWISTER_COLORS.filter((c) => c !== current))
  return { color, used: [] }
}

export function getTotalTurns(mode: GameMode, playerCount: number, roundsPerPlayer: number): number {
  if (mode === 'infinite') return 0
  return mode === 'duelo' ? roundsPerPlayer : playerCount * roundsPerPlayer
}

export function startGame(state: GameState, mode: GameMode, pool: Card[]): GameState {
  if (state.players.length === 0) return state

  const settings: GameSettings = { ...state.settings, mode, timedMode: mode === 'speedrun' }
  let deck: Card[]
  let usedTwisterColors: TwisterColor[] = []

  if (mode === 'twister') {
    const { color } = nextTwisterColor([])
    deck = [twisterCard(color)]
    usedTwisterColors = [color]
  } else {
    deck = buildDeck(pool, settings, state.players.length)
  }

  return {
    ...state,
    settings,
    screen: 'game',
    turnOrder: shuffle(state.players),
    currentTurnIndex: 0,
    deck,
    roundCount: 0,
    turnsPlayed: 0,
    totalTurns: getTotalTurns(mode, state.players.length, settings.roundsPerPlayer),
    scores: state.players.map((player) => ({
      player,
      points: 0,
      completed: 0,
      failed: 0,
      streak: 0,
      categoryStats: { ...EMPTY_STATS },
    })),
    usedTwisterColors,
  }
}

function scoreResult(score: PlayerScore, completed: boolean, card: Card): PlayerScore {
  const delta = completed ? card.points : -Math.min(card.points, MAX_FAIL_PENALTY)
  return {
    ...score,
    points: Math.max(0, score.points + delta),
    completed: score.completed + (completed ? 1 : 0),
    failed: score.failed + (completed ? 0 : 1),
    streak: completed ? score.streak + 1 : 0,
    categoryStats: completed
      ? { ...score.categoryStats, [card.statType]: score.categoryStats[card.statType] + 1 }
      : score.categoryStats,
  }
}

function drawNextCard(state: GameState, pool: Card[]) {
  if (state.settings.mode === 'twister') {
    const current = state.deck[0]?.description as TwisterColor | undefined
    const { color, used } = nextTwisterColor(state.usedTwisterColors, current)
    return { deck: [twisterCard(color)], usedTwisterColors: [...used, color] }
  }
  const rest = state.deck.slice(1)
  return {
    deck: rest.length ? rest : buildDeck(pool, state.settings, state.players.length),
    usedTwisterColors: state.usedTwisterColors,
  }
}

export function playTurn(state: GameState, completed: boolean, pool: Card[]): GameState {
  const card = state.deck[0]
  const player = state.turnOrder[state.currentTurnIndex]
  if (!card || !player || state.screen !== 'game') return state

  const isDuelo = state.settings.mode === 'duelo'
  const scores = state.scores.map((score) =>
    isDuelo || score.player.id === player.id ? scoreResult(score, completed, card) : score,
  )

  const nextIndex = isDuelo ? 0 : (state.currentTurnIndex + 1) % state.turnOrder.length
  const roundCount = nextIndex === 0 ? state.roundCount + 1 : state.roundCount
  const gameEnded =
    state.settings.mode !== 'infinite' && roundCount >= state.settings.roundsPerPlayer

  return {
    ...state,
    ...drawNextCard(state, pool),
    scores,
    currentTurnIndex: nextIndex,
    roundCount,
    turnsPlayed: state.turnsPlayed + 1,
    screen: gameEnded ? 'scoreboard' : state.screen,
  }
}

/** Swaps the current card for the next one at the cost of a point. */
export function rerollCard(state: GameState, pool: Card[]): GameState {
  const player = state.turnOrder[state.currentTurnIndex]
  if (!player || !state.deck.length) return state
  const isDuelo = state.settings.mode === 'duelo'
  return {
    ...state,
    ...drawNextCard(state, pool),
    scores: state.scores.map((score) =>
      isDuelo || score.player.id === player.id
        ? { ...score, points: Math.max(0, score.points - REROLL_COST) }
        : score,
    ),
  }
}

/** Best score first; ties are broken by the most challenges completed. */
export function rankScores(scores: PlayerScore[]): PlayerScore[] {
  return [...scores].sort((a, b) => b.points - a.points || b.completed - a.completed)
}

const isTied = (a: PlayerScore, b: PlayerScore) =>
  a.points === b.points && a.completed === b.completed

/** Podium position of each ranked score; tied players share the same one. */
export function getPositions(ranked: PlayerScore[]): number[] {
  const positions: number[] = []
  ranked.forEach((score, i) => {
    positions.push(i > 0 && isTied(score, ranked[i - 1]) ? positions[i - 1] : i + 1)
  })
  return positions
}

export function getWinners(scores: PlayerScore[]): PlayerScore[] {
  const [best] = rankScores(scores)
  if (!best || best.points === 0) return []
  return scores.filter((score) => isTied(score, best))
}

const SHARED_VARIABLES = {
  '{numero}': ['2', '3'],
  '{segundos}': ['2', '3', '5'],
  '{segundos_bloque}': ['20', '30', '45', '60'],
}

const LANG_VARIABLES: Record<string, Record<string, string[]>> = {
  es: {
    '{nivel_usuario}': ['V0', 'V1', 'V2', 'V3', 'fácil', 'medio'],
    '{color_presa}': ['rojas', 'azules', 'verdes', 'amarillas', 'negras', 'blancas'],
    '{parte_cuerpo}': ['la mano izquierda', 'la mano derecha', 'el pie izquierdo', 'el pie derecho'],
  },
  en: {
    '{nivel_usuario}': ['V0', 'V1', 'V2', 'V3', 'easy', 'medium'],
    '{color_presa}': ['red', 'blue', 'green', 'yellow', 'black', 'white'],
    '{parte_cuerpo}': ['left hand', 'right hand', 'left foot', 'right foot'],
  },
  fr: {
    '{nivel_usuario}': ['V0', 'V1', 'V2', 'V3', 'facile', 'moyen'],
    '{color_presa}': ['rouges', 'bleues', 'vertes', 'jaunes', 'noires', 'blanches'],
    '{parte_cuerpo}': ['ta main gauche', 'ta main droite', 'ton pied gauche', 'ton pied droit'],
  },
  ja: {
    '{nivel_usuario}': ['V0', 'V1', 'V2', 'V3', '簡単', '普通'],
    '{color_presa}': ['赤', '青', '緑', '黄', '黒', '白'],
    '{parte_cuerpo}': ['左手', '右手', '左足', '右足'],
  },
  pt: {
    '{nivel_usuario}': ['V0', 'V1', 'V2', 'V3', 'fácil', 'médio'],
    '{color_presa}': ['vermelhas', 'azuis', 'verdes', 'amarelas', 'pretas', 'brancas'],
    '{parte_cuerpo}': ['a tua mão esquerda', 'a tua mão direita', 'o teu pé esquerdo', 'o teu pé direito'],
  },
}

export function fillTemplate(text: string, lang: string): string {
  const variables = { ...SHARED_VARIABLES, ...(LANG_VARIABLES[lang] ?? LANG_VARIABLES.es) }
  return Object.entries(variables).reduce(
    (result, [key, options]) => result.replaceAll(key, () => pickRandom(options)),
    text,
  )
}

export function generateDynamicCards(templates: Card[], lang: string): Card[] {
  return templates.map((template) => ({
    ...template,
    description: fillTemplate(template.description, lang),
  }))
}

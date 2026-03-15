import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { Lang, GameScreen, Player, GameMode, GameSettings, Card, PlayerScore, TwisterColor } from '../types'
import { PLAYER_COLORS } from '../types'
import useSound from 'use-sound'

const staticCardsModules = import.meta.glob('../data/cards_*.json', { eager: true })
const dynamicCardsModules = import.meta.glob('../data/dynamic_cards_*.json', { eager: true })

type CardCategory = import('../types').CardCategory

interface AppState {
  lang: Lang
  screen: GameScreen
  players: Player[]
  settings: GameSettings
  selectedMode: GameMode | null
  turnOrder: Player[]
  currentTurnIndex: number
  deck: Card[]
  roundCount: number
  totalRounds: number
  scores: PlayerScore[]
  usedTwisterColors: TwisterColor[]
}

const defaultSettings: GameSettings = {
  mode: 'allVsAll',
  roundsPerPlayer: 5,
  difficultyFilter: 'all',
  categories: [
    'strength', 'speed', 'resistance', 'group', 'team',
    'balance', 'technique', 'coordination', 'specialChallenges', 'flexibility',
  ],
  timedMode: false,
  timerSeconds: 30,
}

const initialState: AppState = {
  lang: 'es',
  screen: 'language',
  players: [],
  settings: defaultSettings,
  selectedMode: null,
  turnOrder: [],
  currentTurnIndex: 0,
  deck: [],
  roundCount: 0,
  totalRounds: 0,
  scores: [],
  usedTwisterColors: [],
}

type AppContextValue = AppState & {
  setLang: (l: Lang) => void
  setScreen: (s: GameScreen) => void
  addPlayer: (nickname: string, color: (typeof PLAYER_COLORS)[number]) => void
  removePlayer: (id: string) => void
  setSettings: (s: Partial<GameSettings>) => void
  setSelectedMode: (m: GameMode | null) => void
  startGame: (mode: GameMode) => void
  nextTurn: (completed: boolean, cardPoints: number) => void
  resetToSetup: () => void
  resetToModes: () => void
  resetScoresAndPlayAgain: () => void
  endGameInfinite: () => void
  getUsedColors: () => (typeof PLAYER_COLORS)[number][]
  playClick: () => void
  rerollTwisterColor: (cardId: number) => void
  rerollCard: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function replaceVariables(text: string, lang: string): string {
  // Default to Spanish variables
  let variables: Record<string, string[]> = {
    '{nivel_usuario}': ['V0', 'V1', 'V2', 'V3', 'V4', 'fácil', 'medio'],
    '{numero}': ['1', '2', '3'],
    '{color_presa}': ['rojas', 'azules', 'verdes', 'amarillas', 'negras', 'blancas'],
    '{parte_cuerpo}': ['mano izquierda', 'mano derecha', 'pie izquierdo', 'pie derecho'],
    '{segundos}': ['5', '10', '15', '20', '30']
  }

  if (lang === 'en') {
    variables = {
      '{nivel_usuario}': ['V0', 'V1', 'V2', 'V3', 'V4', 'easy', 'medium'],
      '{numero}': ['1', '2', '3'],
      '{color_presa}': ['red', 'blue', 'green', 'yellow', 'black', 'white'],
      '{parte_cuerpo}': ['left hand', 'right hand', 'left foot', 'right foot'],
      '{segundos}': ['5', '10', '15', '20', '30']
    }
  } else if (lang === 'fr') {
    variables = {
      '{nivel_usuario}': ['V0', 'V1', 'V2', 'V3', 'V4', 'facile', 'moyen'],
      '{numero}': ['1', '2', '3'],
      '{color_presa}': ['rouges', 'bleues', 'vertes', 'jaunes', 'noires', 'blanches'],
      '{parte_cuerpo}': ['main gauche', 'main droite', 'pied gauche', 'pied droit'],
      '{segundos}': ['5', '10', '15', '20', '30']
    }
  } else if (lang === 'ja') {
    variables = {
      '{nivel_usuario}': ['V0', 'V1', 'V2', 'V3', 'V4', '簡単', '普通'],
      '{numero}': ['1', '2', '3'],
      '{color_presa}': ['赤', '青', '緑', '黄', '黒', '白'],
      '{parte_cuerpo}': ['左手', '右手', '左足', '右足'],
      '{segundos}': ['5', '10', '15', '20', '30']
    }
  } else if (lang === 'pt') {
    variables = {
      '{nivel_usuario}': ['V0', 'V1', 'V2', 'V3', 'V4', 'fácil', 'médio'],
      '{numero}': ['1', '2', '3'],
      '{color_presa}': ['vermelhas', 'azuis', 'verdes', 'amarelas', 'pretas', 'brancas'],
      '{parte_cuerpo}': ['mão esquerda', 'mão direita', 'pé esquerdo', 'pé direito'],
      '{segundos}': ['5', '10', '15', '20', '30']
    }
  }
  
  let res = text
  for (const [key, options] of Object.entries(variables)) {
    if (res.includes(key)) {
      const randomOpt = options[Math.floor(Math.random() * options.length)]
      res = res.replace(key, randomOpt)
    }
  }
  return res
}

function getCardsPool(lang: string): Card[] {
  // Encontrar el archivo correcto para el idioma actual, si no existe, usar español por defecto
  const staticModule = (staticCardsModules[`../data/cards_${lang}.json`] as any) 
    || (staticCardsModules[`../data/cards_es.json`] as any)
  const dynamicModule = (dynamicCardsModules[`../data/dynamic_cards_${lang}.json`] as any) 
    || (dynamicCardsModules[`../data/dynamic_cards_es.json`] as any)

  const staticCards = (staticModule?.default || staticModule || []) as Card[]
  const dynamicTemplates = (dynamicModule?.default || dynamicModule || []) as Card[]

  // Generate 5 dynamic cards per game based on templates
  const generated: Card[] = dynamicTemplates.map((template, index) => ({
    ...template,
    id: template.id + index * 100 + Math.floor(Math.random() * 100),
    description: replaceVariables(template.description, lang)
  }))
  return [...staticCards, ...generated]
}

const TWISTER_COLORS: TwisterColor[] = [
  'red', 'blue', 'purple', 'yellow', 'pink', 
  'green', 'black', 'white', 'orange', 'lightGreen', 
  'lightBlue', 'gray', 'brown'
]

const EMPTY_STATS: Record<CardCategory, number> = {
  strength: 0, speed: 0, resistance: 0, balance: 0, 
  technique: 0, coordination: 0, flexibility: 0, specialChallenges: 0, group: 0, team: 0
}

function getTwisterCard(id: number, color: TwisterColor): Card {
  return {
    id,
    title: 'Twister',
    description: color, // We use description to store the color key for translation
    level: 1,
    points: 2,
    statType: 'specialChallenges',
    tries: 1,
    imageSrc: null,
    mode: 'twister'
  }
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)
  const [playClickSound] = useSound('/click.wav', { volume: 0.5 })

  const setLang = useCallback((lang: Lang) => {
    playClickSound()
    setState((s) => ({ ...s, lang }))
  }, [playClickSound])

  const setScreen = useCallback((screen: GameScreen) => {
    setState((s) => ({ ...s, screen }))
  }, [])

  const addPlayer = useCallback((nickname: string, color: (typeof PLAYER_COLORS)[number]) => {
    const id = `p-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setState((s) => ({
      ...s,
      players: [...s.players, { id, nickname: nickname.trim(), color }],
    }))
  }, [])

  const removePlayer = useCallback((id: string) => {
    setState((s) => ({ ...s, players: s.players.filter((p) => p.id !== id) }))
  }, [])

  const setSettings = useCallback((partial: Partial<GameSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...partial } }))
  }, [])

  const setSelectedMode = useCallback((selectedMode: GameMode | null) => {
    playClickSound()
    setState((s) => ({ ...s, selectedMode }))
  }, [playClickSound])

  const buildDeck = useCallback((settings: GameSettings, lang: string): Card[] => {
    let list = getCardsPool(lang).filter((c) => settings.categories.includes(c.statType as CardCategory))
    if (state.players.length === 1) {
      list = list.filter(c => c.statType !== 'group' && c.statType !== 'team')
    }
    if (settings.difficultyFilter !== 'all') {
      list = list.filter((c) => c.level === settings.difficultyFilter)
    }
    return shuffle(list)
  }, [state.players.length])

  const startGame = useCallback((mode: GameMode) => {
    setState((s) => {
      if (s.players.length === 0) return s
      const settings = { ...s.settings, mode }
      const isTwister = mode === 'twister'
      const totalRounds = mode === 'infinite'
        ? 999
        : mode === 'duelo' || isTwister
          ? settings.roundsPerPlayer
          : s.players.length * settings.roundsPerPlayer
      const turnOrder = shuffle([...s.players])
      
      let deck: Card[] = []
      let initialUsed: TwisterColor[] = []
      
      if (isTwister) {
        // Generate first card
        const available = TWISTER_COLORS
        const color = available[Math.floor(Math.random() * available.length)]
        deck = [getTwisterCard(Date.now(), color)]
        initialUsed = [color]
      } else {
        deck = buildDeck(settings, s.lang)
      }

      const scores: PlayerScore[] = s.players.map((player) => ({
        player,
        points: 0,
        completed: 0,
        failed: 0,
        streak: 0,
        categoryStats: { ...EMPTY_STATS },
      }))
      return {
        ...s,
        settings,
        selectedMode: mode,
        screen: 'game',
        turnOrder,
        currentTurnIndex: 0,
        deck: deck.length ? deck : getCardsPool(s.lang),
        roundCount: 0,
        totalRounds,
        scores,
        usedTwisterColors: initialUsed,
      }
    })
  }, [buildDeck])

  const nextTurn = useCallback((completed: boolean, cardPoints: number) => {
    setState((s) => {
      const currentPlayer = s.turnOrder[s.currentTurnIndex]
      if (!currentPlayer && s.settings.mode !== 'duelo') return s
      
      const penalty = completed ? 0 : Math.min(cardPoints, 2)
      const points = completed ? cardPoints : -penalty
      const currentCard = s.deck[0]

      let newScores = s.scores
      if (s.settings.mode === 'duelo') {
        // En modo duelo, todos ganan o pierden puntos
        newScores = s.scores.map((sc) => ({
          ...sc,
          points: Math.max(0, sc.points + points),
          completed: sc.completed + (completed ? 1 : 0),
          failed: sc.failed + (completed ? 0 : 1),
          // Las rachas en duelo son globales pero se aplican a cada uno
          streak: completed ? sc.streak + 1 : 0,
          categoryStats: completed && currentCard?.statType
            ? { ...sc.categoryStats, [currentCard.statType]: sc.categoryStats[currentCard.statType] + 1 }
            : sc.categoryStats
        }))
      } else {
        newScores = s.scores.map((p, i) =>
              i === s.currentTurnIndex
                ? {
                    ...p,
                    points: Math.max(0, p.points + points),
                    completed: points > 0 ? p.completed + 1 : p.completed,
                    failed: points < 0 ? p.failed + 1 : p.failed,
                    streak: points > 0 ? p.streak + 1 : 0,
                    categoryStats: points > 0 && currentCard?.statType
                      ? { ...p.categoryStats, [currentCard.statType]: p.categoryStats[currentCard.statType] + 1 }
                      : p.categoryStats
                  }
                : p
            )
      }

      // Fix Duelo vs Twister logic:
      const isDuelo = s.settings.mode === 'duelo'
      const isTwister = s.settings.mode === 'twister'
      
      const realNextIndex = isDuelo ? 0 : (s.currentTurnIndex + 1) % s.turnOrder.length
      const roundEnded = realNextIndex === 0
      const newRoundCount = roundEnded ? s.roundCount + 1 : s.roundCount
      
      const gameEnded =
        s.settings.mode !== 'infinite' && newRoundCount >= s.settings.roundsPerPlayer

      let nextDeck = s.deck.slice(1)
      let newUsed = s.usedTwisterColors
      
      if (isTwister) {
        if (roundEnded) newUsed = []
        // Generate next twister card
        const available = TWISTER_COLORS.filter(c => !newUsed.includes(c))
        const finalAvailable = available.length ? available : TWISTER_COLORS
        const nextColor = finalAvailable[Math.floor(Math.random() * finalAvailable.length)]
        nextDeck = [getTwisterCard(Date.now(), nextColor)]
        newUsed = [...(roundEnded ? [] : newUsed), nextColor]
      } else {
        if (!nextDeck.length) {
          nextDeck = shuffle(buildDeck(s.settings, s.lang))
          if (!nextDeck.length) nextDeck = getCardsPool(s.lang)
        }
      }

      return {
        ...s,
        scores: newScores,
        currentTurnIndex: realNextIndex,
        roundCount: newRoundCount,
        deck: nextDeck,
        usedTwisterColors: newUsed,
        screen: gameEnded ? 'scoreboard' : s.screen,
      }
    })
  }, [buildDeck])

  const resetToSetup = useCallback(() => {
    setState((s) => ({
      ...initialState,
      lang: s.lang,
      screen: 'setup',
      players: [],
      settings: defaultSettings,
    }))
  }, [])

  const resetToModes = useCallback(() => {
    setState((s) => ({
      ...s,
      screen: 'modes',
      selectedMode: null,
      turnOrder: [],
      currentTurnIndex: 0,
      deck: [],
      roundCount: 0,
      totalRounds: 0,
      scores: [],
    }))
  }, [])

  const resetScoresAndPlayAgain = useCallback(() => {
    setState((s) => {
      const pool = getCardsPool(s.lang)
      const built = buildDeck(s.settings, s.lang)
      const deck = shuffle(built.length ? built : pool)
      const turnOrder = shuffle([...s.players])
      const scores: PlayerScore[] = s.players.map((player) => ({
        player,
        points: 0,
        completed: 0,
        failed: 0,
        streak: 0,
        categoryStats: { ...EMPTY_STATS }
      }))
      return {
        ...s,
        screen: 'game',
        turnOrder,
        currentTurnIndex: 0,
        deck,
        roundCount: 0,
        totalRounds: s.settings.mode === 'infinite' ? 0 : s.players.length * s.settings.roundsPerPlayer,
        scores,
      }
    })
  }, [buildDeck])

  const endGameInfinite = useCallback(() => {
    setState((s) => (s.settings.mode === 'infinite' ? { ...s, screen: 'scoreboard' as const } : s))
  }, [])

  const getUsedColors = useCallback(() => {
    return state.players.map((p) => p.color)
  }, [state.players])

  const playClick = useCallback(() => {
    playClickSound()
  }, [playClickSound])

  const rerollTwisterColor = useCallback((cardId: number) => {
    playClickSound()
    setState(s => {
      if (s.settings.mode !== 'twister') return s
      const available = TWISTER_COLORS.filter(c => !s.usedTwisterColors.includes(c))
      // If none available (unlikely with 13 colors), pick any but current
      const currentDesc = s.deck[0]?.description as TwisterColor
      const finalAvailable = available.length ? available : TWISTER_COLORS.filter(c => c !== currentDesc)
      const nextColor = finalAvailable[Math.floor(Math.random() * finalAvailable.length)]
      
      const newCard = getTwisterCard(cardId, nextColor)
      // Replace only first card
      const newDeck = [newCard, ...s.deck.slice(1)]
      // Update used colors: remove old one, add new one
      const filteredUsed = s.usedTwisterColors.filter(c => c !== currentDesc)
      
      const newScores = s.scores.map((sc, i) => 
        i === s.currentTurnIndex 
          ? { ...sc, points: Math.max(0, sc.points - 1) } 
          : sc
      )

      return {
        ...s,
        deck: newDeck,
        scores: newScores,
        usedTwisterColors: [...filteredUsed, nextColor]
      }
    })
  }, [playClickSound])
  
  const rerollCard = useCallback(() => {
    playClickSound()
    setState(s => {
      // Deduct 1 point from current player
      const newScores = s.scores.map((sc, i) => 
        i === s.currentTurnIndex 
          ? { ...sc, points: Math.max(0, sc.points - 1) } 
          : sc
      )

      // Move to next card in deck
      let nextDeck = s.deck.slice(1)
      if (!nextDeck.length) {
        nextDeck = shuffle(buildDeck(s.settings, s.lang))
        if (!nextDeck.length) nextDeck = getCardsPool(s.lang)
      }

      return {
        ...s,
        scores: newScores,
        deck: nextDeck
      }
    })
  }, [playClickSound, buildDeck])

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      setLang,
      setScreen,
      addPlayer,
      removePlayer,
      setSettings,
      setSelectedMode,
      startGame,
      nextTurn,
      resetToSetup,
      resetToModes,
      resetScoresAndPlayAgain,
      endGameInfinite,
      getUsedColors,
      playClick,
      rerollTwisterColor,
      rerollCard,
    }),
    [
      state,
      setLang,
      setScreen,
      addPlayer,
      removePlayer,
      setSettings,
      setSelectedMode,
      startGame,
      nextTurn,
      resetToSetup,
      resetToModes,
      resetScoresAndPlayAgain,
      endGameInfinite,
      getUsedColors,
      playClick,
      rerollTwisterColor,
      rerollCard,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

import { describe, expect, it } from 'vitest'
import type { Card, CardCategory, Player } from '../types'
import {
  buildDeck,
  fillTemplate,
  getPositions,
  getWinners,
  initialGameState,
  playTurn,
  rankScores,
  rerollCard,
  startGame,
  type GameState,
} from './logic'

const card = (id: number, statType: CardCategory = 'strength', level = 1, points = 5): Card => ({
  id, statType, level, points,
  title: `Card ${id}`, description: 'Do it', tries: 1, imageSrc: null, mode: 'All',
})

const pool = [
  ...Array.from({ length: 30 }, (_, i) => card(i + 1)),
  card(100, 'team', 2),
  card(101, 'group', 3),
]

const makePlayers = (count: number): Player[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `p${i}`, nickname: `Player ${i}`, color: '#e53935',
  }))

const newGame = (mode: Parameters<typeof startGame>[1], playerCount = 3, rounds = 2): GameState =>
  startGame(
    {
      ...initialGameState,
      players: makePlayers(playerCount),
      settings: { ...initialGameState.settings, roundsPerPlayer: rounds },
    },
    mode,
    pool,
  )

const scoreOf = (state: GameState, id: string) => state.scores.find((s) => s.player.id === id)!

describe('scoring', () => {
  it('gives the points to the player whose turn it is, whatever the turn order', () => {
    for (let run = 0; run < 25; run++) {
      const game = newGame('allVsAll', 4)
      const player = game.turnOrder[0]
      const next = playTurn(game, true, pool)
      expect(scoreOf(next, player.id).points).toBe(game.deck[0].points)
      expect(next.scores.filter((s) => s.points > 0)).toHaveLength(1)
    }
  })

  it('caps the penalty at two points and never goes below zero', () => {
    let game = newGame('allVsAll', 1, 5)
    const player = game.turnOrder[0]
    game = playTurn(game, false, pool)
    expect(scoreOf(game, player.id)).toMatchObject({ points: 0, failed: 1, streak: 0 })
    game = playTurn(game, true, pool)
    const earned = scoreOf(game, player.id).points
    game = playTurn(game, false, pool)
    expect(scoreOf(game, player.id).points).toBe(earned - 2)
  })

  it('charges a reroll to the current player only', () => {
    let game = newGame('allVsAll', 3)
    game = playTurn(game, true, pool)
    game = playTurn(game, true, pool)
    game = playTurn(game, true, pool)
    const player = game.turnOrder[game.currentTurnIndex]
    const before = game.scores.map((s) => s.points)
    const firstCard = game.deck[0]
    const rerolled = rerollCard(game, pool)
    expect(rerolled.deck[0]).not.toBe(firstCard)
    rerolled.scores.forEach((score, i) => {
      expect(score.points).toBe(before[i] - (score.player.id === player.id ? 1 : 0))
    })
  })

  it('shares the result between everyone in duel mode', () => {
    const game = playTurn(newGame('duelo', 3), true, pool)
    expect(new Set(game.scores.map((s) => s.points)).size).toBe(1)
    expect(game.scores[0].completed).toBe(1)
  })

  it('gives tied players the same position', () => {
    const [a, b, c] = newGame('allVsAll', 3).scores
    const ranked = rankScores([{ ...a, points: 5 }, { ...b, points: 5 }, { ...c, points: 1 }])
    expect(getPositions(ranked)).toEqual([1, 1, 3])
  })

  it('reports ties and games nobody scored in', () => {
    const [a, b] = newGame('allVsAll', 2).scores
    expect(getWinners([a, b])).toHaveLength(0)
    expect(getWinners([{ ...a, points: 5 }, { ...b, points: 5 }])).toHaveLength(2)
    expect(getWinners([{ ...a, points: 6 }, { ...b, points: 5 }])).toHaveLength(1)
  })
})

describe('game length', () => {
  it.each([
    ['allVsAll', 3, 2, 6],
    ['speedrun', 2, 3, 6],
    ['twister', 3, 2, 6],
    ['duelo', 3, 2, 2],
  ] as const)('%s with %i players and %i rounds lasts %i turns', (mode, players, rounds, turns) => {
    let game = newGame(mode, players, rounds)
    expect(game.totalTurns).toBe(turns)
    for (let i = 0; i < turns; i++) {
      expect(game.screen).toBe('game')
      game = playTurn(game, true, pool)
    }
    expect(game.screen).toBe('scoreboard')
    expect(game.turnsPlayed).toBe(turns)
  })

  it('never ends an infinite game by itself', () => {
    let game = newGame('infinite', 2, 1)
    for (let i = 0; i < 100; i++) game = playTurn(game, true, pool)
    expect(game.screen).toBe('game')
    expect(game.deck.length).toBeGreaterThan(0)
  })

  it('only enables the timer in speedrun', () => {
    expect(newGame('speedrun').settings.timedMode).toBe(true)
    expect(newGame('allVsAll').settings.timedMode).toBe(false)
  })
})

describe('twister', () => {
  it('keeps dealing colour cards when the game is played again', () => {
    const first = newGame('twister')
    const again = startGame({ ...first, screen: 'scoreboard' }, 'twister', pool)
    expect(again.deck).toHaveLength(1)
    expect(again.deck[0].mode).toBe('twister')
  })

  it('does not repeat a colour until all of them have come up', () => {
    let game = newGame('twister', 1, 13)
    const seen = [game.deck[0].description]
    for (let i = 0; i < 12; i++) {
      game = playTurn(game, true, pool)
      seen.push(game.deck[0].description)
    }
    expect(new Set(seen).size).toBe(13)
  })
})

describe('deck', () => {
  const settings = initialGameState.settings

  it('keeps group and team cards away from solo players', () => {
    const ids = buildDeck(pool, settings, 1).map((c) => c.id)
    expect(ids).not.toContain(100)
    expect(ids).not.toContain(101)
    expect(buildDeck(pool, settings, 2).map((c) => c.id)).toContain(100)
  })

  it('applies the difficulty and category filters', () => {
    const deck = buildDeck(pool, { ...settings, difficultyFilter: 2 }, 2)
    expect(deck.map((c) => c.id)).toEqual([100])
  })

  it('relaxes filters that match nothing, even for a solo player', () => {
    const onlyTeam = { ...settings, categories: ['team'] as CardCategory[] }
    const deck = buildDeck(pool, onlyTeam, 1)
    expect(deck.length).toBeGreaterThan(0)
    expect(deck.every((c) => c.statType === 'strength')).toBe(true)
  })
})

describe('templates', () => {
  it('fills every placeholder', () => {
    for (const lang of ['es', 'en', 'fr', 'ja', 'pt', 'unknown']) {
      const text = fillTemplate(
        '{nivel_usuario} {numero} {color_presa} {parte_cuerpo} {segundos} {segundos_bloque}',
        lang,
      )
      expect(text).not.toMatch(/[{}]/)
    }
  })
})

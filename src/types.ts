export type Lang = string

export type GameScreen =
  | 'language'
  | 'howToPlay'
  | 'setup'
  | 'modes'
  | 'game'
  | 'scoreboard'

export type GameMode = 'infinite' | 'allVsAll' | 'teams' | 'allToOne' | 'duelo' | 'twister'

export const PLAYER_COLORS = [
  '#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab',
  '#1e88e5', '#00acc1', '#00897b', '#43a047', '#7cb342',
  '#c0ca33', '#fdd835', '#ffb300', '#fb8c00', '#f4511e',
] as const

export type PlayerColor = (typeof PLAYER_COLORS)[number]

export interface Player {
  id: string
  nickname: string
  color: PlayerColor
}

export type CardCategory =
  | 'strength' | 'speed' | 'resistance' | 'group' | 'team'
  | 'balance' | 'technique' | 'coordination' | 'specialChallenges' | 'flexibility'

export interface Card {
  id: number
  title: string
  description: string
  level: number
  points: number
  statType: CardCategory
  tries: number
  imageSrc: string | null
  mode: string
}

export interface GameSettings {
  mode: GameMode
  roundsPerPlayer: number
  difficultyFilter: number | 'all'
  categories: CardCategory[]
}

export interface PlayerScore {
  player: Player
  points: number
  completed: number
  failed: number
  streak: number
}

export type TwisterColor = 
  | 'red' | 'blue' | 'purple' | 'yellow' | 'pink' 
  | 'green' | 'black' | 'white' | 'orange' | 'lightGreen' 
  | 'lightBlue' | 'gray' | 'brown'

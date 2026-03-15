import type { CardCategory } from '../types'

export const CATEGORY_COLORS: Record<CardCategory, string> = {
  strength: '#FF5E5E',
  speed: '#FBBF24',
  resistance: '#3B82F6',
  group: '#BF483D',
  team: '#BF483D',
  balance: '#27E66D',
  technique: '#8B5CF6',
  coordination: '#FB923C',
  specialChallenges: '#FF00AA',
  flexibility: '#10B981',
}

export const STAT_ICONS: Record<CardCategory, string> = {
  strength: 'dumbbell',
  balance: 'person-walking',
  technique: 'bullseye',
  resistance: 'heart',
  group: 'users',
  team: 'users',
  speed: 'bolt',
  specialChallenges: 'star',
  coordination: 'link',
  flexibility: 'person-running',
}

import {
  Dumbbell,
  Footprints,
  Handshake,
  HeartPulse,
  PersonStanding,
  Sparkles,
  Target,
  UsersRound,
  Waypoints,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { CardCategory } from '../types'

export const CATEGORY_COLORS: Record<CardCategory, string> = {
  strength: '#FF7A70',
  speed: '#FFE066',
  resistance: '#94D4FF',
  balance: '#AEFF96',
  technique: '#E6C98F',
  coordination: '#FFB870',
  flexibility: '#86EFD0',
  specialChallenges: '#FF96E6',
  team: '#FFC9B8',
  group: '#D8EE7C',
}

export const CATEGORY_ICONS: Record<CardCategory, LucideIcon> = {
  strength: Dumbbell,
  speed: Zap,
  resistance: HeartPulse,
  balance: Footprints,
  technique: Target,
  coordination: Waypoints,
  flexibility: PersonStanding,
  specialChallenges: Sparkles,
  team: Handshake,
  group: UsersRound,
}

export const TWISTER_COLOR_VALUES: Record<string, string> = {
  red: '#EF4444', blue: '#3B82F6', purple: '#A855F7', yellow: '#FACC15',
  pink: '#EC4899', green: '#22C55E', black: '#1A1A1A', white: '#FFFFFF',
  orange: '#F97316', lightGreen: '#86EFAC', lightBlue: '#93C5FD',
  gray: '#9CA3AF', brown: '#92400E',
}

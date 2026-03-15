import type { Player } from '../types'
import './PlayerChip.css'

interface PlayerChipProps {
  player: Player
  onRemove: () => void
}

export function PlayerChip({ player, onRemove }: PlayerChipProps) {
  return (
    <div className="player-chip">
      <button
        type="button"
        className="player-chip-remove"
        onClick={onRemove}
        aria-label={`Remove ${player.nickname}`}
      >
        ✕
      </button>
      <div
        className="player-chip-avatar"
        style={{ backgroundColor: player.color }}
      />
      <span className="player-chip-name">{player.nickname}</span>
    </div>
  )
}

import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { PLAYER_COLORS, type PlayerColor } from '../types'
import { Modal } from './Modal'
import './AddPlayerModal.css'

interface AddPlayerModalProps {
  onClose: () => void
  onAdded: () => void
}

export function AddPlayerModal({ onClose, onAdded }: AddPlayerModalProps) {
  const { t } = useTranslation()
  const { addPlayer, getUsedColors, players } = useApp()
  const [nickname, setNickname] = useState('')
  const [color, setColor] = useState<PlayerColor>(PLAYER_COLORS[0])
  const [error, setError] = useState('')

  const usedColors = getUsedColors()
  const usedNicknames = players.map((p) => p.nickname.toLowerCase())

  const handleAdd = () => {
    const nick = nickname.trim()
    if (!nick) {
      setError('Nickname required')
      return
    }
    if (usedNicknames.includes(nick.toLowerCase())) {
      setError('Nickname already in use')
      return
    }
    if (usedColors.includes(color)) {
      setError('Color already in use')
      return
    }
    addPlayer(nick, color)
    onAdded()
    onClose()
  }

  return (
    <Modal
      title={t('addPlayer')}
      onClose={onClose}
      primaryButtonLabel={t('add')}
      onPrimary={handleAdd}
      showCloseX={true}
    >
      <div className="add-player-form">
        <label className="add-player-label">{t('color')}</label>
        <div className="add-player-colors">
          {PLAYER_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`add-player-color-btn ${color === c ? 'selected' : ''} ${usedColors.includes(c) ? 'used' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => !usedColors.includes(c) && setColor(c)}
              disabled={usedColors.includes(c)}
              title={usedColors.includes(c) ? 'In use' : ''}
              aria-pressed={color === c}
            />
          ))}
        </div>
        <label className="add-player-label">{t('nickname')}</label>
        <input
          type="text"
          className="add-player-input"
          value={nickname}
          onChange={(e) => { setNickname(e.target.value); setError('') }}
          placeholder="Nickname"
          maxLength={20}
          autoFocus
        />
        {error && <p className="add-player-error">{error}</p>}
      </div>
    </Modal>
  )
}

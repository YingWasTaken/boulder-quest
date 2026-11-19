import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'
import { PLAYER_COLORS, type PlayerColor } from '../types'
import { Modal } from './Modal'
import { readableOn } from '../utils/color'
import { Check } from 'lucide-react'
import './AddPlayerModal.css'

interface AddPlayerModalProps {
  onClose: () => void
}

export function AddPlayerModal({ onClose }: AddPlayerModalProps) {
  const { t } = useTranslation()
  const { addPlayer, players, playClick } = useApp()
  const usedColors: string[] = players.map((p) => p.color)
  const [nickname, setNickname] = useState('')
  const [color, setColor] = useState<PlayerColor>(
    () => PLAYER_COLORS.find((c) => !usedColors.includes(c)) ?? PLAYER_COLORS[0],
  )
  const [error, setError] = useState('')

  const handleAdd = () => {
    const nick = nickname.trim()
    if (!nick) {
      setError(t('nicknameRequired'))
      return
    }
    if (players.some((p) => p.nickname.toLowerCase() === nick.toLowerCase())) {
      setError(t('nicknameTaken'))
      return
    }
    playClick()
    addPlayer(nick, color)
    onClose()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    handleAdd()
  }

  return (
    <Modal title={t('addPlayer')} onClose={onClose} primaryButtonLabel={t('add')} onPrimary={handleAdd}>
      <form className="add-player-form" onSubmit={handleSubmit}>
        <label className="add-player-label" htmlFor="player-nickname">{t('nickname')}</label>
        <input
          id="player-nickname"
          name="nickname"
          type="text"
          spellCheck={false}
          autoCapitalize="words"
          className="add-player-input"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value)
            setError('')
          }}
          placeholder={t('nicknamePlaceholder')}
          maxLength={14}
          autoComplete="off"
          autoFocus={window.matchMedia('(pointer: fine)').matches}
          aria-invalid={!!error}
          aria-describedby={error ? 'player-nickname-error' : undefined}
        />
        {error && <p className="add-player-error" id="player-nickname-error" role="alert">{error}</p>}

        <span className="add-player-label">{t('color')}</span>
        <div className="add-player-colors">
          {PLAYER_COLORS.map((c, index) => {
            const used = usedColors.includes(c)
            return (
              <button
                key={c}
                type="button"
                className={`add-player-color ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c, color: readableOn(c) }}
                onClick={() => setColor(c)}
                disabled={used}
                aria-label={`${t('color')} ${index + 1}`}
                aria-pressed={color === c}
              >
                {color === c && <Check size={20} strokeWidth={3.5} aria-hidden />}
              </button>
            )
          })}
        </div>
      </form>
    </Modal>
  )
}

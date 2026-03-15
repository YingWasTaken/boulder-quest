import { Modal } from './Modal'

interface ModeModalProps {
  title: string
  description: string
  onPlay: () => void
  onClose: () => void
  playLabel: string
}

export function ModeModal({ title, description, onPlay, onClose, playLabel }: ModeModalProps) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      primaryButtonLabel={playLabel}
      onPrimary={onPlay}
      showCloseX={true}
    >
      <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{description}</p>
    </Modal>
  )
}

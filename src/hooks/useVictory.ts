import confetti from 'canvas-confetti'
import { useCallback } from 'react'

export function useVictory() {
  const triggerConfetti = useCallback((color: string) => {
    const end = Date.now() + 1000
    const colors = [color, '#ffffff']

    ;(function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }())
  }, [])

  return { triggerConfetti }
}

import { useEffect, useRef } from 'react'

// Back handlers stack up: the newest one (an open dialog) answers first.
const handlers: Array<() => void> = []

export function handleBack(): boolean {
  const top = handlers[handlers.length - 1]
  if (!top) return false
  top()
  return true
}

/** Runs `onBack` when the Android back button is pressed while this is on top. */
export function useBackHandler(onBack: () => void, enabled = true) {
  const latest = useRef(onBack)

  useEffect(() => {
    latest.current = onBack
  }, [onBack])

  useEffect(() => {
    if (!enabled) return
    const handler = () => latest.current()
    handlers.push(handler)
    return () => {
      const index = handlers.lastIndexOf(handler)
      if (index >= 0) handlers.splice(index, 1)
    }
  }, [enabled])
}

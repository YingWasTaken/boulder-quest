const INK = '#16130F'
const WHITE = '#FFFFFF'

const channel = (value: number) => {
  const v = value / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

/** Ink or white, whichever reads better on the given background. */
export function readableOn(hex: string): string {
  const light = luminance(hex)
  return (light + 0.05) / (luminance(INK) + 0.05) >= 1.05 / (light + 0.05) ? INK : WHITE
}

import type { CSSProperties, ReactNode } from 'react'
import './Hold.css'

// The five facets of the Boulder Quest logo, in a 1080x1080 box.
const FACETS = [
  { points: '300,105 445,75 470,400 295,565 120,370', logo: '#FDEC95', light: 0.45 },
  { points: '445,75 705,130 950,425 705,550 470,400', logo: '#94D4FF', light: 0.28 },
  { points: '120,370 295,565 280,965 135,860 45,625', logo: '#FF96E6', light: 0.14 },
  { points: '470,400 705,550 560,1015 280,965 295,565', logo: '#FF5E5E', light: 0 },
  { points: '705,550 950,425 1025,710 955,880 560,1015', logo: '#AEFF96', light: 0.2 },
]

interface HoldProps {
  /** Tints the facets with one colour; without it the hold uses the logo colours. */
  color?: string
  size?: number | string
  className?: string
  children?: ReactNode
  style?: CSSProperties
}

export function Hold({ color, size = 48, className = '', children, style }: HoldProps) {
  return (
    <span className={`hold ${className}`} style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 1080 1080" aria-hidden>
        {FACETS.map(({ points, logo, light }) => (
          <g key={points}>
            <polygon points={points} fill={color ?? logo} />
            {color && <polygon points={points} fill="#fff" fillOpacity={light} />}
            <polygon points={points} className="hold-line" />
          </g>
        ))}
      </svg>
      {children && <span className="hold-content">{children}</span>}
    </span>
  )
}

import './CardArt.css'

// A low-poly wall drawn on a shared set of vertices. Mirroring it and lightening
// the faces differently gives each challenge its own face from the same drawing.
const FACES = [
  '-10,-10 130,-10 95,85 -10,110',
  '130,-10 270,-10 320,70 215,120 95,85',
  '270,-10 410,-10 410,130 320,70',
  '-10,110 95,85 215,120 120,250 -10,250',
  '215,120 320,70 410,130 250,250',
  '410,130 410,250 250,250',
  '215,120 250,250 120,250',
]

const LIGHTNESS = [0, 0.16, 0.34, 0.5]

interface CardArtProps {
  color: string
  seed: number
}

export function CardArt({ color, seed }: CardArtProps) {
  const mirrored = seed % 2 === 1
  return (
    <svg className="card-art" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect x="-10" y="-10" width="420" height="260" fill={color} />
      <g transform={mirrored ? 'matrix(-1 0 0 1 400 0)' : undefined}>
        {FACES.map((points, i) => (
          <polygon
            key={points}
            points={points}
            fill="#fff"
            fillOpacity={LIGHTNESS[(seed * 7 + i * (seed % 3 + 2)) % LIGHTNESS.length]}
            className="card-art-face"
          />
        ))}
      </g>
    </svg>
  )
}

// Synthesises the game's two sound effects from scratch, so they carry no
// third-party rights. Run: node scripts/generate_sounds.mjs
import fs from 'fs'

const RATE = 44100

function writeWav(path, samples) {
  const data = Buffer.alloc(samples.length * 2)
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2))
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(RATE, 24)
  header.writeUInt32LE(RATE * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  fs.writeFileSync(path, Buffer.concat([header, data]))
}

// Click: a short pitched tick with a fast decay.
const click = Array.from({ length: Math.round(RATE * 0.045) }, (_, i) => {
  const t = i / RATE
  const envelope = Math.exp(-t * 110)
  return 0.6 * envelope * (Math.sin(2 * Math.PI * 1320 * t) + 0.35 * Math.sin(2 * Math.PI * 2640 * t))
})

// Swipe: filtered noise whose brightness sweeps up and fades out.
let seed = 7
const noise = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648
  return seed / 1073741824 - 1
}
const swipeLength = Math.round(RATE * 0.22)
let low = 0
const swipe = Array.from({ length: swipeLength }, (_, i) => {
  const p = i / swipeLength
  const cutoff = 0.04 + 0.5 * p
  low += cutoff * (noise() - low)
  const envelope = Math.sin(Math.PI * p) ** 1.5
  return 0.85 * envelope * low
})

writeWav('public/click.wav', click)
writeWav('public/swipe.wav', swipe)
console.log('Wrote public/click.wav and public/swipe.wav')

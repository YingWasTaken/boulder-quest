// Builds every icon and splash from public/logo.png on a white background.
// Run: node scripts/generate_icons.mjs  (then: npm run assets:android)
import fs from 'fs'
import sharp from 'sharp'

const LOGO = 'public/logo.png'
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 }

async function onCanvas(out, canvas, logoSize, background) {
  const logo = await sharp(LOGO).resize(logoSize, logoSize, { fit: 'contain', background: CLEAR }).toBuffer()
  await sharp({ create: { width: canvas, height: canvas, channels: 4, background } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(out)
}

fs.mkdirSync('assets', { recursive: true })

// Sources for @capacitor/assets (Android launcher, adaptive icon and splash).
await onCanvas('assets/icon-only.png', 1024, 720, WHITE)
await onCanvas('assets/icon-foreground.png', 1024, 560, CLEAR) // inside the adaptive-icon safe zone
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: WHITE } }).png().toFile('assets/icon-background.png')
await onCanvas('assets/splash.png', 2732, 640, WHITE)
await onCanvas('assets/splash-dark.png', 2732, 640, WHITE)

// Web and PWA icons.
await onCanvas('public/icon-192.png', 192, 136, WHITE)
await onCanvas('public/icon-512.png', 512, 360, WHITE)
await onCanvas('public/icon-maskable-512.png', 512, 300, WHITE)
await onCanvas('public/apple-touch-icon.png', 180, 128, WHITE)

console.log('Icons written to assets/ and public/')

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// `vite build --mode android` makes the bundle for the Capacitor app, which
// ships its files inside the APK and needs no service worker.
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      disable: mode === 'android',
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'icon-192.png', 'icon-512.png', 'click.wav', 'swipe.wav'],
      manifest: {
        name: 'Boulder Quest',
        short_name: 'Boulder Quest',
        description: 'A card game for climbing gyms',
        theme_color: '#FFF8E9',
        background_color: '#FFFFFF',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wav,woff2,txt}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
}))

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'click.wav', 'swipe.wav'],
      manifest: {
        name: 'Boulder Quest',
        short_name: 'BoulderQuest',
        description: 'A card game for climbing gyms',
        theme_color: '#FFF8E9',
        background_color: '#FFF8E9',
        display: 'standalone',
        icons: [
          {
            src: 'logo.png',
            sizes: '1080x1080',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wav,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      }
    })
  ],
})

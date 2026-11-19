import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // Final package name on Google Play: it cannot change after the first upload.
  appId: 'com.boulderquest.app',
  appName: 'Boulder Quest',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
    },
    SystemBars: {
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      style: 'LIGHT',
    },
  },
}

export default config

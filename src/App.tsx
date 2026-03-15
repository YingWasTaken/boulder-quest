import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext'
import { SplashScreen } from './components/SplashScreen'
import { LanguageScreen } from './screens/LanguageScreen'
import { HowToPlaySlides } from './components/HowToPlaySlides'
import { SetupScreen } from './screens/SetupScreen'
import { ModesScreen } from './screens/ModesScreen'
import { GameScreen } from './screens/GameScreen'
import { ScoreboardScreen } from './screens/ScoreboardScreen'

function AppRouter() {
  const { screen, setScreen } = useApp()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <div style={{ visibility: showSplash ? 'hidden' : 'visible' }}>
        {screen === 'howToPlay' ? (
          <HowToPlaySlides onClose={() => setScreen('setup')} />
        ) : (
          (() => {
            switch (screen) {
              case 'language':
                return <LanguageScreen />
              case 'setup':
                return <SetupScreen />
              case 'modes':
                return <ModesScreen />
              case 'game':
                return <GameScreen />
              case 'scoreboard':
                return <ScoreboardScreen />
              default:
                return <LanguageScreen />
            }
          })()
        )}
      </div>
    </>
  )
}


export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}

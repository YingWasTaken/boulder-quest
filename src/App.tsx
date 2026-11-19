import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext'
import { SplashScreen } from './components/SplashScreen'
import { HowToPlaySlides } from './components/HowToPlaySlides'
import { LanguageScreen } from './screens/LanguageScreen'
import { SetupScreen } from './screens/SetupScreen'
import { ModesScreen } from './screens/ModesScreen'
import { GameScreen } from './screens/GameScreen'
import { ScoreboardScreen } from './screens/ScoreboardScreen'
import { initNative } from './native/platform'

initNative()

function CurrentScreen() {
  const { screen, setScreen } = useApp()
  switch (screen) {
    case 'howToPlay':
      return <HowToPlaySlides onClose={() => setScreen('setup')} />
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
}

function AppRouter() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 900)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence>{showSplash && <SplashScreen key="splash" />}</AnimatePresence>
      {!showSplash && <CurrentScreen />}
    </>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </MotionConfig>
  )
}

import { motion } from 'framer-motion'
import { Hold } from './Hold'
import './SplashScreen.css'

export function SplashScreen() {
  return (
    <motion.div
      className="splash-screen"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 11, stiffness: 180 }}
      >
        <Hold size={148} />
      </motion.div>
      <h1 className="splash-title" translate="no">Boulder Quest</h1>
    </motion.div>
  )
}

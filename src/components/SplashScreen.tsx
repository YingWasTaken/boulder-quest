import { motion } from 'framer-motion'
import './SplashScreen.css'

export function SplashScreen() {
  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.div
        className="splash-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.05, opacity: 1 }}
        exit={{ scale: 1.3, opacity: 0 }}
        transition={{
          duration: 1.5,
          ease: "easeOut"
        }}
      >
        <img src="/logo.png" alt="Boulder Quest Logo" className="splash-logo" />
        <h2 className="splash-title">Boulder Quest</h2>
      </motion.div>
    </motion.div>
  )
}

import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Session } from './pages/Session'
import { DoomScrollSession } from './pages/DoomScrollSession'
import { Results } from './pages/Results'
import { AuthPage } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Review } from './pages/Review'
import { Leaderboard } from './pages/Leaderboard'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { TermsOfService } from './pages/TermsOfService'
import { Settings } from './pages/Settings'
import { Analytics } from './pages/Analytics'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { Inventory } from './pages/Inventory'
import { ClickSpark } from './components/ClickSpark'
import { useAuth } from './context/AuthContext'
import { AmbientBackground } from './components/AmbientBackground'
import { QUESTIONS } from './data/questions'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  return user ? children : <Navigate to="/signup" replace state={{ from: location.pathname }} />
}

function Shell() {
  const { user } = useAuth()
  const location = useLocation()
  return (
    <ClickSpark>
      <AmbientBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Routes location={location}>
            <Route path="/" element={user ? <Dashboard /> : <Home />} />
            <Route path="/session" element={<RequireAuth><Session /></RequireAuth>} />
            <Route path="/doomscroll" element={<RequireAuth><DoomScrollSession questions={QUESTIONS} /></RequireAuth>} />
            <Route path="/results" element={<RequireAuth><Results /></RequireAuth>} />
            <Route path="/signin" element={<AuthPage mode="in" />} />
            <Route path="/signup" element={<AuthPage mode="up" />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/review" element={<RequireAuth><Review /></RequireAuth>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
            <Route path="/shop" element={<RequireAuth><Shop /></RequireAuth>} />
            <Route path="/inventory" element={<RequireAuth><Inventory /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </ClickSpark>
  )
}

export default function App() {
  return <Shell />
}
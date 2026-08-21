import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { useAuth } from '../context/AuthContext'

type Props = {
  compact?: boolean
}

export function SiteNav({ compact = false }: Props) {
  const { user } = useAuth()
  return (
    <header className="nav">
      <Link to="/" className="logo">
        <Logo />
      </Link>
      <nav>
        {!compact ? <a href="/#how">How it works</a> : null}
        {user ? (
          <Link to="/dashboard">Dashboard</Link>
        ) : (
          <Link to="/signin">Sign in</Link>
        )}
        <Link to="/session" className="nav-cta">
          Start
        </Link>
      </nav>
    </header>
  )
}

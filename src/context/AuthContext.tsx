import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../types'
import {
  currentUser,
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
  updateProfile,
} from '../lib/auth'
import { adoptGuestProgress } from '../lib/storage'

type AuthCtx = {
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  updateName: (name: string) => void
  signOut: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => currentUser())

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await authSignIn(email, password)
    setUser(next)
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const next = await authSignUp(name, email, password)
      adoptGuestProgress(next.id)
      setUser(next)
    },
    [],
  )

  const signOut = useCallback(() => {
    authSignOut()
    setUser(null)
  }, [])

  const updateName = useCallback((name: string) => {
    setUser((current) => current ? updateProfile(current.id, name) : current)
  }, [])

  const value = useMemo(
    () => ({ user, signIn, signUp, updateName, signOut }),
    [user, signIn, signUp, updateName, signOut],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

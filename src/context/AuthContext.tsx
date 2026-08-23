import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../types'
import {
  currentUser,
  fromSupabaseUser,
  signIn as authSignIn,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  signUp as authSignUp,
  updateProfile,
} from '../lib/auth'
import { adoptGuestProgress, hydrateProgress } from '../lib/storage'
import { supabase } from '../lib/supabase'

type AuthCtx = {
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  updateName: (name: string) => void
  signOut: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => currentUser())

  useEffect(() => {
    let mounted = true
    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted || !data.user) return
      const next = fromSupabaseUser(data.user)
      setUser(next)
      void hydrateProgress(next.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return
      const next = fromSupabaseUser(session.user)
      setUser(next)
      void hydrateProgress(next.id)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await authSignIn(email, password)
    await hydrateProgress(next.id)
    setUser(next)
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const next = await authSignUp(name, email, password)
      adoptGuestProgress(next.id)
      await hydrateProgress(next.id)
      setUser(next)
    },
    [],
  )

  const signInWithGoogle = useCallback(async () => {
    await authSignInWithGoogle()
  }, [])

  const signOut = useCallback(() => {
    void supabase.auth.signOut()
    authSignOut()
    setUser(null)
  }, [])

  const updateName = useCallback((name: string) => {
    setUser((current) => current ? updateProfile(current.id, name) : current)
  }, [])

  const value = useMemo(
    () => ({ user, signIn, signUp, signInWithGoogle, updateName, signOut }),
    [user, signIn, signUp, signInWithGoogle, updateName, signOut],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

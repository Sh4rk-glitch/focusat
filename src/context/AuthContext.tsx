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
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  updateName: (name: string) => Promise<void>
  signOut: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => currentUser())
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true

    // Initial session & user check on application boot
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return

      if (session?.user) {
        const next = fromSupabaseUser(session.user)
        adoptGuestProgress(next.id)
        await hydrateProgress(next.id)
        if (mounted) setUser(next)
      } else {
        if (mounted) setUser(null)
      }
      if (mounted) setLoading(false)
    })

    // Listen for auth events (sign in, token refresh, multi-tab login, sign out)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (session?.user) {
        const next = fromSupabaseUser(session.user)
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          adoptGuestProgress(next.id)
          await hydrateProgress(next.id)
        }
        if (mounted) {
          setUser(next)
          setLoading(false)
        }
      } else {
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const next = await authSignIn(email, password)
      adoptGuestProgress(next.id)
      await hydrateProgress(next.id)
      setUser(next)
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true)
      try {
        const next = await authSignUp(name, email, password)
        adoptGuestProgress(next.id)
        await hydrateProgress(next.id)
        setUser(next)
      } finally {
        setLoading(false)
      }
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

  const updateName = useCallback(async (name: string) => {
    if (!user) return
    const next = await updateProfile(user.id, name)
    setUser(next)
  }, [user])

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signInWithGoogle, updateName, signOut }),
    [user, loading, signIn, signUp, signInWithGoogle, updateName, signOut],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
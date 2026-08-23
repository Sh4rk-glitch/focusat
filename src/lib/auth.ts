import type { User } from '../types'
import { supabase } from './supabase'

const USERS_KEY = 'focusat-users'
const SESSION_KEY = 'focusat-session'

type StoredUser = User & { salt: string; hash: string }

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as StoredUser[]
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function bytesToHex(arr: Uint8Array): string {
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(buf))
}

function randomSalt(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
}

function toPublic(u: StoredUser): User {
  return { id: u.id, email: u.email, name: u.name }
}

export function currentUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function fromSupabaseUser(authUser: { id: string; email?: string; user_metadata?: { name?: string; full_name?: string; avatar_url?: string; picture?: string } }): User {
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name: authUser.user_metadata?.name ?? authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'Learner',
    avatarUrl: authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture,
  }
}

export function setCurrentUser(user: User | null): void {
  if (!user) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail.includes('@')) throw new Error('Enter a valid email.')
  if (password.length < 6) throw new Error('Password must be at least 6 characters.')
  if (!name.trim()) throw new Error('Add a name so the dashboard feels like yours.')

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: { data: { name: name.trim() } },
  })
  if (!error && data.user) {
    const user = fromSupabaseUser(data.user)
    setCurrentUser(user)
    return user
  }
  if (error && !error.message.toLowerCase().includes('failed to fetch')) {
    throw new Error(error.message)
  }

  const users = readUsers()
  if (users.some((u) => u.email === cleanEmail)) {
    throw new Error('That email already has an account. Sign in instead.')
  }

  const salt = randomSalt()
  const hash = await sha256(`${salt}:${password}`)
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: cleanEmail,
    name: name.trim(),
    salt,
    hash,
  }
  writeUsers([...users, user])
  const pub = toPublic(user)
  setCurrentUser(pub)
  return pub
}

export async function signIn(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase()
  const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
  if (!error && data.user) {
    const user = fromSupabaseUser(data.user)
    setCurrentUser(user)
    return user
  }
  if (error && !error.message.toLowerCase().includes('failed to fetch')) {
    throw new Error(error.message)
  }

  const users = readUsers()
  const found = users.find((u) => u.email === cleanEmail)
  if (!found) throw new Error('No account with that email.')
  const hash = await sha256(`${found.salt}:${password}`)
  if (hash !== found.hash) throw new Error('Wrong password.')
  const pub = toPublic(found)
  setCurrentUser(pub)
  return pub
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) {
    const message = error.message.toLowerCase()
    if (message.includes('provider is not enabled')) {
      throw new Error('Google sign-in is not enabled for this Supabase project yet.')
    }
    if (message.includes('redirect_uri')) {
      throw new Error('Google OAuth redirect settings do not match this app.')
    }
    throw new Error(error.message)
  }
}

export function signOut(): void {
  setCurrentUser(null)
}

export async function updateProfile(userId: string, name: string): Promise<User> {
  const cleanName = name.trim()
  if (!cleanName) throw new Error('Name cannot be empty.')
  const { data, error } = await supabase.auth.updateUser({ data: { name: cleanName } })
  if (!error && data.user) {
    const user = fromSupabaseUser(data.user)
    setCurrentUser(user)
    return user
  }
  if (error && !error.message.toLowerCase().includes('failed to fetch')) throw new Error(error.message)

  const users = readUsers()
  const index = users.findIndex((user) => user.id === userId)
  if (index < 0) throw new Error('Account not found.')
  const updated = { ...users[index], name: cleanName }
  users[index] = updated
  writeUsers(users)
  const publicUser = toPublic(updated)
  setCurrentUser(publicUser)
  return publicUser
}

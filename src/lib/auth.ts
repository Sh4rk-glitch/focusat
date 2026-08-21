import type { User } from '../types'

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
  const users = readUsers()
  const found = users.find((u) => u.email === cleanEmail)
  if (!found) throw new Error('No account with that email.')
  const hash = await sha256(`${found.salt}:${password}`)
  if (hash !== found.hash) throw new Error('Wrong password.')
  const pub = toPublic(found)
  setCurrentUser(pub)
  return pub
}

export function signOut(): void {
  setCurrentUser(null)
}

export function updateProfile(userId: string, name: string): User {
  const cleanName = name.trim()
  if (!cleanName) throw new Error('Name cannot be empty.')
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

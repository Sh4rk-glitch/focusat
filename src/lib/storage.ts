import type {
  ItemLog,
  ReviewItem,
  SessionMode,
  SessionRecord,
  SessionResult,
  SkillCell,
  SkillId,
  Stats,
} from '../types'
import { currentUser } from './auth'
import { emptySkills, recommendedMode } from './adaptive'
import { supabase } from './supabase'

const GUEST_KEY = 'focusat-v1'

function ns(): string {
  const user = currentUser()
  return user ? `focusat-v1:${user.id}` : GUEST_KEY
}

const empty: Stats = {
  streak: 0,
  bestStreak: 0,
  lastCompletedDate: null,
  totalSessions: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  lastScore: null,
  lastDistractions: 0,
}

type Store = Stats & {
  history: SessionRecord[]
  skills: Record<SkillId, SkillCell>
  review: ReviewItem[]
  itemLog: ItemLog[]
  lastMode: SessionMode | null
}

export type LeaderboardEntry = {
  user_id: string
  name: string
  questions_answered: number
  leaks: number
}

function emptyStore(): Store {
  return {
    ...empty,
    history: [],
    skills: emptySkills(),
    review: [],
    itemLog: [],
    lastMode: null,
  }
}

export function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + delta)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function mergeSkills(raw?: Partial<Record<SkillId, SkillCell>>): Record<SkillId, SkillCell> {
  const merged = { ...emptySkills(), ...raw }
  for (const cell of Object.values(merged)) cell.totalTimeMs ??= 0
  return merged
}

function readStore(key = ns()): Store {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as Partial<Store>
    return {
      ...emptyStore(),
      ...parsed,
      history: parsed.history ?? [],
      skills: mergeSkills(parsed.skills),
      review: parsed.review ?? [],
      itemLog: parsed.itemLog ?? [],
      lastMode: parsed.lastMode ?? null,
    }
  } catch {
    return emptyStore()
  }
}

function writeStore(store: Store, key = ns()): void {
  localStorage.setItem(key, JSON.stringify(store))
}

async function pushRemoteStore(store: Store, userId: string): Promise<void> {
  const user = currentUser()
  const [progress, leaderboard] = await Promise.all([
    supabase.from('user_progress').upsert({ user_id: userId, data: store, updated_at: new Date().toISOString() }),
    supabase.from('leaderboard').upsert({
      user_id: userId,
      name: user?.name ?? 'Learner',
      questions_answered: store.totalQuestions,
      leaks: store.history.reduce((sum, item) => sum + item.distractions, 0),
      updated_at: new Date().toISOString(),
    }),
  ])
  if (progress.error) console.warn('Could not sync progress.', progress.error.message)
  if (leaderboard.error) console.warn('Could not sync leaderboard.', leaderboard.error.message)
}

export async function hydrateProgress(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.warn('Could not load synced progress.', error.message)
    return
  }
  if (data?.data) writeStore(data.data as Store, `focusat-v1:${userId}`)
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('user_id, name, questions_answered, leaks')
    .order('questions_answered', { ascending: false })
    .order('leaks', { ascending: true })
    .limit(50)
  if (error) throw new Error(error.message)
  return (data ?? []) as LeaderboardEntry[]
}

export function loadStats(): Stats {
  const store = readStore()
  return {
    streak: store.streak,
    bestStreak: store.bestStreak,
    lastCompletedDate: store.lastCompletedDate,
    totalSessions: store.totalSessions,
    totalCorrect: store.totalCorrect,
    totalQuestions: store.totalQuestions,
    lastScore: store.lastScore,
    lastDistractions: store.lastDistractions,
  }
}

export function loadHistory(): SessionRecord[] {
  return readStore().history
}

export function loadSkills(): Record<SkillId, SkillCell> {
  return readStore().skills
}

export function loadReview(): ReviewItem[] {
  return readStore().review
}

export function loadItemLog(): ItemLog[] {
  return readStore().itemLog
}

export function loadWrongQuestionIds(): string[] {
  return readStore().itemLog
    .filter((item) => !item.correct)
    .map((item) => item.id)
    .filter((id, i, all) => all.indexOf(id) === i)
}

export function resetProgress(): void {
  const store = emptyStore()
  writeStore(store)
  const user = currentUser()
  if (user) void pushRemoteStore(store, user.id)
}

export function loadLastMode(): SessionMode | null {
  return readStore().lastMode
}

export function saveEngine(partial: {
  skills?: Record<SkillId, SkillCell>
  review?: ReviewItem[]
  itemLog?: ItemLog[]
}): void {
  const prev = readStore()
  const next = { ...prev, ...partial }
  writeStore(next)
  const user = currentUser()
  if (user) void pushRemoteStore(next, user.id)
}

export function adoptGuestProgress(userId: string): void {
  const guest = readStore(GUEST_KEY)
  const destKey = `focusat-v1:${userId}`
  const dest = readStore(destKey)
  if (dest.totalSessions > 0) return
  if (guest.totalSessions === 0 && guest.history.length === 0) return
  writeStore(guest, destKey)
}

export function recordCompletion(result: SessionResult): Stats {
  const prev = readStore()
  const record: SessionRecord = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    correct: result.correct,
    total: result.total,
    distractions: result.distractions,
    forfeited: result.forfeited,
    mode: result.mode,
    focusScore: result.focusScore,
    weakSkill: result.weakSkill,
  }
  const history = [record, ...prev.history].slice(0, 80)

  if (result.forfeited && result.total === 0) {
    return loadStats()
  }
  if (result.forfeited) {
    const next = {
      ...prev,
      lastDistractions: result.distractions,
      lastMode: result.mode,
      history,
    }
    writeStore(next)
    const user = currentUser()
    if (user) void pushRemoteStore(next, user.id)
    return loadStats()
  }

  const today = todayKey()
  let streak = prev.streak
  if (prev.lastCompletedDate === today) {
    streak = Math.max(1, prev.streak)
  } else if (prev.lastCompletedDate === shiftDay(today, -1)) {
    streak = prev.streak + 1
  } else {
    streak = 1
  }

  const next = {
    ...prev,
    streak,
    bestStreak: Math.max(prev.bestStreak, streak),
    lastCompletedDate: today,
    totalSessions: prev.totalSessions + 1,
    totalCorrect: prev.totalCorrect + result.correct,
    totalQuestions: prev.totalQuestions + result.total,
    lastScore: result.correct,
    lastDistractions: result.distractions,
    lastMode: result.mode,
    history,
  }
  writeStore(next)
  const user = currentUser()
  if (user) void pushRemoteStore(next, user.id)
  return loadStats()
}

export function nextModeHint(): SessionMode {
  return recommendedMode(readStore().skills)
}

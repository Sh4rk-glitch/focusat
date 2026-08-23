import { createClient } from '@supabase/supabase-js'

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {}
const url = viteEnv.VITE_SUPABASE_URL ?? 'https://ahlkdbxtebsltrxhrbyz.supabase.co'
const publishableKey = viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_R4XUkFxsYgZyq633Klk9Tw_ZvxW4Ibm'

export const supabase = createClient(url, publishableKey)

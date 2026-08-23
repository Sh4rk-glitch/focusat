import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://ahlkdbxtebsltrxhrbyz.supabase.co'
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_R4XUkFxsYgZyq633Klk9Tw_ZvxW4Ibm'

export const supabase = createClient(url, publishableKey)

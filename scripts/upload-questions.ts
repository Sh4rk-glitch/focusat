import { createClient } from '@supabase/supabase-js'
import { QUESTIONS } from '../src/data/questions.ts'
import { questionMeta } from '../src/data/catalog.ts'

const url = process.env.VITE_SUPABASE_URL ?? 'https://ahlkdbxtebsltrxhrbyz.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  throw new Error('Set SUPABASE_SERVICE_ROLE_KEY in the terminal before running this script.')
}

const supabase = createClient(url, serviceRoleKey)
const rows = QUESTIONS.map((question) => ({
  ...questionMeta(question),
  id: question.id,
  section: question.section,
  prompt: question.prompt,
  choices: question.choices,
  answer: question.answer,
  explain: question.explain,
  desmos: question.desmos ?? null,
  skill: questionMeta(question).skill,
  difficulty: questionMeta(question).difficulty,
}))

const { error } = await supabase.from('questions').upsert(rows, { onConflict: 'id' })
if (error) throw new Error(`Question upload failed: ${error.message}`)
console.log(`Uploaded ${rows.length} questions.`)

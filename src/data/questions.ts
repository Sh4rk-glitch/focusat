import type { Question } from '../types'
import { EXTRA_QUESTIONS } from './extraBank'
import { supabase } from '../lib/supabase'

const CORE: Question[] = [
  {
    id: 'm1',
    section: 'Math',
    prompt: 'If 3x + 7 = 22, what is the value of x?',
    choices: ['3', '5', '7', '15'],
    answer: 1,
    explain: 'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.',
  },
  {
    id: 'm2',
    section: 'Math',
    prompt:
      'A jacket priced at $80 is marked up 25%, then sold at 20% off the new price. What is the sale price?',
    choices: ['$80', '$76', '$84', '$100'],
    answer: 0,
    explain: 'After markup: 80 × 1.25 = 100. After 20% off: 100 × 0.80 = 80.',
  },
  {
    id: 'm3',
    section: 'Math',
    prompt: 'What is the slope of the line through (2, 3) and (6, 11)?',
    choices: ['1', '2', '3', '4'],
    answer: 1,
    explain: '(11 − 3) / (6 − 2) = 8 / 4 = 2.',
    desmos: 'y-3=2(x-2)',
  },
  {
    id: 'm4',
    section: 'Math',
    prompt: 'If f(x) = x² − 5x + 6, what is f(3)?',
    choices: ['0', '2', '6', '12'],
    answer: 0,
    explain: '9 − 15 + 6 = 0.',
    desmos: 'y=x^2-5x+6',
  },
  {
    id: 'm5',
    section: 'Math',
    prompt: '24 is what percent of 80?',
    choices: ['24%', '30%', '32%', '40%'],
    answer: 1,
    explain: '24 ÷ 80 = 0.30, which is 30%.',
  },
  {
    id: 'm6',
    section: 'Math',
    prompt: 'Solve for y: 2(y − 4) = 3y + 1',
    choices: ['−9', '−7', '7', '9'],
    answer: 0,
    explain: '2y − 8 = 3y + 1. Then −8 − 1 = 3y − 2y, so y = −9.',
  },
  {
    id: 'm7',
    section: 'Math',
    prompt: 'The mean of 4, 8, 12, and x is 10. What is x?',
    choices: ['10', '12', '16', '18'],
    answer: 2,
    explain: '(24 + x) / 4 = 10, so 24 + x = 40 and x = 16.',
  },
  {
    id: 'm8',
    section: 'Math',
    prompt:
      'A rectangle is 3 times as long as it is wide. If the perimeter is 48, what is the width?',
    choices: ['4', '6', '8', '12'],
    answer: 1,
    explain: '2(3w + w) = 48 → 8w = 48 → w = 6.',
  },
  {
    id: 'm9',
    section: 'Math',
    prompt: 'If 2^a = 32, then a =',
    choices: ['4', '5', '6', '16'],
    answer: 1,
    explain: '32 = 2⁵, so a = 5.',
  },
  {
    id: 'm10',
    section: 'Math',
    prompt: 'Which inequality describes all solutions of 5x − 2 < 13?',
    choices: ['x < 2', 'x < 3', 'x > 3', 'x < 11'],
    answer: 1,
    explain: '5x < 15, so x < 3.',
  },
  {
    id: 'm11',
    section: 'Math',
    prompt: 'A car travels 180 miles in 3 hours. At that constant rate, how far in 5 hours?',
    choices: ['240 miles', '280 miles', '300 miles', '360 miles'],
    answer: 2,
    explain: 'Speed is 60 mph. 60 × 5 = 300 miles.',
  },
  {
    id: 'm12',
    section: 'Math',
    prompt: 'If a + b = 10 and a − b = 4, what is the value of ab?',
    choices: ['16', '21', '24', '40'],
    answer: 1,
    explain: 'Add: 2a = 14, so a = 7. Then b = 3. Product: 21.',
  },
  {
    id: 'm13',
    section: 'Math',
    prompt: 'A bag has 4 red and 6 blue marbles. Probability of drawing red, then blue without replacement?',
    choices: ['4/15', '4/25', '2/9', '1/4'],
    answer: 0,
    explain: '(4/10) × (6/9) = 24/90 = 4/15.',
  },
  {
    id: 'm14',
    section: 'Math',
    prompt: 'The circle x² + y² = 49 has radius',
    choices: ['7', '14', '24.5', '49'],
    answer: 0,
    explain: 'Standard form x² + y² = r², so r = 7.',
    desmos: 'x^2+y^2=49',
  },
  {
    id: 'm15',
    section: 'Math',
    prompt: '|x − 3| = 5. Which is a solution?',
    choices: ['x = −8', 'x = −2', 'x = 2', 'x = 3'],
    answer: 1,
    explain: 'x − 3 = 5 or x − 3 = −5 → x = 8 or x = −2.',
  },
  {
    id: 'm16',
    section: 'Math',
    prompt: 'A linear function passes through (0, 4) and (2, 10). What is f(5)?',
    choices: ['16', '18', '19', '22'],
    answer: 2,
    explain: 'Slope = 3, so f(x) = 3x + 4. f(5) = 19.',
    desmos: 'y=3x+4',
  },
  {
    id: 'm17',
    section: 'Math',
    prompt: 'If 12 is 40% of n, what is n?',
    choices: ['24', '30', '36', '48'],
    answer: 1,
    explain: '0.4n = 12 → n = 30.',
  },
  {
    id: 'm18',
    section: 'Math',
    prompt: 'Simplify: (3x²y)(−2xy³)',
    choices: ['−6x³y⁴', '−6x²y³', '6x³y⁴', '−5x³y⁴'],
    answer: 0,
    explain: '3 × −2 = −6; x² · x = x³; y · y³ = y⁴.',
  },
  {
    id: 'm19',
    section: 'Math',
    prompt: 'The median of 3, 9, 4, 11, 7 is',
    choices: ['4', '7', '9', '11'],
    answer: 1,
    explain: 'Ordered: 3, 4, 7, 9, 11. Middle value is 7.',
  },
  {
    id: 'm20',
    section: 'Math',
    prompt: 'A right triangle has legs 6 and 8. The hypotenuse is',
    choices: ['10', '12', '14', '48'],
    answer: 0,
    explain: '6² + 8² = 36 + 64 = 100 = 10².',
    desmos: 'y=\\sqrt{36-x^2}',
  },
  {
    id: 'r1',
    section: 'Reading',
    passage:
      'Unlike the rumor mill of social media, a scientific paper is designed to be slow. Reviewers poke holes. Authors revise. The delay is not a bug; it is the product. Speed sells. Carefulness, less so.',
    prompt: 'The author’s primary claim is that',
    choices: [
      'social media is more accurate than journals',
      'scientific delay is a feature of careful work',
      'reviewers should work faster',
      'authors should avoid revision',
    ],
    answer: 1,
    explain: 'The passage calls delay “the product,” contrasting it with speed.',
  },
  {
    id: 'r2',
    section: 'Reading',
    passage:
      'Maya kept the metronome ticking while she practiced, not because she loved the click, but because silence made her rush. The click was a fence. Inside it, she could be precise.',
    prompt: 'As used in the passage, “fence” most nearly means',
    choices: ['barrier that hides her', 'decoration', 'boundary that controls pace', 'punishment'],
    answer: 2,
    explain: 'The metronome keeps her from rushing; it is a pacing boundary.',
  },
  {
    id: 'r3',
    section: 'Reading',
    passage:
      'Cities plant trees for shade, for air, and for a quieter kind of wealth: people linger. A bench under leaves is not infrastructure in a spreadsheet, but it is how a street becomes a place.',
    prompt: 'The author suggests that urban trees',
    choices: [
      'should be judged only by air quality data',
      'are mainly decorative',
      'create social value that numbers miss',
      'belong only in parks',
    ],
    answer: 2,
    explain: '“Quieter kind of wealth” and lingering people imply unmeasured social value.',
  },
  {
    id: 'r4',
    section: 'Reading',
    passage:
      'The first draft was a mess of certainty. The second draft asked better questions. By the fourth, the writer had removed every sentence that existed only to sound smart.',
    prompt: 'The sequence of drafts mainly shows that revision',
    choices: [
      'adds more impressive vocabulary',
      'replaces confidence with inquiry and clarity',
      'is unnecessary if the first draft is long',
      'should stop after the second draft',
    ],
    answer: 1,
    explain: 'Certainty gives way to questions; show-off sentences get cut.',
  },
  {
    id: 'r5',
    section: 'Reading',
    passage:
      'When the tide pulled back, the rocks were not empty. They were a map: barnacles, tide pools, a crab the size of a thumbnail. The “nothing” was only what we had failed to look at.',
    prompt: 'The closing sentence implies that',
    choices: [
      'the tide destroyed the ecosystem',
      'emptiness was an error of attention',
      'crabs are rare in tide pools',
      'maps are more accurate than observation',
    ],
    answer: 1,
    explain: '“Nothing” was a failure to look, not a lack of life.',
  },
  {
    id: 'r6',
    section: 'Reading',
    passage:
      'Critics called the building cold. Residents called it honest: concrete that did not pretend to be marble, windows that admitted the weather instead of denying it.',
    prompt: 'The residents’ view of the building is best described as',
    choices: ['nostalgic', 'dismissive', 'appreciative of its candor', 'focused on luxury materials'],
    answer: 2,
    explain: 'They praise honesty: materials and weather are not disguised.',
  },
  {
    id: 'w1',
    section: 'Writing',
    prompt:
      'Choose the option that best completes the sentence: “Each of the essays ___ a clear thesis.”',
    choices: ['have', 'has', 'having', 'were having'],
    answer: 1,
    explain: '“Each” is singular, so the verb is “has.”',
  },
  {
    id: 'w2',
    section: 'Writing',
    prompt: 'Which sentence is punctuated correctly?',
    choices: [
      'The exam was hard, however I finished.',
      'The exam was hard; however, I finished.',
      'The exam was hard however, I finished.',
      'The exam was hard, however, I finished.',
    ],
    answer: 1,
    explain: 'Two independent clauses need a semicolon (or period) before “however.”',
  },
  {
    id: 'w3',
    section: 'Writing',
    prompt: 'Which choice uses the correct word?',
    choices: [
      'The committee announced it’s decision.',
      'The committee announced its decision.',
      'The committee announced its’ decision.',
      'The committee announced it is decision.',
    ],
    answer: 1,
    explain: '“Its” is possessive. “It’s” always means “it is.”',
  },
  {
    id: 'w4',
    section: 'Writing',
    prompt:
      'To combine without changing meaning: “The lab was closed. We waited outside.”',
    choices: [
      'The lab was closed we waited outside.',
      'The lab was closed, we waited outside.',
      'Because the lab was closed, we waited outside.',
      'The lab was closed; but we waited outside.',
    ],
    answer: 2,
    explain: 'A comma splice is wrong; “because” correctly links cause and result.',
  },
  {
    id: 'w5',
    section: 'Writing',
    prompt: 'Which sentence is most concise without losing meaning?',
    choices: [
      'Due to the fact that it rained, the game was postponed.',
      'In light of the occurrence of rain, postponement happened.',
      'Because it rained, the game was postponed.',
      'Rain, being a factor, caused postponement of the game.',
    ],
    answer: 2,
    explain: '“Because it rained…” is the tightest equivalent.',
  },
  {
    id: 'w6',
    section: 'Writing',
    prompt: 'Choose the correct modifier placement.',
    choices: [
      'Running to class, the backpack bounced on Jordan’s shoulder.',
      'Running to class, Jordan’s backpack bounced on his shoulder.',
      'Running to class, Jordan felt the backpack bounce on his shoulder.',
      'Running to class, it bounced on Jordan’s shoulder.',
    ],
    answer: 2,
    explain: 'The person running must be the subject: Jordan, not the backpack.',
  },
  {
    id: 'w7',
    section: 'Writing',
    prompt: 'Which maintains parallel structure?',
    choices: [
      'She likes to read, to write, and painting.',
      'She likes reading, writing, and to paint.',
      'She likes to read, write, and paint.',
      'She likes reading, to write, and paint.',
    ],
    answer: 2,
    explain: 'All three verbs follow “to” in the same form.',
  },
  {
    id: 'w8',
    section: 'Writing',
    prompt: 'Which sentence is grammatically standard?',
    choices: [
      'Neither the tutors nor the teacher were available.',
      'Neither the tutors nor the teacher was available.',
      'Neither the tutors nor the teacher are available yesterday.',
      'Neither the tutors or the teacher was available.',
    ],
    answer: 1,
    explain: 'With neither/nor, the verb agrees with the closer subject: “teacher was.”',
  },
]

export const QUESTIONS: Question[] = [...CORE, ...EXTRA_QUESTIONS]

function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<Question>
  return typeof row.id === 'string' &&
    (row.section === 'Math' || row.section === 'Reading' || row.section === 'Writing') &&
    typeof row.prompt === 'string' && Array.isArray(row.choices) && row.choices.length === 4 &&
    typeof row.answer === 'number' && row.answer >= 0 && row.answer <= 3 && typeof row.explain === 'string'
}

export async function syncQuestionsFromSupabase(): Promise<void> {
  const { data, error } = await supabase.from('questions').select('*')
  if (error) {
    console.warn('Using bundled questions; Supabase question sync failed.', error.message)
    return
  }
  const remote = (data ?? []).filter(isQuestion)
  if (remote.length === 0) return
  QUESTIONS.splice(0, QUESTIONS.length, ...remote)
}

export const SESSION_QUESTION_COUNT = 8
export const SESSION_SECONDS = 8 * 60

export function pickSession(count = SESSION_QUESTION_COUNT): Question[] {
  const copy = [...QUESTIONS]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  const math = copy.filter((q) => q.section === 'Math')
  const verbal = copy.filter((q) => q.section !== 'Math')
  const mixed: Question[] = []
  let m = 0
  let v = 0
  for (let i = 0; i < count; i++) {
    if (i % 2 === 0 && m < math.length) {
      mixed.push(math[m++])
    } else if (v < verbal.length) {
      mixed.push(verbal[v++])
    } else {
      mixed.push(math[m++])
    }
  }
  return mixed
}

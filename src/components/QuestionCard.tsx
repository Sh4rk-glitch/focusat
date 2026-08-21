import { AnimatePresence, motion } from 'motion/react'
import type { Question } from '../types'

type Props = {
  question: Question
  index: number
  total: number
  selected: number | null
  locked: boolean
  onSelect: (i: number) => void
}

const letters = ['A', 'B', 'C', 'D']

export function QuestionCard({
  question,
  index,
  total,
  selected,
  locked,
  onSelect,
}: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={question.id}
        className="qcard"
        initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="qmeta">
          <span className="pill">{question.section}</span>
          <span className="qcount">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
        {question.passage ? (
          <p className="passage">{question.passage}</p>
        ) : null}
        <h2 className="qprompt">{question.prompt}</h2>
        <div className="choices">
          {question.choices.map((choice, i) => {
            const isSel = selected === i
            const isAns = locked && i === question.answer
            const isWrong = locked && isSel && i !== question.answer
            return (
              <motion.button
                key={choice}
                type="button"
                className={`choice ${isSel ? 'is-sel' : ''} ${isAns ? 'is-ans' : ''} ${isWrong ? 'is-wrong' : ''}`}
                onClick={() => onSelect(i)}
                disabled={locked}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.35 }}
              >
                <span className="letter">{letters[i]}</span>
                <span>{choice}</span>
              </motion.button>
            )
          })}
        </div>
        {locked ? (
          <motion.p
            className="explain"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {question.explain}
          </motion.p>
        ) : null}
      </motion.article>
    </AnimatePresence>
  )
}

import { Link } from 'react-router-dom'
import { useState } from 'react'
import { QUESTIONS } from '../data/questions'
import { questionMeta } from '../data/catalog'
import { difficultyLabel } from '../lib/adaptive'
import { loadWrongQuestionIds } from '../lib/storage'
import type { Difficulty } from '../types'

export function Review() {
  const [filter, setFilter] = useState<'all' | 'ela' | 'math'>('all')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const ids = loadWrongQuestionIds()
  const questions = QUESTIONS.filter((question) => {
    if (!ids.includes(question.id)) return false
    if (filter === 'math' && question.section !== 'Math') return false
    if (filter === 'ela' && question.section === 'Math') return false
    return difficulty === 'all' || difficultyLabel(questionMeta(question).difficulty) === difficulty
  })
  const review = questions.map((question) => question.id).join(',')

  return <div className="page review-page">
    <Link to="/dashboard" className="ghost-link">Back to dashboard</Link>
    <p className="eyebrow">Wrong answer bank</p>
    <h1>Practice the questions that got away.</h1>
    <p className="lede">Every miss is saved to your account. Filter the bank, then retake the whole set.</p>
    <div className="filter-row">
      {(['all', 'ela', 'math'] as const).map((item) => <button key={item} type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item === 'all' ? 'All' : item.toUpperCase()}</button>)}
      <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty | 'all')}>
        <option value="all">All levels</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="challenge">Challenge</option>
      </select>
    </div>
    {questions.length ? <Link to={`/session?mode=mix&review=${review}`} className="btn btn-gold">Retake {questions.length} questions</Link> : <p className="muted">No wrong answers match this filter yet.</p>}
    <ul className="review-list">{questions.map((question) => <li key={question.id}><span>{question.section}</span><strong>{question.prompt.slice(0, 110)}{question.prompt.length > 110 ? '...' : ''}</strong><em>{difficultyLabel(questionMeta(question).difficulty)}</em></li>)}</ul>
  </div>
}
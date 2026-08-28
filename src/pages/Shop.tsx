import { Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { buyShopItem, loadStats } from '../lib/storage'
import { Logo } from '../components/Logo'
import { FocusCoinIcon } from '../components/FocusCoinIcon'

interface ShopCatalogItem {
  id: string
  name: string
  category: string
  icon: string
  cost: number
  description: string
}

const SHOP_ITEMS: ShopCatalogItem[] = [
  {
    id: 'freeze',
    name: '3-day streak freeze',
    category: 'Streak protection',
    icon: '❄',
    cost: 100,
    description: 'Take up to three days away without breaking your current streak.'
  },
  {
    id: 'multiplier',
    name: 'Focus multiplier',
    category: 'Focus boost',
    icon: '⚡',
    cost: 250,
    description: 'Double the FocusPoints earned from your next practice session.'
  },
  {
    id: 'restore',
    name: 'Restore your last streak',
    category: 'Streak repair',
    icon: '🔥',
    cost: 300,
    description: 'Restore the exact streak you lost, but only during the following day.'
  },
  {
    id: 'shield',
    name: 'Double Session Shield',
    category: 'Daily protection',
    icon: '🛡️',
    cost: 450,
    description: 'Protects your streak across two consecutive missed days automatically.'
  },
  {
    id: 'surge',
    name: 'Focus Surge',
    category: 'Session upgrade',
    icon: '⏱️',
    cost: 500,
    description: 'Earn 3x FocusPoints during deep evening focus sessions (after 8 PM).'
  },
  {
    id: 'diagnostic_redo',
    name: 'Diagnostic Redo Pass',
    category: 'Diagnostic reset',
    icon: '🎯',
    cost: 750,
    description: 'Recalibrate your baseline score projection with a fresh full-length diagnostic.'
  }
]

export function Shop() {
  const { user } = useAuth()
  const [points, setPoints] = useState(() => loadStats().points)
  const [message, setMessage] = useState('')

  if (!user) return <Navigate to="/signin" replace />

  const buy = (item: ShopCatalogItem) => {
    if (points < item.cost) {
      const needed = item.cost - points
      setMessage(`You need ${needed} more FocusPoints to buy ${item.name}.`)
      return
    }

    if (buyShopItem(item.id as any, item.cost)) {
      setPoints((value) => value - item.cost)
      setMessage(`${item.name} added to your inventory.`)
    } else {
      setMessage(`Could not complete purchase.`)
    }
  }

  return (
    <div className="page economy-page">
      <header className="nav">
        <Link to="/" className="logo"><Logo /></Link>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/inventory">Inventory</Link>
          <span className="points-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FocusCoinIcon size={16} /> {points} FocusPoints
          </span>
        </nav>
      </header>

      <main className="economy-content">
        <div className="economy-heading">
          <div>
            <p className="eyebrow">Focusat shop</p>
            <h1>Spend your FocusPoints wisely.</h1>
            <p className="muted">Earn FocusPoints for every question you practice and master.</p>
          </div>
          <Link to="/inventory" className="btn btn-ghost">View inventory</Link>
        </div>

        <section className="shop-grid">
          {SHOP_ITEMS.map((item) => {
            const canAfford = points >= item.cost
            return (
              <article className="shop-item" key={item.id}>
                <span className="shop-item-icon">{item.icon}</span>
                <p className="eyebrow">{item.category}</p>
                <h2>{item.name}</h2>
                <p className="muted">{item.description}</p>
                <div className="shop-item-footer">
                  <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <FocusCoinIcon size={14} /> {item.cost} <small>FocusPoints</small>
                  </strong>
                  <button
                    type="button"
                    className={`btn ${canAfford ? 'btn-gold' : 'btn-ghost'}`}
                    disabled={!canAfford}
                    onClick={() => buy(item)}
                  >
                    {canAfford ? 'Buy item' : 'Not enough'}
                  </button>
                </div>
              </article>
            )
          })}
        </section>

        {message ? <p className="economy-message">{message}</p> : null}
      </main>
    </div>
  )
}
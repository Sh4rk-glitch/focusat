import { Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { canRedeemStreakRestore, loadInventory, redeemStreakFreeze, redeemStreakRestore } from '../lib/storage'
import { Logo } from '../components/Logo'

export function Inventory() {
  const { user } = useAuth()
  const [freezeCount, setFreezeCount] = useState(() => loadInventory().streakFreeze3)
  const [restoreCount, setRestoreCount] = useState(() => loadInventory().streakRestore)
  const [multiplierCount] = useState(() => loadInventory().focusMultiplier)
  const [message, setMessage] = useState('')
  if (!user) return <Navigate to="/signin" replace />

  const redeem = () => {
    if (redeemStreakFreeze()) {
      setFreezeCount((value) => value - 1)
      setMessage('Freeze redeemed. Your next three days are protected.')
    } else setMessage('You do not have a three-day freeze to redeem.')
  }

  const restore = () => {
    if (redeemStreakRestore()) {
      setRestoreCount((value) => value - 1)
      setMessage('Your previous streak has been restored.')
    } else setMessage('Streak restore is only available on the day after a loss.')
  }

  return (
    <div className="page economy-page">
      <header className="nav"><Link to="/" className="logo"><Logo /></Link><nav><Link to="/dashboard">Dashboard</Link><Link to="/shop">Shop</Link></nav></header>
      <main className="economy-content"><div className="economy-heading"><div><p className="eyebrow">Your inventory</p><h1>Tools for your streak.</h1><p className="muted">Redeem an item when you need it.</p></div><Link to="/shop" className="btn btn-ghost">Visit shop</Link></div>{freezeCount + restoreCount + multiplierCount > 0 ? <section className="inventory-grid">
        {freezeCount > 0 ? <article className="shop-item"><span className="shop-item-icon">❄</span><p className="eyebrow">Streak protection</p><h2>3-day streak freeze</h2><p className="muted">Protect your next three days from a missed practice session.</p><div className="shop-item-footer"><strong>{freezeCount} <small>owned</small></strong><button type="button" className="btn btn-gold" onClick={redeem}>Redeem</button></div></article> : null}
        {restoreCount > 0 ? <article className="shop-item"><span className="shop-item-icon">✦</span><p className="eyebrow">Streak repair</p><h2>Restore your last streak</h2><p className="muted">Use this only on the day after you lose your streak.</p><div className="shop-item-footer"><strong>{restoreCount} <small>owned</small></strong><button type="button" className="btn btn-gold" disabled={!canRedeemStreakRestore()} onClick={restore}>Redeem</button></div></article> : null}
        {multiplierCount > 0 ? <article className="shop-item"><span className="shop-item-icon">⚡</span><p className="eyebrow">Focus boost</p><h2>Focus multiplier</h2><p className="muted">Double points from your next practice session.</p><div className="shop-item-footer"><strong>{multiplierCount} <small>owned</small></strong><button type="button" className="btn btn-ghost" disabled>Auto-applies</button></div></article> : null}
      </section> : <section className="inventory-empty"><span className="shop-item-icon">✦</span><h2>Looks like your bag is empty right now!</h2><p className="muted">Visit the shop when you have points to spend.</p><Link to="/shop" className="btn btn-gold">Visit shop</Link></section>}{message ? <p className="economy-message">{message}</p> : null}</main>
    </div>
  )
}

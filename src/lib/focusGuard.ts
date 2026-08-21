type Opts = {
  armed: () => boolean
  onLeak: () => void
  ignore: () => boolean
}

function focusInIframe(): boolean {
  const el = document.activeElement
  return Boolean(el && el.tagName === 'IFRAME')
}

function windowLost(): boolean {
  if (focusInIframe()) return false
  if (document.hidden) return true
  if (!document.hasFocus()) return true
  return false
}

export function attachFocusGuard(opts: Opts): () => void {
  const fire = (force = false) => {
    if (opts.ignore()) return
    if (!opts.armed()) return
    if (!force && !windowLost()) return
    opts.onLeak()
  }

  const onBlur = () => {
    window.setTimeout(() => {
      if (!document.hasFocus() && !focusInIframe()) fire()
    }, 0)
  }

  const onVis = () => {
    if (document.hidden) fire(true)
  }

  const onPageHide = () => fire(true)

  const poll = window.setInterval(() => {
    if (!opts.armed() || opts.ignore()) return
    if (windowLost()) fire()
  }, 250)

  window.addEventListener('blur', onBlur)
  window.addEventListener('pagehide', onPageHide)
  document.addEventListener('visibilitychange', onVis)

  return () => {
    window.clearInterval(poll)
    window.removeEventListener('blur', onBlur)
    window.removeEventListener('pagehide', onPageHide)
    document.removeEventListener('visibilitychange', onVis)
  }
}

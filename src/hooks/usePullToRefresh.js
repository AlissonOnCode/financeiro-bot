import { useEffect, useRef } from 'react'

export default function usePullToRefresh(onRefresh) {
  const containerRef = useRef(null)
  const indicatorRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    const ind = indicatorRef.current
    if (!el || !ind) return

    let startY = null
    let active = false

    function show(dy) {
      const clamped = Math.min(dy, 80)
      ind.style.opacity = String(clamped / 80)
      ind.style.transform = `translateX(-50%) translateY(${clamped * 0.5}px)`
      ind.textContent = dy >= 80 ? '↑ Solte para atualizar' : '↓ Puxe para atualizar'
    }

    function hide() {
      ind.style.opacity = '0'
      ind.style.transform = 'translateX(-50%) translateY(0)'
      active = false
      startY = null
    }

    function onStart(e) {
      if (el.scrollTop > 0) return
      startY = e.touches[0].clientY
    }

    function onMove(e) {
      if (startY === null) return
      const dy = e.touches[0].clientY - startY
      if (dy <= 0) { startY = null; return }
      active = true
      show(dy)
    }

    function onEnd(e) {
      if (!active) return
      const dy = e.changedTouches[0].clientY - startY
      const trigger = dy >= 80
      hide()
      if (trigger) onRefresh()
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: true })
    el.addEventListener('touchend', onEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
  }, [onRefresh])

  return { containerRef, indicatorRef }
}

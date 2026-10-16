import { useCallback, useEffect, useState } from 'react'

export type MotionPreference = 'on' | 'off'

const STORAGE_KEY = 'rahul-os:motion'

/**
 * Motion control.
 *
 * Two things are true at once:
 *  1. The operating system preference (`prefers-reduced-motion`) is respected
 *     in CSS for everything decorative.
 *  2. A visitor can switch interface motion off explicitly, which sets
 *     `data-motion="off"` on the root element — and that genuinely collapses
 *     the motion tokens, so it changes real animation behaviour rather than
 *     being a decorative control.
 */
export function useMotionPreference() {
  const [motion, setMotion] = useState<MotionPreference>(() => {
    if (typeof window === 'undefined') return 'on'
    const applied = document.documentElement.dataset.motion
    if (applied === 'off' || applied === 'on') return applied
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on'
  })

  const [systemReduced, setSystemReduced] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent) => setSystemReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.motion = motion
    try {
      localStorage.setItem(STORAGE_KEY, motion)
    } catch {
      /* session-only preference */
    }
  }, [motion])

  const toggleMotion = useCallback(() => {
    setMotion((current) => (current === 'on' ? 'off' : 'on'))
  }, [])

  return { motion, setMotion, toggleMotion, reduceMotion: motion === 'off' || systemReduced }
}

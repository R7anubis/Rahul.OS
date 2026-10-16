import { useCallback, useEffect, useRef, useState } from 'react'

type CopyState = 'idle' | 'copied' | 'error'

/**
 * Clipboard helper with a confirmation state.
 * Falls back to a hidden textarea + execCommand on browsers that do not expose
 * the async Clipboard API (or when the page is not in a secure context).
 */
export function useCopyToClipboard(resetAfterMs = 2200) {
  const [state, setState] = useState<CopyState>('idle')
  const timeout = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timeout.current) window.clearTimeout(timeout.current)
    },
    [],
  )

  const scheduleReset = useCallback(() => {
    if (timeout.current) window.clearTimeout(timeout.current)
    timeout.current = window.setTimeout(() => setState('idle'), resetAfterMs)
  }, [resetAfterMs])

  const copy = useCallback(
    async (text: string) => {
      const legacyCopy = () => {
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.top = '-1000px'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(area)
        return ok
      }

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
        } else if (!legacyCopy()) {
          throw new Error('copy unavailable')
        }
        setState('copied')
        scheduleReset()
        return true
      } catch {
        setState('error')
        scheduleReset()
        return false
      }
    },
    [scheduleReset],
  )

  return { state, copy, isCopied: state === 'copied', isError: state === 'error' }
}

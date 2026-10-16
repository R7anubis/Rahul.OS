import { useEffect, useState } from 'react'

export type CursorContext = 'default' | 'action' | 'inspect' | 'text'

interface PointerCapability {
  /** true only when a custom cursor is appropriate and safe to render */
  enabled: boolean
  /** cursor arrived from a real pointing device, not a synthetic event */
  pointerType: 'mouse' | 'pen' | 'touch' | null
  setPointerType: (type: PointerCapability['pointerType']) => void
}

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Decides whether the enhanced pointer layer may run.
 *
 * It is enabled only when *all* of these hold:
 *  - the device reports a hover-capable fine pointer (so touch is excluded);
 *  - the visitor has not asked for reduced motion, either via the OS setting or
 *    the site's own motion toggle;
 *  - the page is in a real browser with matchMedia available.
 *
 * The custom cursor is a progressive enhancement: when this returns false the
 * native cursor is left completely untouched, and `data-cursor="custom"` is
 * never set on the root element — so a failure here can never leave the page
 * without a visible cursor.
 */
export function usePointerCapability(motionEnabled: boolean): PointerCapability {
  const [finePointer, setFinePointer] = useState(false)
  const [systemReduced, setSystemReduced] = useState(true)
  const [pointerType, setPointerType] = useState<PointerCapability['pointerType']>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setFinePointer(false)
      setSystemReduced(true)
      return
    }

    const fine = window.matchMedia(FINE_POINTER)
    const reduced = window.matchMedia(REDUCED_MOTION)

    const sync = () => {
      setFinePointer(fine.matches)
      setSystemReduced(reduced.matches)
    }
    sync()

    fine.addEventListener('change', sync)
    reduced.addEventListener('change', sync)
    return () => {
      fine.removeEventListener('change', sync)
      reduced.removeEventListener('change', sync)
    }
  }, [])

  // A touch contact anywhere demotes the layer — some hybrid devices report a
  // fine pointer while still being driven by touch.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onPointerDown = (event: PointerEvent) => {
      setPointerType(
        event.pointerType === 'touch' ? 'touch' : event.pointerType === 'pen' ? 'pen' : 'mouse',
      )
    }
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const enabled =
    finePointer && !systemReduced && motionEnabled && pointerType !== 'touch' && pointerType !== 'pen'

  return { enabled, pointerType, setPointerType }
}

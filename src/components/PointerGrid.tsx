import { useEffect, useRef } from 'react'

interface PointerGridProps {
  /** extra class so each placement can size its own mask */
  className?: string
  motionEnabled: boolean
}

/**
 * Very low-contrast dot grid that lifts slightly around the pointer.
 *
 * It reads as surface sheen rather than a light show: the highlight is the
 * theme's own `--dot` token at a whisker more opacity, over a 220px radius. When
 * the pointer is not inside the area there is no animation at all — the layer
 * sits still and the CSS custom properties simply stop changing. Disabled
 * entirely when motion is reduced, in which case the static grid underneath
 * (already part of the design) is all that shows.
 */
export function PointerGrid({ className = '', motionEnabled }: PointerGridProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!motionEnabled) return
    const element = ref.current
    if (!element) return
    if (typeof window.matchMedia !== 'function') return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let next: { x: number; y: number } | null = null

    const paint = () => {
      frame = 0
      if (!next) return
      const rect = element.getBoundingClientRect()
      element.style.setProperty('--px', `${next.x - rect.left}px`)
      element.style.setProperty('--py', `${next.y - rect.top}px`)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      next = { x: event.clientX, y: event.clientY }
      if (frame) return
      frame = window.requestAnimationFrame(paint)
    }

    const onEnter = () => {
      element.dataset.active = 'true'
    }
    const onLeave = () => {
      element.dataset.active = 'false'
    }

    const host = element.parentElement ?? element
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointerleave', onLeave)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [motionEnabled])

  return <div className={`pointer-grid ${className}`.trim()} ref={ref} aria-hidden="true" data-active="false" />
}

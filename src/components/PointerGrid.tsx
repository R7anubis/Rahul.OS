import { useEffect, useRef, useState } from 'react'

interface PointerGridProps {
  /** extra class so each placement can size its own mask */
  className?: string
  motionEnabled: boolean
}

/**
 * Very low-contrast dot grid that lifts slightly around the pointer.
 *
 * It reads as surface sheen rather than a light show: the same `--dot` token at
 * a whisker more opacity, inside a 240px disc, on the same pitch and phase as
 * the static `.dot-field` texture. When the pointer is not inside the section
 * there is no animation at all — the layer sits still and the CSS custom
 * properties simply stop changing. Disabled entirely when motion is reduced, in
 * which case the static grid underneath (already part of the design) is all
 * that shows.
 *
 * Listeners go on the nearest <section>, not on the immediate parent. A parent
 * that is `pointer-events: none` with no targetable descendants can never be
 * the target of a pointer event and is not in the hit-test chain of anything
 * that is, so it receives neither `pointerenter` nor `pointermove` — which
 * silently disabled the hero's grid, whose parent is `.hero__bg`. The section
 * always contains the section's content, so it is a reliable host.
 */
export function PointerGrid({ className = '', motionEnabled }: PointerGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  /** Resolved before render: ineligible devices never get the layer at all. */
  const [canRun, setCanRun] = useState(false)

  useEffect(() => {
    if (!motionEnabled) {
      setCanRun(false)
      return
    }
    if (typeof window.matchMedia !== 'function') {
      setCanRun(false)
      return
    }
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setCanRun(false)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCanRun(false)
      return
    }
    setCanRun(true)
  }, [motionEnabled])

  useEffect(() => {
    if (!canRun) return
    const element = ref.current
    if (!element) return

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

    const host = element.closest('section') ?? element.parentElement ?? element
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointerleave', onLeave)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [canRun])

  if (!canRun) return null

  return <div className={`pointer-grid ${className}`.trim()} ref={ref} aria-hidden="true" data-active="false" />
}

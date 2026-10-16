import { useEffect, useRef } from 'react'
import { usePointerCapability, type CursorContext } from '../hooks/usePointerCapability'

interface PointerLayerProps {
  /** the site's own motion preference (the header toggle) */
  motionEnabled: boolean
}

/**
 * Precision reticle pointer layer.
 *
 * The cursor is a bracket box: four angular corner arms around a 3px accent
 * centre pixel, with mid-edge ticks that only appear over interactive targets.
 * It deliberately avoids the usual circular follower / glow / trailing ring.
 *
 * Constraints this respects:
 *  - progressive enhancement only. `data-cursor="custom"` is set on <html> by
 *    this component *and* removed on unmount or when capability drops, so the
 *    native cursor is only ever hidden while a replacement is on screen;
 *  - capability-gated: fine pointer + hover, no reduced-motion request, motion
 *    toggle on, and no touch/pen contact. Anything else leaves the native
 *    cursor alone and this component renders nothing at all;
 *  - over text the reticle withdraws and an I-beam appears, so the selection
 *    affordance is never lost;
 *  - every position write happens inside one requestAnimationFrame loop using
 *    transforms. A click adds no DOM nodes — it toggles a single attribute for
 *    160ms, so holding the button down cannot flood the layer.
 */

const ACTION_SELECTOR = 'a, button, summary, select, [role="button"], [data-cursor="action"]'
const TEXT_SELECTOR =
  'p, h1, h2, h3, h4, h5, h6, li, dt, dd, blockquote, code, figcaption, input, textarea, [contenteditable]'
const INSPECT_SELECTOR = '[data-cursor-inspect]'

const PRESS_MS = 160

export function PointerLayer({ motionEnabled }: PointerLayerProps) {
  const { enabled } = usePointerCapability(motionEnabled)

  const rootRef = useRef<HTMLDivElement>(null)
  const reticleRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const crossRef = useRef<HTMLDivElement>(null)
  const crossXRef = useRef<HTMLSpanElement>(null)
  const crossYRef = useRef<HTMLSpanElement>(null)
  const crossLabelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!enabled) return
    const rootElement = document.documentElement

    // Capability is confirmed: hand the cursor over to the custom layer.
    rootElement.dataset.cursor = 'custom'

    const state = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      visible: false,
      context: 'default' as CursorContext,
      inspectEl: null as HTMLElement | null,
      // Only the interactive architecture diagram publishes a position
      // readout; on a static illustration the crosshair alone is the aid, and
      // printing coordinates there would be decoration.
      inspectCoords: false,
      frame: 0,
      pressTimer: 0,
    }

    const apply = () => {
      state.frame = 0
      const { x, y } = state
      const translate = `translate3d(${x}px, ${y}px, 0)`

      if (reticleRef.current) reticleRef.current.style.transform = translate
      if (barRef.current) barRef.current.style.transform = translate

      if (crossRef.current && state.inspectEl) {
        const rect = state.inspectEl.getBoundingClientRect()
        crossRef.current.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`
        crossRef.current.style.width = `${rect.width}px`
        crossRef.current.style.height = `${rect.height}px`
        if (crossXRef.current) crossXRef.current.style.transform = `translateY(${y - rect.top}px)`
        if (crossYRef.current) crossYRef.current.style.transform = `translateX(${x - rect.left}px)`
        if (crossLabelRef.current) {
          if (state.inspectCoords && rect.width > 0 && rect.height > 0) {
            const px = Math.round(((x - rect.left) / rect.width) * 100)
            const py = Math.round(((y - rect.top) / rect.height) * 100)
            crossLabelRef.current.textContent = `X ${String(Math.max(0, Math.min(99, px))).padStart(
              2,
              '0',
            )} · Y ${String(Math.max(0, Math.min(99, py))).padStart(2, '0')}`
          } else {
            crossLabelRef.current.textContent = ''
          }
        }
      }
    }

    const schedule = () => {
      if (state.frame) return
      state.frame = window.requestAnimationFrame(apply)
    }

    const setContext = (context: CursorContext) => {
      if (state.context === context) return
      state.context = context
      if (rootRef.current) rootRef.current.dataset.context = context
    }

    const isTextish = (element: Element | null) => {
      if (!element) return false
      // Do not treat a whole card or section as a text surface: only real leaf
      // text, so a paragraph inside a link still reads as an action.
      const tag = element.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return true
      return element.matches(TEXT_SELECTOR) && element.querySelector('a, button') === null
    }

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (!target || !(target instanceof Element)) return

      const inspectTarget = target.closest(INSPECT_SELECTOR)
      state.inspectEl = inspectTarget instanceof HTMLElement ? inspectTarget : null
      state.inspectCoords =
        inspectTarget instanceof HTMLElement &&
        inspectTarget.getAttribute('data-cursor-inspect') === 'diagram'
      if (crossRef.current) crossRef.current.style.opacity = state.inspectEl ? '1' : '0'

      if (target.closest(ACTION_SELECTOR)) setContext('action')
      else if (state.inspectEl) setContext('inspect')
      else if (isTextish(target)) setContext('text')
      else setContext('default')

      schedule()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      state.x = event.clientX
      state.y = event.clientY
      if (!state.visible) {
        state.visible = true
        if (rootRef.current) rootRef.current.dataset.visible = 'true'
      }
      schedule()
    }

    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        state.visible = false
        if (rootRef.current) rootRef.current.dataset.visible = 'false'
      }
    }

    // Press acknowledgement: an attribute flip, cleared on a timer. No nodes,
    // no animation frames, nothing that can accumulate.
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !rootRef.current) return
      rootRef.current.dataset.press = 'true'
      window.clearTimeout(state.pressTimer)
      state.pressTimer = window.setTimeout(() => {
        if (rootRef.current) rootRef.current.dataset.press = 'false'
      }, PRESS_MS)
    }

    const onPointerLeaveDocument = () => {
      state.visible = false
      if (rootRef.current) rootRef.current.dataset.visible = 'false'
    }

    window.addEventListener('pointerover', onPointerOver, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerout', onPointerOut, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.addEventListener('pointerleave', onPointerLeaveDocument)
    window.addEventListener('blur', onPointerLeaveDocument)

    return () => {
      delete rootElement.dataset.cursor
      if (state.frame) window.cancelAnimationFrame(state.frame)
      window.clearTimeout(state.pressTimer)
      window.removeEventListener('pointerover', onPointerOver)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointerleave', onPointerLeaveDocument)
      window.removeEventListener('blur', onPointerLeaveDocument)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      className="pointer-layer"
      ref={rootRef}
      data-context="default"
      data-visible="false"
      data-press="false"
      aria-hidden="true"
    >
      {/* hairlines that span whatever diagram is under the pointer */}
      <div className="pointer-cross" ref={crossRef}>
        <span className="pointer-cross__x" ref={crossXRef} />
        <span className="pointer-cross__y" ref={crossYRef} />
        <span className="pointer-cross__readout" ref={crossLabelRef} />
      </div>

      <span className="pointer-reticle" ref={reticleRef}>
        <i className="pointer-reticle__arm pointer-reticle__arm--tl" />
        <i className="pointer-reticle__arm pointer-reticle__arm--tr" />
        <i className="pointer-reticle__arm pointer-reticle__arm--bl" />
        <i className="pointer-reticle__arm pointer-reticle__arm--br" />
        <i className="pointer-reticle__tick pointer-reticle__tick--n" />
        <i className="pointer-reticle__tick pointer-reticle__tick--s" />
        <i className="pointer-reticle__tick pointer-reticle__tick--w" />
        <i className="pointer-reticle__tick pointer-reticle__tick--e" />
        <i className="pointer-reticle__pixel" />
      </span>

      <span className="pointer-bar" ref={barRef} />
    </div>
  )
}

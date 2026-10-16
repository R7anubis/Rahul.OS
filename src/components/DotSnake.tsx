import { useEffect, useRef, useState } from 'react'

/**
 * A small snake that lives inside the existing dot grid.
 *
 * It is drawn on one canvas layered *behind* the hero content and above the
 * CSS dot field, snapped to the same 12px pitch as `.dot-field` so it reads as
 * grid dots lighting up rather than a second competing pattern.
 *
 * Movement is a rope, not a stream of random directions: the head steers with
 * a bounded turn rate (< 1 rad/s) driven by smooth multi-frequency drift, and
 * every following dot is pulled to a fixed distance behind the one ahead of
 * it. That gives continuous curvature for free and makes sudden jumps
 * impossible by construction. Horizontal travel wraps modulo the canvas width,
 * so leaving one edge is the same motion as entering the other.
 *
 * Only one instance is ever awake: a snake runs while its section overlaps the
 * reading band near the top of the viewport, and takes the module-level
 * presence slot so a section boundary hands over cleanly instead of showing two
 * snakes at once. Between sections it fades out and stops entirely.
 *
 * Cost control:
 *  - nothing is mounted unless motion is on, the pointer is a fine hover
 *    device, and reduced motion is not requested;
 *  - one requestAnimationFrame loop, paused when the tab is hidden or the
 *    canvas is off-screen (IntersectionObserver);
 *  - previous cells are cleared individually instead of repainting the canvas;
 *  - device pixel ratio is capped at 2.
 */
interface DotSnakeProps {
  /** the site's own motion preference (header toggle) */
  motionEnabled: boolean
  /** className for placement-specific masking */
  className?: string
}

/** Grid pitch — kept in step with `.dot-field { background-size: 12px 12px }`. */
const PITCH = 12
/** Number of dots from head to tail tip. */
const BODY = 26
/** Vertical margin inside which the snake steers away from an edge. */
const V_MARGIN = 46
/** Below this width the hero is too tight for the effect to read well. */
const MIN_WIDTH = 480

type Phase = 'cruise' | 'pause' | 'dive' | 'surface' | 'approach' | 'tap' | 'recoil'

interface Dot {
  /** continuous x in canvas space; wraps modulo width when drawn */
  x: number
  y: number
  /** grid cell the dot is currently rendered in (hysteresis target) */
  cx: number
  cy: number
  hasCell: boolean
  r: number
  a: number
}

/**
 * Only one snake may be visible on the page at a time.
 *
 * Each mounted snake tries to take this single slot when its section reaches
 * the reading band. A snake holds the slot while it fades out and releases it
 * when it has gone, so a handoff between sections is sequential — the outgoing
 * snake finishes leaving before the incoming one appears — rather than two
 * snakes crossed over each other.
 */
let presenceHolder: object | null = null

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** Shortest signed angular difference, in (-PI, PI]. */
const angleDiff = (target: number, current: number) => {
  let d = (target - current) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

export function DotSnake({ motionEnabled, className = '' }: DotSnakeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  /**
   * Whether the effect may run at all. Resolved before render so a device that
   * is not eligible never gets the canvas element — an inert empty canvas in
   * the DOM would still be a small lie about what is switched on.
   */
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
    // Touch-first devices skip the effect entirely, per the design brief.
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

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    /* ---- palette, re-read whenever the theme changes ------------------ */
    let ink = 'rgba(255,255,255,0.55)'
    let headInk = 'rgba(255,255,255,0.95)'
    let accent = 'rgb(255,69,48)'
    const readPalette = () => {
      const cs = getComputedStyle(canvas)
      const text = cs.getPropertyValue('--text').trim()
      const dim = cs.getPropertyValue('--text-dim').trim()
      const ac = cs.getPropertyValue('--accent').trim()
      if (dim) ink = dim
      if (text) headInk = text
      if (ac) accent = ac
    }

    /* ---- geometry ---------------------------------------------------- */
    let width = 0
    let height = 0
    let dpr = 1
    let enabled = false

    const dots: Dot[] = []
    for (let i = 0; i < BODY; i += 1) {
      dots.push({
        x: 0,
        y: 0,
        cx: 0,
        cy: 0,
        hasCell: false,
        r: 1.5,
        a: 1,
      })
    }
    // Radius and alpha taper from head to tail.
    for (let i = 0; i < BODY; i += 1) {
      const t = i / (BODY - 1)
      const dot = dots[i]!
      dot.r = i === 0 ? 2.2 : 1.5 - t * 0.5
      dot.a = i === 0 ? 1 : 0.85 * (1 - t) ** 1.35 + 0.06
    }

    const state = {
      x: 0,
      y: 0,
      heading: 0,
      speed: 34,
      targetSpeed: 34,
      phase: 'cruise' as Phase,
      phaseT: 0,
      phaseDur: 0,
      fade: 1,
      fadeTarget: 1,
      eventTimer: rand(6, 12),
      encounterTimer: rand(8, 16),
      encounterCooldown: 0,
      tapPoint: null as { x: number; y: number; t: number } | null,
      seedA: Math.random() * Math.PI * 2,
      seedB: Math.random() * Math.PI * 2,
      frame: 0,
      last: 0,
    }

    /** The last cells drawn, so they can be cleared individually. */
    let painted: { x: number; y: number }[] = []

    const pointer = { x: -1, y: -1, inside: false, active: false }

    const place = (relocate: boolean) => {
      state.x = relocate ? rand(width * 0.12, width * 0.88) : width * 0.5
      state.y = relocate ? rand(V_MARGIN + 12, Math.max(V_MARGIN + 13, height - V_MARGIN - 12)) : height * 0.5
      state.heading = rand(0, Math.PI * 2)
      state.speed = 34
      state.targetSpeed = 34
      for (let i = 0; i < BODY; i += 1) {
        const dot = dots[i]!
        dot.x = state.x - Math.cos(state.heading) * PITCH * i
        dot.y = state.y - Math.sin(state.heading) * PITCH * i
        dot.hasCell = false
      }
    }

    /* ---- resize ------------------------------------------------------ */
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const nextW = Math.max(0, Math.round(rect.width))
      const nextH = Math.max(0, Math.round(rect.height))
      enabled = nextH > 120 && nextW >= MIN_WIDTH
      if (nextW === width && nextH === height) return

      width = nextW
      height = nextH
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      readPalette()
      painted = []
      place(!state.x)
      if (!enabled) {
        ctx.clearRect(0, 0, width, height)
      }
    }

    /* ---- one simulation step ---------------------------------------- */
    const step = (dt: number) => {
      state.phaseT += dt
      state.encounterCooldown = Math.max(0, state.encounterCooldown - dt)

      switch (state.phase) {
        case 'pause': {
          state.targetSpeed = 4
          if (state.phaseT >= state.phaseDur) {
            state.phase = 'cruise'
            state.phaseT = 0
            state.targetSpeed = rand(30, 46)
            state.eventTimer = rand(7, 16)
          }
          break
        }
        case 'dive': {
          state.fadeTarget = 0
          if (state.phaseT >= 0.55) {
            place(true)
            state.phase = 'surface'
            state.phaseT = 0
            state.fadeTarget = 1
          }
          break
        }
        case 'surface': {
          if (state.phaseT >= 0.5) {
            state.phase = 'cruise'
            state.phaseT = 0
            state.eventTimer = rand(7, 16)
          }
          break
        }
        case 'approach': {
          if (!pointer.inside) {
            state.phase = 'recoil'
            state.phaseT = 0
            break
          }
          const dx = pointer.x - state.x
          const dy = pointer.y - state.y
          if (Math.hypot(dx, dy) < 24) {
            state.phase = 'tap'
            state.phaseT = 0
            state.tapPoint = { x: state.x, y: state.y, t: 0 }
          } else if (state.phaseT > 3.2) {
            state.phase = 'recoil'
            state.phaseT = 0
          }
          break
        }
        case 'tap': {
          state.targetSpeed = 6
          if (state.phaseT >= 0.28) {
            state.phase = 'recoil'
            state.phaseT = 0
            state.tapPoint = { x: state.x, y: state.y, t: 0 }
          }
          break
        }
        case 'recoil': {
          if (state.phaseT >= 1.1) {
            state.phase = 'cruise'
            state.phaseT = 0
            state.eventTimer = rand(7, 16)
            state.encounterCooldown = rand(14, 30)
            state.tapPoint = null
          }
          break
        }
        default: {
          // cruise
          state.targetSpeed = 34
          if (state.eventTimer > 0) {
            state.eventTimer -= dt
          } else if (Math.random() < 0.72) {
            state.phase = 'pause'
            state.phaseT = 0
            state.phaseDur = rand(0.8, 2.6)
          } else {
            state.phase = 'dive'
            state.phaseT = 0
          }
        }
      }

      /* ---- steering ----------------------------------------------- */
      const t = state.phaseT
      // Smooth bounded drift: two slow sines, no per-frame randomness.
      const drift =
        Math.sin(t * 0.37 + state.seedA + state.x * 0.004) * 0.6 +
        Math.sin(t * 0.71 + state.seedB + state.y * 0.005) * 0.4

      let dirX = Math.cos(state.heading)
      let dirY = Math.sin(state.heading)

      if (state.phase === 'approach' || state.phase === 'tap') {
        // Turn toward the cursor at a limited rate — a gentle approach, not a snap.
        const dx = pointer.x - state.x
        const dy = pointer.y - state.y
        const len = Math.hypot(dx, dy) || 1
        dirX = dx / len
        dirY = dy / len
      } else if (state.phase === 'recoil') {
        // Deflect away, then let the drift take over again.
        const dx = state.x - pointer.x
        const dy = state.y - pointer.y
        const len = Math.hypot(dx, dy) || 1
        dirX = dx / len + drift * 0.5
        dirY = dy / len + drift * 0.5
      } else {
        // Vertical softening near the top and bottom edges.
        if (state.y < V_MARGIN) {
          dirY += ((V_MARGIN - state.y) / V_MARGIN) * 1.8
        } else if (state.y > height - V_MARGIN) {
          dirY -= ((state.y - (height - V_MARGIN)) / V_MARGIN) * 1.8
        }
        dirX += drift * 0.55
        dirY += drift * 0.35
      }

      const targetHeading = Math.atan2(dirY, dirX)
      const maxTurn =
        state.phase === 'approach' || state.phase === 'recoil' ? 1.9 : state.phase === 'tap' ? 0.4 : 0.95
      const turn = angleDiff(targetHeading, state.heading)
      state.heading += Math.max(-maxTurn * dt, Math.min(maxTurn * dt, turn))

      /* ---- integrate ------------------------------------------------- */
      const speedLerp = state.phase === 'pause' ? 3.2 : 1.6
      state.speed += (state.targetSpeed - state.speed) * Math.min(1, speedLerp * dt)
      state.x += Math.cos(state.heading) * state.speed * dt
      state.y += Math.sin(state.heading) * state.speed * dt

      // Horizontal wrap: leaving one edge is the same move as entering the other.
      if (state.x < 0) state.x += width
      else if (state.x > width) state.x -= width

      // Vertical clamp with a last-resort reflection, so it can never escape.
      const topPad = 10
      const botPad = height - 10
      if (state.y < topPad) {
        state.y = topPad
        state.heading = -state.heading
      } else if (state.y > botPad) {
        state.y = botPad
        state.heading = -state.heading
      }

      state.fade += (state.fadeTarget - state.fade) * Math.min(1, 4 * dt)

      /* ---- rope: each dot holds a fixed distance behind the one ahead -- */
      const head = dots[0]!
      head.x = state.x
      head.y = state.y
      for (let i = 1; i < BODY; i += 1) {
        const a = dots[i - 1]!
        const b = dots[i]!
        const dx = a.x - b.x
        const dy = a.y - b.y
        const d = Math.hypot(dx, dy)
        if (d > PITCH) {
          const pull = (d - PITCH) / d
          b.x += dx * pull
          b.y += dy * pull
        }
      }

      // Grid snapping with hysteresis: a dot keeps its cell until it has moved
      // well past halfway, which removes the boundary flicker that plain
      // rounding produces.
      for (let i = 1; i < BODY; i += 1) {
        const dot = dots[i]!
        if (!dot.hasCell) {
          dot.cx = Math.round(dot.x / PITCH) * PITCH
          dot.cy = Math.round(dot.y / PITCH) * PITCH
          dot.hasCell = true
        } else if (
          Math.abs(dot.x - dot.cx) > PITCH * 0.55 ||
          Math.abs(dot.y - dot.cy) > PITCH * 0.55
        ) {
          dot.cx += Math.round((dot.x - dot.cx) / PITCH) * PITCH
          dot.cy += Math.round((dot.y - dot.cy) / PITCH) * PITCH
        }
      }

      if (state.tapPoint) state.tapPoint.t += dt

      /* ---- random events --------------------------------------------- */
      if (
        state.phase === 'cruise' &&
        state.encounterCooldown <= 0 &&
        pointer.inside &&
        pointer.active
      ) {
        const dx = pointer.x - state.x
        const dy = pointer.y - state.y
        if (Math.hypot(dx, dy) < 300) {
          state.phase = 'approach'
          state.phaseT = 0
          state.encounterCooldown = 400 // held until the recoil finishes
        }
      }
      if (state.encounterTimer > 0) state.encounterTimer -= dt
    }

    /* ---- draw --------------------------------------------------------- */
    const wrapDraw = (x: number, draw: (px: number) => void) => {
      draw(x)
      if (x < PITCH * 3) draw(x + width)
      else if (x > width - PITCH * 3) draw(x - width)
    }

    const render = () => {
      // Clear exactly what was drawn last frame.
      for (const cell of painted) {
        ctx.clearRect(cell.x - 5, cell.y - 5, 10, 10)
      }
      painted = []
      const fade = state.fade * presence
      if (!enabled || fade < 0.02) return

      const approaching = state.phase === 'approach' || state.phase === 'tap'

      // Body dots, back to front so the head sits on top.
      for (let i = BODY - 1; i >= 1; i -= 1) {
        const dot = dots[i]!
        const alpha = dot.a * fade
        if (alpha <= 0.02) continue
        const r = dot.r
        ctx.fillStyle = i === 1 && approaching ? accent : ink
        const a = i === 1 && approaching ? Math.min(1, alpha + 0.25) : alpha
        ctx.globalAlpha = a
        wrapDraw(dot.cx, (px) => {
          ctx.beginPath()
          ctx.arc(px, dot.cy, r, 0, Math.PI * 2)
          ctx.fill()
        })
        wrapDraw(dot.cx, (px) => painted.push({ x: px, y: dot.cy }))
      }

      // Head: drawn at its true position so the leading edge stays smooth.
      ctx.globalAlpha = fade
      ctx.fillStyle = approaching ? accent : headInk
      const headDot = dots[0]!
      wrapDraw(headDot.x, (px) => {
        ctx.beginPath()
        ctx.arc(px, headDot.y, 2.2, 0, Math.PI * 2)
        ctx.fill()
      })
      wrapDraw(headDot.x, (px) => painted.push({ x: px, y: headDot.y }))

      // The single red mark left by a tap, fading out over ~0.9s.
      const tap = state.tapPoint
      if (tap && tap.t < 0.9) {
        const age = tap.t / 0.9
        ctx.globalAlpha = (1 - age) * 0.9 * fade
        ctx.fillStyle = accent
        wrapDraw(tap.x, (px) => {
          ctx.beginPath()
          ctx.arc(px, tap.y, 1.6 + age * 1.4, 0, Math.PI * 2)
          ctx.fill()
        })
        wrapDraw(tap.x, (px) => painted.push({ x: px, y: tap.y }))
      }

      ctx.globalAlpha = 1
    }

    /* ---- loop --------------------------------------------------------- */
    const token = {}
    let running = false
    let visible = true
    let primary = false
    /** how far this snake is faded in; 0 = gone, 1 = fully present */
    let presence = 0

    /**
     * Claim (or keep) the single presence slot for this frame, then ease toward
     * the resulting target. A snake that wants the slot while another holds it
     * simply waits, faded out, until the holder finishes leaving.
     */
    const updatePresence = (dt: number) => {
      const wants = primary && visible && enabled
      if (wants && presenceHolder === null) presenceHolder = token
      const owns = presenceHolder === token
      const target = wants && owns ? 1 : 0
      presence += (target - presence) * Math.min(1, 5 * dt)
      if (!wants && owns && presence <= 0.01) {
        presence = 0
        presenceHolder = null
      }
    }

    /** Keep animating while primary, or while still visibly fading out. */
    const shouldRun = () => visible && (primary || presence > 0.01)

    const frame = (now: number) => {
      if (!running) return
      state.frame = window.requestAnimationFrame(frame)
      if (!state.last) state.last = now
      const dt = Math.min(0.05, (now - state.last) / 1000)
      state.last = now
      updatePresence(dt)
      if (enabled) step(dt)
      render()
      if (!shouldRun()) stop()
    }

    const start = () => {
      if (running || !shouldRun()) return
      running = true
      state.last = 0
      state.frame = window.requestAnimationFrame(frame)
    }

    const stop = () => {
      running = false
      if (state.frame) window.cancelAnimationFrame(state.frame)
      state.frame = 0
      // Never leave the slot claimed by a snake that is no longer running, or
      // no other section could ever take it.
      if (presenceHolder === token) presenceHolder = null
    }

    /* ---- listeners ---------------------------------------------------- */
    const onResize = () => {
      resize()
      if (enabled) start()
      else stop()
    }

    const onVisibility = () => {
      visible = !document.hidden
      if (visible) start()
      else stop()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.inside =
        pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height
      pointer.active = true
    }
    const onPointerLeave = () => {
      pointer.inside = false
      pointer.active = false
    }

    // Theme changes swap the palette under a running canvas.
    const themeObserver = new MutationObserver(readPalette)

    /**
     * Primacy is measured against a band near the top of the viewport rather
     * than "any part visible". The band is 30%–45% of the viewport height, which
     * is where the eye sits while reading, and because the sections are stacked
     * and non-overlapping at most one snake holds it at a time — so two snakes
     * cannot both be awake. Crossing a boundary lets the outgoing snake finish
     * fading before the incoming one takes the slot.
     */
    const io =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(
            (entries) => {
              primary = entries.some((entry) => entry.isIntersecting)
              if (primary && visible) start()
            },
            { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
          )
        : null

    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null

    readPalette()
    resize()
    if (ro) ro.observe(canvas)
    else window.addEventListener('resize', onResize)
    if (io) io.observe(canvas)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)

    // Without an observer there is no band to measure, so the snake behaves as
    // it did before: present whenever the section is mounted and enabled.
    if (!io) primary = true
    if (visible && enabled) start()

    return () => {
      stop()
      ro?.disconnect()
      io?.disconnect()
      themeObserver.disconnect()
      if (!ro) window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [canRun])

  if (!canRun) return null

  return <canvas className={`snake ${className}`.trim()} ref={canvasRef} aria-hidden="true" />
}

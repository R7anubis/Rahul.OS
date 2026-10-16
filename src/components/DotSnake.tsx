import { useEffect, useRef, useState } from 'react'
import {
  DOT_PITCH,
  buildCorridors,
  phaseFor,
  snapToLattice,
  type Band,
} from '../lib/dotGeometry'

/**
 * A small snake that lives inside the site's dot grid — one snake for the whole
 * page, not one per section.
 *
 * There is a single canvas, fixed to the viewport, driven by a single
 * simulation that runs in *document* coordinates. Because the snake's position
 * is a position on the page rather than a position on the screen, scrolling
 * does not move it: it stays where it is and the page slides past it, the way
 * something drawn into the grid would. The scroll offset is subtracted on the
 * way out, at draw time.
 *
 * Where it is allowed to go is declared in markup, by sections carrying
 * `data-snake-band`. Bands closer together than `TRACK_GAP` are joined into one
 * corridor the snake can swim across, and every band is also a clip region, so
 * nothing is ever painted outside them. The hero and About form one corridor
 * (the toolchain strip between them is opaque and only about 60px tall, so the
 * snake passes behind it and comes out the other side). Contact is the other.
 *
 * Two transitions, both deliberate:
 *  - **within a corridor** the snake steers toward the part of the page being
 *    read, so it arrives by swimming rather than by appearing;
 *  - **between corridors** — About to Contact, with five sections in between —
 *    it dives under the grid, is moved while it is invisible, and surfaces in
 *    the section being read. Swimming that far would mean crossing cards,
 *    diagrams and dense text, which the design rules out.
 *
 * Movement itself is a rope, not a stream of random directions: the head steers
 * with a bounded turn rate (< 1 rad/s) driven by smooth multi-frequency drift,
 * and every following dot is pulled to a fixed distance behind the one ahead of
 * it. That gives continuous curvature for free and makes sudden jumps
 * impossible by construction. Horizontal travel wraps modulo the width, so
 * leaving one edge is the same motion as entering the other.
 *
 * Cost control:
 *  - nothing is mounted unless motion is on, the pointer is a fine hover
 *    device, and reduced motion is not requested;
 *  - one requestAnimationFrame loop for the whole page, paused when the tab is
 *    hidden or when no band is on screen (which is most of a scroll through the
 *    middle of the page);
 *  - previous cells are cleared individually instead of repainting the canvas;
 *  - device pixel ratio is capped at 2.
 */
interface DotSnakeProps {
  /** the site's own motion preference (header toggle) */
  motionEnabled: boolean
}

/** Number of dots from head to tail tip. */
const BODY = 26
/** Vertical margin inside which the snake steers away from a corridor edge. */
const V_MARGIN = 46
/** Below this width the effect is too tight to read well. */
const MIN_WIDTH = 480
/** Last-resort clamp inside a corridor, so it can never escape one. */
const EDGE_PAD = 10
/** Where the eye sits in the viewport, as a fraction of its height. */
const READ_FRACTION = 0.38
/** Strength of the pull toward the band being read, in heading units. */
const HOME_PULL = 1.15

type Phase = 'cruise' | 'pause' | 'dive' | 'surface' | 'approach' | 'tap' | 'recoil'

interface Dot {
  /** continuous x in viewport space; wraps modulo width when drawn */
  x: number
  /** continuous y in document space */
  y: number
  /** grid cell the dot is currently rendered in (hysteresis target) */
  cx: number
  cy: number
  hasCell: boolean
  r: number
  a: number
}

/** A band with its lattice resolved into document coordinates. */
interface PlacedBand {
  top: number
  bottom: number
  /** document y of this band's first dot row */
  lattice: number
}

interface PlacedCorridor {
  top: number
  bottom: number
  bands: PlacedBand[]
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Shortest signed angular difference, in (-PI, PI]. */
const angleDiff = (target: number, current: number) => {
  let d = (target - current) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

export function DotSnake({ motionEnabled }: DotSnakeProps) {
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
    /** document y of the top of the viewport */
    let scrollY = window.scrollY || 0

    /** The lattice the printed dots use, horizontally. */
    let phaseX = 0
    let corridors: PlacedCorridor[] = []
    let current: PlacedCorridor | null = null
    let pending: PlacedCorridor | null = null
    /** the band inside the current corridor that the reader is in */
    let home: PlacedBand | null = null

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
      encounterCooldown: 0,
      tapPoint: null as { x: number; y: number; t: number } | null,
      seedA: Math.random() * Math.PI * 2,
      seedB: Math.random() * Math.PI * 2,
      frame: 0,
      last: 0,
      placed: false,
    }

    /** The last cells drawn, so they can be cleared individually. */
    let painted: { x: number; y: number }[] = []

    /** Cursor, in viewport coordinates; converted to document space on use. */
    const pointer = { x: -1, y: -1, inside: false, active: false }

    /** Document y of the line the reader's eye sits on. */
    const readLine = () => scrollY + height * READ_FRACTION

    /**
     * Whether any part of the snake is on screen right now. The margin is
     * generous because the body trails up to `BODY * DOT_PITCH` behind the head,
     * so the snake can still be partly visible with its head just off screen.
     */
    const snakeOnScreen = () =>
      state.y - scrollY > -160 && state.y - scrollY < height + 160

    /** Whether any band at all is on screen — with a small margin, so the loop
     *  starts just before a band arrives and stops just after it leaves. */
    const anyBandOnScreen = () =>
      corridors.some((corridor) => corridor.bands.some((band) => bandOnScreen(band)))

    const bandOnScreen = (band: PlacedBand) =>
      band.bottom - scrollY > -40 && band.top - scrollY < height + 40

    const nearestBand = (corridor: PlacedCorridor, y: number) => {
      let best = corridor.bands[0] ?? null
      let bestDistance = Infinity
      for (const band of corridor.bands) {
        const distance = y < band.top ? band.top - y : y > band.bottom ? y - band.bottom : 0
        if (distance < bestDistance) {
          bestDistance = distance
          best = band
        }
      }
      return best
    }

    /** The band a dot at document y belongs to, for lattice snapping. */
    const bandAt = (y: number) => {
      if (!current) return null
      for (const band of current.bands) {
        if (y >= band.top && y <= band.bottom) return band
      }
      return nearestBand(current, y)
    }

    /* ---- measurement -------------------------------------------------- */
    const measure = () => {
      const bands: Band[] = []
      for (const element of document.querySelectorAll('[data-snake-band]')) {
        const rect = element.getBoundingClientRect()
        const top = rect.top + (window.scrollY || 0)
        if (rect.height <= 0) continue
        bands.push({ top, bottom: top + rect.height, phase: phaseFor(rect.height) })
      }
      corridors = buildCorridors(bands).map((corridor) => ({
        top: corridor.top,
        bottom: corridor.bottom,
        bands: corridor.bands.map((band) => ({
          top: band.top,
          bottom: band.bottom,
          lattice: band.top + band.phase,
        })),
      }))

      // The corridors are rebuilt from scratch, so the snake's is resolved again
      // by the line the reader is on. If that line is not in a corridor — they
      // are reading the middle of the page — it waits to be placed rather than
      // steering toward bounds that may have moved under it.
      pending = null
      const line = readLine()
      current = corridors.find((corridor) => line >= corridor.top && line <= corridor.bottom) ?? null
      if (!current) state.placed = false
    }

    /**
     * Put the snake down in `corridor`, near the line the reader is on so that
     * it surfaces where they are looking rather than at a random end.
     */
    const place = (corridor: PlacedCorridor, relocate: boolean) => {
      const band = nearestBand(corridor, readLine()) ?? corridor.bands[0]
      const top = (band?.top ?? corridor.top) + V_MARGIN + 12
      const bottom = (band?.bottom ?? corridor.bottom) - V_MARGIN - 12
      const lo = Math.min(top, bottom)
      const hi = Math.max(top, bottom)
      state.x = relocate ? rand(width * 0.12, width * 0.88) : width * 0.5
      state.y = relocate ? clamp(readLine() + rand(-60, 60), lo, hi) : (lo + hi) / 2
      state.heading = rand(0, Math.PI * 2)
      state.speed = 34
      state.targetSpeed = 34
      state.placed = true
      for (let i = 0; i < BODY; i += 1) {
        const dot = dots[i]!
        dot.x = state.x - Math.cos(state.heading) * DOT_PITCH * i
        dot.y = state.y - Math.sin(state.heading) * DOT_PITCH * i
        dot.hasCell = false
      }
    }

    /* ---- moving between corridors -------------------------------------- */
    const relocateNow = () => {
      if (!pending) return
      current = pending
      pending = null
      state.fade = 0
      state.fadeTarget = 1
      place(current, true)
      state.phase = 'surface'
      state.phaseT = 0
    }

    const startDive = () => {
      state.phase = 'dive'
      state.phaseT = 0
      state.fadeTarget = 0
    }

    /**
     * Decide which corridor the snake should be in, and which band inside it
     * the reader is on.
     *
     * Moving within a corridor is a swim: the band to head for changes, and the
     * steering reads it as an errand. Moving between corridors is a dive.
     */
    const pickCorridor = () => {
      const line = readLine()
      const target =
        corridors.find((corridor) => line >= corridor.top && line <= corridor.bottom) ?? null

      // Queue a move if the reader is now in a different corridor, and drop a
      // queued one if they have gone back to the corridor the snake is in.
      if (pending && pending !== target) pending = null
      if (target && target !== current) pending = target

      // Then act on it. A dive already under way is left alone: it performs the
      // move itself when it lands. Otherwise, if there is something on screen to
      // see it dives first, and if there is not it is simply moved, which is
      // invisible either way.
      if (pending && state.phase !== 'dive') {
        if (state.placed && snakeOnScreen()) startDive()
        else relocateNow()
      }

      home = current ? (current.bands.find((band) => line >= band.top && line <= band.bottom) ?? nearestBand(current, line)) : null
    }

    /* ---- resize ------------------------------------------------------- */
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
      // The printed lattice is centred in its element, so where the dots fall
      // depends on the size they are drawn at.
      phaseX = phaseFor(width)
      if (!enabled) {
        ctx.clearRect(0, 0, width, height)
      }
      if (state.placed && current) place(current, true)
    }

    /* ---- one simulation step ---------------------------------------- */
    const step = (dt: number) => {
      if (!current) return
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
            if (pending) {
              current = pending
              pending = null
            }
            place(current, true)
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
          const dy = pointer.y + scrollY - state.y
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
        const dy = pointer.y + scrollY - state.y
        const len = Math.hypot(dx, dy) || 1
        dirX = dx / len
        dirY = dy / len
      } else if (state.phase === 'recoil') {
        // Deflect away, then let the drift take over again.
        const dx = state.x - pointer.x
        const dy = state.y - (pointer.y + scrollY)
        const len = Math.hypot(dx, dy) || 1
        dirX = dx / len + drift * 0.5
        dirY = dy / len + drift * 0.5
      } else {
        // Errand: head for the band being read, but only once outside it.
        if (home && !state.tapPoint) {
          const reachTop = home.top + V_MARGIN
          const reachBottom = home.bottom - V_MARGIN
          if (state.y < reachTop) dirY += Math.min(1, (reachTop - state.y) / 300) * HOME_PULL
          else if (state.y > reachBottom) dirY -= Math.min(1, (state.y - reachBottom) / 300) * HOME_PULL
        }
        // Vertical softening near the corridor edges.
        const softTop = current.top + V_MARGIN
        const softBottom = current.bottom - V_MARGIN
        if (state.y < softTop) {
          dirY += ((softTop - state.y) / V_MARGIN) * 1.8
        } else if (state.y > softBottom) {
          dirY -= ((state.y - softBottom) / V_MARGIN) * 1.8
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

      // Vertical clamp with a last-resort reflection, so it can never escape
      // the corridor it belongs to.
      if (state.y < current.top + EDGE_PAD) {
        state.y = current.top + EDGE_PAD
        state.heading = -state.heading
      } else if (state.y > current.bottom - EDGE_PAD) {
        state.y = current.bottom - EDGE_PAD
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
        if (d > DOT_PITCH) {
          const pull = (d - DOT_PITCH) / d
          b.x += dx * pull
          b.y += dy * pull
        }
      }

      // Grid snapping with hysteresis: a dot keeps its cell until it has moved
      // well past halfway, which removes the boundary flicker that plain
      // rounding produces. Both axes snap to the lattice the CSS prints — the
      // element's own centre, not multiples of the pitch from its corner — so
      // the snake lights up dots that are already there.
      for (let i = 1; i < BODY; i += 1) {
        const dot = dots[i]!
        const band = bandAt(dot.y)
        const tx = snapToLattice(dot.x, phaseX)
        const ty = band ? snapToLattice(dot.y, band.lattice) : dot.y
        if (!dot.hasCell) {
          dot.cx = tx
          dot.cy = ty
          dot.hasCell = true
        } else if (Math.abs(dot.x - dot.cx) > DOT_PITCH * 0.55 || Math.abs(dot.y - dot.cy) > DOT_PITCH * 0.55) {
          dot.cx = tx
          dot.cy = ty
        }
      }

      if (state.tapPoint) state.tapPoint.t += dt

      /* ---- cursor encounters ---------------------------------------- */
      if (
        state.phase === 'cruise' &&
        state.encounterCooldown <= 0 &&
        pointer.inside &&
        pointer.active &&
        snakeOnScreen()
      ) {
        const dx = pointer.x - state.x
        const dy = pointer.y + scrollY - state.y
        if (Math.hypot(dx, dy) < 300) {
          state.phase = 'approach'
          state.phaseT = 0
          state.encounterCooldown = 400 // held until the recoil finishes
        }
      }
    }

    /* ---- draw --------------------------------------------------------- */
    const wrapDraw = (x: number, draw: (px: number) => void) => {
      draw(x)
      if (x < DOT_PITCH * 3) draw(x + width)
      else if (x > width - DOT_PITCH * 3) draw(x - width)
    }

    const render = () => {
      // Clear exactly what was drawn last frame.
      for (const cell of painted) {
        ctx.clearRect(cell.x - 5, cell.y - 5, 10, 10)
      }
      painted = []
      const fade = state.fade
      if (!enabled || !current || fade < 0.02) return

      const offset = scrollY
      // Nothing may be painted outside the declared bands: the union of their
      // rectangles is the clip, so the snake is hidden behind whatever sits in
      // the gaps (the toolchain strip, for instance) instead of over it.
      ctx.save()
      ctx.beginPath()
      for (const band of current.bands) {
        ctx.rect(0, band.top - offset, width, band.bottom - band.top)
      }
      ctx.clip()

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
          ctx.arc(px, dot.cy - offset, r, 0, Math.PI * 2)
          ctx.fill()
        })
        wrapDraw(dot.cx, (px) => painted.push({ x: px, y: dot.cy - offset }))
      }

      // Head: drawn at its true position so the leading edge stays smooth.
      ctx.globalAlpha = fade
      ctx.fillStyle = approaching ? accent : headInk
      const headDot = dots[0]!
      wrapDraw(headDot.x, (px) => {
        ctx.beginPath()
        ctx.arc(px, headDot.y - offset, 2.2, 0, Math.PI * 2)
        ctx.fill()
      })
      wrapDraw(headDot.x, (px) => painted.push({ x: px, y: headDot.y - offset }))

      // The single red mark left by a tap, fading out over ~0.9s.
      const tap = state.tapPoint
      if (tap && tap.t < 0.9) {
        const age = tap.t / 0.9
        ctx.globalAlpha = (1 - age) * 0.9 * fade
        ctx.fillStyle = accent
        wrapDraw(tap.x, (px) => {
          ctx.beginPath()
          ctx.arc(px, tap.y - offset, 1.6 + age * 1.4, 0, Math.PI * 2)
          ctx.fill()
        })
        wrapDraw(tap.x, (px) => painted.push({ x: px, y: tap.y - offset }))
      }

      ctx.globalAlpha = 1
      ctx.restore()
    }

    /* ---- loop --------------------------------------------------------- */
    let running = false
    let visible = true

    /** The loop only needs to run while a band is on screen and enabled. */
    const shouldRun = () => visible && enabled && corridors.length > 0 && anyBandOnScreen()

    const frame = (now: number) => {
      if (!running) return
      state.frame = window.requestAnimationFrame(frame)
      if (!state.last) state.last = now
      const dt = Math.min(0.05, (now - state.last) / 1000)
      state.last = now
      scrollY = window.scrollY || 0
      pickCorridor()
      if (!state.placed && current) place(current, true)
      if (!shouldRun()) {
        stop()
        return
      }
      step(dt)
      render()
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
      // A stopped loop can leave the last frame on a canvas that no longer
      // tracks the page, so clear it rather than let it sit there.
      for (const cell of painted) ctx.clearRect(cell.x - 5, cell.y - 5, 10, 10)
      painted = []
    }

    /* ---- listeners ---------------------------------------------------- */
    const onResize = () => {
      resize()
      measure()
      if (enabled) start()
      else stop()
    }

    const onScroll = () => {
      scrollY = window.scrollY || 0
      start()
    }

    const onVisibility = () => {
      visible = !document.hidden
      if (visible) start()
      else stop()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.inside =
        pointer.x >= 0 && pointer.y >= 0 && pointer.x <= width && pointer.y <= height
      pointer.active = true
    }
    const onPointerLeave = () => {
      pointer.inside = false
      pointer.active = false
    }

    // Theme changes swap the palette under a running canvas.
    const themeObserver = new MutationObserver(readPalette)
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null

    readPalette()
    resize()
    measure()
    if (ro) ro.observe(document.body)
    else window.addEventListener('resize', onResize)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)

    if (shouldRun()) start()

    return () => {
      stop()
      ro?.disconnect()
      themeObserver.disconnect()
      if (!ro) window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [canRun])

  if (!canRun) return null

  return <canvas className="snake" ref={canvasRef} aria-hidden="true" />
}

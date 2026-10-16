/**
 * Hero motif: an instrument dial drawn around the portrait.
 *
 * The drawing is centred on the portrait plate and sized from it (the CSS box
 * is a fixed multiple of the plate's width), so the arcs clear the plate's
 * corners at every breakpoint and stay in register with the photograph. Three
 * concentric arcs sit in the band above and beside the plate, crossed by radial
 * ticks, carrying a few nodes and one dashed accent sweep. The part of each arc
 * that would fall behind the plate is drawn behind it, so the plate's border
 * and corner ticks stay unbroken.
 *
 * Deterministic SVG — no random numbers, no canvas, no telemetry pretence.
 * Motion is the slow dash sweep and a node opacity pulse, both switched off
 * with the motion toggle.
 */
const CENTRE = 400
/** Arc radii, in viewBox units. The portrait plate occupies ±182 × ±237. */
const ARCS = [262, 283, 304] as const
/** The middle arc carries the ticks and the accent sweep. */
const ARC_MID = 283
const SWEEP_FROM = 150
const SWEEP_TO = 390
/** Tick angles across the sweep — 30° apart, ends included. */
const TICKS = Array.from({ length: 9 }, (_, index) => SWEEP_FROM + index * ((SWEEP_TO - SWEEP_FROM) / 8))

const polar = (radius: number, degrees: number): [number, number] => {
  const radians = (degrees * Math.PI) / 180
  return [
    CENTRE + radius * Math.cos(radians),
    CENTRE + radius * Math.sin(radians),
  ]
}

const arcPath = (radius: number) => {
  const [x1, y1] = polar(radius, SWEEP_FROM)
  const [x2, y2] = polar(radius, SWEEP_TO)
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

/** Nodes sit on an arc, at the angle given — hand-placed, stable. */
const NODES: { radius: number; angle: number; accent?: boolean }[] = [
  { radius: 304, angle: 300, accent: true },
  { radius: 262, angle: 202 },
  { radius: 283, angle: 246 },
  { radius: 304, angle: 336 },
  { radius: 283, angle: 384 },
  { radius: 262, angle: 168 },
]

export function SignalMotif() {
  return (
    <div className="motif" aria-hidden="true">
      <svg viewBox="0 0 800 800" role="presentation" focusable="false">
        {ARCS.map((radius) => (
          <path
            key={radius}
            className="motif__arc"
            d={arcPath(radius)}
            fill="none"
          />
        ))}

        {TICKS.map((angle) => {
          const [x1, y1] = polar(ARC_MID - 18, angle)
          const [x2, y2] = polar(ARC_MID + 16, angle)
          return (
            <line
              key={`tick-${angle}`}
              className="motif__tick"
              x1={x1.toFixed(2)}
              y1={y1.toFixed(2)}
              x2={x2.toFixed(2)}
              y2={y2.toFixed(2)}
            />
          )
        })}

        {/* One dashed accent sweep on the middle ring — the signal, not a spinner. */}
        <path className="motif__trace" d={arcPath(ARC_MID)} pathLength={100} strokeDasharray="8 22" fill="none" />

        {NODES.map(({ radius, angle, accent }) => {
          const [x, y] = polar(radius, angle)
          return (
            <g key={`node-${radius}-${angle}`}>
              <circle
                className="motif__node"
                cx={x.toFixed(2)}
                cy={y.toFixed(2)}
                r={accent ? 4.5 : 2.6}
                fill={accent ? 'var(--accent)' : 'var(--text-dim)'}
              />
              {accent ? (
                <circle
                  cx={x.toFixed(2)}
                  cy={y.toFixed(2)}
                  r="13"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1"
                  opacity="0.5"
                />
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

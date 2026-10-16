/**
 * Hero motif: concentric instrumentation rings, radial spokes, a signal trace
 * crossing the field and a handful of nodes. Deterministic SVG — no random
 * numbers, no canvas, no telemetry pretence. Motion is a slow dash trace and a
 * subtle node opacity pulse, both switched off when motion is disabled.
 */
export function SignalMotif() {
  const centre = 380
  const rings = [120, 200, 280]
  const spokes = Array.from({ length: 12 }, (_, index) => (index * 360) / 12)

  // Node positions sit where the trace crosses a ring — hand-placed, stable.
  const nodes: [number, number][] = [
    [380, 100],
    [520, 200],
    [660, 380],
    [520, 560],
    [380, 660],
    [240, 560],
    [100, 380],
    [240, 200],
  ]

  return (
    <div className="motif" aria-hidden="true">
      <svg viewBox="0 0 760 760" role="presentation" focusable="false">
        {rings.map((r) => (
          <circle
            key={r}
            cx={centre}
            cy={centre}
            r={r}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
          />
        ))}

        {spokes.map((angle) => {
          const rad = (angle * Math.PI) / 180
          return (
            <line
              key={angle}
              x1={centre}
              y1={centre}
              x2={centre + Math.cos(rad) * 280}
              y2={centre + Math.sin(rad) * 280}
              stroke="var(--line-soft)"
              strokeWidth="1"
            />
          )
        })}

        <polyline
          className="motif__trace"
          points="40,470 150,470 200,360 250,470 330,470 380,240 430,470 520,470 570,330 620,470 720,470"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.25"
          opacity="0.65"
        />

        {nodes.map(([x, y], index) => (
          <g key={`${x}-${y}`}>
            <circle
              className="motif__node"
              cx={x}
              cy={y}
              r={index === 3 ? 5 : 3}
              fill={index === 3 ? 'var(--accent)' : 'var(--text-dim)'}
            />
            {index === 3 ? (
              <circle cx={x} cy={y} r="13" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
            ) : null}
          </g>
        ))}

        <rect x="6" y="6" width="748" height="748" fill="none" stroke="var(--line-soft)" strokeWidth="1" />
      </svg>
    </div>
  )
}

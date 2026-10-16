/**
 * Rockstar Games technical QA — abstract performance profile.
 *
 * A deliberately abstract illustration of the *shape* of stability and
 * performance work: a frame-time distribution, a stability envelope and a
 * session timeline with defect and regression markers. It is generated here,
 * contains no real data, and is not captured from any employer tool.
 */

// Deterministic pseudo-random heights so the figure never flickers between
// renders and there is no hidden randomness in the bundle.
const BARS = Array.from({ length: 44 }, (_, index) => {
  const wave = Math.sin(index / 2.6) * 0.18 + Math.sin(index / 1.3 + 1.7) * 0.09
  const spike = index === 17 || index === 31 ? 0.32 : index === 18 ? 0.2 : 0
  return 0.28 + wave + spike
})

const EVENTS = [
  { x: 168, label: 'DEFECT LOGGED' },
  { x: 386, label: 'REPRODUCED' },
  { x: 604, label: 'REGRESSION PASS' },
]

export function QaFigure() {
  return (
    <svg className="fig" viewBox="0 0 800 500" role="img" aria-label="Abstract illustration of frame-time distribution, stability envelope and a QA session timeline with defect markers">
      <defs>
        <pattern id="qa-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle className="fig-dot" cx="1" cy="1" r="1" opacity="0.5" />
        </pattern>
        <marker id="qa-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path className="fig-arrow" d="M0,0 L10,5 L0,10 z" />
        </marker>
      </defs>

      <rect width="800" height="500" fill="url(#qa-dots)" />

      <text className="fig-t fig-ink-faint" x="36" y="44" fontSize="14">
        STABILITY &amp; PERFORMANCE · ABSTRACT SHAPE OF THE WORK
      </text>

      {/* frame-time distribution */}
      <rect className="fig-panel fig-line-strong" x="36" y="66" width="728" height="232" fill="var(--bg-panel)" />
      <text className="fig-t fig-ink-faint" x="54" y="92" fontSize="11">
        FRAME TIME SAMPLES — UNLABELLED BY DESIGN
      </text>

      <line className="fig-line" x1="70" y1="270" x2="730" y2="270" />
      <line className="fig-line" x1="70" y1="110" x2="70" y2="270" />

      {BARS.map((value, index) => {
        const height = Math.max(4, value * 140)
        const x = 78 + index * 14.6
        const isSpike = index === 17 || index === 18 || index === 31
        return (
          <rect
            key={index}
            className={isSpike ? 'fig-accent-fill' : 'fig-line-strong'}
            x={x}
            y={270 - height}
            width="9"
            height={height}
            opacity={isSpike ? 0.95 : 0.75}
          />
        )
      })}

      <line className="fig-line-strong" x1="70" y1="150" x2="730" y2="150" strokeDasharray="6 5" />
      <text className="fig-t fig-ink-faint" x="660" y="144" fontSize="11">
        BUDGET LINE
      </text>

      <text className="fig-t fig-ink-faint" x="20" y="196" fontSize="11" transform="rotate(-90 20 196)">
        FRAME TIME
      </text>
      <text className="fig-t fig-ink-faint" x="380" y="288" fontSize="11">
        SESSION ELAPSED
      </text>

      {/* event markers on the distribution */}
      {[17, 31].map((index) => {
        const x = 78 + index * 14.6 + 4.5
        return (
          <g key={index}>
            <line className="fig-accent" x1={x} y1="112" x2={x} y2="140" />
            <text className="fig-t fig-accent-fill" x={x - 26} y="108" fontSize="10">
              SPIKE
            </text>
          </g>
        )
      })}

      {/* session timeline */}
      <text className="fig-t fig-ink-faint" x="36" y="336" fontSize="12">
        SESSION TIMELINE · WHAT QA PRODUCES
      </text>
      <text className="fig-t fig-ink-faint" x="36" y="356" fontSize="11">
        SAMPLES → EVIDENCE → FIX → VERIFICATION
      </text>
      <line className="fig-line-strong" x1="70" y1="396" x2="730" y2="396" />

      {EVENTS.map((event, index) => (
        <g key={event.label}>
          <line className="fig-line" x1="70" y1="380" x2="730" y2="380" opacity="0.5" />
          <circle className="fig-accent-fill" cx={event.x} cy="396" r="6" />
          <line className="fig-line" x1={event.x} y1="396" x2={event.x} y2="426" />
          <text className="fig-t fig-ink" x={event.x - 4} y="446" fontSize="12">
            {event.label}
          </text>
          <text className="fig-s fig-ink-faint" x={event.x - 4} y="464" fontSize="12">
            {index === 0
              ? 'issue identified + documented'
              : index === 1
                ? 'shortest path to the problem'
                : 'change verified, nothing broken'}
          </text>
        </g>
      ))}

      <path className="fig-line-strong" d="M736,384 L736,404" markerEnd="url(#qa-arrow)" opacity="0.6" />

      <text className="fig-t fig-accent-fill" x="36" y="488" fontSize="11">
        ABSTRACT ILLUSTRATION · NO REAL DATA · NOT AN EMPLOYER TOOL
      </text>
    </svg>
  )
}

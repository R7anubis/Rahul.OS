/**
 * SameFace — conceptual facial-analysis diagram.
 *
 * Original illustration: the detection region, the landmark points ML Kit
 * returns, the relationships measured between them, and the two-image
 * comparison stage. It is not a screenshot, and no accuracy is claimed.
 *
 * Layout note: callout labels are placed in clear space inside the detection
 * region and joined to their point with a leader line. The figure is rendered
 * from a 350px card up to a 700px detail panel, so overlaps would scale too —
 * label anchors below are chosen so no two labels or leaders can collide.
 */

// 0–4 are the named landmarks; 5–10 are unnamed points ML Kit also returns.
const LANDMARKS: { x: number; y: number; label?: string; lx?: number; ly?: number }[] = [
  { x: 205, y: 200 },
  { x: 285, y: 196 },
  { x: 246, y: 236, label: 'NOSE', lx: 262, ly: 262 },
  { x: 208, y: 288, label: 'MOUTH', lx: 118, ly: 286 },
  { x: 246, y: 308, label: 'CHIN', lx: 118, ly: 332 },
  { x: 152, y: 184 },
  { x: 340, y: 184 },
  { x: 130, y: 262 },
  { x: 362, y: 262 },
  { x: 196, y: 364 },
  { x: 300, y: 364 },
]

// Relationships drawn between landmarks: eye span, nose-to-chin axis, and the
// two face widths. The point is that geometry is what gets compared.
const MEASURES: [number, number][] = [
  [0, 1],
  [2, 4],
  [5, 6],
  [7, 8],
]

export function SameFaceFigure() {
  return (
    <svg
      className="fig"
      viewBox="0 0 800 500"
      role="img"
      aria-label="Conceptual diagram of facial landmark detection and landmark-set comparison"
    >
      <defs>
        <pattern id="sf-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle className="fig-dot" cx="1" cy="1" r="1" opacity="0.5" />
        </pattern>
        <marker id="sf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path className="fig-arrow-faint" d="M0,0 L10,5 L0,10 z" />
        </marker>
      </defs>

      <rect width="800" height="500" fill="url(#sf-dots)" />

      <text className="fig-t fig-ink-faint" x="36" y="46" fontSize="15">
        STAGE 01 / DETECT
      </text>

      {/* detection region */}
      <rect className="fig-line-strong" x="104" y="78" width="288" height="332" fill="none" strokeDasharray="6 6" />
      <path className="fig-accent" d="M104,78 h22 M104,78 v22" strokeWidth="2" fill="none" />
      <path className="fig-accent" d="M392,410 h-22 M392,410 v-22" strokeWidth="2" fill="none" />
      <text className="fig-t fig-ink-dim" x="112" y="100" fontSize="13">
        FACE_REGION
      </text>

      {/* stylised face outline */}
      <path
        className="fig-line-strong"
        d="M152,196 C152,132 196,104 248,104 C300,104 344,132 344,196 C344,268 300,372 248,372 C196,372 152,268 152,196 Z"
        fill="none"
        strokeWidth="1.5"
      />
      <path className="fig-line" d="M158,232 C184,244 214,244 240,232" fill="none" />
      <path className="fig-line" d="M256,232 C282,244 312,244 338,232" fill="none" />
      <path className="fig-line" d="M216,296 C232,310 262,310 278,296" fill="none" />

      {/* measured relationships */}
      <g data-part="Measured relationships">
      {MEASURES.map(([a, b], index) => {
        const from = LANDMARKS[a]
        const to = LANDMARKS[b]
        if (!from || !to) return null
        return (
          <line
            key={index}
            className="fig-accent"
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            strokeDasharray="3 3"
            opacity="0.8"
          />
        )
      })}

      </g>

      {/* landmark points + callouts */}
      <g data-part="Landmark points">
      {LANDMARKS.map((point, index) => (
        <circle
          key={`point-${index}`}
          className="fig-accent"
          cx={point.x}
          cy={point.y}
          r="4"
          fill="var(--bg)"
          strokeWidth="1.6"
        />
      ))}

      <line className="fig-line" x1="245" y1="198" x2="245" y2="184" />
      <text className="fig-t fig-ink-dim" x="222" y="176" fontSize="12">
        EYES
      </text>

      {LANDMARKS.filter((point) => point.label && point.lx !== undefined && point.ly !== undefined).map(
        (point) => (
          <g key={point.label}>
            <line
              className="fig-line"
              x1={point.x}
              y1={point.y}
              x2={point.lx!}
              y2={point.ly!}
            />
            <text className="fig-t fig-ink-dim" x={point.lx} y={point.ly! - 4} fontSize="12">
              {point.label}
            </text>
          </g>
        ),
      )}

      <text className="fig-t fig-ink-faint" x="108" y="436" fontSize="12">
        ML KIT · FACE + LANDMARK DETECTION
      </text>
      </g>

      {/* ---- comparison stage ---- */}
      <line className="fig-line" x1="432" y1="78" x2="432" y2="420" />
      <text className="fig-t fig-ink-faint" x="466" y="46" fontSize="15">
        STAGE 02 / COMPARE
      </text>

      {[
        { x: 466, tag: 'IMG_A' },
        { x: 566, tag: 'IMG_B' },
      ].map((frame) => (
        <g key={frame.tag}>
          <rect className="fig-line-strong" x={frame.x} y="92" width="84" height="106" fill="none" />
          <path
            className="fig-line"
            d={`M${frame.x + 18},170 C${frame.x + 14},138 ${frame.x + 30},118 ${frame.x + 42},118 C${frame.x + 54},118 ${frame.x + 70},138 ${frame.x + 66},170`}
            fill="none"
          />
          <circle className="fig-accent-fill" cx={frame.x + 34} cy="144" r="2.8" />
          <circle className="fig-accent-fill" cx={frame.x + 52} cy="144" r="2.8" />
          <circle className="fig-accent-fill" cx={frame.x + 43} cy="160" r="2.8" />
          <text className="fig-t fig-ink-dim" x={frame.x} y="218" fontSize="13">
            {frame.tag}
          </text>
        </g>
      ))}

      <line className="fig-line-strong" x1="556" y1="228" x2="556" y2="242" markerEnd="url(#sf-arrow)" />

      <g data-part="Comparison stage">
      <rect className="fig-line" x="466" y="250" width="300" height="86" fill="none" />
      <text className="fig-t fig-ink-dim" x="480" y="274" fontSize="13">
        LANDMARK SET COMPARISON
      </text>
      <text className="fig-s fig-ink-faint" x="480" y="298" fontSize="16">
        geometry → similarity signal
      </text>
      <line className="fig-line-strong" x1="480" y1="316" x2="752" y2="316" />
      <rect className="fig-accent-fill" x="480" y="314" width="180" height="4" opacity="0.85" />
      <circle className="fig-accent" cx="660" cy="316" r="5" fill="var(--bg)" strokeWidth="1.6" />

      <text className="fig-t fig-ink-faint" x="480" y="358" fontSize="12">
        DIFFERENT
      </text>
      <text className="fig-t fig-ink-faint" x="700" y="358" fontSize="12">
        SIMILAR
      </text>

      <text className="fig-t fig-ink-faint" x="466" y="436" fontSize="12">
        RESULT · NOT IDENTITY VERIFICATION
      </text>
      </g>
    </svg>
  )
}

/**
 * SCAMS — conceptual system, risk-band and escalation flow.
 * Every element is a proposed design. The disclaimer is drawn inside the
 * figure so the diagram stays honest wherever it is reused.
 *
 * Geometry note: text is kept inside its own box by design — the figure scales
 * from a 350px card to a 700px detail panel, so any overflow would scale too.
 */
const NODES = [
  { x: 36, title: 'REPORT', code: '01', lines: ['student submits', 'a message'] },
  { x: 218, title: 'ASSESS', code: '02', lines: ['risk signals', 'evaluated'] },
  { x: 400, title: 'CLASSIFY', code: '03', lines: ['risk band', 'assigned'] },
  { x: 582, title: 'ALERT', code: '04', lines: ['guidance', 'surfaced'] },
]

export function ScamsFigure() {
  const boxWidth = 150

  return (
    <svg
      className="fig"
      viewBox="0 0 800 500"
      role="img"
      aria-label="Conceptual SCAMS pipeline, risk bands and escalation flow diagram"
    >
      <defs>
        <pattern id="sc-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle className="fig-dot" cx="1" cy="1" r="1" opacity="0.5" />
        </pattern>
        <marker id="sc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path className="fig-arrow" d="M0,0 L10,5 L0,10 z" />
        </marker>
      </defs>

      <rect width="800" height="500" fill="url(#sc-dots)" />

      <text className="fig-t fig-ink-faint" x="36" y="40" fontSize="14">
        PROPOSED PIPELINE · STUDENT-FACING
      </text>

      {NODES.map((node, index) => (
        <g key={node.title} data-part={`step ${node.code}`}>
          <rect
            className={index === 2 ? 'fig-panel fig-accent' : 'fig-panel fig-line-strong'}
            x={node.x}
            y="66"
            width={boxWidth}
            height="104"
            fill="var(--bg-panel)"
            strokeWidth={index === 2 ? 1.6 : 1}
          />
          <rect
            className={index === 2 ? 'fig-accent-fill' : 'fig-line-strong'}
            x={node.x}
            y="66"
            width={boxWidth}
            height="3"
          />
          <text className="fig-t fig-ink-faint" x={node.x + 12} y="94" fontSize="12">
            {node.code}
          </text>
          <text className="fig-t fig-ink" x={node.x + 12} y="122" fontSize="16">
            {node.title}
          </text>
          <text className="fig-s fig-ink-faint" x={node.x + 12} y="142" fontSize="13">
            {node.lines[0]}
          </text>
          <text className="fig-s fig-ink-faint" x={node.x + 12} y="159" fontSize="13">
            {node.lines[1]}
          </text>
          {index < NODES.length - 1 ? (
            <line
              className="fig-line-strong"
              x1={node.x + boxWidth + 1}
              y1="118"
              x2={node.x + boxWidth + 27}
              y2="118"
              markerEnd="url(#sc-arrow)"
            />
          ) : null}
        </g>
      ))}

      {/* final step, stacked under the pipeline to stay inside the viewBox */}
      <g data-part="step 05">
        <rect className="fig-panel fig-line-strong" x="582" y="196" width={boxWidth} height="76" fill="var(--bg-panel)" />
        <rect className="fig-line-strong" x="582" y="196" width={boxWidth} height="3" />
        <text className="fig-t fig-ink-faint" x="594" y="220" fontSize="12">
          05
        </text>
        <text className="fig-t fig-ink" x="594" y="244" fontSize="15">
          ESCALATE
        </text>
        <text className="fig-s fig-ink-faint" x="594" y="263" fontSize="12">
          support path engaged
        </text>
      </g>

      <path className="fig-line-strong" d="M657,172 L657,188" fill="none" markerEnd="url(#sc-arrow)" />

      {/* risk bands */}
      <text className="fig-t fig-ink-faint" x="36" y="230" fontSize="13">
        RISK BANDS — NO SCORES CLAIMED
      </text>
      {[
        { x: 36, label: 'LOW', dim: true },
        { x: 178, label: 'ELEVATED', dim: false },
        { x: 320, label: 'HIGH', dim: false },
      ].map((band) => (
        <g key={band.label} data-part={`risk ${band.label}`}>
          <rect
            className={band.dim ? 'fig-line-strong' : 'fig-accent-fill'}
            x={band.x}
            y="242"
            width="120"
            height="8"
            opacity={band.dim ? 0.6 : 0.9}
          />
          <text
            className={band.dim ? 'fig-t fig-ink-faint' : 'fig-t fig-ink-dim'}
            x={band.x}
            y="266"
            fontSize="13"
          >
            {band.label}
          </text>
        </g>
      ))}

      {/* conceptual app screen */}
      <g data-part="Conceptual app view">
      <rect className="fig-inset fig-line-strong" x="36" y="288" width="440" height="142" fill="var(--bg-inset)" />
      <rect className="fig-panel fig-line" x="36" y="288" width="440" height="24" fill="var(--bg-panel)" />
      <circle className="fig-accent-fill" cx="52" cy="300" r="3.5" />
      <circle className="fig-line-strong" cx="66" cy="300" r="3.5" fill="none" />
      <circle className="fig-line-strong" cx="80" cy="300" r="3.5" fill="none" />
      <text className="fig-t fig-ink-faint" x="96" y="305" fontSize="12">
        CONCEPTUAL APP VIEW
      </text>

      <rect className="fig-line-strong" x="52" y="326" width="176" height="9" />
      <rect className="fig-line" x="52" y="348" width="252" height="6" />
      <rect className="fig-line" x="52" y="364" width="210" height="6" />
      <rect className="fig-line" x="52" y="380" width="240" height="6" />

      <rect className="fig-line" x="330" y="326" width="130" height="60" fill="none" />
      <text className="fig-t fig-ink-faint" x="344" y="348" fontSize="11">
        RISK BAND
      </text>
      <text className="fig-t fig-accent-fill" x="344" y="372" fontSize="16">
        ELEVATED
      </text>

      <rect className="fig-accent" x="52" y="396" width="72" height="20" fill="none" />
      <text className="fig-t fig-accent-fill" x="62" y="410" fontSize="12">
        REVIEW
      </text>
      <rect className="fig-line-strong" x="134" y="396" width="92" height="20" fill="none" />
      <text className="fig-t fig-ink-dim" x="144" y="410" fontSize="12">
        GUIDANCE
      </text>
      </g>

      {/* escalation ladder */}
      <g data-part="Escalation path">
      <rect className="fig-line" x="520" y="288" width="244" height="118" fill="none" />
      <text className="fig-t fig-ink-faint" x="536" y="312" fontSize="12">
        ESCALATION PATH
      </text>
      {['advisor / support contact', 'institution channel', 'report + record'].map((line, index) => (
        <g key={line}>
          <circle className="fig-accent-fill" cx="546" cy={338 + index * 26} r="3" />
          <text className="fig-s fig-ink-dim" x="560" y={343 + index * 26} fontSize="15">
            {line}
          </text>
        </g>
      ))}
      </g>

      <text className="fig-t fig-ink-faint" x="520" y="440" fontSize="12">
        GOVERNANCE · PILOT EVALUATION
      </text>
      <text className="fig-s fig-ink-faint" x="520" y="460" fontSize="13">
        scope, safeguards, measurement
      </text>

      <text className="fig-t fig-accent-fill" x="36" y="470" fontSize="12">
        CONCEPTUAL DESIGN — NOT DEPLOYED SOFTWARE
      </text>
    </svg>
  )
}

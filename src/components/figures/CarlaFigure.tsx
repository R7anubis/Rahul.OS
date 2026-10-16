/**
 * CARLA / ROS 2 — vehicle control loop block diagram.
 * Shows how waypoint selection, dynamic look-ahead, error computation and PID
 * control connect to the simulated vehicle, with the simulation closing the
 * loop. Axes on the inset plot are deliberately unnumbered: no benchmark
 * figures are claimed.
 */

const BLOCKS = [
  { x: 36, y: 84, w: 150, h: 74, title: 'VEHICLE STATE', sub: 'CARLA actor', code: 'ROS NODE' },
  { x: 212, y: 84, w: 150, h: 74, title: 'WAYPOINT', sub: 'route search', code: 'ROS NODE' },
  { x: 388, y: 84, w: 150, h: 74, title: 'LOOK-AHEAD', sub: 'distance ∝ speed', code: 'ROS NODE' },
  { x: 564, y: 84, w: 150, h: 74, title: 'ERROR', sub: 'cross-track, heading', code: 'ROS NODE' },
]

const CONTROLLERS = [
  { x: 564, y: 208, w: 150, h: 62, title: 'PID · STEERING', sub: 'lateral' },
  { x: 564, y: 288, w: 150, h: 62, title: 'PID · THROTTLE', sub: 'longitudinal' },
]

export function CarlaFigure() {
  return (
    <svg className="fig" viewBox="0 0 800 500" role="img" aria-label="Block diagram of waypoint following and PID vehicle control in CARLA with ROS 2">
      <defs>
        <pattern id="ca-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle className="fig-dot" cx="1" cy="1" r="1" opacity="0.5" />
        </pattern>
        <marker id="ca-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path className="fig-arrow" d="M0,0 L10,5 L0,10 z" />
        </marker>
        <marker id="ca-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path className="fig-accent-fill" d="M0,0 L10,5 L0,10 z" />
        </marker>
      </defs>

      <rect width="800" height="500" fill="url(#ca-dots)" />

      <text className="fig-t fig-ink-faint" x="36" y="44" fontSize="14">
        CONTROL LOOP · 20 Hz STYLE CYCLE
      </text>
      <text className="fig-t fig-ink-faint" x="36" y="64" fontSize="12">
        ROS 2 NODES ↔ CARLA SIMULATION
      </text>

      {BLOCKS.map((block, index) => (
        <g key={block.title} data-part={block.title}>
          <rect className="fig-panel fig-line-strong" x={block.x} y={block.y} width={block.w} height={block.h} fill="var(--bg-panel)" />
          <rect className="fig-line-strong" x={block.x} y={block.y} width={block.w} height="3" />
          <text className="fig-t fig-ink-faint" x={block.x + 12} y={block.y + 22} fontSize="11">
            {block.code}
          </text>
          <text className="fig-t fig-ink" x={block.x + 12} y={block.y + 44} fontSize="15">
            {block.title}
          </text>
          <text className="fig-s fig-ink-faint" x={block.x + 12} y={block.y + 62} fontSize="13">
            {block.sub}
          </text>
          {index < BLOCKS.length - 1 ? (
            <line
              className="fig-line-strong"
              x1={block.x + block.w + 2}
              y1={block.y + 37}
              x2={block.x + block.w + 22}
              y2={block.y + 37}
              markerEnd="url(#ca-arrow)"
            />
          ) : null}
        </g>
      ))}

      <path
        className="fig-line-strong"
        d="M639,160 L639,182 L639,196"
        fill="none"
        markerEnd="url(#ca-arrow)"
      />

      {CONTROLLERS.map((block) => (
        <g key={block.title} data-part={block.title}>
          <rect className="fig-panel fig-line-strong" x={block.x} y={block.y} width={block.w} height={block.h} fill="var(--bg-panel)" />
          <text className="fig-t fig-ink" x={block.x + 12} y={block.y + 26} fontSize="14">
            {block.title}
          </text>
          <text className="fig-s fig-ink-faint" x={block.x + 12} y={block.y + 46} fontSize="13">
            {block.sub}
          </text>
        </g>
      ))}

      <path className="fig-line-strong" d="M612,270 L612,366 L612,380" fill="none" markerEnd="url(#ca-arrow)" />

      {/* vehicle command block */}
      <g data-part="Vehicle control">
      <rect className="fig-panel fig-accent" x="36" y="208" width="240" height="222" fill="var(--bg-panel)" strokeWidth="1.4" />
      <text className="fig-t fig-ink-faint" x="52" y="234" fontSize="11">
        ACTUATION
      </text>
      <text className="fig-t fig-ink" x="52" y="258" fontSize="16">
        VEHICLE CONTROL
      </text>
      <text className="fig-s fig-ink-faint" x="52" y="280" fontSize="13">
        steer · throttle · brake
      </text>

      {/* compact vehicle + route sketch */}
      <rect className="fig-inset fig-line" x="52" y="298" width="208" height="112" fill="var(--bg-inset)" />
      <path className="fig-line-strong" d="M64,384 C104,384 118,318 168,318 C206,318 224,344 248,330" fill="none" />
      <circle className="fig-accent-fill" cx="146" cy="330" r="6" />
      <circle className="fig-accent" cx="146" cy="330" r="16" fill="none" strokeDasharray="3 4" opacity="0.8" />
      <text className="fig-t fig-ink-faint" x="62" y="316" fontSize="11">
        LOOK-AHEAD TARGET
      </text>
      <text className="fig-t fig-ink-faint" x="62" y="402" fontSize="11">
        ROUTE WAYPOINTS
      </text>
      </g>

      {/* feedback path — the loop closes back at the vehicle state node */}
      <path
        className="fig-accent"
        d="M36,430 L18,430 L18,121 L30,121"
        fill="none"
        strokeDasharray="6 5"
        markerEnd="url(#ca-arrow-accent)"
        opacity="0.9"
      />
      <text className="fig-t fig-accent-fill" x="300" y="472" fontSize="12">
        SIMULATION FEEDBACK · LOOP CLOSES
      </text>

      {/* inset plot: error response, unnumbered axes.
          Deliberately no tick values — no benchmark figures are claimed. */}
      <g data-part="Error response">
      <rect className="fig-line" x="300" y="208" width="240" height="222" fill="none" />
      <text className="fig-t fig-ink-faint" x="316" y="232" fontSize="11">
        ERROR RESPONSE · ILLUSTRATIVE
      </text>
      <text className="fig-t fig-ink-faint" x="316" y="250" fontSize="11">
        TRACK ERROR ↑
      </text>

      <line className="fig-line" x1="316" y1="402" x2="524" y2="402" />
      <line className="fig-line" x1="316" y1="266" x2="316" y2="402" />
      <text className="fig-t fig-ink-faint" x="466" y="418" fontSize="11">
        TIME →
      </text>

      <line className="fig-line-strong" x1="316" y1="300" x2="524" y2="300" strokeDasharray="4 4" />
      <text className="fig-t fig-ink-faint" x="474" y="294" fontSize="10">
        TARGET
      </text>

      <path
        className="fig-accent"
        d="M316,300 C330,266 344,332 358,306 C372,282 386,316 400,302 C414,290 428,310 442,300 C456,293 470,303 484,300 C498,298 512,300 524,300"
        fill="none"
        strokeWidth="1.4"
      />

      <text className="fig-s fig-ink-faint" x="316" y="340" fontSize="12">
        Tuned for damping rather
      </text>
      <text className="fig-s fig-ink-faint" x="316" y="357" fontSize="12">
        than a single fast response.
      </text>
      </g>
    </svg>
  )
}

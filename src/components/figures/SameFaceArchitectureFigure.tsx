/**
 * SameFace — architecture and data flow, drawn from the system architecture
 * (Section IV) and development process (Section VI) described in the research
 * paper.
 *
 * Honesty rules encoded in the drawing itself:
 *  - the ML Kit box is labelled as detection only, with "no embeddings
 *    returned / no similarity scoring", because ML Kit's Face Detection API
 *    returns boxes, landmarks and contours — not vectors, and no comparison;
 *  - the similarity scoring layer is drawn dashed and marked PROPOSED, matching
 *    the paper's statement that a custom ML similarity algorithm is planned for
 *    a future implementation;
 *  - every zone is a real group tagged with `data-stage`, so the diagram can be
 *    dimmed and illuminated by the DiagramExplorer without any motion being
 *    required to read it.
 *
 * Layout: a single 800×500 grid. Vertical budget — zones 58–348, proposed layer
 * 364–456, legend 478. Every connector was placed to avoid crossing another
 * group or a text baseline; the figure is checked visually before shipping.
 */
export function SameFaceArchitectureFigure({ activeStage }: { activeStage?: string }) {
  const stageProps = (id: string) =>
    activeStage
      ? ({ 'data-stage': id, 'data-active': activeStage === id ? 'true' : 'false' } as const)
      : {}

  return (
    <svg
      className="fig"
      data-staged={activeStage ? 'true' : 'false'}
      viewBox="0 0 800 500"
      role="img"
      aria-label="Architecture diagram of SameFace: the Android app with ML Kit face detection on device, Firebase authentication, storage and realtime messaging, and a proposed similarity scoring layer"
    >
      <defs>
        <pattern id="sfa-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle className="fig-dot" cx="1" cy="1" r="1" opacity="0.5" />
        </pattern>
        <marker id="sfa-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path className="fig-arrow" d="M0,0 L10,5 L0,10 z" />
        </marker>
        <marker id="sfa-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path className="fig-accent-fill" d="M0,0 L10,5 L0,10 z" />
        </marker>
      </defs>

      <rect width="800" height="500" fill="url(#sfa-dots)" />

      {/* ---------------- zone 1: on device ---------------- */}
      <rect className="fig-line-strong" x="36" y="58" width="434" height="290" fill="none" />
      <text className="fig-t fig-ink" x="50" y="82" fontSize="13">
        ON DEVICE
      </text>
      <text className="fig-t fig-ink-faint" x="168" y="82" fontSize="12">
        ANDROID · KOTLIN / JAVA
      </text>

      <g {...stageProps('capture')}>
        <rect className="fig-panel fig-line-strong" x="50" y="96" width="128" height="68" fill="var(--bg-panel)" />
        <rect className="fig-line-strong" x="50" y="96" width="128" height="3" />
        <text className="fig-t fig-ink-faint" x="62" y="116" fontSize="11">
          01
        </text>
        <text className="fig-t fig-ink" x="62" y="136" fontSize="14">
          CAPTURE
        </text>
        <text className="fig-s fig-ink-faint" x="62" y="154" fontSize="12">
          camera image
        </text>
      </g>

      <g {...stageProps('detect')}>
        <rect className="fig-panel fig-line-strong" x="192" y="96" width="128" height="68" fill="var(--bg-panel)" />
        <rect className="fig-line-strong" x="192" y="96" width="128" height="3" />
        <text className="fig-t fig-ink-faint" x="204" y="116" fontSize="11">
          02
        </text>
        <text className="fig-t fig-ink" x="204" y="136" fontSize="14">
          DETECT
        </text>
        <text className="fig-s fig-ink-faint" x="204" y="154" fontSize="12">
          face bounding box
        </text>
      </g>

      <g {...stageProps('landmarks')}>
        <rect className="fig-panel fig-line-strong" x="334" y="96" width="122" height="68" fill="var(--bg-panel)" />
        <rect className="fig-line-strong" x="334" y="96" width="122" height="3" />
        <text className="fig-t fig-ink-faint" x="346" y="116" fontSize="11">
          03
        </text>
        <text className="fig-t fig-ink" x="346" y="136" fontSize="14">
          LANDMARKS
        </text>
        <text className="fig-s fig-ink-faint" x="346" y="154" fontSize="11">
          eyes, nose, mouth
        </text>
      </g>

      {/* pipeline arrows inside the device */}
      <line className="fig-line-strong" x1="179" y1="130" x2="187" y2="130" markerEnd="url(#sfa-arrow)" />
      <line className="fig-line-strong" x1="321" y1="130" x2="329" y2="130" markerEnd="url(#sfa-arrow)" />

      {/* what ML Kit actually returns — the boundary of the claim */}
      <rect className="fig-line" x="192" y="196" width="264" height="84" fill="none" strokeDasharray="5 5" />
      <text className="fig-t fig-ink-dim" x="204" y="216" fontSize="11">
        FIREBASE ML KIT · FACE DETECTION
      </text>
      <text className="fig-s fig-ink-faint" x="204" y="234" fontSize="12">
        boxes, landmarks, contours
      </text>
      <text className="fig-t fig-accent-fill" x="204" y="252" fontSize="11">
        NO EMBEDDINGS RETURNED
      </text>
      <text className="fig-t fig-accent-fill" x="204" y="268" fontSize="11">
        NO SIMILARITY SCORING
      </text>

      <g {...stageProps('chat')}>
        <rect className="fig-panel fig-line-strong" x="50" y="196" width="128" height="60" fill="var(--bg-panel)" />
        <text className="fig-t fig-ink-faint" x="62" y="216" fontSize="11">
          06
        </text>
        <text className="fig-t fig-ink" x="62" y="238" fontSize="14">
          CHAT UI
        </text>
      </g>

      <text className="fig-t fig-ink-faint" x="50" y="336" fontSize="11">
        CONSENT REQUIRED FOR FACIAL DATA · §IV-D
      </text>

      {/* ---------------- zone 2: cloud ---------------- */}
      <rect className="fig-line-strong" x="494" y="58" width="270" height="272" fill="none" />
      <text className="fig-t fig-ink" x="508" y="82" fontSize="13">
        FIREBASE
      </text>
      <text className="fig-t fig-ink-faint" x="600" y="82" fontSize="12">
        CLOUD
      </text>

      <g {...stageProps('store')}>
        <rect className="fig-panel fig-line-strong" x="508" y="96" width="240" height="52" fill="var(--bg-panel)" />
        <text className="fig-t fig-ink-faint" x="520" y="114" fontSize="11">
          04a
        </text>
        <text className="fig-t fig-ink" x="552" y="114" fontSize="13">
          AUTH · OTP 2FA
        </text>
        <text className="fig-s fig-ink-faint" x="520" y="134" fontSize="12">
          email or SMS second factor
        </text>

        <rect className="fig-panel fig-line-strong" x="508" y="158" width="240" height="52" fill="var(--bg-panel)" />
        <text className="fig-t fig-ink-faint" x="520" y="176" fontSize="11">
          04b
        </text>
        <text className="fig-t fig-ink" x="552" y="176" fontSize="13">
          FACE DATA STORE
        </text>
        <text className="fig-s fig-ink-faint" x="520" y="196" fontSize="12">
          tied to the user account
        </text>
      </g>

      <g {...stageProps('chat')}>
        <rect className="fig-panel fig-line-strong" x="508" y="220" width="240" height="52" fill="var(--bg-panel)" />
        <text className="fig-t fig-ink-faint" x="520" y="238" fontSize="11">
          06
        </text>
        <text className="fig-t fig-ink" x="552" y="238" fontSize="13">
          REALTIME DATABASE
        </text>
        <text className="fig-s fig-ink-faint" x="520" y="258" fontSize="12">
          messaging between matches
        </text>
      </g>

      <text className="fig-t fig-ink-faint" x="508" y="296" fontSize="11">
        STORAGE &amp; ACCOUNTS · §IV-B
      </text>
      <text className="fig-t fig-ink-faint" x="508" y="314" fontSize="11">
        REAL-TIME MESSAGING · §IV-E
      </text>

      {/* landmarks out to the face-data store */}
      <path
        className="fig-line-strong"
        d="M456,130 L475,130 L475,184 L503,184"
        fill="none"
        markerEnd="url(#sfa-arrow)"
      />

      {/* chat UI around the ML Kit boundary into the realtime database */}
      <path
        className="fig-line-strong"
        d="M150,256 L150,292 L482,292 L482,246 L503,246"
        fill="none"
        markerEnd="url(#sfa-arrow)"
      />

      {/* ---------------- proposed similarity layer ---------------- */}
      <g {...stageProps('similarity')}>
        <rect
          className="fig-panel fig-accent"
          x="192"
          y="364"
          width="428"
          height="92"
          fill="var(--bg-panel)"
          strokeDasharray="7 6"
          strokeWidth="1.4"
        />
        <text className="fig-t fig-accent-fill" x="208" y="388" fontSize="12">
          05 · SIMILARITY SCORING — PROPOSED
        </text>
        <text className="fig-s fig-ink-dim" x="208" y="410" fontSize="13">
          A separate method is required: landmark geometry, or an
        </text>
        <text className="fig-s fig-ink-dim" x="208" y="428" fontSize="13">
          embedding model trained for face verification.
        </text>
        <text className="fig-t fig-ink-faint" x="208" y="448" fontSize="11">
          PAPER §IV-C — PLANNED FOR A FUTURE IMPLEMENTATION
        </text>

        {/* stored features feed the proposed scorer, routing outside the zones */}
        <path
          className="fig-accent"
          d="M748,184 L784,184 L784,410 L624,410"
          fill="none"
          strokeDasharray="6 5"
          markerEnd="url(#sfa-arrow-accent)"
        />

        {/* the score returns to the app, running clear of the on-device zone */}
        <path
          className="fig-accent"
          d="M192,410 L18,410 L18,240 L46,240"
          fill="none"
          strokeDasharray="6 5"
          markerEnd="url(#sfa-arrow-accent)"
        />
        <text className="fig-t fig-ink-faint" x="36" y="400" fontSize="10">
          MATCH
        </text>
      </g>

      <text className="fig-t fig-ink-faint" x="36" y="478" fontSize="11">
        SOLID 01–04, 06 · DOCUMENTED IN THE PAPER
      </text>
      <text className="fig-t fig-accent-fill" x="430" y="478" fontSize="11">
        DASHED 05 · PROPOSED WORK
      </text>
    </svg>
  )
}

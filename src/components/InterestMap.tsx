import { useCallback, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { interestEdges, interestNodes, interestNote, type InterestNode } from '../data/interests'
import { projectBySlug } from '../data/projects'
import { sectionById } from '../data/sections'
import { SectionHeading } from './SectionHeading'

interface InterestMapProps {
  onNavigate: (hash: string) => void
}

/**
 * Narrow-screen order for the same six nodes.
 *
 * The packed canvas needs width to keep six labels legible, so on small
 * screens the nodes reflow into a column and the edges are drawn as a rail
 * instead of being hidden. This order is chosen so five of the six connections
 * join neighbouring rows; only AI/ML–Software has to span a gap. The list below
 * the map keeps the data order, and the buttons stay in data order in the DOM —
 * `order` only moves them visually.
 */
const MOBILE_ORDER = [
  'data-science',
  'ai-ml',
  'embedded',
  'automotive',
  'gaming',
  'software',
] as const
const ROW_PX = 56
const RAIL_END = 26
const RAIL_START = 7

/**
 * Connected-node interest map.
 *
 * Accessibility: the visual canvas is decorative; the controls are real
 * buttons (absolutely positioned over it) and a persistent index list below
 * gives the same information as a plain, linear, screen-reader-friendly list.
 * Selecting a node fills one shared detail panel, so nothing is hidden behind
 * a hover-only interaction.
 */
export function InterestMap({ onNavigate }: InterestMapProps) {
  const [selectedId, setSelectedId] = useState<string>(interestNodes[1]?.id ?? '')
  // Hovering or focusing a node previews its connections without committing a
  // selection, so the map can be read by moving across it.
  const [previewId, setPreviewId] = useState<string | null>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const selected: InterestNode | undefined =
    interestNodes.find((node) => node.id === selectedId) ?? interestNodes[0]


  const byId = (id: string) => interestNodes.find((node) => node.id === id)

  const mobileIndex = (id: string) => {
    const index = MOBILE_ORDER.indexOf(id as (typeof MOBILE_ORDER)[number])
    return index < 0 ? MOBILE_ORDER.length : index
  }
  /** Row centre in the mobile rail's own coordinate space (1 unit = 1px). */
  const rowY = (id: string) => (mobileIndex(id) + 0.5) * ROW_PX

  const select = useCallback((id: string) => setSelectedId(id), [])

  // The node the map is currently emphasising: preview wins, selection is the
  // resting state.
  const focusId = previewId ?? selected?.id ?? ''
  const isLit = (id: string) => focusId === id

  const onCanvasKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']
    if (!keys.includes(event.key)) return
    event.preventDefault()
    const ids = interestNodes.map((node) => node.id)
    const current = Math.max(0, ids.indexOf(selected?.id ?? ''))
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown'
    const nextIndex = forward
      ? (current + 1) % ids.length
      : (current - 1 + ids.length) % ids.length
    const nextId = ids[nextIndex]
    if (!nextId) return
    setSelectedId(nextId)
    buttonRefs.current[nextId]?.focus()
  }

  const followLink = (kind: 'project' | 'experience' | 'section', target: string) => () => {
    if (kind === 'project') {
      onNavigate(`#/projects/${target}`)
      return
    }
    if (kind === 'experience') {
      onNavigate('#experience')
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('rahul-os:select-experience', { detail: target }))
      }, 120)
      return
    }
    onNavigate(`#${target}`)
  }

  const linkLabel = (kind: 'project' | 'experience' | 'section', target: string) => {
    if (kind === 'project') return projectBySlug(target)?.title ?? 'Project'
    if (kind === 'experience') return 'Experience timeline'
    return sectionById(target)?.label ?? 'Section'
  }

  return (
    <section className="section" id="interests" aria-labelledby="interests-title">
      <div className="shell">
        <SectionHeading
          index="06"
          label="Interest map"
          id="interests-title"
          title="Six interests, and where they cross."
          note={
            <p>
              Each node links to the project or job behind it.
            </p>
          }
        />

        <div className="imap" data-reveal>
          <div>
            <div
              className="imap__canvas"
              role="group"
              aria-label="Interest map — select a node. Arrow keys move between nodes."
              onKeyDown={onCanvasKeyDown}
              style={
                {
                  '--imap-row': `${ROW_PX}px`,
                  '--imap-rows': MOBILE_ORDER.length,
                } as React.CSSProperties
              }
            >
              {/* Narrow screens: same nodes, same six connections, drawn as a
                  rail so nothing is hidden and no label is squeezed. */}
              <svg
                className="imap__svg imap__svg--mobile"
                viewBox={`0 0 100 ${MOBILE_ORDER.length * ROW_PX}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {interestEdges.map(([fromId, toId], lane) => {
                  const y1 = rowY(fromId)
                  const y2 = rowY(toId)
                  const railX = RAIL_START + (lane % 4) * 3.6
                  const active = focusId === fromId || focusId === toId
                  return (
                    <g
                      key={`m-${fromId}-${toId}`}
                      className={`imap__rail${active ? ' imap__rail--active' : ''}`}
                    >
                      <path
                        d={`M ${railX} ${y1} C ${railX - 3.4} ${y1 + (y2 - y1) * 0.4}, ${
                          railX - 3.4
                        } ${y1 + (y2 - y1) * 0.6}, ${railX} ${y2}`}
                      />
                      <path d={`M ${railX} ${y1} L ${RAIL_END} ${y1}`} />
                      <path d={`M ${railX} ${y2} L ${RAIL_END} ${y2}`} />
                      <circle cx={railX} cy={y1} r="1" />
                      <circle cx={railX} cy={y2} r="1" />
                    </g>
                  )
                })}
              </svg>

              <svg
                className="imap__svg imap__svg--packed"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {interestEdges.map(([fromId, toId]) => {
                  const from = byId(fromId)
                  const to = byId(toId)
                  if (!from || !to) return null
                  const active = focusId === fromId || focusId === toId
                  return (
                    <line
                      key={`${fromId}-${toId}`}
                      className={`imap__edge${active ? ' imap__edge--active' : ''}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                    />
                  )
                })}

                {interestNodes.map((node) => (
                  <circle
                    key={node.id}
                    className="imap__halo"
                    cx={node.x}
                    cy={node.y}
                    r="9"
                    opacity={isLit(node.id) ? 1 : 0}
                  />
                ))}
              </svg>

              {interestNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className="imap__nodebutton"
                  style={
                    {
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      order: mobileIndex(node.id),
                    } as React.CSSProperties
                  }
                  aria-pressed={selected?.id === node.id}
                  data-lit={isLit(node.id) ? 'true' : undefined}
                  ref={(element) => {
                    buttonRefs.current[node.id] = element
                  }}
                  onMouseEnter={() => setPreviewId(node.id)}
                  onMouseLeave={() => setPreviewId(null)}
                  onFocus={() => setPreviewId(node.id)}
                  onBlur={() => setPreviewId(null)}
                  onClick={() => select(node.id)}
                >
                  <i aria-hidden="true" />
                  {node.short}
                  {isLit(node.id) ? <span className="vh"> (highlighted on the map)</span> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="imap__panel" aria-live="polite">
            {selected ? (
              <>
                <p className="mono faint">
                  {selected.code} · NODE
                </p>
                <h3>{selected.label}</h3>
                <p>{selected.blurb}</p>
                <ul className="imap__links">
                  {selected.links.map((link) => (
                    <li key={`${link.kind}-${link.target}`}>
                      <button type="button" onClick={followLink(link.kind, link.target)}>
                        <ArrowUpRight size={13} aria-hidden="true" />
                        {link.label}
                        <span className="vh"> — {linkLabel(link.kind, link.target)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>

        {/* Accessible, list-based alternative — always present, not hidden. */}
        <div className="imap__index">
          <div className="imap__index-head mono">
            <span>All six, as a list</span>
            <span>Select to load details</span>
          </div>
          <ul className="imap__index-list">
            {interestNodes.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  className="imap__index-item"
                  aria-pressed={selected?.id === node.id}
                  data-lit={isLit(node.id) ? 'true' : undefined}
                  onMouseEnter={() => setPreviewId(node.id)}
                  onMouseLeave={() => setPreviewId(null)}
                  onFocus={() => setPreviewId(node.id)}
                  onBlur={() => setPreviewId(null)}
                  onClick={() => select(node.id)}
                >
                  <span aria-hidden="true">{node.code}</span>
                  <span>
                    <b>{node.label}</b>
                    <span>{node.links.length} links</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="imap__note">{interestNote}</p>
      </div>
    </section>
  )
}

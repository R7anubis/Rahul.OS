import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, CornerDownRight } from 'lucide-react'
import { experience, type ExperienceEntry } from '../data/experience'
import { SectionHeading } from './SectionHeading'

interface ExperienceTimelineProps {
  onNavigate: (hash: string) => void
  reduceMotion: boolean
}

/**
 * Interactive timeline. Every milestone is a real button with
 * `aria-expanded` / `aria-controls`, so mouse, touch and keyboard all work and
 * assistive technology gets the expanded state for free. Arrow keys, Home and
 * End move between milestones.
 */
export function ExperienceTimeline({ onNavigate, reduceMotion }: ExperienceTimelineProps) {
  const [selectedId, setSelectedId] = useState<string>(experience[0]?.id ?? '')
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const selected: ExperienceEntry | undefined =
    experience.find((entry) => entry.id === selectedId) ?? experience[0]

  const select = useCallback(
    (id: string) => {
      setSelectedId(id)
      const button = buttonRefs.current[id]
      const panel = panelRef.current
      // On narrow layouts the panel sits under the rail: nudge it into view
      // only when it is entirely below the viewport, to avoid jarring jumps.
      if (panel && button && window.matchMedia('(max-width: 1023px)').matches) {
        const rect = panel.getBoundingClientRect()
        if (rect.top > window.innerHeight - 120) {
          panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
        }
      }
    },
    [reduceMotion],
  )

  // Links from elsewhere on the page (interest map, project pages) can ask for
  // a specific milestone to be opened.
  useEffect(() => {
    const onSelect = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (detail && experience.some((entry) => entry.id === detail)) select(detail)
    }
    window.addEventListener('rahul-os:select-experience', onSelect)
    return () => window.removeEventListener('rahul-os:select-experience', onSelect)
  }, [select])

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(event.key)) return
    event.preventDefault()

    const ids = experience.map((entry) => entry.id)
    // Move relative to what is actually focused, falling back to the selection.
    const focusedId = ids.find((id) => buttonRefs.current[id] === document.activeElement)
    const currentIndex = Math.max(0, ids.indexOf(focusedId ?? selected?.id ?? ''))
    let nextIndex = currentIndex
    if (event.key === 'ArrowDown') nextIndex = Math.min(ids.length - 1, currentIndex + 1)
    if (event.key === 'ArrowUp') nextIndex = Math.max(0, currentIndex - 1)
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = ids.length - 1

    const nextId = ids[nextIndex]
    if (!nextId) return
    setSelectedId(nextId)
    buttonRefs.current[nextId]?.focus()
  }

  return (
    <section className="section" id="experience" aria-labelledby="experience-title">
      <div className="shell">
        <SectionHeading
          index="03"
          label="Experience"
          id="experience-title"
          title="A connected sequence, not a list of claims."
          note={
            <p>
              Dates and titles as listed on the supplied résumé. Where a fact is not on the
              résumé — the Wylo internship dates, for example — the entry says so instead of
              guessing. Nothing here implies endorsement by any employer.
            </p>
          }
        />

        <div className="timeline" data-reveal>
          <div>
            <ul className="timeline__rail" onKeyDown={onKeyDown}>
              {experience.map((entry) => {
                const expanded = selected?.id === entry.id
                return (
                  <li className="milestone" key={entry.id}>
                    <button
                      type="button"
                      className="milestone__btn"
                      ref={(node) => {
                        buttonRefs.current[entry.id] = node
                      }}
                      aria-expanded={expanded}
                      aria-controls={`milestone-panel-${entry.id}`}
                      onClick={() => select(entry.id)}
                    >
                      <span className="milestone__node" aria-hidden="true" />
                      <span>
                        <span className="milestone__org">{entry.org}</span>
                        <span className="milestone__role">
                          {entry.role} · {entry.kind}
                        </span>
                      </span>
                      <span className="milestone__when">
                        {entry.datesVerified ? entry.dates : 'Dates not listed'}
                        <ChevronDown
                          size={13}
                          aria-hidden="true"
                          style={{
                            display: 'block',
                            marginLeft: 'auto',
                            marginTop: 2,
                            transform: expanded ? 'rotate(180deg)' : 'none',
                            transition: 'transform var(--dur-2) var(--ease)',
                          }}
                        />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <p className="timeline__hint">
              <CornerDownRight size={13} aria-hidden="true" />
              Use arrow keys to move between milestones
            </p>
          </div>

          <div ref={panelRef} id={selected ? `milestone-panel-${selected.id}` : undefined} aria-live="polite">
            {selected ? (
              <div className="detail-panel">
                <div className="detail-panel__head">
                  <div>
                    <h3 className="detail-panel__title">{selected.org}</h3>
                    <p className="milestone__role">{selected.role}</p>
                  </div>
                  <span className={`chip${selected.datesVerified ? ' chip--ok' : ''}`}>
                    <span className="chip__dot" aria-hidden="true" />
                    {selected.datesVerified ? selected.dates : 'Dates unverified'}
                  </span>
                </div>

                <div className="detail-panel__body">
                  <dl className="detail-panel__meta">
                    <div>
                      <dt>Location</dt>
                      <dd>{selected.location}</dd>
                    </div>
                    <div>
                      <dt>Type</dt>
                      <dd>{selected.kind}</dd>
                    </div>
                    <div>
                      <dt>Dates</dt>
                      <dd>{selected.dates}</dd>
                    </div>
                  </dl>

                  <p className="dim" style={{ fontSize: 'var(--fs-small)' }}>
                    {selected.summary}
                  </p>

                  <ul className="detail-panel__list">
                    {selected.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>

                  <ul className="project-card__tags" aria-label="Technologies and disciplines">
                    {selected.tags.map((tag) => (
                      <li className="tag" key={tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="detail-panel__foot">
                  <span>{selected.contextNote}</span>
                  {selected.caseStudySlug ? (
                    <a
                      className="link-arrow"
                      href={`#/projects/${selected.caseStudySlug}`}
                      onClick={(event) => {
                        event.preventDefault()
                        onNavigate(`#/projects/${selected.caseStudySlug}`)
                      }}
                    >
                      Read the case study
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="timeline__panel-empty">
                Select a milestone to read the details.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

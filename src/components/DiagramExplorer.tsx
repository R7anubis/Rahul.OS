import { useRef, useState } from 'react'
import { Info, MousePointerClick } from 'lucide-react'
import type { ProjectDiagram, StageStatus } from '../data/projects'
import { ProjectFigure } from './figures'

interface DiagramExplorerProps {
  diagram: ProjectDiagram
}

/**
 * Interactive architecture diagram.
 *
 * The controls are real buttons in a linear list, so the diagram is fully
 * keyboard operable, screen-reader legible and understandable with motion
 * disabled — selecting a stage highlights that part of the figure and writes
 * the description into a shared readout. Nothing is hidden behind hover, and
 * the whole thing degrades to a captioned figure if the pointer never touches
 * it.
 *
 * Hover is a *preview* only: it changes what the figure highlights and what the
 * readout shows, but it never moves the committed selection, so `aria-pressed`
 * and the stage you chose stay put while the pointer crosses the list. The
 * selection changes on click, Enter/Space (both of which fire click), or an
 * arrow-key move — never as a side effect of the pointer passing over.
 */

const statusLabel: Record<StageStatus, string> = {
  documented: 'Documented',
  'in-development': 'In development',
  proposed: 'Proposed work',
}

const statusChip: Record<StageStatus, string> = {
  documented: 'chip',
  'in-development': 'chip',
  proposed: 'chip chip--concept',
}

export function DiagramExplorer({ diagram }: DiagramExplorerProps) {
  const [selectedId, setSelectedId] = useState<string>(diagram.stages[0]?.id ?? '')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const headingId = `${diagram.kind}-diagram-heading`
  const selected = diagram.stages.find((stage) => stage.id === selectedId) ?? diagram.stages[0]
  const shown = diagram.stages.find((stage) => stage.id === previewId) ?? selected
  const previewing = previewId !== null && previewId !== selectedId

  const move = (delta: number) => {
    const index = diagram.stages.findIndex((stage) => stage.id === selectedId)
    if (index < 0) return
    const next = diagram.stages[(index + delta + diagram.stages.length) % diagram.stages.length]
    if (!next) return
    setSelectedId(next.id)
    // Keep focus with the selection so the two never disagree.
    buttonRefs.current[next.id]?.focus()
  }

  return (
    <section className="diagram" aria-labelledby={headingId}>
      <div className="diagram__head">
        <div>
          <p className="section__eyebrow mono" style={{ marginBottom: '0.6rem' }}>
            <span className="section__index">Interactive</span>
            <span>Architecture</span>
          </p>
          <h2 id={headingId} className="diagram__title">
            {diagram.heading}
          </h2>
        </div>
        <p className="diagram__hint mono">
          <MousePointerClick size={13} aria-hidden="true" />
          Select a stage — keyboard: tab, then arrow keys
        </p>
      </div>

      <div className="diagram__layout">
        <figure className="detail__visual diagram__figure" data-cursor-inspect="diagram">
          <div className="detail__visual-inner">
            <ProjectFigure kind={diagram.kind} activeStage={shown?.id} />
          </div>
          <figcaption>
            <span>{diagram.caption}</span>
            <span>{diagram.kind}</span>
          </figcaption>
        </figure>

        <div className="diagram__panel">
          <ul className="diagram__stages" aria-label="Architecture stages">
            {diagram.stages.map((stage, index) => {
              const isSelected = stage.id === selectedId
              const isPreview = previewing && stage.id === previewId
              return (
                <li key={stage.id}>
                  <button
                    type="button"
                    className="diagram__stage"
                    ref={(element) => {
                      buttonRefs.current[stage.id] = element
                    }}
                    aria-pressed={isSelected}
                    data-preview={isPreview ? 'true' : undefined}
                    onMouseEnter={() => setPreviewId(stage.id)}
                    onMouseLeave={() => setPreviewId(null)}
                    onFocus={() => setPreviewId(stage.id)}
                    onBlur={() => setPreviewId(null)}
                    onClick={() => setSelectedId(stage.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                        event.preventDefault()
                        move(1)
                      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                        event.preventDefault()
                        move(-1)
                      }
                    }}
                  >
                    <span className="diagram__stage-index" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="diagram__stage-label">{stage.label}</span>
                    <span className={statusChip[stage.status]}>{statusLabel[stage.status]}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="diagram__readout" aria-live="polite">
            {shown ? (
              <>
                <p className="diagram__readout-label mono">
                  <Info size={13} aria-hidden="true" />
                  {shown.label} · {statusLabel[shown.status]}
                  {previewing ? <span className="diagram__readout-flag"> · preview</span> : null}
                </p>
                <p className="diagram__readout-text">{shown.detail}</p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

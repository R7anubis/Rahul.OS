import { useState } from 'react'
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
  const [activeId, setActiveId] = useState<string>(diagram.stages[0]?.id ?? '')
  const active = diagram.stages.find((stage) => stage.id === activeId) ?? diagram.stages[0]

  return (
    <section className="diagram" aria-labelledby="sameface-diagram-heading">
      <div className="diagram__head">
        <div>
          <p className="section__eyebrow mono" style={{ marginBottom: '0.6rem' }}>
            <span className="section__index">Interactive</span>
            <span>Architecture</span>
          </p>
          <h2 id="sameface-diagram-heading" className="diagram__title">
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
            <ProjectFigure kind={diagram.kind} activeStage={activeId} />
          </div>
          <figcaption>
            <span>{diagram.caption}</span>
            <span>{diagram.kind}</span>
          </figcaption>
        </figure>

        <div className="diagram__panel">
          <ul className="diagram__stages" aria-label="Architecture stages">
            {diagram.stages.map((stage, index) => {
              const selected = stage.id === activeId
              return (
                <li key={stage.id}>
                  <button
                    type="button"
                    className="diagram__stage"
                    aria-pressed={selected}
                    onMouseEnter={() => setActiveId(stage.id)}
                    onFocus={() => setActiveId(stage.id)}
                    onClick={() => setActiveId(stage.id)}
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
            {active ? (
              <>
                <p className="diagram__readout-label mono">
                  <Info size={13} aria-hidden="true" />
                  {active.label} · {statusLabel[active.status]}
                </p>
                <p className="diagram__readout-text">{active.detail}</p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

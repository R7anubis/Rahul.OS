import { ArrowLeft, ArrowUpRight, Info } from 'lucide-react'
import { categoryLabel, projects, type Project } from '../data/projects'
import { ProjectFigure } from './figures'
import { statusChipClass } from '../lib/status'

interface ProjectDetailProps {
  project: Project
  onNavigate: (hash: string) => void
}

const statusNote: Record<Project['statusKind'], string> = {
  'student-project': 'Built as a student project',
  'academic-proposal': 'Academic proposal and pilot design — not deployed',
  'study-exploration': 'Study and exploration — architecture described, not a release',
  'professional-experience': 'Professional experience — not a product Rahul owns',
}

export function ProjectDetail({ project, onNavigate }: ProjectDetailProps) {
  const go = (hash: string) => (event: React.MouseEvent) => {
    event.preventDefault()
    onNavigate(hash)
  }

  const others = projects.filter((item) => item.slug !== project.slug)
  const startIndex = projects.findIndex((item) => item.slug === project.slug)
  const next = [others[(startIndex + 0) % others.length], others[(startIndex + 1) % others.length]].filter(
    (item): item is Project => Boolean(item),
  )

  return (
    <article className="detail shell">
      <a className="detail__back" href="#projects" onClick={go('#projects')}>
        <ArrowLeft size={14} aria-hidden="true" />
        Back to all projects
      </a>

      <header className="detail__hero">
        <div>
          <p className="section__eyebrow mono" style={{ marginBottom: '1rem' }}>
            <span className="section__index">{categoryLabel[project.category]}</span>
            <span>{project.period}</span>
          </p>

          <h1 className="detail__title">{project.title}</h1>
          <p className="project-card__subtitle" style={{ marginBottom: '1.25rem' }}>
            {project.subtitle}
          </p>
          <p className="detail__lede">{project.lede}</p>

          <div className="detail__badges">
            <span className={statusChipClass(project.statusKind)}>
              <span className="chip__dot" aria-hidden="true" />
              {project.statusLabel}
            </span>
            <span className="chip">
              <span className="chip__dot" aria-hidden="true" />
              {project.context}
            </span>
            <span className="chip">
              <span className="chip__dot" aria-hidden="true" />
              {statusNote[project.statusKind]}
            </span>
          </div>
        </div>

        <figure className="detail__visual">
          <div className="detail__visual-inner">
            <ProjectFigure kind={project.figure} />
          </div>
          <figcaption>
            <span>{project.figureCaption}</span>
            <span>{project.slug}</span>
          </figcaption>
        </figure>
      </header>

      <div className="detail__body">
        <div className="detail__sections">
          {project.sections.map((section) => (
            <section className="detail__section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          {project.steps ? (
            <section className="detail__section">
              <h2>{project.statusKind === 'professional-experience' ? 'Disciplines applied' : 'Step by step'}</h2>
              <div className="step-list">
                {project.steps.map((step, index) => (
                  <div className="step" key={step.title}>
                    <span className="step__n" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="step__t">{step.title}</p>
                      <p className="step__d">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="detail__aside">
          <div className="callout">
            <p className="callout__label mono">
              <Info size={13} aria-hidden="true" />
              {project.disclaimer.label}
            </p>
            <p>{project.disclaimer.text}</p>
          </div>

          <dl className="fact-list">
            <div className="fact-list__head mono">
              <span>Entry data</span>
              <span>{project.slug}</span>
            </div>
            <div className="fact">
              <dt>Category</dt>
              <dd>{categoryLabel[project.category]}</dd>
            </div>
            <div className="fact">
              <dt>Context</dt>
              <dd>{project.context}</dd>
            </div>
            <div className="fact">
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div className="fact">
              <dt>Status</dt>
              <dd>{project.statusLabel}</dd>
            </div>
            <div className="fact">
              <dt>Technologies</dt>
              <dd>
                <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {project.technologies.map((tech) => (
                    <li className="tag" key={tech}>
                      {tech}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <nav className="detail__next" aria-label="Other projects">
        {next.map((item) => (
          <a
            key={item.slug}
            className="next-card"
            href={`#/projects/${item.slug}`}
            onClick={go(`#/projects/${item.slug}`)}
          >
            <span>{categoryLabel[item.category]}</span>
            <strong>{item.title}</strong>
            <span className="mono faint" style={{ textTransform: 'none', letterSpacing: 0 }}>
              {item.subtitle}
            </span>
            <ArrowUpRight size={14} aria-hidden="true" style={{ display: 'none' }} />
          </a>
        ))}
      </nav>
    </article>
  )
}

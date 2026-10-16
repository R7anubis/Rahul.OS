import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../data/projects'
import { categoryLabel } from '../data/projects'
import { ProjectFigure } from './figures'
import { statusChipClass } from '../lib/status'

interface ProjectCardProps {
  project: Project
  index: number
  onOpen: (slug: string) => void
}

export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  return (
    <article className={`project-card card-enter${project.wide ? ' project-card--wide' : ''}`}>
      <div className="project-card__figure">
        <span className="project-card__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <ProjectFigure kind={project.figure} />
      </div>

      <div className="project-card__body">
        <div className="project-card__top">
          <span className="mono faint">{categoryLabel[project.category]}</span>
          <span className={statusChipClass(project.statusKind)}>
            <span className="chip__dot" aria-hidden="true" />
            {project.statusLabel}
          </span>
        </div>

        <div>
          <h3 className="project-card__title">{project.title}</h3>
          <p className="project-card__subtitle">{project.subtitle}</p>
        </div>

        <p className="project-card__desc">{project.summary}</p>

        <ul className="project-card__tags" aria-label={`Technologies used in ${project.title}`}>
          {project.technologies.slice(0, 4).map((tech) => (
            <li className="tag" key={tech}>
              {tech}
            </li>
          ))}
          {project.technologies.length > 4 ? (
            <li className="tag tag--muted">+{project.technologies.length - 4}</li>
          ) : null}
        </ul>

        <div className="project-card__footer">
          <span className="project-card__role">{project.role}</span>
          <a
            className="project-card__link"
            href={`#/projects/${project.slug}`}
            onClick={(event) => {
              event.preventDefault()
              onOpen(project.slug)
            }}
          >
            <span className="vh">{`View details for ${project.title}`}</span>
            <span aria-hidden="true">Details</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  )
}

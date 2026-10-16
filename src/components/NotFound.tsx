import { ArrowLeft, Compass } from 'lucide-react'
import { projects } from '../data/projects'
import { sections } from '../data/sections'
import { profile } from '../data/profile'

interface NotFoundProps {
  path: string
  onNavigate: (hash: string) => void
}

/**
 * Not-found experience: explains what happened, offers the real routes, and
 * keeps the reader inside the system rather than dropping them at a dead end.
 */
export function NotFound({ path, onNavigate }: NotFoundProps) {
  const go = (hash: string) => (event: React.MouseEvent) => {
    event.preventDefault()
    onNavigate(hash)
  }

  return (
    <section className="notfound shell" aria-labelledby="notfound-title">
      <p className="notfound__code mono">ERROR 404 · ROUTE NOT FOUND</p>
      <h1 className="notfound__title" id="notfound-title">
        That address isn’t part of this system.
      </h1>
      <p>
        Nothing is mounted at <code className="mono-plain">&ldquo;{path}&rdquo;</code>. It may be a
        mistyped link, or a project that has been renamed. Everything that does exist is
        listed below.
      </p>

      <div className="notfound__actions">
        <a className="btn btn--primary" href="#top" onClick={go('#top')}>
          <ArrowLeft size={14} aria-hidden="true" />
          Back to the start
        </a>
        <a className="btn btn--ghost" href="#projects" onClick={go('#projects')}>
          <Compass size={14} aria-hidden="true" />
          Browse projects
        </a>
      </div>

      <nav className="notfound__routes" aria-label="Available destinations">
        {projects.map((project) => (
          <a
            key={project.slug}
            className="notfound__route"
            href={`#/projects/${project.slug}`}
            onClick={go(`#/projects/${project.slug}`)}
          >
            {project.title}
            <span>Project · {project.subtitle}</span>
          </a>
        ))}
        {sections.map((section) => (
          <a
            key={section.id}
            className="notfound__route"
            href={`#${section.id}`}
            onClick={go(`#${section.id}`)}
          >
            {section.label}
            <span>Section · {section.index}</span>
          </a>
        ))}
        <a className="notfound__route" href={`mailto:${profile.email}`}>
          Email Rahul
          <span>{profile.email}</span>
        </a>
      </nav>
    </section>
  )
}

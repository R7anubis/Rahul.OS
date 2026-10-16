import { useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { projectCategories, projects, type ProjectCategoryId } from '../data/projects'
import { ProjectCard } from './ProjectCard'
import { SectionHeading } from './SectionHeading'

interface ProjectGridProps {
  onOpenProject: (slug: string) => void
}

type Filter = ProjectCategoryId | 'all'

export function ProjectGrid({ onOpenProject }: ProjectGridProps) {
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['all', projects.length]])
    for (const project of projects) {
      map.set(project.category, (map.get(project.category) ?? 0) + 1)
    }
    return map
  }, [])

  const visible = useMemo(
    () => (filter === 'all' ? projects : projects.filter((project) => project.category === filter)),
    [filter],
  )

  const activeLabel = projectCategories.find((category) => category.id === filter)?.label ?? 'All'

  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <div className="shell">
        <SectionHeading
          index="02"
          label="Selected work"
          id="projects-title"
          title="Four entries, described at the stage they actually reached."
          note={
            <>
              <p>
                Two of these come from study and side exploration, one is an academic
                proposal, and one is a description of a job.
              </p>
              <p style={{ marginTop: '0.6rem' }}>
                Every visual below is an <strong>original diagram drawn for this site</strong> —
                there are no project screenshots, and nothing here is a proprietary interface.
              </p>
            </>
          }
        />

        {/* Signal scanner — real filtering over the project data */}
        <div className="scanner">
          <span className="scanner__label mono">
            <SlidersHorizontal size={13} aria-hidden="true" />
            Signal scanner
          </span>
          <div className="filter-list" role="group" aria-label="Filter projects by category">
            {projectCategories.map((category) => {
              const count = counts.get(category.id) ?? 0
              if (count === 0) return null
              return (
                <button
                  key={category.id}
                  type="button"
                  className="filter"
                  aria-pressed={filter === category.id}
                  onClick={() => setFilter(category.id)}
                >
                  <span className="filter__mark" aria-hidden="true" />
                  {category.label}
                  <span className="filter__count">{count}</span>
                </button>
              )
            })}
          </div>
          <span className="scanner__count mono" aria-live="polite">
            {visible.length} of {projects.length} shown · {activeLabel}
          </span>
        </div>

        <div className="project-grid">
          {visible.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              onOpen={onOpenProject}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

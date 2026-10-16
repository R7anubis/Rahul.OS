import { Info } from 'lucide-react'
import { skillClusters, skillsNote } from '../data/skills'
import { SectionHeading } from './SectionHeading'

export function Skills() {
  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <div className="shell">
        <SectionHeading
          index="05"
          label="Skills"
          id="skills-title"
          title="Grouped by area, never scored out of ten."
          note={
            <p>
              No percentage bars, no proficiency meters — a meter would invent a number that
              nothing on the résumé supports. Tags show what has been worked with and where.
            </p>
          }
        />

        <div className="clusters" data-reveal>
          {skillClusters.map((cluster) => (
            <article className="cluster" key={cluster.id}>
              <div className="cluster__head">
                <h3 className="cluster__name">{cluster.name}</h3>
                <span className="cluster__code" aria-hidden="true">
                  {cluster.code}
                </span>
              </div>
              <p className="cluster__desc">{cluster.description}</p>
              <ul className="cluster__tags" aria-label={`${cluster.name} — technologies`}>
                {cluster.tags.map((tag) => (
                  <li className="tag" key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="skills__footnote">
          <Info size={14} aria-hidden="true" />
          {skillsNote}
        </p>
      </div>
    </section>
  )
}

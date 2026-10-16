import { BookOpen, GraduationCap } from 'lucide-react'
import { development, education } from '../data/education'
import { SectionHeading } from './SectionHeading'

export function Education() {
  return (
    <section className="section" id="education" aria-labelledby="education-title">
      <div className="shell">
        <SectionHeading
          index="04"
          label="Education"
          id="education-title"
          title="Qualifications and short courses."
          note={
            <p>
              The Master of Data Science is in progress; the B.Tech is complete.
            </p>
          }
        />

        <div className="edu" data-reveal>
          {education.map((entry) => (
            <article className="edu__item" key={entry.id}>
              <p className="edu__when">
                {entry.status === 'In progress' ? (
                  <GraduationCap size={13} aria-hidden="true" />
                ) : (
                  <BookOpen size={13} aria-hidden="true" />
                )}
                <span>{entry.periodVerified ? entry.period : 'Period not stated'}</span>
                <span className={`chip${entry.status === 'In progress' ? ' chip--ok' : ''}`}>
                  <span className="chip__dot" aria-hidden="true" />
                  {entry.status}
                </span>
              </p>

              <h3 className="edu__degree">{entry.degree}</h3>
              <p className="edu__school">
                {entry.institution} — {entry.location}
              </p>
              <p className="edu__note">{entry.note}</p>
              {entry.detail ? <p className="edu__note">{entry.detail}</p> : null}
            </article>
          ))}
        </div>

        <div className="dev-list">
          <div className="dev-list__head mono">
            <span>Professional development</span>
            <span>LinkedIn Learning</span>
          </div>
          <div className="dev-list__rows">
            {development.map((course) => (
              <div className="dev-row" key={course.id}>
                <strong>{course.title}</strong>
                <span>{course.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

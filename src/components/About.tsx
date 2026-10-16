import { profile } from '../data/profile'
import { SectionBackdrop } from './SectionBackdrop'
import { SectionHeading } from './SectionHeading'

export function About({ motionEnabled }: { motionEnabled: boolean }) {
  return (
    <section className="section section--fx" id="about" aria-labelledby="about-title" data-snake-band>
      <SectionBackdrop motionEnabled={motionEnabled} />
      <div className="shell">
        <SectionHeading
          index="01"
          label="About"
          id="about-title"
          title="From Information Science to data science."
          note={
            <p>
              An Information Science degree, then embedded software, then technical QA, and
              now a Master of Data Science.
            </p>
          }
        />

        <div className="about" data-reveal>
          <div className="about__copy">
            <p className="about__lead">
              I started in Information Science and Engineering, spent a few years in
              embedded software and automotive ADAS, worked technical QA on a AAA game,
              and I am now studying data science at Monash.
            </p>

            <p>
              My degree at Presidency University in Bengaluru is where the interest in
              systems started. Software that sits close to the hardware asks a particular
              kind of question: what is the machine actually doing, and how would I know?
            </p>

            <p>
              <strong>Tata Elxsi</strong> turned that into work: Embedded C and C++ on
              Embedded Linux, in the automotive domain around{' '}
              <strong>advanced driver assistance systems</strong>, where a missed edge case
              has physical consequences.
            </p>

            <p>
              <strong>Rockstar Games India</strong> was the other end of the scale: technical
              QA inside a AAA development environment, on the announced Grand Theft Auto VI
              project. Finding and documenting defects, supporting reproduction and
              regression testing, and working with in-house profiling tools for stability and
              performance — large, interdependent software where the details are small and
              specific.
            </p>

            <p>
              Now I am at Monash studying data science: statistics, modelling, and what it
              takes to make a claim the data actually supports. Alongside coursework I have
              worked on a web and data project using React, GraphQL and PostgreSQL.
            </p>

            <div className="about__signature">
              <span className="mono dim">{profile.name}</span>
              <span className="mono faint">Information Science · Embedded · QA · Data</span>
            </div>
          </div>

          <aside className="about__aside">
            <dl className="fact-list">
              <div className="fact-list__head mono">
                <span>At a glance</span>
              </div>
              <div className="fact">
                <dt>Based in</dt>
                <dd>{profile.location}</dd>
              </div>
              <div className="fact">
                <dt>Currently</dt>
                <dd>
                  {profile.studies.program}, {profile.studies.institution}
                  <span>{profile.studies.intake} · {profile.studies.campus}</span>
                </dd>
              </div>
              <div className="fact">
                <dt>Most recently</dt>
                <dd>
                  Rockstar Games India — Associate QA – Technical
                  <span>Sep 2025 – Jun 2026 · Bengaluru</span>
                </dd>
              </div>
              <div className="fact">
                <dt>Before that</dt>
                <dd>
                  Tata Elxsi — Engineer, embedded software
                  <span>Jan 2024 – May 2025 · ADAS domain</span>
                </dd>
              </div>
              <div className="fact">
                <dt>Degree</dt>
                <dd>
                  B.Tech, Information Science and Engineering
                  <span>Presidency University, Bengaluru</span>
                </dd>
              </div>
              <div className="fact">
                <dt>Languages</dt>
                <dd>{profile.languages.join(' · ')}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}

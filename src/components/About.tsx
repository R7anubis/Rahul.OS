import { profile } from '../data/profile'
import { SectionHeading } from './SectionHeading'

export function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="shell">
        <SectionHeading
          index="01"
          label="About"
          id="about-title"
          title="Curiosity, pointed at systems that have to work."
          note={
            <p>
              A short account of how an Information Science degree turned into embedded
              software, game technology QA and a move into data science — written without
              the usual <strong>self-mythologising</strong>.
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
              systems started. Software that sits close to the hardware asks for a
              particular kind of attention: what is the machine actually doing, and how
              would I know?
            </p>

            <p>
              <strong>Tata Elxsi</strong> turned that into work. Embedded C and C++ on
              Embedded Linux, in the automotive domain around{' '}
              <strong>advanced driver assistance systems</strong> — where the feedback loop
              is physical and the cost of a missed edge case is not theoretical. I learned to
              be careful there, and I liked that it was not optional.
            </p>

            <p>
              <strong>Rockstar Games India</strong> moved me to the other end of the scale:
              technical QA inside a AAA development environment on the announced Grand Theft
              Auto VI project. Finding and documenting defects, supporting reproduction and
              regression testing, and working with in-house profiling tools focused on
              stability and performance. Large, interdependent software; small, specific
              details; constant communication.
            </p>

            <p>
              Now I am at Monash studying data science — the part of the stack I had used
              without formalising: statistics, modelling, and what it takes to make a claim
              that the data actually supports. Alongside coursework I have worked on a web
              and data project using React, GraphQL and PostgreSQL.
            </p>

            <p>
              What connects all of it is a preference for things that are useful and honest
              about their limits. The work on this site is deliberately described at the
              stage it actually reached — one project built, one designed as an academic
              proposal, one explored in simulation. Accurate is more interesting to me than
              impressive.
            </p>

            <div className="about__signature">
              <span className="mono dim">{profile.name}</span>
              <span className="mono faint">Information Science · Embedded · QA · Data</span>
            </div>
          </div>

          <aside className="about__aside">
            <dl className="fact-list">
              <div className="fact-list__head mono">
                <span>Verified record</span>
                <span>Résumé</span>
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

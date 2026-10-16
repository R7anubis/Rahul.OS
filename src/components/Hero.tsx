import { ArrowRight, GraduationCap, Mail, MapPin } from 'lucide-react'
import { profile } from '../data/profile'
import { asset } from '../lib/assets'
import { PointerGrid } from './PointerGrid'
import { SignalMotif } from './SignalMotif'

interface HeroProps {
  onNavigate: (hash: string) => void
  motionEnabled: boolean
}

const PORTRAIT_SRC = asset('images/portrait-960.jpg')
const PORTRAIT_SRCSET = [
  `${asset('images/portrait-640.jpg')} 640w`,
  `${asset('images/portrait-960.jpg')} 960w`,
  `${asset('images/portrait-1280.jpg')} 1280w`,
].join(', ')
const DUOTONE_SRCSET = [
  `${asset('images/portrait-duotone-640.jpg')} 640w`,
  `${asset('images/portrait-duotone-960.jpg')} 960w`,
  `${asset('images/portrait-duotone-1280.jpg')} 1280w`,
].join(', ')

export function Hero({ onNavigate, motionEnabled }: HeroProps) {
  const goToSection = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault()
    onNavigate(`#${id}`)
  }

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" data-snake-band>
      <div className="hero__bg">
        <span className="dot-field" />
        <PointerGrid motionEnabled={motionEnabled} />
        <SignalMotif />
      </div>

      <div className="hero__inner shell">
        <div className="hero__grid">
          <div>
            <div className="hero__meta">
              <span className="mono dim" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} aria-hidden="true" />
                {profile.locationShort}
              </span>
              <span className="chip chip--ok">
                <span className="chip__dot" aria-hidden="true" />
                {profile.studies.status}
              </span>
            </div>

            <h1 className="hero__wordmark" id="hero-title">
              RAHUL<em className="wordmark__dot">.RAJ</em>
              <span className="vh">
                {' '}
                — {profile.name}: {profile.headline}
              </span>
            </h1>

            <p className="hero__role">
              Embedded software · Technical QA · Data science
            </p>

            <p className="hero__headline">{profile.headline}</p>

            <p className="hero__support">{profile.support}</p>

            <div className="hero__actions">
              <a
                className="btn btn--primary"
                href="#projects"
                onClick={goToSection('projects')}
              >
                Explore projects
                <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a className="btn btn--ghost" href="#contact" onClick={goToSection('contact')}>
                <Mail size={14} aria-hidden="true" />
                Contact me
              </a>
            </div>

            <div className="hero__fineprint">
              <span>
                <GraduationCap size={13} aria-hidden="true" />
                {profile.studies.program}, {profile.studies.institution} — {profile.studies.intake}
              </span>
            </div>
          </div>

          <div>
            <figure className="portrait">
              <span className="portrait__tick portrait__tick--tl" aria-hidden="true" />
              <span className="portrait__tick portrait__tick--br" aria-hidden="true" />
              <div className="portrait__frame">
                {/* Dark theme shows the duotone print; light theme the neutral one. */}
                <img
                  className="portrait__img portrait__img--duotone"
                  src={asset('images/portrait-duotone-960.jpg')}
                  srcSet={DUOTONE_SRCSET}
                  sizes="(min-width: 1024px) 30rem, 100vw"
                  width={960}
                  height={1214}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  fetchPriority="high"
                />
                <img
                  className="portrait__img portrait__img--natural"
                  src={PORTRAIT_SRC}
                  srcSet={PORTRAIT_SRCSET}
                  sizes="(min-width: 1024px) 30rem, 100vw"
                  width={960}
                  height={1214}
                  alt="Portrait photograph of Rahul Raj, monochrome treatment"
                  decoding="async"
                  fetchPriority="high"
                />
                <span className="portrait__texture dot-field dot-field--dense" aria-hidden="true" />
              </div>
              <figcaption className="portrait__caption">
                <span>
                  FIG.01 · <b>{profile.name}</b>
                </span>
                <span>{profile.locationShort}</span>
              </figcaption>
            </figure>

            <div className="portrait__aside">
              <dl className="mini-readout">
                <div className="mini-readout__row">
                  <dt>Studying</dt>
                  <dd>{profile.studies.program}</dd>
                </div>
                <div className="mini-readout__row">
                  <dt>Campus</dt>
                  <dd>{profile.studies.institution}, Clayton</dd>
                </div>
                <div className="mini-readout__row">
                  <dt>Intake</dt>
                  <dd>July 2026</dd>
                </div>
                <div className="mini-readout__row">
                  <dt>Focus</dt>
                  <dd>Data · AI · Game tech</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

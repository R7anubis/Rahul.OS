import { ArrowUp, ArrowUpRight, Github, Instagram, Linkedin } from 'lucide-react'
import { DotMark } from './DotMark'
import { profile } from '../data/profile'
import { sections } from '../data/sections'

interface FooterProps {
  onNavigate: (hash: string) => void
}

const icons = {
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  email: null,
  x: ArrowUpRight,
} as const

export function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear()

  const goTo = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault()
    onNavigate(`#${id}`)
  }

  const toTop = (event: React.MouseEvent) => {
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onNavigate('#top')
  }

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__grid">
          <div>
            <span className="footer__mark">
              <DotMark size={16} />
              {/* One text run: as separate flex children the container's gap
                  landed between "RAHUL" and the period. */}
              <span className="wordmark">
                RAHUL
                <span className="wordmark__dot footer__mark-dot">.RAJ</span>
              </span>
            </span>
            <p className="footer__tagline">{profile.tagline}</p>
            <p className="mono faint" style={{ marginTop: '1rem' }}>
              {profile.locationShort} · {profile.studies.program}
            </p>
          </div>

          <nav className="footer__col" aria-label="Sections">
            <h2>Sections</h2>
            <div className="footer__links">
              {sections.map((section) => (
                <a
                  key={section.id}
                  className="footer__link"
                  href={`#${section.id}`}
                  onClick={goTo(section.id)}
                >
                  <span className="mono faint">{section.index}</span>
                  {section.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="footer__col">
            <h2>Elsewhere</h2>
            <div className="footer__links">
              {profile.links.map((link) => {
                const Icon = icons[link.id as keyof typeof icons]
                return (
                  <a
                    key={link.id}
                    className="footer__link"
                    href={link.href}
                    {...(link.external
                      ? { target: '_blank', rel: profile.externalRel }
                      : {})}
                    aria-label={link.description}
                  >
                    {Icon ? <Icon size={14} aria-hidden="true" /> : null}
                    {link.label}
                    <span className="mono faint">{link.handle}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="footer__meta">
          <div className="footer__meta-list">
            <span>© {year} {profile.name}</span>
            <span>No cookies · no analytics · no tracking</span>
          </div>
          <a className="footer__link to-top" href="#top" onClick={toTop}>
            <ArrowUp size={14} aria-hidden="true" />
            Back to top
          </a>
        </div>

        <p className="footer__disclaimer">
          Personal site — not affiliated with or endorsed by any company or product named
          here, including employers.
        </p>
      </div>
    </footer>
  )
}

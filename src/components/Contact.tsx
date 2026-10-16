import {
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Instagram,
  Linkedin,
  Mail,
  TriangleAlert,
} from 'lucide-react'
import { profile } from '../data/profile'
import { PointerGrid } from './PointerGrid'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { SectionHeading } from './SectionHeading'

const linkIcons = {
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  email: Mail,
  x: ArrowUpRight,
} as const

/**
 * Closing section with a command-interface aesthetic.
 * No contact form: there is no backend to post to, and a form that silently
 * discards messages would be worse than an honest mailto link.
 */
export function Contact({ motionEnabled }: { motionEnabled: boolean }) {
  const { state, copy, isCopied, isError } = useCopyToClipboard()

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <PointerGrid className="pointer-grid--contact" motionEnabled={motionEnabled} />
      <div className="shell">
        <SectionHeading
          index="07"
          label="Contact"
          id="contact-title"
          title="Get in touch."
          note={
            <p>
              Email is the reliable route. There is no contact form — nothing on this site
              could receive one.
            </p>
          }
        />

        <div className="contact__grid" data-reveal>
          <div>
            <p className="contact__title">
              Open to <em>part-time and contract work</em> alongside study.
            </p>

            <p className="dim" style={{ maxWidth: '48ch' }}>
              I am based in Melbourne and studying at Monash. Data science, software, QA and
              embedded work all interest me — email is the fastest way to reach me.
            </p>

            <div className="contact__actions">
              <a className="btn btn--primary" href={`mailto:${profile.email}?subject=Hello%20Rahul`}>
                <Mail size={14} aria-hidden="true" />
                Email Rahul
              </a>
              <button type="button" className="btn btn--ghost" onClick={() => copy(profile.email)}>
                {isCopied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                {isCopied ? 'Copied' : 'Copy email address'}
              </button>
              <span
                className="copy-status"
                data-state={state === 'error' ? 'error' : undefined}
                role="status"
                aria-live="polite"
              >
                {isCopied ? (<><Check size={13} aria-hidden="true" /> Copied to clipboard</>) : null}
                {isError ? (<><TriangleAlert size={13} aria-hidden="true" /> Copy failed — select the address manually</>) : null}
              </span>
            </div>
          </div>

          <div className="terminal">
            <div className="terminal__bar">
              <span className="terminal__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>{profile.email}</span>
              <span aria-hidden="true">zsh</span>
            </div>

            <div className="terminal__body">
              <p className="terminal__line">
                <span className="terminal__prompt">$</span>
                <span>whoami</span>
              </p>
              <p className="terminal__line terminal__out">
                {profile.name} — {profile.location}
              </p>

              <p className="terminal__line">
                <span className="terminal__prompt">$</span>
                <span>contact --list</span>
              </p>

              <ul className="terminal__list">
                {profile.links.map((link) => {
                  const Icon = linkIcons[link.id as keyof typeof linkIcons] ?? Mail
                  return (
                  <li className="cmd-row" key={link.id}>
                    <a
                      className="cmd-row__link"
                      href={link.href}
                      {...(link.external
                        ? { target: '_blank', rel: profile.externalRel, 'aria-label': link.description }
                        : { 'aria-label': link.description })}
                    >
                      <span className="cmd-row__cmd">open {link.id}</span>
                      <span className="cmd-row__value">{link.handle}</span>
                    </a>
                    <span className="cmd-row__icon" aria-hidden="true">
                      <Icon size={14} />
                    </span>
                  </li>
                  )
                })}
              </ul>

              <p className="terminal__line terminal__comment">
                # {profile.studies.program}, {profile.studies.institution} — {profile.studies.intake}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

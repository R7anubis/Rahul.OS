import { useEffect, useMemo, useRef, useState } from 'react'
import { Command, Menu, Moon, Sun, X } from 'lucide-react'
import { DotMark } from './DotMark'
import { linkById, profile } from '../data/profile'
import { sections } from '../data/sections'
import type { Route } from '../hooks/useHashRoute'
import type { Theme } from '../hooks/useTheme'
import type { MotionPreference } from '../hooks/useMotionPreference'

interface HeaderProps {
  route: Route
  activeSection: string | null
  theme: Theme
  motion: MotionPreference
  onToggleTheme: () => void
  onToggleMotion: () => void
  onOpenPalette: () => void
  onNavigate: (hash: string) => void
}

export function Header({
  route,
  activeSection,
  theme,
  motion,
  onToggleTheme,
  onToggleMotion,
  onOpenPalette,
  onNavigate,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const isMac = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)
  }, [])

  const navSections = sections.filter((section) => section.inNav)
  const onHome = route.kind === 'home'

  // Thin scroll-progress line: a real indicator of position in a long page.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Close the mobile sheet whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [route])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  // An open sheet owns the viewport: the page behind it must not scroll. The
  // scroll position is never moved, so closing simply hands scrolling back.
  useEffect(() => {
    if (!menuOpen) return
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousPadding = root.style.paddingRight
    const scrollbar = window.innerWidth - root.clientWidth
    root.style.overflow = 'hidden'
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`

    // iOS still scrolls the page under a hidden root overflow, so touches that
    // start outside the sheet are cancelled.
    const onTouchMove = (event: TouchEvent) => {
      const sheet = menuRef.current
      if (sheet && event.target instanceof Node && sheet.contains(event.target)) return
      if (event.cancelable) event.preventDefault()
    }
    document.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      root.style.overflow = previousOverflow
      root.style.paddingRight = previousPadding
      document.removeEventListener('touchmove', onTouchMove)
    }
  }, [menuOpen])

  // The sheet only exists below 1024px, where the toggle is visible: growing
  // past that closes it rather than leaving the lock on with no way to see it.
  useEffect(() => {
    if (!menuOpen) return
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (query.matches) setMenuOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [menuOpen])

  const goToSection = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault()
    setMenuOpen(false)
    onNavigate(`#${id}`)
  }

  return (
    <>
      <header className="site-header">
        <div className="header__inner shell">
          <a className="brand" href="#top" onClick={goToSection('top')}>
            <DotMark />
            <span className="brand__text">
              RAHUL
              <span className="wordmark__dot">.RAJ</span>
            </span>
            <span className="brand__sub">Personal system</span>
          </a>

          <nav className="header__nav" aria-label="Primary">
            {navSections.map((section) => {
              const current = onHome && activeSection === section.id
              return (
                <a
                  key={section.id}
                  className="nav__link"
                  href={`#${section.id}`}
                  onClick={goToSection(section.id)}
                  aria-current={current ? 'true' : undefined}
                >
                  <span className="nav__index">{section.index}</span>
                  {section.label}
                </a>
              )
            })}
          </nav>

          <div className="header__actions">
            <button type="button" className="icon-btn palette-trigger" onClick={onOpenPalette}>
              <Command size={14} aria-hidden="true" />
              <span className="vh">Open command palette</span>
              <span aria-hidden="true">Search</span>
              <kbd aria-hidden="true">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
            </button>

            <button
              type="button"
              className="icon-btn theme-toggle"
              onClick={onToggleTheme}
              aria-pressed={theme === 'light'}
            >
              {theme === 'dark' ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
              <span className="theme-toggle__track" aria-hidden="true">
                <span className="theme-toggle__thumb" />
              </span>
              <span className="theme-toggle__label" aria-hidden="true">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
              <span className="vh">
                {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              </span>
            </button>

            <button
              type="button"
              className="icon-btn menu-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <X size={15} aria-hidden="true" /> : <Menu size={15} aria-hidden="true" />}
              <span className="vh">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>

        {/* Scroll position indicator — 1px, driven by real document progress. */}
        <div
          aria-hidden="true"
          style={{
            height: 1,
            background: 'var(--accent)',
            transform: `scaleX(${progress})`,
            transformOrigin: 'left',
            opacity: progress > 0.002 ? 1 : 0,
          }}
        />

      </header>
  {/* Rendered outside the sticky header so the sheet is measured against the
      viewport rather than the header box. */}
      <div
        className="mobile-nav"
        id="mobile-nav"
        ref={menuRef}
        hidden={!menuOpen}
      >
        <nav className="shell" aria-label="Compact">
          <ul className="mobile-nav__list">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  className="mobile-nav__link"
                  href={`#${section.id}`}
                  onClick={goToSection(section.id)}
                >
                  {section.label}
                  <span>{section.index}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mobile-nav__actions">
            <button type="button" className="btn btn--sm" onClick={onOpenPalette}>
              <Command size={13} aria-hidden="true" />
              Search site
            </button>
            <button
              type="button"
              className="btn btn--sm"
              onClick={onToggleMotion}
              aria-pressed={motion === 'off'}
            >
              Motion {motion === 'off' ? 'off' : 'on'}
            </button>
            <a
              className="btn btn--sm"
              href={linkById('email')?.href ?? `mailto:${profile.email}`}
            >
              Email
            </a>
          </div>
        </nav>
      </div>
    </>
  )
}

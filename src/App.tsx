import { useCallback, useEffect, useState } from 'react'
import { About } from './components/About'
import { CommandPalette } from './components/CommandPalette'
import { Contact } from './components/Contact'
import { Education } from './components/Education'
import { ExperienceTimeline } from './components/ExperienceTimeline'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { InterestMap } from './components/InterestMap'
import { NotFound } from './components/NotFound'
import { ProjectDetail } from './components/ProjectDetail'
import { ProjectGrid } from './components/ProjectGrid'
import { Skills } from './components/Skills'
import { Toolchain } from './components/Toolchain'
import { PointerLayer } from './components/PointerLayer'
import { useDocumentMeta } from './hooks/useDocumentMeta'
import { useHashRoute } from './hooks/useHashRoute'
import { useMotionPreference } from './hooks/useMotionPreference'
import { useRevealOnScroll } from './hooks/useRevealOnScroll'
import { useScrollSpy } from './hooks/useScrollSpy'
import { useTheme } from './hooks/useTheme'
import { projectBySlug, projects } from './data/projects'
import { sections } from './data/sections'
import { profile } from './data/profile'

const sectionIds = sections.map((section) => section.id)

export default function App() {
  const { route, navigate, tick } = useHashRoute()
  const { theme, toggleTheme } = useTheme()
  const { motion, toggleMotion, reduceMotion } = useMotionPreference()
  const [paletteOpen, setPaletteOpen] = useState(false)

  const activeSection = useScrollSpy(sectionIds, route.kind === 'home')

  // Section reveals. Skipped when motion is off — the CSS leaves content
  // visible in that case, so nothing depends on JavaScript.
  const routeKey = route.kind === 'project' ? `project:${route.slug}` : route.kind
  useRevealOnScroll(routeKey, !reduceMotion)

  // A single accent hairline sweeps the viewport when the theme changes: a
  // deliberate, one-off acknowledgement of the action rather than an effect
  // that keeps running.
  const toggleThemeWithSweep = useCallback(() => {
    toggleTheme()
    if (reduceMotion || typeof document === 'undefined') return
    const root = document.documentElement
    delete root.dataset.themeSweep
    // Force a style flush so the animation can restart on rapid toggles.
    void root.offsetWidth
    root.dataset.themeSweep = 'true'
    window.setTimeout(() => delete root.dataset.themeSweep, 520)
  }, [toggleTheme, reduceMotion])

  const project = route.kind === 'project' ? projectBySlug(route.slug) : undefined

  useDocumentMeta(
    route.kind === 'project' && project
      ? {
          title: `${project.title} — ${project.subtitle} · RAHUL.OS`,
          description: project.summary,
          imageAlt: `RAHUL.OS cover card with a monochrome portrait of Rahul Raj. ${project.title} — ${project.subtitle}.`,
        }
      : route.kind === 'not-found'
        ? {
            title: 'Page not found · RAHUL.OS',
            description: 'No page exists at that address. Every section and project on this site is listed here.',
          }
        : {
            title: 'RAHUL.OS — Rahul Raj · Data science, embedded software and QA',
            description: `${profile.summary} Based in ${profile.location}.`,
          },
  )

  // Ctrl / Cmd + K opens the palette from anywhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Route changes decide the viewport position: sections scroll into view,
  // everything else starts at the top.
  useEffect(() => {
    if (route.kind === 'home' && route.section) {
      const target = document.getElementById(route.section)
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
        return
      }
    }
    if (route.kind === 'home' && !route.section && tick === 0) return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route, tick, reduceMotion])

  const openProject = useCallback((slug: string) => navigate(`#/projects/${slug}`), [navigate])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      {/* Faint 12-column guide lines — present on wide screens only. */}
      <div className="grid-lines" aria-hidden="true" />

      <Header
        route={route}
        activeSection={activeSection}
        theme={theme}
        motion={motion}
        onToggleTheme={toggleThemeWithSweep}
        onToggleMotion={toggleMotion}
        onOpenPalette={() => setPaletteOpen(true)}
        onNavigate={navigate}
      />

      <main id="main">
        {route.kind === 'home' ? (
          <>
            <Hero onNavigate={navigate} motionEnabled={!reduceMotion} />
            <Toolchain />
            <About />
            <ProjectGrid onOpenProject={openProject} />
            <ExperienceTimeline onNavigate={navigate} reduceMotion={reduceMotion} />
            <Education />
            <Skills />
            <InterestMap onNavigate={navigate} />
            <Contact motionEnabled={!reduceMotion} />
          </>
        ) : null}

        {route.kind === 'project' && project ? (
          <ProjectDetail project={project} onNavigate={navigate} />
        ) : null}

        {route.kind === 'not-found' ? (
          <NotFound path={route.path} onNavigate={navigate} />
        ) : null}
      </main>

      <Footer onNavigate={navigate} />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={navigate}
        theme={theme}
        onToggleTheme={toggleThemeWithSweep}
        motion={motion}
        onToggleMotion={toggleMotion}
      />

      <PointerLayer motionEnabled={!reduceMotion} />

      {/* Route count is exposed for the smoke test; harmless in production. */}
      <span className="vh" data-testid="project-count">
        {projects.length} projects
      </span>
    </>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { sections } from '../data/sections'
import { projectBySlug } from '../data/projects'

/**
 * Dependency-free hash router.
 *
 * Why hash routing: it makes every project page a real, linkable, shareable URL
 * (`#/projects/sameface`) that works on any static host — GitHub Pages, S3, a
 * USB stick — with no server rewrites and no 404 fallback configuration.
 *
 * Recognised shapes:
 *   ''                     → home
 *   '#projects'            → home, scrolled to a section ('#top' included)
 *   '#/projects/<slug>'    → project detail page
 *   anything else          → not-found page
 */

export type Route =
  | { kind: 'home'; section?: string }
  | { kind: 'project'; slug: string }
  | { kind: 'not-found'; path: string }

// Home-page hash targets: the documented sections, plus the hero anchor used by
// the wordmark and the back-to-top action, and the skip-link target.
const SECTION_IDS = new Set<string>([
  'top',
  'main',
  ...sections.map((section) => section.id),
])

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '')

  if (raw === '' || raw === '/') return { kind: 'home' }

  if (raw.startsWith('/')) {
    const path = raw.replace(/^\/+/, '').replace(/\/+$/, '')
    if (path === '') return { kind: 'home' }

    const segments = path.split('/')
    if (segments[0] === 'projects' && segments[1]) {
      const slug = decodeURIComponent(segments[1])
      if (projectBySlug(slug)) return { kind: 'project', slug }
      return { kind: 'not-found', path }
    }

    return { kind: 'not-found', path }
  }

  // Bare hash that matches a section id → home scrolled to that section.
  const sectionId = decodeURIComponent(raw)
  if (SECTION_IDS.has(sectionId)) return { kind: 'home', section: sectionId }

  return { kind: 'not-found', path: sectionId }
}

export function useHashRoute() {
  const [hash, setHash] = useState<string>(() =>
    typeof window === 'undefined' ? '' : window.location.hash,
  )
  // Bumped on every navigation attempt, so re-selecting the current section
  // still re-triggers the scroll behaviour.
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const route = useMemo(() => parseHash(hash), [hash])

  /** Navigate to a hash target. Empty string returns to the top of the home page. */
  const navigate = useCallback((to: string) => {
    const next = to.startsWith('#') ? to : `#${to}`
    if (window.location.hash === next) {
      // Same target: re-trigger scroll behaviour without a hashchange event.
      setHash(next)
    } else {
      window.location.hash = next
    }
    setTick((value) => value + 1)
  }, [])

  return { route, navigate, hash, tick }
}

import { useLayoutEffect } from 'react'

/**
 * Section reveals, implemented so that they can never hide content.
 *
 * The CSS only hides elements carrying `data-reveal="pending"`, and *only this
 * hook* sets that attribute — after the element is already in the DOM and
 * before the first paint. So:
 *  - with JavaScript disabled, or if this hook never runs, everything is simply
 *    visible (no `pending` attribute, no hiding rule);
 *  - if IntersectionObserver is unavailable, everything is marked visible
 *    immediately;
 *  - a failsafe timer marks everything visible after 1.5s regardless, so a
 *    dropped observer callback cannot strand a section off-screen.
 *
 * `key` should change whenever the DOM is replaced (route changes) so the scan
 * runs again.
 */
export function useRevealOnScroll(key: string, enabled: boolean) {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (nodes.length === 0) return

    const showAll = () => {
      for (const node of nodes) node.dataset.reveal = 'in'
    }

    if (!enabled || typeof IntersectionObserver === 'undefined') {
      showAll()
      return
    }

    // Mark before paint so there is no flash of already-visible content.
    for (const node of nodes) {
      const rect = node.getBoundingClientRect()
      const inViewport = rect.top < window.innerHeight * 0.92 && rect.bottom > 0
      node.dataset.reveal = inViewport ? 'in' : 'pending'
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.reveal = 'in'
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    for (const node of nodes) {
      if (node.dataset.reveal === 'pending') observer.observe(node)
    }

    const failsafe = window.setTimeout(() => {
      showAll()
      observer.disconnect()
    }, 1500)

    return () => {
      window.clearTimeout(failsafe)
      observer.disconnect()
    }
  }, [key, enabled])
}

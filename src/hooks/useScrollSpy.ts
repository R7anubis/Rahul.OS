import { useEffect, useState } from 'react'

/**
 * Reports which section is currently in view so the header navigation can mark
 * it with `aria-current`. Uses IntersectionObserver rather than scroll maths.
 */
export function useScrollSpy(ids: string[], enabled: boolean): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') {
      setActiveId(null)
      return
    }

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (elements.length === 0) return

    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id
          if (entry.isIntersecting) visible.set(id, entry.intersectionRatio)
          else visible.delete(id)
        }

        if (visible.size === 0) return
        // Topmost section that is at all visible wins — matches reading order.
        const ordered = ids.filter((id) => visible.has(id))
        const first = ordered[0]
        if (first) setActiveId(first)
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.15, 0.4, 0.75, 1],
      },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [ids, enabled])

  return activeId
}

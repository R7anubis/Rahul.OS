import { useEffect } from 'react'
import { SITE_URL } from '../lib/site'

interface MetaOptions {
  title: string
  description: string
  /** alt text for the social card, when the route has something better than the default */
  imageAlt?: string
}

const setMeta = (selector: string, attribute: string, value: string) => {
  const element = document.head.querySelector(selector)
  if (element) element.setAttribute(attribute, value)
}

/**
 * Keeps document title, description and Open Graph tags in step with the
 * current route.
 *
 * Canonical and `og:url` are deliberately pinned to the site root on every
 * route rather than following the hash. Project pages are fragments of one
 * document, so pointing a canonical tag at `…/#/projects/x` would ask search
 * engines to index several URLs that all resolve to the same page. Titles and
 * descriptions do change per route, which is what actually distinguishes them
 * in a result or a shared link.
 */
export function useDocumentMeta({ title, description, imageAlt }: MetaOptions) {
  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:url"]', 'content', `${SITE_URL}/`)
    setMeta('link[rel="canonical"]', 'href', `${SITE_URL}/`)
    setMeta('meta[name="twitter:title"]', 'content', title)
    setMeta('meta[name="twitter:description"]', 'content', description)
    if (imageAlt) {
      setMeta('meta[property="og:image:alt"]', 'content', imageAlt)
      setMeta('meta[name="twitter:image:alt"]', 'content', imageAlt)
    }
  }, [title, description, imageAlt])
}

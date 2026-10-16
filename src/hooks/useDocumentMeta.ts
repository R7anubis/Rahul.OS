import { useEffect } from 'react'

interface MetaOptions {
  title: string
  description: string
}

const setMeta = (selector: string, attribute: string, value: string) => {
  const element = document.head.querySelector(selector)
  if (element) element.setAttribute(attribute, value)
}

/**
 * Keeps document title, description and Open Graph tags in step with the
 * current route — important because project pages are real, linkable URLs.
 */
export function useDocumentMeta({ title, description }: MetaOptions) {
  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[name="twitter:title"]', 'content', title)
    setMeta('meta[name="twitter:description"]', 'content', description)
  }, [title, description])
}

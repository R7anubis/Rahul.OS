/**
 * Canonical origin for all absolute metadata.
 *
 * This is the registered custom domain. The Vercel deployment URL remains
 * available as a fallback, but canonical metadata should use this public origin.
 *
 * If the canonical origin ever changes, it must change in four places
 * together — this file, `index.html`, `public/robots.txt` and
 * `public/sitemap.xml`. The smoke test asserts that all four agree, so a
 * mismatch fails the build rather than shipping quietly.
 */
export const SITE_URL = 'https://r7anubis.is-a.dev'

/** Absolute URL for a site-relative path. */
export const absoluteUrl = (path = '/'): string =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

/** Social preview image, absolute so crawlers resolve it. */
export const OG_IMAGE = absoluteUrl('/images/og-cover.jpg')

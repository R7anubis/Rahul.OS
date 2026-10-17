/**
 * Canonical origin for all absolute metadata.
 *
 * This is the registered custom domain. Nothing falls back to another origin:
 * every absolute URL is built from this constant, so if the constant is wrong
 * the metadata is wrong.
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

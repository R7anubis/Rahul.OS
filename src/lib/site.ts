/**
 * Canonical origin for all absolute metadata.
 *
 * This is the current Vercel deployment. `rahulraj.dev` is deliberately not
 * used anywhere: it is not verified as owned or configured, and advertising an
 * unverified domain as canonical would be a false claim.
 *
 * If the canonical origin ever changes, it must change in four places
 * together — this file, `index.html`, `public/robots.txt` and
 * `public/sitemap.xml`. The smoke test asserts that all four agree, so a
 * mismatch fails the build rather than shipping quietly.
 */
export const SITE_URL = 'https://rahul-os-ten.vercel.app'

/** Absolute URL for a site-relative path. */
export const absoluteUrl = (path = '/'): string =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

/** Social preview image, absolute so crawlers resolve it. */
export const OG_IMAGE = absoluteUrl('/images/og-cover.jpg')

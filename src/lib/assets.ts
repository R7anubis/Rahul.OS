/**
 * Public asset URL helper.
 *
 * Everything the site references lives in `public/`, and this function resolves
 * it against Vite's configured base path — so the build works at a domain root
 * and under a subdirectory (VITE_BASE=/repo-name/) without touching components.
 */
const base = import.meta.env.BASE_URL || '/'

export const asset = (path: string): string =>
  `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`

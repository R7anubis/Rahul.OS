/**
 * RAHUL.OS smoke test.
 *
 * Renders the real application — no mocks of the app itself — with:
 *   1. static render assertions for every route (home, each project, 404)
 *   2. jsdom interaction tests for the project filter, theme toggle, command
 *      palette, timeline and interest map
 *
 * Run with: npm run smoke
 */
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

let failures = 0
let checks = 0

const ok = (condition, label, detail = '') => {
  checks += 1
  if (condition) {
    console.log(`  \u001b[32m✓\u001b[0m ${label}`)
  } else {
    failures += 1
    console.log(`  \u001b[31m✗\u001b[0m ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

const section = (title) => console.log(`\n\u001b[1m${title}\u001b[0m`)

/* ------------------------------------------------------------------ *
 * Browser environment (jsdom) — created before React is imported.
 * ------------------------------------------------------------------ */
const dom = new JSDOM('<!doctype html><html data-theme="dark" data-motion="on"><head></head><body><div id="root"></div></body></html>', {
  url: 'https://rahul-os.test/',
  pretendToBeVisual: true,
})

const { window } = dom

// jsdom lacks these; the app uses them for motion, scroll spy and scrolling.
window.matchMedia = (query) => ({
  matches: query.includes('prefers-reduced-motion') ? false : true,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})
window.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.Element.prototype.scrollIntoView = function scrollIntoView() {}
window.scrollTo = () => {}
window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(Date.now()), 0)
window.cancelAnimationFrame = (handle) => window.clearTimeout(handle)

globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', {
  value: window.navigator,
  configurable: true,
  writable: true,
})
globalThis.HTMLElement = window.HTMLElement
globalThis.Element = window.Element
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.CustomEvent = window.CustomEvent
globalThis.KeyboardEvent = window.KeyboardEvent
globalThis.MouseEvent = window.MouseEvent
Object.defineProperty(globalThis, 'location', {
  value: window.location,
  configurable: true,
  writable: true,
})
globalThis.localStorage = window.localStorage
globalThis.requestAnimationFrame = window.requestAnimationFrame
globalThis.cancelAnimationFrame = window.cancelAnimationFrame
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const React = await import('react')
const { renderToStaticMarkup } = await import('react-dom/server')
const { createRoot } = await import('react-dom/client')
const { act } = React

/* ------------------------------------------------------------------ *
 * Load the real app through Vite so TSX, CSS imports and data modules
 * are handled exactly as they are in development.
 * ------------------------------------------------------------------ */
const vite = await createServer({
  root,
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
})

const { default: App } = await vite.ssrLoadModule('/src/App.tsx')
const { projects } = await vite.ssrLoadModule('/src/data/projects.ts')
const { profile } = await vite.ssrLoadModule('/src/data/profile.ts')
const { sections } = await vite.ssrLoadModule('/src/data/sections.ts')

const render = (hash) => {
  window.location.hash = hash
  const html = renderToStaticMarkup(React.createElement(App))
  const container = document.createElement('div')
  container.innerHTML = html
  return { html, container }
}

/* ------------------------------------------------------------------ *
 * 1. Static assertions per route
 * ------------------------------------------------------------------ */
section('Home page')

const home = render('')
const { container: homeDoc } = home

ok(homeDoc.querySelectorAll('h1').length === 1, 'exactly one h1 on the page')
ok(
  /RAHUL/.test(homeDoc.querySelector('h1')?.textContent ?? ''),
  'h1 contains the wordmark',
)

const headings = [...homeDoc.querySelectorAll('h1, h2, h3, h4')].map((node) =>
  Number(node.tagName.slice(1)),
)
let skip = null
for (let index = 1; index < headings.length; index += 1) {
  if (headings[index] - headings[index - 1] > 1) skip = `${headings[index - 1]} → ${headings[index]}`
}
ok(skip === null, 'heading levels never skip', skip ?? '')

for (const section of sections) {
  ok(Boolean(homeDoc.querySelector(`#${section.id}`)), `section #${section.id} exists`)
}

const homeLinks = [...homeDoc.querySelectorAll('a[href]')]
ok(
  homeLinks.every((a) => {
    const href = a.getAttribute('href') ?? ''
    return href.startsWith('#') || href.startsWith('https://') || href.startsWith('mailto:')
  }),
  'every link is an in-page, https or mailto link',
)

const internalHrefs = homeLinks
  .map((a) => a.getAttribute('href') ?? '')
  .filter((href) => href.startsWith('#') && !href.startsWith('#/'))
ok(
  internalHrefs.every((href) => homeDoc.querySelector(href)),
  'every in-page anchor has a matching element id',
  internalHrefs.find((href) => !homeDoc.querySelector(href)) ?? '',
)

ok(!/href="#"\s/.test(home.html) && !/href="#"/.test(home.html), 'no dead href="#" links')

const images = [...homeDoc.querySelectorAll('img')]
ok(images.length >= 2, 'portrait images are present')
ok(
  images.every((img) => img.getAttribute('alt') !== null),
  'every image has an alt attribute',
)
ok(
  images.every((img) => (img.getAttribute('src') ?? '').startsWith('/images/')),
  'images reference local assets only',
)
ok(
  images.every((img) => img.getAttribute('width') && img.getAttribute('height')),
  'images declare intrinsic dimensions (no layout shift)',
)

ok(
  homeDoc.querySelectorAll('.project-card').length === projects.length,
  `home renders all ${projects.length} project entries`,
)
for (const project of projects) {
  ok(home.html.includes(project.title), `project "${project.title}" appears on the home page`)
}

ok(
  homeDoc.querySelectorAll('svg').length > 6,
  'custom SVG visuals and figures render',
)
ok(!home.html.includes('undefined'), 'no "undefined" leaked into the markup')
ok(!home.html.includes('[object Object]'), 'no stringified objects in the markup')
ok(!home.html.includes('NaN'), 'no NaN in the markup')

const mailto = homeLinks.find((a) => (a.getAttribute('href') ?? '').startsWith('mailto:'))
ok(Boolean(mailto), 'a mailto link is present')
ok(
  (mailto?.getAttribute('href') ?? '').includes(encodeURIComponent(profile.email)) ||
    (mailto?.getAttribute('href') ?? '').includes(profile.email),
  'mailto uses the verified address',
)

const external = homeLinks.filter((a) => (a.getAttribute('href') ?? '').startsWith('http'))
ok(external.length >= 4, 'verified social links are rendered')
ok(
  external.every((a) => a.getAttribute('target') === '_blank'),
  'external links open in a new tab',
)
ok(
  external.every((a) => (a.getAttribute('rel') ?? '').includes('noopener')),
  'external links carry rel="noopener"',
)

ok(
  homeDoc.querySelector('footer')?.textContent.includes(String(new Date().getFullYear())),
  'footer year is generated dynamically',
)

const ids = [...homeDoc.querySelectorAll('[id]')].map((node) => node.id)
ok(new Set(ids).size === ids.length, 'no duplicate element ids')

section('Project detail pages')

for (const project of projects) {
  const detail = render(`#/projects/${project.slug}`)
  const doc = detail.container
  ok(doc.querySelectorAll('h1').length === 1, `${project.slug}: single h1`)
  ok(detail.html.includes(project.title), `${project.slug}: title rendered`)
  ok(
    doc.querySelector('.detail__visual svg') !== null,
    `${project.slug}: figure renders`,
  )
  ok(
    (doc.querySelector('.detail__visual figcaption')?.textContent ?? '').length > 10,
    `${project.slug}: figure is captioned`,
  )
  ok(
    doc.querySelector('.callout') !== null,
    `${project.slug}: honesty caveat is present`,
  )
  ok(
    doc.querySelectorAll('.detail__next .next-card').length === 2,
    `${project.slug}: links to two other projects`,
  )
}

section('Not found page')

const missing = render('#/projects/does-not-exist')
ok(missing.container.textContent.includes('404'), 'unknown project route renders the 404 view')
ok(missing.container.querySelectorAll('h1').length === 1, '404 view has a single h1')
ok(
  missing.container.querySelectorAll('.notfound__route').length >= projects.length + sections.length,
  '404 view lists the real destinations',
)

const strayHash = render('#nonsense-section')
ok(strayHash.container.textContent.includes('404'), 'unknown hash falls back to the 404 view')

// Regression guard: every in-page anchor advertised by the home page must
// resolve to a real view instead of the 404 page.
const advertised = [
  ...new Set(
    homeLinks
      .map((a) => a.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('#') && !href.startsWith('#/')),
  ),
]
const brokenAnchors = advertised.filter((href) =>
  render(href).container.querySelector('.notfound'),
)
ok(
  brokenAnchors.length === 0,
  `all ${advertised.length} in-page anchors resolve (${advertised.join(', ')})`,
  brokenAnchors.join(', '),
)

const homeRoute = render('#top')
ok(!homeRoute.container.querySelector('.notfound'), '#top resolves to the home page')

/* ------------------------------------------------------------------ *
 * 2. Interaction tests (client render inside jsdom)
 * ------------------------------------------------------------------ */
section('Interactions')

const mount = async () => {
  window.location.hash = ''
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(React.createElement(App))
  })
  return { host, root }
}

const click = async (element) => {
  await act(async () => {
    element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

const key = async (target, keyName, init = {}) => {
  await act(async () => {
    target.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true, ...init }),
    )
  })
}

{
  const { host } = await mount()

  // --- project filter ---
  const filterButtons = [...host.querySelectorAll('.filter')]
  ok(filterButtons.length === 5, 'filter bar exposes five real categories')
  const allCards = host.querySelectorAll('.project-card').length

  const aiFilter = filterButtons.find((button) => button.textContent?.includes('AI / ML'))
  await click(aiFilter)
  await click(aiFilter)
  const afterFilter = host.querySelectorAll('.project-card').length
  ok(afterFilter < allCards && afterFilter >= 1, `filtering narrows the grid (${allCards} → ${afterFilter})`)
  ok(
    host.querySelectorAll('.filter[aria-pressed="true"]').length === 1,
    'filter state is exposed with aria-pressed',
  )

  const allFilter = [...host.querySelectorAll('.filter')].find((button) =>
    button.textContent?.trim().startsWith('All'),
  )
  await click(allFilter)
  ok(
    host.querySelectorAll('.project-card').length === allCards,
    'selecting “All” restores every entry',
  )

  // --- theme toggle ---
  const themeToggle = host.querySelector('.theme-toggle')
  await click(themeToggle)
  ok(document.documentElement.dataset.theme === 'light', 'theme toggle switches to light')
  ok(
    window.localStorage.getItem('rahul-os:theme') === 'light',
    'theme choice is persisted',
  )
  await click(themeToggle)
  ok(document.documentElement.dataset.theme === 'dark', 'theme toggle switches back to dark')

  // --- command palette ---
  await key(document, 'k', { metaKey: true })
  ok(Boolean(host.querySelector('[role="dialog"][aria-label="Command palette"]')), 'Cmd+K opens the palette')

  const input = host.querySelector('.palette__input')
  input.value = 'scams'
  await act(async () => {
    input.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
  await act(async () => {
    input.dispatchEvent(new window.Event('change', { bubbles: true }))
  })
  const results = [...host.querySelectorAll('.palette__item')]
  ok(results.length >= 1, 'palette search returns results')
  ok(
    results.some((item) => /scams/i.test(item.textContent ?? '')),
    'palette search finds the SCAMS project',
  )

  await key(host.querySelector('.palette__panel'), 'ArrowDown')
  ok(
    host.querySelectorAll('.palette__item[data-active="true"]').length === 1,
    'palette keeps a single active row',
  )

  await key(host.querySelector('.palette__panel'), 'Escape')
  ok(!host.querySelector('.palette'), 'Escape closes the palette')

  // --- experience timeline ---
  const milestoneButtons = [...host.querySelectorAll('.milestone__btn')]
  ok(milestoneButtons.length === 4, 'timeline renders four verified milestones')
  ok(milestoneButtons[0]?.getAttribute('aria-expanded') === 'true', 'first milestone is expanded')

  await click(milestoneButtons[2])
  ok(
    milestoneButtons[2]?.getAttribute('aria-expanded') === 'true',
    'activating a milestone expands it',
  )
  ok(
    (host.querySelector('.detail-panel__title')?.textContent ?? '').includes('Wylo'),
    'the detail panel shows the selected employer',
  )
  ok(
    (host.querySelector('.detail-panel')?.textContent ?? '').includes('Dates not listed'),
    'unverified dates are stated rather than invented',
  )

  await act(async () => {
    milestoneButtons[3]?.focus()
    milestoneButtons[3]?.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }),
    )
  })
  ok(
    document.activeElement === milestoneButtons[2],
    'arrow keys move focus to the previous milestone',
  )

  // --- interest map ---
  const indexButtons = [...host.querySelectorAll('.imap__index-item')]
  ok(indexButtons.length === 6, 'interest map exposes a six-item accessible index')
  await click(indexButtons[5])
  ok(
    indexButtons[5]?.getAttribute('aria-pressed') === 'true',
    'interest selection is exposed with aria-pressed',
  )
  ok(
    (host.querySelector('.imap__panel')?.textContent ?? '').includes('Gaming technology'),
    'the shared panel updates with the selected interest',
  )
  ok(
    host.querySelector('.imap__panel .imap__links button') !== null,
    'selected interest links to real work',
  )

  // --- copy email ---
  const copyButton = [...host.querySelectorAll('button')].find((button) =>
    /copy email/i.test(button.textContent ?? ''),
  )
  await click(copyButton)
  ok(
    (host.querySelector('.copy-status')?.textContent ?? '').length > 0,
    'copy email reports a result to assistive technology',
  )

  // --- command palette keyboard entry point from the mobile menu ---
  const menuToggle = host.querySelector('.menu-toggle')
  await click(menuToggle)
  ok(
    host.querySelector('#mobile-nav:not([hidden])') !== null,
    'compact mobile navigation opens',
  )
  await click(menuToggle)
  ok(host.querySelector('#mobile-nav[hidden]') !== null, 'compact mobile navigation closes')
}

await vite.close()

/* ------------------------------------------------------------------ *
 * 3. Content honesty guards
 * ------------------------------------------------------------------ */
section('Content guards')

const sourceFiles = [
  'src/data/projects.ts',
  'src/data/experience.ts',
  'src/data/education.ts',
  'src/data/skills.ts',
  'src/data/interests.ts',
  'src/data/profile.ts',
]

const corpus = sourceFiles
  .map((file) => readFileSync(path.join(root, file), 'utf8'))
  .join('\n')

const forbidden = [
  { pattern: /\b\d{1,3}%\s*(accuracy|accurate)/i, label: 'no accuracy percentages' },
  { pattern: /deployed\s+in\s+production|live\s+in\s+production/i, label: 'no production deployment claims' },
  { pattern: /\bActi\b[^.]*project/i, label: 'Acti keyboard is not presented as a project' },
]
for (const rule of forbidden) {
  const scoped = rule.label.includes('Acti') ? corpus.replace(/interestNote[\s\S]*?`/g, '') : corpus
  ok(!rule.pattern.test(scoped), rule.label)
}

ok(
  projects.length === 4,
  'exactly four entries: SameFace, SCAMS, CARLA/ROS 2 and the QA case study',
  `found ${projects.length}`,
)
ok(
  projects.every((project) => project.disclaimer.text.length > 40),
  'every entry carries a written scope disclaimer',
)

const { experience } = await (async () => {
  const server2 = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
  const mod = await server2.ssrLoadModule('/src/data/experience.ts')
  await server2.close()
  return mod
})()

ok(
  experience.every((entry) => entry.datesVerified || /not listed/i.test(entry.dates)),
  'employment without verified dates says so',
)
ok(
  experience.some((entry) => entry.org === 'Rockstar Games India' && entry.dates === 'Sep 2025 – Jun 2026'),
  'Rockstar dates match the résumé',
)

/* ------------------------------------------------------------------ */
console.log(
  `\n${failures === 0 ? '\u001b[32mPASS\u001b[0m' : '\u001b[31mFAIL\u001b[0m'} — ${checks - failures}/${checks} checks passed\n`,
)

process.exit(failures === 0 ? 0 : 1)

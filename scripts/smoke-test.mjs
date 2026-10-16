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
import { JSDOM, VirtualConsole } from 'jsdom'
import { createServer } from 'vite'
import { existsSync, readFileSync } from 'node:fs'
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
// jsdom has no canvas backend, so `getContext('2d')` reports "not implemented"
// and returns null. The snake is written to bail out on a null context, and the
// assertion below covers that; the notice itself is jsdom's, not the app's, so
// it is filtered rather than left to look like a failure.
const virtualConsole = new VirtualConsole()
virtualConsole.on('jsdomError', (error) => {
  if (/Not implemented/i.test(error.message)) return
  console.error(error)
})

const dom = new JSDOM('<!doctype html><html data-theme="dark" data-motion="on"><head></head><body><div id="root"></div></body></html>', {
  url: 'https://rahul-os.test/',
  pretendToBeVisual: true,
  virtualConsole,
})

const { window } = dom

// Give jsdom the same <head> the real build ships, so the metadata assertions
// below exercise the actual tags rather than a fixture. Scripts are dropped —
// jsdom does not execute them here and they are not what is under test.
{
  const html = readFileSync(path.join(root, 'index.html'), 'utf8')
  const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'))
  window.document.head.innerHTML = head.replace(/<script[\s\S]*?<\/script>/g, '')
}

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

section('SameFace case study (research paper source)')

{
  const sameface = render('#/projects/sameface')
  const doc = sameface.container
  const text = sameface.html

  ok(doc.querySelector('.diagram') !== null, 'interactive architecture diagram renders')
  ok(
    doc.querySelectorAll('.diagram__stage').length === 6,
    'diagram exposes six selectable stages',
    `${doc.querySelectorAll('.diagram__stage').length}`,
  )
  ok(
    doc.querySelector('.diagram__stage')?.getAttribute('aria-pressed') === 'true',
    'diagram has a default selected stage',
  )
  ok(
    (doc.querySelector('.diagram__readout-text')?.textContent ?? '').length > 40,
    'diagram readout describes the selected stage',
  )
  ok(
    doc.querySelector('.callout--neutral') !== null &&
      /research paper/i.test(doc.querySelector('.callout--neutral')?.textContent ?? ''),
    'the research paper is cited as the primary source',
  )

  // The specific claim the brief asks us to be careful about.
  ok(
    /NO EMBEDDINGS RETURNED/i.test(text) && /NO SIMILARITY SCORING/i.test(text),
    'states that ML Kit returns no embeddings and no similarity scoring',
  )
  ok(
    /separate method is required|separate similarity method|separate method/i.test(text),
    'explains that a separate similarity method is needed',
  )
  ok(
    /PROPOSED/i.test(text) && /future implementation/i.test(text),
    'marks the similarity algorithm as proposed work',
  )
  ok(
    /Firebase Authentication|OTP/i.test(text),
    'documents the Firebase authentication element',
  )
  ok(
    /Kotlin/i.test(text) && /Java/i.test(text) && /Android/i.test(text),
    'documents the Kotlin/Java Android context',
  )
  ok(
    /Documented design/.test(text) && /Proposed or future work/.test(text),
    'separates documented design from proposed work',
  )
  // No fabricated evaluation results anywhere in the SameFace copy.
  const fabricated = [
    /\b\d{1,3}(\.\d+)?%\s*(accuracy|match|precision|recall)/i,
    /achieved\s+(?:an\s+)?accuracy/i,
    /\btrained\s+on\s+\d+/i,
    /\b\d+\s+(?:users|participants|test subjects|beta testers)\b/i,
    /\btested\s+with\s+\d+/i,
  ]
  for (const pattern of fabricated) {
    ok(!pattern.test(text), `no fabricated metric: ${pattern}`)
  }
}

section('Education dates')

{
  const home2 = render('')
  const educationSection = home2.container.querySelector('#education')
  ok(
    educationSection?.textContent.includes('2019 – 2023'),
    'Presidency University shows the confirmed 2019 – 2023 range',
  )
  ok(
    !educationSection?.textContent.includes('Period not stated'),
    'no education entry still reports an unstated period',
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
  const { host, root } = await mount()

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
    !/dates not listed|dates unverified|not recorded|not stated/i.test(
      host.querySelector('.detail-panel')?.textContent ?? '',
    ),
    'an entry with no confirmed dates renders no date and no placeholder for one',
  )
  ok(
    host.querySelector('.detail-panel__meta') !== null &&
      !/\bDates\b/.test(host.querySelector('.detail-panel__meta')?.textContent ?? ''),
    'the Dates row is omitted entirely when there are no dates to show',
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

  // --- interactive architecture diagram (SameFace detail page) ---
  {
    const beforeRoute = window.location.hash
    await act(async () => {
      window.location.hash = '#/projects/sameface'
      window.dispatchEvent(new window.HashChangeEvent('hashchange'))
    })

    const stages = [...host.querySelectorAll('.diagram__stage')]
    ok(stages.length === 6, 'detail page exposes the six diagram stages')

    await click(stages[4])
    ok(
      stages[4]?.getAttribute('aria-pressed') === 'true',
      'selecting a stage marks it pressed',
    )
    ok(
      /separate ML similarity algorithm|planned for a future implementation/i.test(
        host.querySelector('.diagram__readout-text')?.textContent ?? '',
      ),
      'the proposed stage explains that the algorithm is planned',
    )
    ok(
      host.querySelector('.fig [data-stage="similarity"]')?.getAttribute('data-active') === 'true',
      'the figure highlights the selected stage',
    )

    await act(async () => {
      window.location.hash = beforeRoute
      window.dispatchEvent(new window.HashChangeEvent('hashchange'))
    })
  }

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

  await act(async () => {
    root.unmount()
  })
  ok(
    document.documentElement.dataset.cursor === undefined,
    'unmounting the app hands the native cursor back',
  )
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
  experience.every((entry) => entry.datesVerified || entry.dates === ''),
  'entries without confirmed dates carry no date at all, rather than a placeholder',
)
ok(
  !/résumé|resume/i.test(corpus.replace(/\/\*[\s\S]*?\*\//g, '')),
  'public copy never refers to a résumé or other source document',
)
ok(
  experience.some((entry) => entry.org === 'Rockstar Games India' && entry.dates === 'Sep 2025 – Jun 2026'),
  'Rockstar dates match the résumé',
)

section('Experience timeline: company / role separation')

{
  // This one is a pure CSS layout relationship, so jsdom cannot observe it —
  // it has no style engine for external stylesheets. The concatenation appeared
  // only because both elements were inline <span>s sharing one line, so the
  // guard asserts the two halves that make the fix real:
  //   1. the stylesheet declares them block-level, which is what separates them;
  //   2. the markup keeps all four entries as distinct org/role elements.
  const css = readFileSync(path.join(root, 'src/styles/components.css'), 'utf8')

  const ruleBody = (selector) => {
    const start = css.indexOf(`${selector} {`)
    if (start === -1) return ''
    const open = css.indexOf('{', start)
    const close = css.indexOf('}', open)
    return css.slice(open + 1, close)
  }

  const orgBody = ruleBody('.milestone__org')
  const roleBody = ruleBody('.milestone__role')

  ok(Boolean(orgBody), '.milestone__org rule exists')
  ok(Boolean(roleBody), '.milestone__role rule exists')
  ok(
    /display:\s*block/.test(orgBody),
    'company name is block-level, so it cannot share a line with the role',
  )
  ok(
    /display:\s*block/.test(roleBody),
    'role is block-level, so it starts on its own line',
  )
  ok(
    /margin-top:\s*\S/.test(roleBody),
    'role keeps a declared vertical offset from the company name',
  )
  // Typography and colour must survive the display fix.
  ok(/color:\s*var\(--text\)/.test(orgBody), 'company name keeps its colour token')
  ok(/color:\s*var\(--text-faint\)/.test(roleBody), 'role keeps its colour token')
  ok(
    /font-size:\s*var\(--fs-h4\)/.test(orgBody) && /font-size:\s*var\(--fs-mono\)/.test(roleBody),
    'font sizes are unchanged',
  )

  const timeline = render('')
  const buttons = [...timeline.container.querySelectorAll('.milestone__btn')]
  ok(buttons.length === 4, 'all four milestones are present')

  for (const button of buttons) {
    const org = button.querySelector('.milestone__org')
    const role = button.querySelector('.milestone__role')
    const label = org?.textContent ?? '?'

    ok(Boolean(org && role), `${label}: org and role are separate elements`)
    ok(
      org.nextElementSibling === role,
      `${label}: role is the immediate sibling of the company name`,
    )
    ok(
      (org.textContent ?? '').length > 1 && (role.textContent ?? '').length > 1,
      `${label}: both lines carry real text`,
    )
    // The separation must come from layout, never from a pasted-in space.
    ok(
      !/^\s/.test(role.textContent ?? '') && !/\s$/.test(org.textContent ?? ''),
      `${label}: no manual whitespace was injected into the text`,
    )
  }
}

section('Copy: no process notes or repeated disclaimers')

{
  const css = readFileSync(path.join(root, 'src/styles/components.css'), 'utf8')
  const sourceOf = (file) => readFileSync(path.join(root, file), 'utf8')

  // Strings that were removed because they explained how the site was
  // assembled, or repeated a caveat that is already made once.
  const removedPhrases = [
    'Unlisted information has been omitted',
    'Dates not listed',
    'not recorded in the résumé supplied',
    'Resume-based',
    'no trackers',
    'not a claim of equal depth',
    'rather than scored',
    'side exploration',
    'Revision 0.1',
    'SYSTEM ONLINE',
    'rahul@rahul.os',
    'not a screenshot',
    'not screenshots',
    'self-mythologising',
    'at the intersection of',
    'turning complex technical ideas into useful things',
    'the thread that runs through',
    'Building the thing, not just describing it',
    'listed on the résumé',
    'supplied résumé',
    'Toolchain · as listed',
  ]

  const publicCopy = [
    ...sourceFiles,
    'src/components/About.tsx',
    'src/components/Contact.tsx',
    'src/components/DiagramExplorer.tsx',
    'src/components/Education.tsx',
    'src/components/ExperienceTimeline.tsx',
    'src/components/Footer.tsx',
    'src/components/Header.tsx',
    'src/components/Hero.tsx',
    'src/components/InterestMap.tsx',
    'src/components/NotFound.tsx',
    'src/components/ProjectDetail.tsx',
    'src/components/ProjectGrid.tsx',
    'src/components/Skills.tsx',
    'src/App.tsx',
    'index.html',
  ]

  const haystack = publicCopy
    .map((file) => sourceOf(file))
    // Comments are not public copy.
    .map((text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, ''))
    .join('\n')

  const leaked = removedPhrases.filter((phrase) => haystack.includes(phrase))
  ok(
    leaked.length === 0,
    'removed disclaimers, process notes and AI-style phrases have not come back',
    leaked.join(' | '),
  )

  // The illustration note must survive exactly once per project page.
  ok(
    projects.every((project) => /original illustration/i.test(project.figureCaption)),
    'every project figure caption states that the figure is an original illustration',
  )
  ok(
    !/original illustration/i.test(css),
    'the illustration note is not duplicated into the stylesheet',
  )
}

section('Wordmark: RAHUL.RAJ renders as one word')

{
  window.history.replaceState(null, '', '/')
  const host = document.createElement('div')
  document.body.appendChild(host)
  const r = createRoot(host)
  await act(async () => {
    r.render(React.createElement(App))
  })

  // The reported bug was a space before the period: the footer mark is an
  // inline-flex container, so a bare "RAHUL" text node became its own flex item
  // and the container's gap landed between it and ".RAJ". This asserts the
  // rendered text, which is what a reader actually sees.
  const cases = [
    ['.brand__text', 'header'],
    ['.hero__wordmark', 'hero'],
    ['.footer__mark', 'footer'],
  ]

  for (const [selector, where] of cases) {
    const el = host.querySelector(selector)
    if (!el) {
      ok(false, `${where} wordmark is present`)
      continue
    }
    // Strip the visually-hidden accessible expansion and any child text that
    // is not the wordmark itself.
    const clone = el.cloneNode(true)
    clone.querySelectorAll('.vh').forEach((n) => n.remove())
    const text = (clone.textContent || '').replace(/\s+/g, '')
    ok(text.includes('RAHUL.RAJ'), `${where} wordmark renders as RAHUL.RAJ`, JSON.stringify(text))
  }

  // The flex gap must still apply between the mark glyph and the word.
  const css = readFileSync(path.join(root, 'src/styles/components.css'), 'utf8')
  const markRule = css.slice(css.indexOf('.footer__mark {'), css.indexOf('.footer__mark {') + 320)
  ok(/gap:\s*0\.55rem/.test(markRule), 'the footer mark keeps its intended spacing around the glyph')
  ok(
    /--wm-track:\s*0\.02em/.test(markRule),
    'the footer wordmark carries its own tracking so the dot can sit flush',
  )
  ok(
    /\.wordmark__dot \{[^}]*margin-left:\s*calc\(-1 \* var\(--wm-track/.test(css),
    'the period reclaims exactly the tracking that letter-spacing inserted before it',
  )

  // No stray space in the source either — the value is a single token.
  const profile = readFileSync(path.join(root, 'src/data/profile.ts'), 'utf8')
  ok(/wordmark:\s*'RAHUL\.RAJ'/.test(profile), 'the wordmark value is RAHUL.RAJ with no space')

  await act(async () => {
    r.unmount()
  })
  host.remove()
}

section('SEO and metadata consistency')

{
  const html = readFileSync(path.join(root, 'index.html'), 'utf8')
  const robots = readFileSync(path.join(root, 'public/robots.txt'), 'utf8')
  const sitemap = readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8')
  const site = readFileSync(path.join(root, 'src/lib/site.ts'), 'utf8')
  const meta = await (async () => {
    const server3 = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
    const mod = await server3.ssrLoadModule('/src/lib/site.ts')
    await server3.close()
    return mod
  })()

  const ORIGIN = 'https://rahul-os-ten.vercel.app'
  ok(meta.SITE_URL === ORIGIN, `canonical origin is the current deployment (${meta.SITE_URL})`)

  // The unverified domain must not appear anywhere a crawler would read it.
  const crawlable = html + robots + sitemap
  ok(!/rahulraj\.dev/.test(crawlable), 'the unverified domain appears in no crawlable file')

  ok(
    html.includes(`<link rel="canonical" href="${ORIGIN}/" />`),
    'index.html canonical is absolute and matches the origin',
  )
  ok(
    html.includes(`content="${ORIGIN}/"`),
    'og:url is absolute and matches the canonical origin',
  )
  ok(
    html.includes(`content="${ORIGIN}/images/og-cover.jpg"`),
    'og:image is absolute',
  )
  ok(
    html.includes(`content="${ORIGIN}/images/og-cover.jpg"`),
    'twitter:image is absolute',
  )
  ok(
    !/content="\/images\/og-cover\.jpg"/.test(html),
    'no crawler-facing image URL is left relative',
  )

  // Structured data must point at the same origin and an image that exists.
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  ok(ld !== null, 'structured data block is present')
  if (ld) {
    const data = JSON.parse(ld[1])
    ok(data.url === `${ORIGIN}/`, 'structured-data url matches the canonical origin')
    ok(data.image.startsWith(ORIGIN), 'structured-data image is on the canonical origin')
    const imagePath = data.image.slice(ORIGIN.length)
    ok(
      existsSync(path.join(root, 'public', imagePath)),
      `structured-data image exists in the build (${imagePath})`,
    )
  }

  ok(sitemap.includes(`<loc>${ORIGIN}/</loc>`), 'sitemap lists an absolute canonical URL')
  ok(!/<loc>\//.test(sitemap), 'sitemap has no relative loc entry')
  ok(
    robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`),
    'robots.txt points at an absolute sitemap URL',
  )

  // Every image the metadata references must actually ship.
  const ogOnDisk = path.join(root, 'public', 'images', 'og-cover.jpg')
  ok(existsSync(ogOnDisk), 'the social preview image exists in public/')
  ok(
    /<meta property="og:image:width" content="1200" \/>/.test(html) &&
      /<meta property="og:image:height" content="630" \/>/.test(html),
    'og:image declares the 1200x630 dimensions',
  )
}

section('Document metadata follows the route')

{
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root2 = createRoot(host)

  window.location.hash = '#/projects/sameface'
  await act(async () => {
    root2.render(React.createElement(App))
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40))
  })

  ok(/SameFace/.test(document.title), `project route sets its own title (${document.title})`)
  const desc = document.head.querySelector('meta[name="description"]')
  ok(
    desc !== null && /SameFace|similarity/i.test(desc.getAttribute('content') || ''),
    'project route sets its own description',
  )
  ok(
    document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ===
      'https://rahul-os-ten.vercel.app/',
    'canonical stays on the document root for hash routes',
  )

  // The not-found route must not advertise itself as indexable content.
  window.location.hash = '#/projects/does-not-exist'
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40))
  })
  ok(/not found/i.test(document.title), `unknown route sets a not-found title (${document.title})`)

  // Leave the document on the home route for the sections that follow.
  window.history.replaceState(null, '', '/')
  await act(async () => {
    root2.unmount()
  })
  host.remove()
}

section('Diagram explorer: stable heading and selection model')

{
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root3 = createRoot(host)
  window.location.hash = '#/projects/sameface'
  await act(async () => {
    root3.render(React.createElement(App))
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40))
  })

  const diagram = host.querySelector('.diagram')
  ok(diagram !== null, 'the interactive diagram renders on the SameFace page')

  if (diagram) {
    const labelledBy = diagram.getAttribute('aria-labelledby')
    const heading = diagram.querySelector('h2')
    ok(heading !== null, 'the diagram has a heading element')
    ok(
      heading !== null && heading.id === labelledBy,
      'aria-labelledby points at the diagram heading',
    )
    ok(
      labelledBy !== null && labelledBy.startsWith('sameface'),
      `the heading id is project-specific and stable (${labelledBy})`,
    )
    ok(
      host.querySelectorAll(`#${labelledBy}`).length === 1,
      'the heading id is unique in the document',
    )

    const stages = [...diagram.querySelectorAll('.diagram__stage')]
    ok(stages.length >= 2, `stage controls are buttons (${stages.length})`)

    const selectedId = () => stages.findIndex((b) => b.getAttribute('aria-pressed') === 'true')
    const before = selectedId()
    ok(before >= 0, 'exactly one stage starts selected')

    // Hovering a different stage must not move the committed selection.
    const other = stages.findIndex((_, i) => i !== before)
    await act(async () => {
      stages[other].dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }))
      stages[other].dispatchEvent(new window.MouseEvent('mouseenter', { bubbles: true }))
    })
    ok(
      selectedId() === before,
      'hovering another stage leaves the committed selection where it was',
    )

    // A click does move it.
    await act(async () => {
      stages[other].click()
    })
    ok(selectedId() === other, 'clicking a stage moves the selection')

    // Arrow keys move it too, and keep focus with it.
    await act(async () => {
      stages[other].dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      )
    })
    ok(
      selectedId() === (other + 1) % stages.length,
      'arrow keys move the selection',
    )
  }

  await act(async () => {
    root3.unmount()
  })
  host.remove()
}

section('Dot snake: one for the whole page')

{
  const css = readFileSync(path.join(root, 'src/styles/components.css'), 'utf8')
  const snakeSource = readFileSync(path.join(root, 'src/components/DotSnake.tsx'), 'utf8')
  const originalMatchMedia = window.matchMedia

  const stub = ({ fine, reduced, hover }) => (query) => ({
    matches: query.includes('prefers-reduced-motion')
      ? reduced
      : query.includes('pointer: fine')
        ? fine
        : query.includes('hover: hover')
          ? hover
          : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })

  // Earlier sections leave the document on a project route, which silently made
  // every mount assertion here vacuous. The route is reset per mount and the
  // home page is asserted before anything else is.
  const mountFresh = async () => {
    window.history.replaceState(null, '', '/')
    const host = document.createElement('div')
    document.body.appendChild(host)
    const r = createRoot(host)
    await act(async () => {
      r.render(React.createElement(App))
    })
    ok(host.querySelector('.hero') !== null, 'the home page is the rendered route for this mount')
    return { host, r }
  }

  // jsdom has no canvas backend, so these assert the decisions the component
  // makes before it touches a rendering context.
  window.matchMedia = stub({ fine: false, reduced: false, hover: false })
  const touch = await mountFresh()
  ok(touch.host.querySelectorAll('canvas.snake').length === 0, 'touch-only device: no snake is mounted')
  await act(async () => {
    touch.r.unmount()
  })
  touch.host.remove()

  window.matchMedia = stub({ fine: true, reduced: true, hover: true })
  const reducedMount = await mountFresh()
  ok(reducedMount.host.querySelectorAll('canvas.snake').length === 0, 'reduced motion: no snake is mounted')
  await act(async () => {
    reducedMount.r.unmount()
  })
  reducedMount.host.remove()

  // Fine pointer with motion allowed: exactly one snake, owned by the page.
  window.matchMedia = stub({ fine: true, reduced: false, hover: true })
  const fineMount = await mountFresh()
  const snakes = [...fineMount.host.querySelectorAll('canvas.snake')]
  ok(snakes.length === 1, `one snake canvas for the whole page (${snakes.length})`, 'expected 1')
  const snake = snakes[0]
  ok(snake.closest('section') === null, 'the snake belongs to the page, not to a section')
  const main = snake.parentElement
  ok(main.tagName === 'MAIN', 'the snake is mounted at page level, inside <main>')
  ok(
    main.children[main.children.length - 1] === snake,
    'it is mounted last, so it paints above the printed dot textures',
  )
  ok(
    fineMount.host.querySelectorAll('section canvas.snake').length === 0,
    'no section mounts a snake of its own any more',
  )

  // Where it may go is declared in markup, by the sections themselves.
  const bands = [...fineMount.host.querySelectorAll('[data-snake-band]')].map((el) => el.id)
  ok(bands.join(',') === 'top,about,contact', `the snake travels in the spacious sections (${bands.join(', ')})`)
  ok(
    fineMount.host.querySelectorAll('#projects[data-snake-band], #experience[data-snake-band], #education[data-snake-band], #skills[data-snake-band], #interests[data-snake-band]').length === 0,
    'the dense sections do not opt in',
  )
  // The one visible crossing the design depends on: the hero and About are
  // separate sections with the toolchain strip between them and nothing else,
  // so the snake can swim across that boundary instead of diving.
  const heroEl = fineMount.host.querySelector('#top')
  const stripEl = fineMount.host.querySelector('.toolchain')
  ok(
    heroEl !== null && heroEl.nextElementSibling === stripEl && stripEl !== null,
    'the toolchain strip is what sits between the hero and About',
  )
  ok(
    stripEl !== null && stripEl.nextElementSibling?.id === 'about',
    'and About follows it directly, so the gap the snake crosses is just the strip',
  )
  await act(async () => {
    fineMount.r.unmount()
  })
  fineMount.host.remove()

  // No bands and no snake off the home page.
  window.history.replaceState(null, '', '#/projects/sameface')
  const projectHost = document.createElement('div')
  document.body.appendChild(projectHost)
  const projectRoot = createRoot(projectHost)
  await act(async () => {
    projectRoot.render(React.createElement(App))
  })
  ok(projectHost.querySelectorAll('h1').length === 1, 'the project route rendered for this mount')
  ok(projectHost.querySelectorAll('[data-snake-band]').length === 0, 'a project page has no bands to travel in')
  ok(projectHost.querySelectorAll('canvas.snake').length === 0, 'and no snake')
  await act(async () => {
    projectRoot.unmount()
  })
  projectHost.remove()
  window.history.replaceState(null, '', '/')

  window.matchMedia = originalMatchMedia

  // --- layering ---
  const snakeRule = css.slice(css.indexOf('.snake {'), css.indexOf('.snake {') + 420)
  ok(/position:\s*fixed/.test(snakeRule), 'the snake is a single fixed layer over the page')
  ok(
    /inset:\s*0/.test(snakeRule) && /z-index:\s*0/.test(snakeRule),
    'it covers the viewport at z-index 0, above the section backgrounds',
  )
  ok(/pointer-events:\s*none/.test(snakeRule), 'the snake never takes a pointer event')
  ok(
    /z-index:\s*1/.test(css.slice(css.indexOf('.hero__inner {'), css.indexOf('.hero__inner {') + 200)),
    'hero content stays above the snake',
  )

  // --- one instance, working in document coordinates ---
  ok(!/presenceHolder/.test(snakeSource), 'the presence slot that arbitrated between instances is gone')
  ok(!/new IntersectionObserver/.test(snakeSource), 'per-section primacy observers are gone with it')
  // Comments stripped first: the header explains the loop, and counting prose
  // as call sites is how this assertion was wrong the first time.
  const snakeCode = snakeSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  ok(
    (snakeCode.match(/requestAnimationFrame\(/g) || []).length === 2 &&
      (snakeCode.match(/<canvas/g) || []).length === 1,
    'one canvas and one animation loop for the whole page',
  )
  ok(
    /document coordinates/.test(snakeSource) && /dot\.cy - offset/.test(snakeSource),
    'it simulates in document coordinates and subtracts the scroll offset when drawing',
  )
  ok(
    /scrollY = window\.scrollY/.test(snakeSource),
    'so scrolling moves the page past the snake rather than the snake across the page',
  )
  ok(
    /querySelectorAll\('\[data-snake-band\]'\)/.test(snakeSource),
    'the bands come from the markup, not from a hard-coded list of sections',
  )
  ok(
    /buildCorridors/.test(snakeSource) && /phaseFor/.test(snakeSource) && /snapToLattice/.test(snakeSource),
    'the geometry comes from the shared lattice module',
  )
  ok(
    !/Math\.round\(dot\.x \/ DOT_PITCH\)/.test(snakeSource),
    'it no longer rounds from the corner, which lands between the printed dots',
  )
  ok(
    /ctx\.clip\(\)/.test(snakeSource) && /for \(const band of current\.bands\)/.test(snakeSource),
    'every band is also a clip region, so nothing is painted outside them',
  )

  // --- the two transitions ---
  ok(/const HOME_PULL = /.test(snakeSource), 'within a corridor it steers toward the band being read')
  ok(/const READ_FRACTION = 0\.38/.test(snakeSource), 'measured from a line 38% down the viewport, where the eye sits')
  ok(
    /const startDive = \(\) => \{/.test(snakeSource) &&
      /state\.phase = 'surface'/.test(snakeSource) &&
      /place\(current, true\)/.test(snakeSource),
    'between corridors it dives, is moved while invisible, then surfaces',
  )
  ok(
    /if \(pending && state\.phase !== 'dive'\) \{\n        if \(state\.placed && snakeOnScreen\(\)\) startDive\(\)\n        else relocateNow\(\)/.test(
      snakeSource,
    ),
    'and it only performs that dive when there is something on screen to see',
  )
  ok(
    /if \(pending && pending !== target\) pending = null/.test(snakeSource) &&
      /if \(pending && state\.phase !== 'dive'\)/.test(snakeSource),
    'a queued move cannot get stuck: it is dropped if it is no longer wanted, and acted on in every other phase',
  )
  ok(
    !/mask-image/.test(snakeRule),
    'the section-sized radial mask is gone: at viewport size it would fade the snake out at the screen edges, breaking the wrap',
  )

  // --- robustness, unchanged from before ---
  ok(/prefers-reduced-motion/.test(snakeSource), 'the snake component itself checks reduced motion')
  ok(/if \(!ctx\) return/.test(snakeSource), 'a missing 2D context disables the effect instead of throwing')
  ok(
    /document\.addEventListener\('visibilitychange', onVisibility\)/.test(snakeSource) &&
      /document\.removeEventListener\('visibilitychange', onVisibility\)/.test(snakeSource),
    'the snake pauses on tab hide and removes that listener on cleanup',
  )
  ok(
    /window\.addEventListener\('scroll', onScroll, \{ passive: true \}\)/.test(snakeSource) &&
      /window\.removeEventListener\('scroll', onScroll\)/.test(snakeSource),
    'the scroll listener is passive and removed on cleanup',
  )
  ok(
    /ro\?\.disconnect\(\)/.test(snakeSource) && /themeObserver\.disconnect\(\)/.test(snakeSource),
    'observers are disconnected on cleanup',
  )
  ok(/stop\(\)\n      ro\?\.disconnect/.test(snakeSource), 'the animation frame loop is stopped on cleanup')
}

section('Dot grid geometry: pitch, phase and corridors')

{
  const { DOT_PITCH, TRACK_GAP, buildCorridors, phaseFor, snapToLattice } = await (async () => {
    const server = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
    const mod = await server.ssrLoadModule('/src/lib/dotGeometry.ts')
    await server.close()
    return mod
  })()

  const tokensCss = readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8')
  const globalCss = readFileSync(path.join(root, 'src/styles/global.css'), 'utf8')
  const token = /--dot-pitch:\s*(\d+)px/.exec(tokensCss)
  ok(
    token !== null && Number(token[1]) === DOT_PITCH,
    `the shared pitch and the CSS token agree (${DOT_PITCH}px)`,
  )

  const dotField = globalCss.slice(globalCss.indexOf('.dot-field {'), globalCss.indexOf('.dot-field {') + 260)
  ok(/background-size:\s*var\(--dot-pitch\) var\(--dot-pitch\)/.test(dotField), 'the static dot field draws at the shared pitch')
  ok(/background-position:\s*center/.test(dotField), 'and is centred, which is what offsets its lattice')

  // The printed lattice starts half the element's own size in from its corner.
  // This is the arithmetic the snake has to copy, and the reason rounding to
  // multiples of the pitch puts the snake between the dots.
  ok(phaseFor(900) === 6, `a 900px band starts its lattice 6px down its own box (${phaseFor(900)})`)
  ok(phaseFor(902) === 7, `a 902px band starts it 7px down (${phaseFor(902)})`)
  ok(phaseFor(0) === 0, 'a zero-size box has no phase to apply')
  ok(snapToLattice(449, phaseFor(900)) === 450, 'a dot snaps onto the printed row below it')
  ok(snapToLattice(451, phaseFor(900)) === 450, 'and onto the printed row above it')
  ok(
    snapToLattice(913, phaseFor(900)) === 918 && snapToLattice(913, 0) === 912,
    'rounding from the corner rather than the centre would sit half a pitch off',
  )

  const band = (top, bottom) => ({ top, bottom, phase: 0 })
  const strip = buildCorridors([band(0, 800), band(860, 1700)])
  ok(
    strip.length === 1 && strip[0].bands.length === 2,
    'a 60px gap — the toolchain strip between the hero and About — is one corridor, not two',
  )
  ok(strip[0].top === 0 && strip[0].bottom === 1700, 'the corridor spans from the first band to the last')
  ok(buildCorridors([band(0, 800), band(4200, 5000)]).length === 2, 'the five sections between About and Contact are not')
  ok(buildCorridors([band(0, 800), band(800 + TRACK_GAP + 1, 1700)]).length === 2, 'nor is a gap wider than the limit')
  ok(buildCorridors([band(0, 800), band(800 + TRACK_GAP, 1700)]).length === 1, 'the join is inclusive at exactly the limit')
  ok(buildCorridors([]).length === 0, 'with no bands there is nothing to travel in')
}

section('Reactive dot grid: coverage, alignment and safety')

{
  const css = readFileSync(path.join(root, 'src/styles/components.css'), 'utf8')

  // --- alignment: the reactive layer must coincide with the static texture ---
  const grid = css.slice(css.indexOf('.pointer-grid {'), css.indexOf('.pointer-grid {') + 700)
  ok(
    /background-size:\s*var\(--dot-pitch\) var\(--dot-pitch\)/.test(grid),
    'the reactive grid uses the same shared pitch as the static dot field',
  )
  ok(
    /background-position:\s*center/.test(grid),
    'the reactive grid shares the static grid phase, so dots brighten in place',
  )
  ok(
    !/\.pointer-grid--/.test(css),
    'no per-section modifier sets a divergent pitch (the old 13px/14px split is gone)',
  )
  ok(
    /pointer-events:\s*none/.test(grid),
    'the grid never takes a pointer event',
  )
  ok(
    /position:\s*absolute/.test(grid),
    'the grid is absolutely positioned, so it cannot shift layout',
  )

  // --- the backdrop layer sits behind a lifted content column ---
  const fx = css.slice(css.indexOf('.section__fx {'), css.indexOf('.section__fx {') + 260)
  ok(/inset:\s*0/.test(fx), 'the section backdrop fills the section box')
  ok(/z-index:\s*0/.test(fx), 'the backdrop is at z-index 0')
  ok(/pointer-events:\s*none/.test(fx), 'the backdrop is inert to pointer events')
  const shell = css.slice(css.indexOf('.section--fx > .shell'), css.indexOf('.section--fx > .shell') + 120)
  ok(/position:\s*relative/.test(shell), 'the content column is positioned above the backdrop')
  ok(/z-index:\s*1/.test(shell), 'the content column is lifted to z-index 1')

  // --- the wrapper the hero uses is inert, which is why the host must be the section ---
  const heroBg = css.slice(css.indexOf('.hero__bg {'), css.indexOf('.hero__bg {') + 160)
  ok(
    /pointer-events:\s*none/.test(heroBg),
    'the hero background wrapper is inert (it can never receive pointer events itself)',
  )

  // --- placement, against the rendered document ---
  window.history.replaceState(null, '', '/')
  const host = document.createElement('div')
  document.body.appendChild(host)
  const r = createRoot(host)
  await act(async () => {
    r.render(React.createElement(App))
  })

  const grids = [...host.querySelectorAll('.pointer-grid')]
  ok(grids.length > 0, `reactive grids are rendered (${grids.length})`)

  // Every grid must resolve to a real <section> host, or it would be inert.
  const hosts = grids.map((g) => g.closest('section'))
  ok(
    hosts.every((h) => h !== null),
    'every reactive grid resolves a <section> host, so none of them is inert',
  )
  const heroGrid = grids.find((g) => g.closest('.hero') !== null)
  ok(heroGrid !== undefined, 'the hero still carries a reactive grid')
  ok(
    heroGrid !== undefined && heroGrid.closest('section') !== heroGrid.parentElement,
    "the hero grid's host is the section, not the inert .hero__bg wrapper",
  )

  // Which sections got it, and which deliberately did not.
  const withFx = [...host.querySelectorAll('main .section.section--fx')].map((s) => s.id)
  const expected = ['about', 'projects', 'experience', 'education', 'contact']
  ok(
    expected.every((id) => withFx.includes(id)),
    `the spacious sections carry the effect (${withFx.join(', ')})`,
    `missing: ${expected.filter((id) => !withFx.includes(id)).join(', ')}`,
  )
  const interests = host.querySelector('#interests')
  ok(
    interests !== null && interests.querySelector('.section__fx') === null,
    'the interest map is left alone — it has its own canvas and dot texture',
  )
  const skills = host.querySelector('#skills')
  ok(
    skills !== null && skills.querySelector('.section__fx') === null,
    'the skills grid is left alone — six opaque cards leave too little open background',
  )
  ok(
    host.querySelectorAll('.imap__canvas .pointer-grid, .project-card .pointer-grid').length === 0,
    'no grid is nested inside a diagram canvas or a card',
  )

  // --- dots must not ghost through cards ---
  const tokens = readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8')
  const panelValues = [...tokens.matchAll(/--bg-panel:\s*([^;]+);/g)].map((m) => m[1].trim())
  ok(
    panelValues.length >= 2 && panelValues.every((v) => /^#[0-9a-f]{6}$/i.test(v)),
    'card backgrounds are opaque in both themes, so dots cannot show through them',
    panelValues.join(' | '),
  )

  await act(async () => {
    r.unmount()
  })
  host.remove()
}

section('Precision reticle')

{
  const css = readFileSync(path.join(root, 'src/styles/components.css'), 'utf8')
  const layer = readFileSync(path.join(root, 'src/components/PointerLayer.tsx'), 'utf8')

  ok(layer.includes('pointer-reticle'), 'the reticle replaces the old cursor markup')
  ok(!layer.includes('pointer-ring'), 'no circular follower remains in the component')
  ok(!css.includes('.pointer-ring'), 'no circular follower remains in the stylesheet')
  ok(!css.includes('pointer-ripple'), 'the ripple ring is gone, so nothing trails the cursor')

  // Four corner arms and the accent centre pixel are the whole cursor.
  ok((layer.match(/pointer-reticle__arm--/g) || []).length === 4, 'the reticle has four corner arms')
  ok(layer.includes('pointer-reticle__pixel'), 'the reticle has a centre pixel')

  // Text selection must keep its own affordance.
  ok(layer.includes('pointer-bar'), 'an I-beam is still drawn over text')
  ok(
    /data-context=\'text\'\]\s*\.pointer-reticle\s*\{[^}]*opacity:\s*0/.test(css),
    'the reticle withdraws over text so the I-beam is unambiguous',
  )

  // Restraint: no glow, no trailing animation beyond the press confirmation.
  ok(!/box-shadow:\s*0 0 [1-9]\d*px/.test(css.slice(css.indexOf('.pointer-reticle'))), 'no glow on the reticle')
  ok(!/animation:\s*pointer/.test(css), 'the cursor runs no keyframe animation')

  // Cleanup: the frame and the timer are both released.
  ok(/cancelAnimationFrame/.test(layer), 'the animation frame is cancelled on unmount')
  ok(/clearTimeout\(state\.pressTimer\)/.test(layer), 'the press timer is cleared on unmount')
  ok(/delete rootElement.dataset.cursor/.test(layer), 'the custom cursor attribute is removed on unmount')
}

section('Interest map: mobile reflow')

{
  const map = readFileSync(path.join(root, 'src/components/InterestMap.tsx'), 'utf8')
  const css = readFileSync(path.join(root, 'src/styles/components.css'), 'utf8')

  // The diagram must not be hidden on small screens any more.
  const mobileBlock = css.slice(css.indexOf('@media (max-width: 767px)'))
  ok(
    !/\.imap__canvas\s*\{\s*display:\s*none/.test(css),
    'the interest map canvas is no longer hidden on small screens',
  )
  ok(
    /\.imap__svg--mobile/.test(mobileBlock) || /\.imap__svg--mobile/.test(css),
    'a mobile rail rendering exists for narrow screens',
  )

  // Same six nodes and same six edges in both layouts.
  ok(/MOBILE_ORDER/.test(map), 'the narrow-screen order is declared in the component')
  ok(
    /interestEdges\.map/.test(map) && (map.match(/interestEdges\.map/g) || []).length === 2,
    'all six connections are drawn in both the packed and rail layouts',
  )
  ok(/preserveAspectRatio="none"/.test(map), 'the hexagon SVG scales without distorting its strokes')
  ok(!/display:\s*none[^}]*imap__nodebutton/.test(css), 'no node is hidden on small screens')

  // The decorative canvas sits exactly on top of the buttons: if it took
  // pointer events it would swallow every tap meant for a node.
  const svgRule = css.slice(css.indexOf('.imap__svg {'), css.indexOf('.imap__svg--mobile'))
  ok(/pointer-events:\s*none/.test(svgRule), 'the interest-map canvas cannot intercept taps')
  ok(
    /touch-action:\s*manipulation/.test(css.slice(css.indexOf('.imap__nodebutton {'))),
    'node buttons declare touch-action so a tap is not read as a gesture',
  )
  {
    const globalCss = readFileSync(path.join(root, 'src/styles/global.css'), 'utf8')
    const focusRule = globalCss.slice(globalCss.indexOf(':focus-visible'))
    ok(
      /outline[^;]*var\(--focus\)/.test(focusRule),
      'a global :focus-visible outline covers the node buttons',
    )
  }
  ok(
    /--imap-ring-x/.test(map) && /--imap-ring-y/.test(map),
    'each button publishes its ring position for the narrow-screen layout',
  )
}

section('Layout guards: hero dial, project grid, mobile sheet')

{
  const css = readFileSync(path.join(root, 'src/styles/components.css'), 'utf8')
  const tokens = readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8')
  const header = readFileSync(path.join(root, 'src/components/Header.tsx'), 'utf8')
  const hero = readFileSync(path.join(root, 'src/components/Hero.tsx'), 'utf8')
  const motif = readFileSync(path.join(root, 'src/components/SignalMotif.tsx'), 'utf8')
  const grid = readFileSync(path.join(root, 'src/components/ProjectGrid.tsx'), 'utf8')
  const projects = readFileSync(path.join(root, 'src/data/projects.ts'), 'utf8')
  const card = readFileSync(path.join(root, 'src/components/ProjectCard.tsx'), 'utf8')

  // --- hero dial: drawn from the portrait's own box, behind the plate ---
  ok(
    /portrait-slot/.test(hero) && /\.portrait-slot\s*\{[^}]*position:\s*relative/.test(css),
    'the dial is drawn from the portrait slot anchored on the plate',
  )
  ok(
    /\.motif\s*\{[^}]*left:\s*50%;[^}]*translate\(-50%,\s?-50%\)/.test(css),
    'the dial is centred on that slot rather than pinned to the viewport edge',
  )
  ok(/width:\s*220%/.test(css), 'the dial is sized from the plate, not in fixed pixels')
  ok(
    /\.portrait\s*\{[^}]*z-index:\s*1/.test(css) && /\.hero__copy\s*\{[^}]*z-index:\s*2/.test(css),
    'stacking is dial below plate below copy',
  )
  ok(/@media \(max-width: 1023px\)[\s\S]{0,200}\.motif\s*\{[^}]*display:\s*none/.test(css), 'the dial is a wide-screen composition and is not drawn when the copy stacks above the plate')
  ok(!/viewBox="0 0 760 760"/.test(motif), 'the old dial geometry is gone')

  // --- project grid: four even tracks, no spanning card ---
  ok(
    /\.project-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/.test(css),
    'a single narrow column below 720px',
  )
  ok(/@media \(min-width: 1280px\)[\s\S]{0,120}repeat\(4, minmax\(0, 1fr\)\)/.test(css), 'four even tracks on wide screens')
  ok(!/project-card--wide/.test(css + card + projects + grid), 'no card spans extra tracks any more')
  ok(!/\bwide:\s*true/.test(projects), 'the data no longer carries a wide flag')
  ok(
    /\.project-card\s*\{[^}]*box-shadow:\s*0 0 0 1px var\(--line\)/.test(css),
    'grid rules are the cards\' own hairlines, so a filtered grid leaves no filled block',
  )

  // --- mobile sheet: an overlay pinned under the header, with a scroll lock ---
  ok(
    /\.mobile-nav\s*\{[^}]*position:\s*fixed/.test(css),
    'the compact sheet is positioned against the viewport, not the header box',
  )
  ok(/top:\s*var\(--header-h\)/.test(css) && /--header-h:/.test(tokens), 'the sheet is pinned to a shared header height')
  ok(/--z-sheet:/.test(tokens) && /z-index:\s*var\(--z-sheet\)/.test(css), 'the sheet has its own layer below the header')
  ok(
    /root\.style\.overflow = 'hidden'/.test(header) && /root\.style\.overflow = previousOverflow/.test(header),
    'opening the sheet locks the page and closing restores it exactly',
  )
  {
    const headerStart = header.indexOf('<header className="site-header">')
    const headerEnd = header.indexOf('</header>', headerStart)
    const headerElement = header.slice(headerStart, headerEnd)
    ok(
      headerStart > -1 && !headerElement.includes('className="mobile-nav"'),
      'the sheet is rendered outside the sticky header',
    )
  }
  ok(
    /linkById\('email'\)/.test(header),
    'the sheet\'s email action resolves the verified link rather than an array position',
  )
  ok(
    /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/.test(css.slice(css.indexOf('.mobile-nav__actions'))),
    'the three actions stack on the narrowest phones instead of cramming into one row',
  )
}

section('Pointer layer capability gating')

{
  const originalMatchMedia = window.matchMedia

  const stub = ({ fine, reduced }) => (query) => ({
    matches: query.includes('prefers-reduced-motion')
      ? reduced
      : query.includes('pointer: fine')
        ? fine
        : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })

  const mountFresh = async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => {
      root.render(React.createElement(App))
    })
    return { host, root }
  }

  // Touch / coarse pointer.
  window.matchMedia = stub({ fine: false, reduced: false })
  const coarse = await mountFresh()
  ok(!coarse.host.querySelector('.pointer-layer'), 'coarse pointer: no custom cursor layer is mounted')
  ok(
    document.documentElement.dataset.cursor === undefined,
    'coarse pointer: native cursor is left untouched',
  )
  await act(async () => {
    coarse.root.unmount()
  })

  // Fine pointer but the visitor has asked for reduced motion.
  window.matchMedia = stub({ fine: true, reduced: true })
  const reduced = await mountFresh()
  ok(
    !reduced.host.querySelector('.pointer-layer'),
    'reduced motion: custom cursor is disabled',
  )
  ok(
    document.documentElement.dataset.cursor === undefined,
    'reduced motion: native cursor is left untouched',
  )
  await act(async () => {
    reduced.root.unmount()
  })

  // Fine pointer, motion allowed.
  window.matchMedia = stub({ fine: true, reduced: false })
  const fine = await mountFresh()
  ok(fine.host.querySelector('.pointer-layer') !== null, 'fine pointer + motion on: layer mounts')
  ok(
    document.documentElement.dataset.cursor === 'custom',
    'fine pointer + motion on: cursor handed to the custom layer',
  )
  await act(async () => {
    fine.root.unmount()
  })
  ok(
    document.documentElement.dataset.cursor === undefined,
    'unmount restores the native cursor',
  )

  window.matchMedia = originalMatchMedia
}

section('Reveal fallback')

{
  // Content must never be permanently hidden by the reveal effect.
  window.history.replaceState(null, '', '/')
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(React.createElement(App))
  })

  const revealsAtMount = host.querySelectorAll('[data-reveal]').length
  ok(revealsAtMount > 0, `reveal targets are present (${revealsAtMount})`)

  // The hook's failsafe resolves everything within 1.5s even if the observer
  // never reports an intersection (as in jsdom).
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1700))
  })

  const stillPending = host.querySelectorAll('[data-reveal="pending"]').length
  ok(
    stillPending === 0,
    'after the failsafe window no element is left hidden',
    `${stillPending} still pending`,
  )

  // Every reveal target also has a stable resting state.
  ok(
    host.querySelectorAll('[data-reveal="in"]').length === revealsAtMount,
    'every reveal target resolves to the visible state',
  )

  await act(async () => {
    root.unmount()
  })
}

/* ------------------------------------------------------------------ */
console.log(
  `\n${failures === 0 ? '\u001b[32mPASS\u001b[0m' : '\u001b[31mFAIL\u001b[0m'} — ${checks - failures}/${checks} checks passed\n`,
)

process.exit(failures === 0 ? 0 : 1)

# RAHUL.OS

A personal website for **Rahul Raj** — data science, AI, game technology and
embedded systems. Built as a bespoke interface rather than a template:
monochrome industrial design, dot-matrix textures, editorial typography and
interaction that earns its place on the page.

- **Live identity screen** with the real portrait, editorial crop and a restrained treatment
- **Four work entries**: SameFace, SCAMS, CARLA / ROS 2 and a Rockstar Games QA case study
- **Real project filtering**, a **Ctrl/⌘ + K command palette**, an **interactive timeline**
  and a keyboard-accessible **interest map**
- **Dark and light themes**, persisted, following the OS on a first visit
- **Reduced-motion support**, plus an explicit motion toggle that changes real behaviour
- No backend, no analytics, no cookies, no trackers

---

## Quick start

```bash
npm install
npm run dev          # → http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR, bound to `0.0.0.0:5173` |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only, no emit |
| `npm run smoke` | Renders every route and asserts links, a11y and content rules (95 checks) |
| `npm run assets:images` | Regenerate every image from `assets-src/portrait-source.jpeg` |

Node 20+ is required (developed on Node 22).

---

## Design system

Everything visual is driven by `src/styles/tokens.css` — colour, type scale,
spacing, borders, motion durations and layer order. Theming is a single
attribute on `<html>`:

```html
<html data-theme="dark" data-motion="on">
```

- `data-theme` switches `dark` (default) / `light`. Both palettes were checked
  for contrast and clear **WCAG AA** at every text/surface pairing
  (lowest ratio 4.69:1; body copy is 17.7:1 in dark, 17.0:1 in light).
- `data-motion="off"` collapses the motion tokens to ~0ms, so the motion toggle
  changes genuine animation behaviour rather than pretending to.

An inline script in `index.html` applies the stored (or system) theme before
first paint, so there is no flash of the wrong palette.

Typography is **Geist Sans** and **Geist Mono**, self-hosted as variable
`woff2` files in `public/fonts/` under the SIL Open Font License 1.1
(licence included at `public/fonts/GEIST-LICENSE.txt`). Nothing is fetched from
a third-party CDN, so the site renders identically offline.

---

## Structure

```
src/
  components/            interface components
    figures/             original SVG project illustrations
  data/                  ALL content, as typed data — edit here, not in the UI
    profile.ts           verified identity, contact links, studies
    projects.ts          the four work entries + honesty metadata
    experience.ts        employment timeline (dates verified per entry)
    education.ts         degrees and short courses
    skills.ts            skill clusters
    interests.ts         interest-map nodes and edges
    sections.ts          canonical section list (nav, palette, footer, 404)
  hooks/                 theme, routing, motion, scroll spy, clipboard, meta
  lib/assets.ts          base-path-aware public asset URLs
  styles/                tokens.css · global.css · components.css
  router + App.tsx + main.tsx
public/
  fonts/                 Geist woff2 + OFL licence
  images/                portrait crops, duotone treatment, OG card
  favicon.svg · avatar.png · robots.txt · sitemap.xml
scripts/
  prepare-images.sh      ImageMagick pipeline for every shipped image
  smoke-test.mjs         route/render/link/a11y/content assertions
assets-src/              supplied portrait (résumé PDF is git-ignored — see below)
```

### Content lives in data, not in components

Every entry on the site is a typed object. Adding a fifth project is a matter
of appending to `src/data/projects.ts` and adding a figure component — no
component logic changes, and the filter bar, command palette, 404 page and
cross-links pick it up automatically.

### Routing

A dependency-free hash router (`src/hooks/useHashRoute.ts`):

| URL | View |
| --- | --- |
| `/` | Home |
| `/#projects` | Home, scrolled to a section |
| `/#/projects/sameface` | Project detail page |
| anything else | Not-found page listing every real destination |

Hash routing keeps deep links working on **any** static host with no server
rewrites and no 404 fallback configuration. `#top` and `#main` are treated as
home targets — both are regression-tested in the smoke suite.

---

## Images

All imagery is local and derived from the single supplied portrait by
`scripts/prepare-images.sh` (requires ImageMagick):

```bash
npm run assets:images
```

It produces responsive 640/960/1280 crops, a duotone treatment used in the dark
hero, a 512px avatar and a 1200×630 Open Graph card. Editorial framing is
applied in CSS via `object-position`, so the JPEGs keep their native aspect and
full resolution for every breakpoint.

**Project visuals are original SVG components** in `src/components/figures/` —
there are no project screenshots anywhere in this repository, no remote image
URLs, and nothing that could break or 404.

---

## Accessibility

- Semantic landmarks, one `<h1>` per view, no skipped heading levels (tested)
- Visible focus rings on every interactive element; skip-to-content link
- Dialogs with `aria-modal`, a focus trap, Escape to close and focus restoration
- Timeline milestones are real buttons with `aria-expanded` / `aria-controls`
  and arrow-key navigation; the interest map has a permanent list alternative
- `prefers-reduced-motion` honoured, plus an explicit, functional motion toggle
- Every image has an `alt` attribute and intrinsic dimensions (no layout shift)
- Status is never communicated by colour alone — chips carry text labels

## Performance

Production build: **~48 kB CSS (9 kB gzipped)** and **~325 kB JS
(100 kB gzipped)**, of which React is the bulk. Motion is CSS transitions
rather than an animation library, the hero motif is a small deterministic SVG,
and fonts are two preloaded variable files (~140 kB for both families).

---

## Content honesty

This site is deliberately conservative about what it claims.

- Every work entry carries a written **scope disclaimer** rendered on its
  detail page: SameFace is a student project, SCAMS is an **academic proposal**
  and not deployed, CARLA / ROS 2 is study and exploration, and the Rockstar
  entry is **professional experience — not a product Rahul owns**.
- No accuracy figures, user counts, benchmarks, grades or quantified
  achievements are invented. The Wylo internship dates are not on the supplied
  résumé, so the timeline says so instead of estimating.
- The Rockstar entry describes only Rahul's own responsibilities and contains no
  confidential tooling, process detail or unreleased content, and implies no
  employer endorsement.
- The Acti keyboard appears only as an interest and UX exploration, never as a
  project or achievement.
- `npm run smoke` enforces these rules: it fails the build if accuracy
  percentages, deployment claims or a misrepresented Acti keyboard appear in the
  data layer.

RAHUL.OS is a personal site. It is not affiliated with, endorsed by, or an
implementation of any product, company or design system it refers to —
including Nothing and any employer named on the page.

---

## Testing

```bash
npm run smoke
```

This does not test mocks. It boots the **real Vite pipeline**, renders the real
`App` component, and checks 96 assertions:

1. **Static render, per route** — heading structure, every in-page anchor
   resolving to a real element (and not to the 404 view), no dead `href="#"`,
   image `alt` text and dimensions, local-only image sources, external links
   carrying `target="_blank"` + `rel="noopener"`, `mailto:` encoding, dynamic
   footer year, and no `undefined` / `NaN` / `[object Object]` in the markup.
2. **Interaction, in jsdom** — project filtering and restoration, theme toggle
   plus persistence, palette open via ⌘/Ctrl + K, search, arrow-key selection
   and Escape, timeline expansion with keyboard navigation, interest-map
   selection, copy-email feedback, and the compact mobile menu.
3. **Content guards** — the honesty rules described above.

While building this, the suite caught two real bugs (the `#top` wordmark and the
`#main` skip link both routing to the not-found view), which are now
regression-tested.

The four SVG figures were additionally rasterised to PNG and inspected during
development — their geometry was corrected where labels, blocks or captions
overflowed the viewBox or collided. They are authored to hold up from a ~350px
project card through to a ~700px detail panel.

> **Not verified:** no real browser was available in the build environment, so
> the site has not been manually viewed in Chrome/Safari/Firefox, and no
> Lighthouse, axe or screen-reader run has been performed. Layout was reasoned
> through per breakpoint (see below) and validated through render assertions
> rather than visual inspection at each width. Run the dev server and check the
> four target widths before publishing.

Responsive targets designed for: **≥1600px** large desktop, **1280–1440px**
laptop, **768–1023px** tablet, **≤767px** mobile (with 360px as the floor). The
navigation collapses to the compact sheet below 1024px; the interest-map canvas
hands off to its list alternative below 768px.

---

## Deployment

The build is fully static — `dist/` can be served by anything.

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

### Vercel

Framework preset **Vite**; build `npm run build`, output `dist`.

### GitHub Pages

Set the base path to the repository name so assets resolve under the
subdirectory:

```bash
VITE_BASE=/Rahul.OS/ npm run build
npx gh-pages -d dist        # or push dist/ to the gh-pages branch
```

`vite.config.ts` reads `VITE_BASE` (default `/`), and `src/lib/assets.ts`
resolves public assets against it — so the same source builds correctly at a
domain root or under a subdirectory.

### Custom domain

Update the canonical URL and Open Graph URLs in `index.html` (currently
`https://rahulraj.dev/`) and the `Sitemap` line in `public/robots.txt`.

---

## Private files

`assets-src/` holds the source portrait used by the image pipeline. The
supplied résumé PDF is intentionally **excluded from version control**
(see `.gitignore`) because it contains a personal phone number that is not
published on the site — the verified details extracted from it live in
`src/data/`, and only the public email and social links are exposed in the UI.

## Licence and credits

- Source: © Rahul Raj.
- **Geist** by Vercel / basement.studio — SIL Open Font License 1.1
  (`public/fonts/GEIST-LICENSE.txt`).
- Icons: [Lucide](https://lucide.dev) (ISC).
- Every diagram, texture and pattern in this repository was authored for this
  site.

# RAHUL.OS

A personal website for **Rahul Raj** — data science, AI, game technology and
embedded systems. Built as a bespoke interface rather than a template:
monochrome industrial design, dot-matrix textures, editorial typography and
interaction that earns its place on the page.

- **Live identity screen** with the real portrait, editorial crop and a restrained treatment
- **Four work entries**: SameFace, SCAMS, CARLA / ROS 2 and a Rockstar Games QA case study
- **SameFace documented from its research paper**, with an interactive architecture
  diagram that separates documented design, in-development work and proposals
- **Real project filtering**, a **Ctrl/⌘ + K command palette**, an **interactive timeline**
  and a keyboard-accessible **interest map**
- **Dark and light themes**, persisted, following the OS on a first visit
- **A precision pointer language** — a bracket reticle cursor over a pointer-reactive
  dot grid that covers every spacious section — capability-gated, and never replaces
  the native cursor unsafely
- **A dot-matrix snake** — one for the whole page — that swims through the dot
  grid, travels between sections, and occasionally notices the cursor
- **Reduced-motion support**, plus an explicit motion toggle that changes real behaviour
- No backend, no analytics, no cookies, no trackers

> *Note on the pointer layer:* the design is deliberately restrained. The cursor is four
> angular corner brackets around a 3px accent pixel — no circular follower, no glow, no
> trail. A click flips one attribute for 160 ms rather than adding nodes to the DOM.
> Nothing moves while the pointer is still, and the whole layer disappears on touch, pen
> or reduced motion.

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
| `npm run smoke` | Renders every route and asserts links, a11y, metadata and content rules (290 checks) |
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
    PointerLayer.tsx     capability-gated reticle cursor, crosshair
    DotSnake.tsx         the one canvas snake, and where it may travel
    SectionBackdrop.tsx  per-section reactive grid
    ../lib/dotGeometry.ts  the shared dot lattice and snake corridors
    PointerGrid.tsx      low-contrast pointer-reactive dot field
    DiagramExplorer.tsx  interactive architecture diagram (stages + readout)
    figures/             original SVG project illustrations
  data/                  ALL content, as typed data — edit here, not in the UI
    profile.ts           verified identity, contact links, studies
    projects.ts          the four work entries + honesty metadata
    experience.ts        employment timeline (dates verified per entry)
    education.ts         degrees and short courses
    skills.ts            skill clusters
    interests.ts         interest-map nodes and edges
    sections.ts          canonical section list (nav, palette, footer, 404)
  hooks/                 theme, routing, motion, pointer capability, reveals,
                         scroll spy, clipboard, meta
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

## The pointer layer, in detail

Four rules govern it, all enforced in `src/hooks/usePointerCapability.ts`:

1. **Capability gating.** It renders only when the device reports
   `(hover: hover) and (pointer: fine)`, the visitor has not requested reduced
   motion (OS setting *or* the site's motion toggle), and no touch or pen contact
   has been seen. Any of those failing means the layer is never mounted.
2. **Never cursor-less.** `html[data-cursor="custom"]` — the only thing that sets
   `cursor: none` — is written by the layer itself and deleted on unmount or when
   capability drops. So the native cursor is hidden *only* while a replacement is
   on screen, and a reload with JavaScript disabled simply shows the normal cursor.
3. **Selection is preserved.** Over text the reticle withdraws entirely and an
   I-beam bar takes its place, and `cursor: none` never applies to form fields or
   `contenteditable` because the component short-circuits to the text state first.
4. **No idle animation.** Every write happens inside one `requestAnimationFrame`
   loop that only runs on pointer movement. There is no loop, no drift and no
   trail when the pointer is still.

Keyboard users are unaffected: focus rings, tab order and the skip link are
untouched, and every interaction the pointer layer decorates also exists as a real
button (the diagram stages, the interest map, the timeline milestones).

### Where the reactive grid lives

One dot pattern, defined once. `.dot-field` (static) and `.pointer-grid`
(reactive) both read `--dot-pitch` and both use `background-position: center`, so
in a section that has a static texture the reactive layer brightens **those**
dots rather than printing a second, offset grid over them. That was previously
broken in two ways: the hero's reactive layer ran at 14px over a 12px static
grid, and the Contact layer at 13px, with no shared source of truth.

Coverage is decided by how much open background a section actually has, not by
applying it everywhere:

| Section | Grid | Snake | Why |
| --- | --- | --- | --- |
| Hero | yes | yes | The dot-field it sits on; where the snake starts |
| About | yes | yes | Text column and a sticky aside, with open background around them; one corridor with the hero |
| Projects | yes | no | Card grid — dots only show in the gutters and around the head |
| Experience | yes | no | The rail and detail panel own the centre; a snake would fight the controls |
| Education | yes | no | Two cards and a list — genuinely sparse |
| Skills | **no** | no | Six opaque cards fill the width, leaving almost no open background |
| Interests | **no** | no | Already has its own 14px dotted canvas and an SVG diagram |
| Contact | yes | yes | Kept, now identical to everywhere else; the snake's second corridor |
| Toolchain | **no** | no | A thin, full-width band of tool names |

The snake is a different shape of the same idea: one canvas, fixed to the
viewport, with a single simulation running in *document* coordinates. Sections
declare whether the snake may be in them with `data-snake-band`, and every band
is drawn as a clip region, so nothing is ever painted outside one. That is what
lets it cross a section boundary: the toolchain strip is opaque and sits between
the hero and About, so the snake simply passes behind it and comes out the other
side, the way something drawn into the page would.

Two properties make this safe to apply at that breadth. Card and panel
backgrounds (`--bg-panel`) are opaque hex values in both themes, so dots can
never ghost through a card, diagram or table — the effect is only ever visible
in real open space. And every backdrop is absolutely positioned behind a lifted
content column (`.section--fx > .shell`), so it cannot shift layout or cover
anything.

### The dot snake

`src/components/DotSnake.tsx` draws **one** snake, onto one canvas, fixed to the
viewport at `z-index: 0` — above the section backgrounds (so it can light up dots
that are already printed) and below every content column, so it can never cover
text. It never receives a pointer event and is mounted once, at page level.

The simulation runs in *document* coordinates, so scrolling moves the page past
the snake rather than the snake across the page; the scroll offset is subtracted
only when drawing. Sections opt in with `data-snake-band` — the hero, About and
Contact — and the union of those rectangles is also the clip, so the snake is
hidden behind whatever sits in the gaps rather than over it. The hero and About
form one corridor, because the only thing between them is the opaque toolchain
strip; Contact is the other. Sections where cards, diagrams or controls occupy
the centre were left alone, since a snake would either hide behind them or
compete with them.

- **It rides the existing grid, in phase as well as pitch.** Body dots snap to
  the same lattice the CSS prints, via `src/lib/dotGeometry.ts`. Pitch alone is
  not enough: `background-position: center` puts an element's dots half its own
  size in from its corner, so a dot snapped to multiples of 12 from the corner
  lands *between* the printed rows — which is what the snake used to do, half a
  pitch off in the hero. The lattice is now taken from the band's own centre,
  per band, and the smoke test checks the arithmetic numerically (and checks
  that the JS pitch and the `--dot-pitch` token agree the other way round).
  Snapping uses hysteresis — a dot keeps its cell until it has moved past 55% of
  a pitch — which removes the boundary flicker plain rounding produces.
- **Movement is a rope, not noise.** The head steers with a bounded turn rate
  driven by two slow sines; every following dot is pulled to a fixed distance
  behind the one ahead. Sudden direction changes are impossible by construction,
  and curvature is continuous. Horizontal travel wraps modulo the canvas width, so
  leaving one edge is the same motion as entering the other.
- **A small state machine.** `cruise`, `pause`, `dive` (fade out, relocate, fade
  back in), `surface`, and the encounter states `approach`, `tap`, `recoil`. Pauses
  and dives are scheduled 7–16 s apart and vary in duration; a dive is the "gone
  into the grid" case.
- **Two ways of moving between sections, both continuous.** Within a corridor
  the snake steers toward the band the reader is on — a soft pull that grows
  with distance and disappears once it is inside that band — so crossing from
  the hero into About is a swim, hidden for a moment by the toolchain strip and
  continuing on the other side. Between corridors, where five full sections sit
  in between, swimming would mean crossing cards, diagrams and dense text, so it
  dives under the grid, is moved while it is invisible, and surfaces in the
  section being read. There is an explicit instruction to fall back to that dive
  if the strip ever grows too wide to cross, so the behaviour cannot become two
  sections sharing a boundary they shouldn't.
- **One snake, one loop.** There is no arbitration machinery any more: a single
  canvas and a single simulation mean the old module-level presence slot and the
  per-section observers are both gone. The loop runs while a band is on screen —
  which, on a scroll through the middle of the page, is nothing at all — and
  stops otherwise, clearing the frame it last painted so nothing is left frozen
  against the viewport.
- **Nothing is mounted where it cannot run.** Eligibility is resolved before
  render, so a touch-only device or a reduced-motion request does not get the
  canvas element at all — previously the canvas was rendered and merely left
  inert, which made the "disabled" claim partly untrue.
- **Cursor encounters are rare.** They need the pointer within 300 px of the head,
  in the same section (distance is measured in document space, so a pointer 6,000 px
  away cannot trigger one), and clear of a cooldown that runs 14–30 s after each. The
  snake approaches at a limited turn rate, taps within 24 px, and recoils. A single
  accent pixel marks the contact and fades over 0.9 s. It never chases, follows or
  hovers.
- **Cost.** Nothing mounts on touch-only devices or under reduced motion. One
  `requestAnimationFrame` loop, paused by `visibilitychange` and by an
  `IntersectionObserver` when the hero scrolls away. Previous cells are cleared
  individually instead of repainting the canvas, and device pixel ratio is capped
  at 2. A missing 2D context disables the effect rather than throwing.

### The hero dial

`SignalMotif.tsx` draws the instrument dial *from the portrait's own box*: the dial
is a fixed 220% of the plate's width and is centred on it, which puts its arcs clear
of the plate's corners and keeps it in register with the photograph at every width.
The stacking inside the hero is dial (0) → plate (1) → copy (2), so the arcs cross
behind the photograph rather than over it, and the plate's border and corner ticks
stay unbroken. Below 1024px the copy sits directly above the portrait, so a dial
large enough to clear the plate would run through the text: the illustration is a
wide-screen composition and is not drawn there.

### The project grid

Four entries, four even tracks from 1280px up, two from 720px and one below that:
every row is full and every card is the same width, so no column is left empty. The
1px rules are the cards' own hairlines (`box-shadow`) rather than the container's
background, so filtering down to a single result leaves no filled block where the
empty tracks are. The category label sits above the status pill on every card, so
the four headers match, and the footer is bottom-aligned so the "Details" links line
up across the row.

### The interest map on narrow screens

The packed six-node canvas needs width. Rather than hiding it below 768px, the six
nodes sit on a hexagon in a square canvas, with the same six connections drawn
between them: five join neighbouring vertices and AI/ML–Software becomes one chord,
so the whole network stays readable without a column of stacked rows. The ring order
is `MOBILE_ORDER` in `InterestMap.tsx`, and each button publishes its packed
position and its ring position as custom properties, so the two layouts cannot drift
apart and the buttons stay in data order in the DOM for screen readers.

## Accessibility

- Semantic landmarks, one `<h1>` per view, no skipped heading levels (tested)
- The custom cursor is capability-gated and always reversible (tested for coarse
  pointer, reduced motion and unmount)
- Section reveals can never strand content: elements are visible by default, only
  JavaScript marks them pending, and a 1.5s failsafe reveals everything (tested)
- Visible focus rings on every interactive element; skip-to-content link
- Dialogs with `aria-modal`, a focus trap, Escape to close and focus restoration
- Timeline milestones are real buttons with `aria-expanded` / `aria-controls`
  and arrow-key navigation; the interest map has a permanent list alternative
- `prefers-reduced-motion` honoured, plus an explicit, functional motion toggle
- Every image has an `alt` attribute and intrinsic dimensions (no layout shift)
- Status is never communicated by colour alone — chips carry text labels

## Performance

Production build: **58.1 kB CSS (10.7 kB gzipped)** and **354 kB JS (108 kB
gzipped)**, of which React is the bulk. There is no animation library. Motion is
CSS transitions plus three small `requestAnimationFrame` loops, each of which runs
only while something is actually happening: the pointer layer under an active
pointer, the scroll-progress hairline under scroll, and the snake — which is one
loop for the whole page, running only while one of its three sections is on screen
and the tab is visible. Scrolling through the middle of the page stops it
completely.

Adding the grid to five more sections cost no extra loops and no extra listeners
per frame: each reactive grid listens on its own `<section>`, so a `pointermove`
outside that section never reaches it, and there is only ever one snake. Fonts are
two preloaded variable files (~140 kB for both families).

---

## Content honesty

This site is deliberately conservative about what it claims.

- Every work entry carries a written **scope disclaimer** rendered on its
  detail page: SameFace is a student project, SCAMS is an **academic proposal**
  and not deployed, CARLA / ROS 2 is study and exploration, and the Rockstar
  entry is **professional experience — not a product Rahul owns**.
- The **SameFace case study is sourced from its research paper** (Rahul Raj,
  Presidency University), which is cited on the page. Three claims are handled
  with particular care:
  - ML Kit's Face Detection API returns bounding boxes, landmarks and contours —
    it does **not** return face embeddings and contains no comparison function.
    The page and diagram say so explicitly.
  - A similarity judgement therefore needs a separate method (landmark geometry
    or an embedding model). The paper describes the custom similarity algorithm
    as planned for a future implementation, so it is labelled **proposed work**.
  - The paper's evaluation section is prospective. No accuracy figures,
    evaluation results, trained models or user testing exist in it, so none are
    displayed. The tests enforce this with regex guards.
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
  data layer, and it checks the SameFace page for five further fabricated-metric
  patterns (accuracy percentages, "achieved accuracy", "trained on N", user
  counts, "tested with N").

RAHUL.OS is a personal site. It is not affiliated with, endorsed by, or an
implementation of any product, company or design system it refers to —
including Nothing and any employer named on the page.

---

## Testing

```bash
npm run smoke
```

This does not test mocks. It boots the **real Vite pipeline**, renders the real
`App` component, and checks 290 assertions:

1. **Static render, per route** — heading structure, every in-page anchor
   resolving to a real element (and not to the 404 view), no dead `href="#"`,
   image `alt` text and dimensions, local-only image sources, external links
   carrying `target="_blank"` + `rel="noopener"`, `mailto:` encoding, dynamic
   footer year, and no `undefined` / `NaN` / `[object Object]` in the markup.
2. **Interaction, in jsdom** — project filtering and restoration, theme toggle
   plus persistence, palette open via ⌘/Ctrl + K, search, arrow-key selection
   and Escape, timeline expansion with keyboard navigation, interest-map
   selection, copy-email feedback, and the compact mobile menu.
3. **SameFace case study** — the diagram renders with six selectable stages, the
   research paper is cited as the source, ML Kit's limits are stated, the
   proposed similarity layer is labelled, and five fabricated-metric patterns
   are absent.
4. **Education dates** — Presidency University shows the confirmed 2019 – 2023
   range and no entry reports an unstated period.
5. **Pointer capability gating** — with a coarse pointer, with reduced motion,
   and with a fine pointer: the layer mounts only in the last case, and unmounting
   always restores the native cursor.
6. **Reveal fallback** — after the failsafe window, no element is left hidden.
7. **Content guards** — the honesty rules described above, plus a list of phrases
   that were deliberately removed (process notes, repeated disclaimers, AI-style
   constructions) which must not come back.
8. **SEO and metadata consistency** — the canonical origin in `src/lib/site.ts`,
   `index.html`, `robots.txt` and `sitemap.xml` must all agree; no crawler-facing
   URL may be relative; the unverified domain may not appear in any crawlable file;
   and the structured-data image must exist on disk in `public/`.
9. **Route metadata** — project routes set their own title and description, the
   canonical tag stays on the document root, and an unknown route reports itself
   as not found.
10. **Diagram explorer** — the heading id is project-specific and unique,
    `aria-labelledby` resolves to it, hovering another stage leaves the committed
    selection untouched, and click plus arrow keys move it.
11. **Wordmark** — the rendered text of the header, hero and footer wordmarks is
    `RAHUL.RAJ` with no whitespace, and the footer mark keeps its intended gap
    around the glyph while the period reclaims the tracking that `letter-spacing`
    inserts before it.
12. **Snake and reticle** — gating decisions, layering, and the specific cleanups
    (cancelled frame, cleared timer, disconnected observers, removed
    `data-cursor`) are asserted against the source and stylesheet, because jsdom
    has neither a canvas nor a layout engine.
13. **Interest map reflow** — the pack is no longer hidden on small screens, the
    hexagon rendering exists, the decorative SVG cannot take pointer events, and
    both layouts draw all six connections.
14. **Reactive grid coverage and alignment** — the pitch token is 12px and both
    the static and reactive layers consume it; the reactive layer shares the
    static grid's phase; no per-section pitch overrides have come back; the five
    intended sections carry the effect and Skills/Interests do not; every grid
    resolves a real `<section>` host (the hero's old host was inert, which
    silently disabled it); no grid is nested in a card or diagram canvas; and
    `--bg-panel` is an opaque hex in both themes so dots cannot ghost through.
15. **One snake for the whole page** — exactly one canvas on the home route and
    none on a project route; no section mounts its own; it is the last child of
    `<main>`, so it paints above the printed dots; it is a fixed layer at
    `z-index: 0` that never takes a pointer event; the sections that declare
    `data-snake-band` are the hero, About and Contact and the dense ones are not;
    the toolchain strip is what sits between the hero and About (the corridor the
    design depends on); it works in document coordinates and subtracts the scroll
    offset only when drawing; every band is a clip region; the two transitions
    are both present; and the old arbitration machinery is gone. Eligibility is
    still resolved before render, so touch-only and reduced-motion mounts contain
    no canvas element at all.
16. **Dot geometry** — the pitch and the lattice phase are unit-tested as pure
    functions, numerically: a 900px band starts its lattice 6px down its own box,
    dots snap to that row from either side, and snapping from the corner instead
    of the centre would sit half a pitch off (which is what the hero used to do).
    The JS pitch is compared against the `--dot-pitch` token read out of
    `tokens.css`, so the two cannot drift. Corridor joining is tested too: a 60px
    gap merges, a gap the width of five sections does not, and the limit is
    inclusive.

While building this, the suite caught two real bugs (the `#top` wordmark and the
`#main` skip link both routing to the not-found view), which are now
regression-tested.

The five SVG figures were additionally rasterised to PNG and visually inspected
during development (before and after each change) — geometry was corrected where
labels, blocks, captions or connectors overflowed the viewBox, collided with each
other, or crossed a group they should route around. They are authored to hold up
from a ~350px project card through to a ~700px detail panel.

> **Not verified:** no real browser was available in the build environment, so
> the site has not been manually viewed in Chrome/Safari/Firefox, and no
> Lighthouse, axe or screen-reader run has been performed. Layout was reasoned
> through per breakpoint (see below) and validated through render assertions
> rather than visual inspection at each width.

### What still needs manual browser testing

The automated suite runs in jsdom, which cannot see pixels or paint. These need a
real browser before publishing:

1. **Reticle feel** — that the bracket box tracks without perceptible lag, that the
   corner arms do not jitter at the boundary between an action and text, and that
   the 3px accent pixel reads as restrained at your DPI rather than as a bright
   dot.
2. **Pointer-grid sheen intensity** — confirm the reactive grid over the hero and
   contact sections is subtle enough. It is `opacity: 0.5` on the dot mask; lower
   it if your monitor makes it too present.
3. **`cursor: none` verification** — hover the hero, an input, a link and the
   command palette and confirm a cursor is always visible. Cross-check in Firefox
   and Safari, where `matchMedia` reporting for `(hover: hover) and (pointer: fine)`
   differs from Chrome.
4. **Theme sweep** — confirm the one-shot accent hairline reads as a considered
   acknowledgement rather than a glitch, in both themes.
5. **Reveal timing** — scroll the full page and confirm sections reveal as they
   enter without feeling sluggish or like content is playing catch-up.
6. **Responsive widths** — 320, 375, 390, 430, 768 and 1024px, plus 1600px and a
   desktop width. Two things specifically need eyes: the interest map's hexagon
   below 768px (all six pills inside the canvas, no clipping or overlap, edges
   legible between them) and the diagram explorer, which stacks below 1180px.
7. **Hybrid devices** — a touchscreen laptop should start with no custom cursor
   after the first touch, and restore it if you return to the trackpad.
8. **Screen reader pass** — VoiceOver or NVDA over the diagram explorer, the
   interest map and the timeline.
9. **Snake behaviour over time** — leave the hero on screen for several minutes and
   confirm: speed and pause lengths vary, horizontal wrap reads as continuous (no
   visible teleport), the dive-and-resurface is not jarring, and cursor encounters
   stay infrequent. Then check CPU/temperature on a low-powered laptop — the loop
   pauses when the tab is hidden and when no band is on screen, but that is
   asserted in code, not measured.
10. **The snake crossing from the hero into About** — the one visible crossing.
   Scroll slowly down through the toolchain strip: the snake should swim down with
   you, disappear behind the strip for a moment, and still be there below it. It
   should not fade out or restart, and it should not appear *on* the strip. This is
   the part most worth your eyes; the geometry behind it is unit-tested, but that
   it reads as one animal is a judgement only a browser can settle.
11. **The snake moving from About to Contact** — jump or scroll from About to
   Contact (the Contact nav link is the quickest way). It should be in Contact,
   emerging rather than appearing mid-swim, and it should never be visible in
   Projects, Experience, Education, Skills or Interests on the way. Then scroll
   back up: it should follow you back into the hero/About corridor.
12. **Scroll behaviour of the fixed canvas** — while a band is on screen, the
   snake's dots must stay locked to the page as you scroll (the fixed layer is
   repositioned every frame, so a lag here would show as the snake sliding against
   the grid). Worth a slow scroll and a fast flick on a 60 Hz laptop.
13. **Grid alignment in the hero** — the reactive dots should brighten the existing
   static dots, not appear between them, and the snake should swim *through* them
   rather than between the rows. This is the fix that motivated the shared lattice,
   and it is only visible in a browser.
14. **Grid over cards** — confirm no dots appear on top of a project card, cluster
   card, timeline panel or the terminal. They should be visible only in open
   background.

15. **Mobile sheet** — open it on a phone at 320–430px: the three actions should sit
    on their own rows with nothing clipped, the page behind must not scroll (try a
    swipe, the wheel and Page Down), Escape or the close button must hand scrolling
    back where it was, and Search site, Motion and Email must all work.

Responsive targets designed for: **≥1600px** large desktop, **1280–1440px**
laptop, **768–1023px** tablet, **≤767px** mobile (with 320px as the floor). The
navigation collapses to the compact sheet below 1024px — a full-height overlay
pinned under the header bar, with the page behind it locked; the interest map
reflows from its packed canvas to the hexagon below 768px, and the snake is not
mounted at all below 480px or without a fine pointer.

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

### Canonical domain

The canonical origin is the registered custom domain,
`https://r7anubis.is-a.dev`. Deployments remain reachable on the Vercel URL
(`https://rahul-os-ten.vercel.app`), but no crawler-facing file points at it:
that address is not advertised as canonical anywhere.

The origin is declared in four places that must be changed together:

| File | What to change |
| --- | --- |
| `src/lib/site.ts` | `SITE_URL` |
| `index.html` | canonical, `og:url`, `og:image`, `twitter:image`, structured data |
| `public/robots.txt` | the `Sitemap:` line |
| `public/sitemap.xml` | the `<loc>` entry |

The smoke test asserts that all four agree, so a partial change fails the suite
rather than shipping quietly. `rahulraj.dev` is deliberately absent everywhere:
it is not verified as owned or configured, and an unverified domain must not be
advertised as canonical.

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

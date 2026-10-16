/**
 * The dot lattice, shared by the CSS textures and the canvas snake.
 *
 * Every dot pattern on the site is a `radial-gradient` tile at
 * `background-size: var(--dot-pitch)` positioned with `background-position:
 * center`. Centring means the printed lattice is offset from an element's
 * top-left corner by half that element's own size — which is why the snake has
 * to ask for the same numbers instead of rounding to multiples of the pitch. If
 * it rounds from zero it lands between the printed dots, and the effect reads
 * as a second pattern rather than dots lighting up.
 *
 * `DOT_PITCH` mirrors the `--dot-pitch` custom property in `tokens.css`. The
 * smoke test asserts that the two agree, so this stays the same single source
 * of truth from the other side.
 */
export const DOT_PITCH = 12

/** Distance from an element's top-left corner to the first dot of its lattice. */
export const phaseFor = (size: number): number => (((size / 2) % DOT_PITCH) + DOT_PITCH) % DOT_PITCH

/** The nearest dot position to `value`, on a lattice starting at `phase`. */
export const snapToLattice = (value: number, phase: number): number =>
  phase + Math.round((value - phase) / DOT_PITCH) * DOT_PITCH

/** One stretch of page the snake may live and be drawn in, in document space. */
export interface Band {
  /** document y of the top edge */
  top: number
  /** document y of the bottom edge */
  bottom: number
  /** lattice phase of this band's own dot texture, relative to `top` */
  phase: number
}

/** One or more bands the snake may move between without leaving the page. */
export interface Corridor {
  top: number
  bottom: number
  bands: Band[]
}

/**
 * Bands with a gap no wider than this are joined into one corridor.
 *
 * The gap matters: the toolchain strip is the only thing between the hero and
 * About, and it runs from about 70px to about 110px tall across desktop widths
 * (its list of tool names wraps). The snake can swim across that and stay one
 * animal. The limit is set generously so it holds at narrower desktop widths
 * too; if the strip ever grows past it the snake falls back to diving between
 * the two sections, which still looks deliberate.
 *
 * Nothing else can merge: the next break is About to Contact, with five full
 * sections of cards, diagrams and dense text in between.
 */
export const TRACK_GAP = 160

/** Join the bands into the corridors the snake can travel in. */
export function buildCorridors(bands: Band[]): Corridor[] {
  const corridors: Corridor[] = []
  for (const band of bands) {
    const last = corridors[corridors.length - 1]
    if (last && band.top - last.bottom <= TRACK_GAP) {
      last.bands.push(band)
      last.bottom = Math.max(last.bottom, band.bottom)
      continue
    }
    corridors.push({ top: band.top, bottom: band.bottom, bands: [band] })
  }
  return corridors
}

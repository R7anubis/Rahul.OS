import { PointerGrid } from './PointerGrid'

interface SectionBackdropProps {
  /** the site's own motion preference (header toggle) */
  motionEnabled: boolean
}

/**
 * The reactive dot grid for one section.
 *
 * Absolutely positioned inside the section and behind the content column, so it
 * cannot shift layout or cover anything: the owning section carries
 * `section--fx`, which lifts `.shell` above this layer. `pointer-events: none`,
 * so clicks, hover states and text selection are untouched — the grid finds its
 * host section by walking up the tree rather than relying on its own hit area.
 *
 * The dot snake is deliberately *not* here: it is one snake for the whole page,
 * mounted once in `App`, and a section only opts into it with `data-snake-band`.
 */
export function SectionBackdrop({ motionEnabled }: SectionBackdropProps) {
  return (
    <div className="section__fx" aria-hidden="true">
      <PointerGrid motionEnabled={motionEnabled} />
    </div>
  )
}

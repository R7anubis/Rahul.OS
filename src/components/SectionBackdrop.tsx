import { DotSnake } from './DotSnake'
import { PointerGrid } from './PointerGrid'

interface SectionBackdropProps {
  /** the site's own motion preference (header toggle) */
  motionEnabled: boolean
  /**
   * Mount the dot snake in this section's open background.
   *
   * Only set on sections with enough empty space for it to read: the snake runs
   * in at most one section at a time, so adding it to a dense section would
   * mostly hide it behind cards and diagrams.
   */
  snake?: boolean
}

/**
 * The reactive dot grid (and optionally the snake) for one section.
 *
 * Absolutely positioned inside the section and behind the content column, so it
 * cannot shift layout or cover anything: the owning section carries
 * `section--fx`, which lifts `.shell` above this layer. `pointer-events: none`,
 * so clicks, hover states and text selection are untouched — the grid finds its
 * host section by walking up the tree rather than relying on its own hit area.
 */
export function SectionBackdrop({ motionEnabled, snake = false }: SectionBackdropProps) {
  return (
    <div className="section__fx" aria-hidden="true">
      {snake ? <DotSnake motionEnabled={motionEnabled} /> : null}
      <PointerGrid motionEnabled={motionEnabled} />
    </div>
  )
}

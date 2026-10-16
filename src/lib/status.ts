
import type { ProjectStatusKind } from '../data/projects'

/**
 * Status chip styling. The accent treatment is reserved for entries that carry
 * a caveat (proposed, conceptual or otherwise not shipped); built work and
 * professional experience use the neutral chip. Colour is never the only
 * signal — the chip always carries its own label.
 */
export const statusChipClass = (kind: ProjectStatusKind): string =>
  kind === 'academic-proposal' || kind === 'study-exploration' ? 'chip chip--concept' : 'chip'

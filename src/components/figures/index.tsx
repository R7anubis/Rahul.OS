import type { ReactElement } from 'react'
import type { FigureKind } from '../../data/projects'
import { SameFaceFigure } from './SameFaceFigure'
import { ScamsFigure } from './ScamsFigure'
import { CarlaFigure } from './CarlaFigure'
import { QaFigure } from './QaFigure'

/**
 * Every project visual is an original SVG component rendered in the page —
 * no remote images, no broken placeholders, no stock photography, and nothing
 * that could be mistaken for a screenshot of Rahul's own software.
 */
const figures: Record<FigureKind, () => ReactElement> = {
  'sameface-landmarks': SameFaceFigure,
  'scams-workflow': ScamsFigure,
  'carla-control': CarlaFigure,
  'qa-performance': QaFigure,
}

export function ProjectFigure({ kind }: { kind: FigureKind }) {
  const Figure = figures[kind]
  return <Figure />
}

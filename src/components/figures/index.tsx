import type { ReactElement } from 'react'
import type { FigureKind } from '../../data/projects'
import { SameFaceFigure } from './SameFaceFigure'
import { SameFaceArchitectureFigure } from './SameFaceArchitectureFigure'
import { ScamsFigure } from './ScamsFigure'
import { CarlaFigure } from './CarlaFigure'
import { QaFigure } from './QaFigure'

/**
 * Every project visual is an original SVG component rendered in the page —
 * no remote images, no broken placeholders, no stock photography, and nothing
 * that could be mistaken for a screenshot of Rahul's own software.
 *
 * Figures that carry a `data-stage` grouping also accept `activeStage`, which
 * the DiagramExplorer drives so a stage can be selected by keyboard.
 */
type FigureComponent = (props: { activeStage?: string }) => ReactElement

const figures: Record<FigureKind, FigureComponent> = {
  'sameface-landmarks': SameFaceFigure,
  'sameface-architecture': SameFaceArchitectureFigure,
  'scams-workflow': ScamsFigure,
  'carla-control': CarlaFigure,
  'qa-performance': QaFigure,
}

/** Figures whose internal stages can be highlighted. */
const stagedFigures = new Set<FigureKind>(['sameface-architecture'])

export function isStagedFigure(kind: FigureKind): boolean {
  return stagedFigures.has(kind)
}

export function ProjectFigure({ kind, activeStage }: { kind: FigureKind; activeStage?: string }) {
  const Figure = figures[kind]
  return <Figure {...(activeStage ? { activeStage } : {})} />
}

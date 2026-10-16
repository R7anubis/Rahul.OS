/**
 * Interest map — areas of work and study, and where they connect.
 *
 * Node positions are percentages of the canvas, shared by the SVG edges and
 * the HTML buttons so the two stay in register. On narrow screens the same
 * nodes are laid out as a column with the edges drawn as a rail; see
 * `MOBILE_ORDER` in InterestMap.tsx.
 */

export interface InterestLink {
  label: string
  /** where the link points */
  kind: 'project' | 'experience' | 'section'
  /** project slug, experience id, or section id */
  target: string
}

export interface InterestNode {
  id: string
  label: string
  /** short label for the packed canvas layout */
  short: string
  code: string
  x: number
  y: number
  blurb: string
  links: InterestLink[]
}

export const interestNodes: InterestNode[] = [
  {
    id: 'data-science',
    label: 'Data science',
    short: 'Data',
    code: 'N01',
    x: 50,
    y: 15,
    blurb:
      'Where I am pointed right now: a Master of Data Science at Monash. What I like is getting from a vague question to something measurable.',
    links: [
      { label: 'Education timeline', kind: 'section', target: 'education' },
      { label: 'SCAMS — risk assessment framing', kind: 'project', target: 'scams' },
    ],
  },
  {
    id: 'ai-ml',
    label: 'AI / machine learning',
    short: 'AI / ML',
    code: 'N02',
    x: 50,
    y: 47,
    blurb:
      'On-device models in an Android app, generative AI as a day-to-day tool, and a habit of checking what a model output actually means.',
    links: [
      { label: 'SameFace — on-device ML Kit', kind: 'project', target: 'sameface' },
      { label: 'Data & AI skills cluster', kind: 'section', target: 'skills' },
    ],
  },
  {
    id: 'software',
    label: 'Software development',
    short: 'Software',
    code: 'N03',
    x: 83,
    y: 47,
    blurb:
      'Front end, back end and tooling — state, data models, and making something behave predictably.',
    links: [
      { label: 'Web / data coursework', kind: 'section', target: 'skills' },
      { label: 'SameFace — Android build', kind: 'project', target: 'sameface' },
    ],
  },
  {
    id: 'embedded',
    label: 'Embedded systems',
    short: 'Embedded',
    code: 'N04',
    x: 17,
    y: 47,
    blurb:
      'Embedded Linux and C/C++ work at Tata Elxsi, where the memory and timing budget set the design.',
    links: [
      { label: 'Tata Elxsi — embedded software', kind: 'experience', target: 'tata-elxsi' },
      { label: 'Embedded & automotive cluster', kind: 'section', target: 'skills' },
    ],
  },
  {
    id: 'automotive',
    label: 'Automotive technology',
    short: 'Automotive',
    code: 'N05',
    x: 27,
    y: 81,
    blurb:
      'Advanced driver assistance systems, sensor-driven behaviour and vehicle control. Software that has to be right, because the feedback loop is physical.',
    links: [
      { label: 'CARLA / ROS 2 vehicle control', kind: 'project', target: 'carla-ros2-vehicle-control' },
      { label: 'Tata Elxsi — ADAS domain', kind: 'experience', target: 'tata-elxsi' },
    ],
  },
  {
    id: 'gaming',
    label: 'Gaming technology',
    short: 'Games',
    code: 'N06',
    x: 73,
    y: 81,
    blurb:
      'Real-time, interdependent software where a missed detail shows up immediately. QA work on a AAA build is where I learned to write a report someone else can reproduce.',
    links: [
      { label: 'Technical QA case study', kind: 'project', target: 'rockstar-performance-qa' },
      { label: 'Rockstar Games India', kind: 'experience', target: 'rockstar' },
    ],
  },
]

/** Connections drawn between nodes, by id pair. */
export const interestEdges: [string, string][] = [
  ['data-science', 'ai-ml'],
  ['ai-ml', 'software'],
  ['ai-ml', 'embedded'],
  ['embedded', 'automotive'],
  ['automotive', 'gaming'],
  ['software', 'gaming'],
]

export const interestNote =
  'The lines show which interests connect to which. Product and interface design sits alongside these — the Acti keyboard is an ongoing exploration, not a shipped product.'

/**
 * Interest map — a visualisation of areas Rahul is drawn to, and how they
 * connect. This is not a claim that every node is a professional
 * specialisation; the UI says so explicitly.
 *
 * Node positions are percentages of the canvas, shared by the SVG edges and
 * the absolutely-positioned HTML buttons so the two stay in register.
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
      'Where I am pointed right now: a Master of Data Science at Monash, and an interest in what analysis can actually settle. Most of what I like about it is the discipline of turning a vague question into something measurable.',
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
      'The thread that runs through most of my work: on-device models in an Android app, generative AI as a working tool, and a healthy scepticism about what a model output actually means.',
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
      'Building the thing, not just describing it. Front end, back end, tooling and the unglamorous parts: state, data models and making something that behaves predictably.',
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
      'Where I learned that constraints are the design. Embedded Linux and C/C++ work taught me to care about what the machine is actually doing, which never left.',
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
      'Advanced driver assistance systems, sensor-driven behaviour and vehicle control. A domain where software has to be right, because the feedback loop is physical.',
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
      'Games are the most demanding software I have worked on — real-time, interdependent and unforgiving. QA work there taught me more about engineering discipline than any other job.',
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
  'This map shows how the interests feed into each other, not a claim of equal depth in every area. Product and interface design is a related interest — including the Acti keyboard, an ongoing UX and hardware exploration of mine rather than a shipped product.'

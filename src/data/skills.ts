/**
 * Skills and technical interests, grouped into clusters.
 * Deliberately no percentages or proficiency meters: the clusters describe
 * areas of experience, and the footnote in the UI says exactly that.
 */

export interface SkillCluster {
  id: string
  name: string
  /** short technical code shown in the corner of the cluster panel */
  code: string
  description: string
  tags: string[]
}

export const skillClusters: SkillCluster[] = [
  {
    id: 'data-ai',
    name: 'Data & AI',
    code: 'SYS.01',
    description:
      'Analysis and applied machine learning, plus a working interest in generative AI and how to use it well.',
    tags: ['Python', 'Data analysis', 'AI/ML', 'Generative AI', 'Prompt engineering', 'AI-assisted development'],
  },
  {
    id: 'software',
    name: 'Software development',
    code: 'SYS.02',
    description:
      'Front end, back end and general application development across study and personal work.',
    tags: ['JavaScript', 'React', 'Vite', 'Java', 'Kotlin', 'C', 'C++', 'CMake', 'GraphQL', 'PostgreSQL'],
  },
  {
    id: 'mobile',
    name: 'Mobile',
    code: 'SYS.03',
    description:
      'Android application work, including on-device machine learning with Firebase ML Kit.',
    tags: ['Android', 'Kotlin', 'Java', 'Firebase ML Kit', 'Face & landmark detection'],
  },
  {
    id: 'embedded',
    name: 'Embedded & automotive',
    code: 'SYS.04',
    description:
      'Embedded software and Linux application work from the automotive side of engineering.',
    tags: ['Embedded C', 'Embedded C++', 'Embedded Linux', 'Raspberry Pi', 'ADAS domain'],
  },
  {
    id: 'simulation',
    name: 'Simulation & robotics',
    code: 'SYS.05',
    description:
      'Vehicle simulation and control loops: waypoint following, PID tuning and dynamic look-ahead.',
    tags: ['CARLA', 'ROS 2', 'Python', 'PID control', 'Waypoint following', 'Dynamic look-ahead'],
  },
  {
    id: 'game-tech',
    name: 'Game technology',
    code: 'SYS.06',
    description:
      'Professional technical QA in AAA development, plus an ongoing interest in how games are built.',
    tags: ['Technical QA', 'Functional testing', 'Regression testing', 'Defect reporting', 'Stability & performance', 'Unity', 'C#'],
  },
]

export const skillsNote =
  'Grouped by area of experience rather than scored. Some of these are professional tools, others are study, coursework or side exploration — the labels and the rest of this site are where the difference is spelled out.'

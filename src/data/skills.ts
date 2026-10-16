/**
 * Skills and technical interests, grouped by area.
 *
 * No percentages or proficiency meters: there is no evidence behind a score,
 * so the clusters only name what has been worked with.
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
      'Analysis and applied machine learning, plus day-to-day use of generative AI tools.',
    tags: ['Python', 'Data analysis', 'AI/ML', 'Generative AI', 'Prompt engineering', 'AI-assisted development'],
  },
  {
    id: 'software',
    name: 'Software development',
    code: 'SYS.02',
    description:
      'Front end, back end and application development, mostly from study and personal projects.',
    tags: ['JavaScript', 'React', 'Vite', 'Java', 'Kotlin', 'C', 'C++', 'CMake', 'GraphQL', 'PostgreSQL'],
  },
  {
    id: 'mobile',
    name: 'Mobile',
    code: 'SYS.03',
    description:
      'Android development, including on-device face and landmark detection with Firebase ML Kit.',
    tags: ['Android', 'Kotlin', 'Java', 'Firebase ML Kit', 'Face & landmark detection'],
  },
  {
    id: 'embedded',
    name: 'Embedded & automotive',
    code: 'SYS.04',
    description:
      'Embedded C/C++ and Linux application work in the automotive domain.',
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
      'Technical QA in AAA development, and an interest in how games are built.',
    tags: ['Technical QA', 'Functional testing', 'Regression testing', 'Defect reporting', 'Stability & performance', 'Unity', 'C#'],
  },
]

export const skillsNote = 'Tools and topics from work, study and personal projects.'

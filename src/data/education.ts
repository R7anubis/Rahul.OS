/** Education and verified professional development. */

export interface EducationEntry {
  id: string
  degree: string
  institution: string
  location: string
  period: string
  /** true when the period is stated on the supplied résumé */
  periodVerified: boolean
  status: 'In progress' | 'Completed' | 'Not stated'
  note: string
  detail?: string
}

export const education: EducationEntry[] = [
  {
    id: 'monash',
    degree: 'Master of Data Science',
    institution: 'Monash University',
    location: 'Clayton campus, Victoria',
    period: 'Jul 2026 – present',
    periodVerified: true,
    status: 'In progress',
    note: 'July 2026 intake.',
    detail:
      'Currently studying data science at the Clayton campus in Melbourne, alongside the engineering and QA background described on this site.',
  },
  {
    id: 'presidency',
    degree: 'B.Tech, Information Science and Engineering',
    institution: 'Presidency University',
    location: 'Bengaluru, India',
    period: 'Dates not listed on the supplied résumé',
    periodVerified: false,
    status: 'Completed',
    note: 'Bachelor of Technology, Information Science and Engineering.',
    detail:
      'Where the interest in systems, software and applied data work started — the foundation for later work in embedded software and QA.',
  },
]

export interface DevelopmentEntry {
  id: string
  title: string
  provider: string
  date: string
}

/** Courses listed on the résumé. Short courses, not qualifications. */
export const development: DevelopmentEntry[] = [
  {
    id: 'pair-programming-ai',
    title: 'Pair Programming with AI',
    provider: 'LinkedIn Learning',
    date: 'Jan 2025',
  },
  {
    id: 'chatgpt-multimodal',
    title: 'Prompting ChatGPT with Multimodal Techniques',
    provider: 'LinkedIn Learning',
    date: 'Dec 2024',
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering: How to Talk to the AIs',
    provider: 'LinkedIn Learning',
    date: 'Dec 2024',
  },
  {
    id: 'generative-vs-traditional-ai',
    title: 'Generative AIs vs. Traditional AI',
    provider: 'LinkedIn Learning',
    date: 'Nov 2024',
  },
]

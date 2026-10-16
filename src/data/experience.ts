/**
 * Professional experience.
 *
 * Entries carry only what is confirmed. Where a field is not known it is left
 * empty and the UI renders nothing for it, rather than announcing the gap.
 */

export interface ExperienceEntry {
  id: string
  org: string
  role: string
  /** confirmed date range; empty string when the dates are not known */
  dates: string
  datesVerified: boolean
  location: string
  kind: 'Full-time' | 'Internship' | 'Volunteering'
  /** one-line summary shown in the timeline rail */
  summary: string
  /** what the role involved, in plain terms */
  points: string[]
  /** technologies / disciplines touched in the role */
  tags: string[]
  /** short factual note, where there is one worth making */
  contextNote?: string
  /** optional pointer to a longer case study */
  caseStudySlug?: string
}

export const experience: ExperienceEntry[] = [
  {
    id: 'rockstar',
    org: 'Rockstar Games India',
    role: 'Associate QA – Technical',
    dates: 'Sep 2025 – Jun 2026',
    datesVerified: true,
    location: 'Bengaluru, India',
    kind: 'Full-time',
    summary:
      'Technical QA inside a AAA game development environment, including work on the announced Grand Theft Auto VI project.',
    points: [
      'Worked within a AAA game development environment, including work on Grand Theft Auto VI.',
      'Performed detailed software testing, identified and documented issues, and supported defect reproduction and regression testing.',
      'Worked with in-house profiling tools focused on stability and performance.',
      'Worked with other teams to investigate software behaviour and keep quality standards consistent.',
    ],
    tags: ['Technical QA', 'Defect reporting', 'Regression testing', 'Stability & performance profiling'],
    contextNote:
      'My own account of the role — no confidential tooling or unreleased material is described, and nothing here implies employer endorsement.',
    caseStudySlug: 'rockstar-performance-qa',
  },
  {
    id: 'tata-elxsi',
    org: 'Tata Elxsi',
    role: 'Engineer (embedded software)',
    dates: 'Jan 2024 – May 2025',
    datesVerified: true,
    location: 'Bengaluru, India',
    kind: 'Full-time',
    summary:
      'Embedded software engineering in the automotive domain, including advanced driver assistance systems (ADAS).',
    points: [
      'Worked on embedded software projects using Embedded C, Embedded C++, Embedded Linux and Linux application development.',
      'Used CMake and structured engineering processes for technical software development and troubleshooting.',
      'Investigated issues and worked to keep software quality consistent.',
    ],
    tags: ['Embedded C', 'Embedded C++', 'Embedded Linux', 'CMake', 'ADAS domain'],
    contextNote: 'ADAS domain work; project-specific detail is under NDA.',
  },
  {
    id: 'wylo',
    org: 'Wylo',
    role: 'Technical and Community Manager (intern)',
    dates: '',
    datesVerified: false,
    location: 'Remote',
    kind: 'Internship',
    summary:
      'Internship covering technical and community responsibilities for the Wylo app.',
    points: [
      'Technical support for the Wylo app and the people using it.',
      'Community management — communication with members and users.',
    ],
    tags: ['Community management', 'Technical support', 'Product'],
  },
  {
    id: 'ui-volunteer',
    org: 'U&I',
    role: 'Volunteer English Tutor',
    dates: 'Jun 2025 – Dec 2025',
    datesVerified: true,
    location: 'Bengaluru, India',
    kind: 'Volunteering',
    summary: 'Volunteer English tutoring alongside full-time work.',
    points: [
      'Tutored students in English.',
      'Adjusted my approach for different learning needs.',
    ],
    tags: ['Teaching', 'Communication', 'Community'],
    contextNote: 'Volunteered alongside full-time work.',
  },
]

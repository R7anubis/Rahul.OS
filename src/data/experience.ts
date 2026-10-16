/**
 * Professional experience — verified entries only.
 *
 * Dates come from the supplied résumé. Where the résumé does not list dates,
 * the entry says so explicitly rather than guessing.
 */

export interface ExperienceEntry {
  id: string
  org: string
  role: string
  /** verified date range, or an explicit note that none is listed */
  dates: string
  datesVerified: boolean
  location: string
  kind: 'Full-time' | 'Internship' | 'Volunteering'
  /** one-line summary shown in the timeline rail */
  summary: string
  /** responsibilities, worded from the résumé and supplied context */
  points: string[]
  /** technologies / disciplines touched in the role */
  tags: string[]
  /** neutral context line — no confidential detail, no endorsement implied */
  contextNote: string
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
      'Collaborated with teams to investigate software behaviour and maintain quality standards in a fast-paced environment.',
    ],
    tags: ['Technical QA', 'Defect reporting', 'Regression testing', 'Stability & performance profiling'],
    contextNote:
      'Describes my own responsibilities only. No confidential tooling, unreleased material or internal process detail is reproduced here. Nothing on this site implies endorsement by any employer.',
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
      'Worked collaboratively to investigate issues, meet deadlines and maintain software quality.',
    ],
    tags: ['Embedded C', 'Embedded C++', 'Embedded Linux', 'CMake', 'ADAS domain'],
    contextNote:
      'Automotive work sat in the ADAS space. Project-specific detail is under NDA and is intentionally not described.',
  },
  {
    id: 'wylo',
    org: 'Wylo',
    role: 'Technical and Community Manager (intern)',
    dates: 'Dates not listed on the supplied résumé',
    datesVerified: false,
    location: 'Remote',
    kind: 'Internship',
    summary:
      'Internship covering technical and community responsibilities for the Wylo app.',
    points: [
      'Technical and community-related responsibilities for the Wylo app.',
      'Worked across product support and community-facing communication.',
    ],
    tags: ['Community management', 'Technical support', 'Product'],
    contextNote:
      'The exact dates and scope of this internship are not recorded in the résumé supplied for this site, so they are left unstated rather than estimated.',
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
      'Provided English tutoring to students using clear explanations, patience and encouragement.',
      'Adapted communication and teaching approach to different learning needs.',
    ],
    tags: ['Teaching', 'Communication', 'Community'],
    contextNote: 'Volunteer role, listed on the résumé alongside full-time work.',
  },
]

/**
 * The canonical section list. Drives the header navigation, the scroll
 * indicator, the footer sitemap and the command palette, so all four can never
 * drift apart.
 */

export interface SiteSection {
  id: string
  index: string
  label: string
  /** shown in the command palette hint */
  hint: string
  /** present in the compact header navigation */
  inNav: boolean
}

export const sections: SiteSection[] = [
  { id: 'about', index: '01', label: 'About', hint: 'Who I am and how I got here', inNav: true },
  { id: 'projects', index: '02', label: 'Projects', hint: 'SameFace, SCAMS, CARLA / ROS 2 and QA work', inNav: true },
  { id: 'experience', index: '03', label: 'Experience', hint: 'Rockstar Games India, Tata Elxsi, Wylo, U&I', inNav: true },
  { id: 'education', index: '04', label: 'Education', hint: 'Monash University and Presidency University', inNav: false },
  { id: 'skills', index: '05', label: 'Skills', hint: 'Data, software, mobile, embedded, simulation, QA', inNav: true },
  { id: 'interests', index: '06', label: 'Interests', hint: 'How the disciplines connect', inNav: false },
  { id: 'contact', index: '07', label: 'Contact', hint: 'Email and verified social links', inNav: true },
]

export const sectionById = (id: string): SiteSection | undefined =>
  sections.find((section) => section.id === id)

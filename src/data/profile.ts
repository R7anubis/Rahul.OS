/**
 * Owner profile — verified, public information only.
 * Everything here comes from the supplied résumé or from Rahul directly.
 * If a fact is not verified, it does not belong in this file.
 */

export interface SocialLink {
  id: 'linkedin' | 'github' | 'instagram' | 'x' | 'email'
  label: string
  handle: string
  href: string
  /** opens in a new tab (external) or hands off to a mail client */
  external: boolean
  /** short description used as the accessible label / tooltip */
  description: string
}

export const profile = {
  name: 'Rahul Raj',
  firstName: 'Rahul',
  wordmark: 'RAHUL.RAJ',
  system: 'RAHUL.OS',
  tagline: 'A personal system for projects, ideas and engineering.',

  headline: 'I build at the intersection of data, AI and technology.',
  support:
    "From embedded systems and automotive ADAS to game technology and applied AI, I'm interested in turning complex technical ideas into useful things.",

  location: 'Melbourne, Australia',
  locationShort: 'Melbourne, AU',
  timeZone: 'Australia/Melbourne',

  email: 'rahul.mayavi@gmail.com',

  studies: {
    program: 'Master of Data Science',
    institution: 'Monash University',
    campus: 'Clayton campus',
    intake: 'July 2026 intake',
    status: 'Currently studying',
  },

  /** Languages listed on the supplied résumé. */
  languages: ['English', 'Hindi', 'Kannada', 'Tamil'],

  /** Short, factual summary used for meta descriptions. */
  summary:
    'Data science student at Monash University with experience across software QA, embedded engineering and technical problem solving.',

  links: [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      handle: 'rahul-raj-9556861bb',
      href: 'https://www.linkedin.com/in/rahul-raj-9556861bb/',
      external: true,
      description: 'Rahul Raj on LinkedIn (opens in a new tab)',
    },
    {
      id: 'github',
      label: 'GitHub',
      handle: 'R7anubis',
      href: 'https://github.com/R7anubis',
      external: true,
      description: 'Rahul Raj on GitHub, username R7anubis (opens in a new tab)',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      handle: 'r7anubis',
      href: 'https://www.instagram.com/r7anubis/',
      external: true,
      description: 'Rahul Raj on Instagram (opens in a new tab)',
    },
    {
      id: 'x',
      label: 'X',
      handle: 'R7anub1s',
      href: 'https://x.com/R7anub1s',
      external: true,
      description: 'Rahul Raj on X, formerly Twitter (opens in a new tab)',
    },
    {
      id: 'email',
      label: 'Email',
      handle: 'rahul.mayavi@gmail.com',
      href: 'mailto:rahul.mayavi@gmail.com?subject=Hello%20Rahul',
      external: false,
      description: 'Email Rahul Raj at rahul.mayavi@gmail.com',
    },
  ] satisfies SocialLink[],

  /** External links always carry the same security attributes. */
  externalRel: 'me noopener noreferrer',
} as const

export type Profile = typeof profile

/** Look up a single verified link by id (typed, no index juggling). */
export const linkById = (id: SocialLink['id']): SocialLink | undefined =>
  profile.links.find((link) => link.id === id)

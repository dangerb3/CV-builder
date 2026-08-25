import type { ResumeDoc } from '../types/resume';

/**
 * Демонстрационное резюме — то, что видит любой, кто открыл проект впервые.
 * Личных данных здесь нет и быть не должно: своё резюме живёт в
 * `public/resume.local.json`, который не попадает в репозиторий.
 * См. `lib/bootstrap.ts`.
 */
export const defaultResumeEn: ResumeDoc = {
  basics: {
    name: 'Alex Morgan',
    title: 'Frontend Engineer',
    tagline: 'Open to remote. Ready to relocate.',
    photo: '',
    contacts: [
      { id: 'c-email', kind: 'email', value: 'alex.morgan@example.com' },
      { id: 'c-phone', kind: 'phone', value: '+1 555 0100' },
      { id: 'c-location', kind: 'location', value: 'Berlin, Germany' },
      { id: 'c-linkedin', kind: 'linkedin', value: 'linkedin.com/in/example' },
      { id: 'c-github', kind: 'github', value: 'github.com/example' },
    ],
  },
  sections: [
    {
      id: 's-experience',
      type: 'experience',
      title: 'Work Experience',
      column: 'left',
      visible: true,
      items: [
        {
          id: 'e-1',
          role: 'Senior Frontend Engineer',
          company: 'Northwind Labs',
          period: '03/2023 - Present',
          summary: 'A product company building analytics tools for logistics teams',
          bullets: [
            'Rebuilt the dashboard on a shared component library, cutting page load time in half',
            'Owned features end-to-end — from requirements to production release',
            'Mentored two junior engineers through onboarding and code review',
            'Technologies: TypeScript, React, Vite, TanStack Query',
          ],
        },
        {
          id: 'e-2',
          role: 'Frontend Engineer',
          company: 'Bright Studio',
          period: '06/2020 - 02/2023',
          summary: 'A digital agency delivering web products for European clients',
          bullets: [
            'Delivered a dozen client projects across e-commerce and media',
            'Introduced automated visual testing that caught regressions before release',
            'Technologies: TypeScript, React, Redux, Styled Components',
          ],
        },
      ],
    },
    {
      id: 's-skills',
      type: 'skills',
      title: 'Skills',
      column: 'right',
      visible: true,
      items: [
        'TypeScript',
        'React',
        'Redux',
        'Zustand',
        'Node.js',
        'Vite',
        'Tailwind CSS',
        'Styled components',
        'Playwright',
        'Vitest',
        'Figma',
        'Git',
      ].map((name, i) => ({ id: `sk-${i}`, name })),
    },
    {
      id: 's-projects',
      type: 'projects',
      title: 'Personal Projects',
      column: 'right',
      visible: true,
      items: [
        {
          id: 'p-1',
          name: 'Tideline — habit tracker',
          link: 'example.com/tideline',
          summary: '',
          bullets: [
            'Offline-first PWA with background sync and push reminders',
            'Built with React, IndexedDB, and a small Express API',
            'Stack: React 19, TypeScript, Vite, Dexie',
          ],
        },
        {
          id: 'p-2',
          name: 'Palette Lab',
          link: 'example.com/palette-lab',
          summary: '',
          bullets: [
            'Colour-contrast checker that grades palettes against WCAG levels',
            'Runs entirely in the browser — no data leaves the page',
          ],
        },
      ],
    },
    {
      id: 's-education',
      type: 'education',
      title: 'Education',
      column: 'right',
      visible: true,
      items: [
        {
          id: 'ed-1',
          degree: 'Computer Science',
          institution: 'Technical University of Berlin',
          period: '09/2016 - 06/2020',
          bullets: [],
        },
      ],
    },
  ],
};

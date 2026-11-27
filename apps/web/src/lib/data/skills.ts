import type { SkillGroup } from '@portofolio/shared';

/**
 * Static Skills & Tech Stack (V1 codebase data — bilingual EN/ID).
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    categoryEn: 'Frontend Web',
    categoryId: 'Frontend Web',
    items: [
      'Nuxt.js',
      'Vue.js',
      'Svelte',
      'TypeScript',
      'Tailwind CSS',
      'Vuetify',
      'Leaflet.js',
      'HTML5',
      'CSS3'
    ]
  },
  {
    id: 'mobile',
    categoryEn: 'Mobile Development',
    categoryId: 'Pengembangan Mobile',
    items: ['Flutter', 'React Native']
  },
  {
    id: 'integration',
    categoryEn: 'Integration & Core',
    categoryId: 'Integrasi & Dasar',
    items: ['REST API', 'WebSockets', 'JSON', 'Git']
  }
];

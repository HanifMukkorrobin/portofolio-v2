import type { WorkHistoryItem } from '@portofolio/shared';

/**
 * Static Work History (V1 codebase data — bilingual EN/ID).
 */
export const workHistory: WorkHistoryItem[] = [
  {
    id: 'traspac-makmur-sejahtera',
    company: 'PT. Traspac Makmur Sejahtera',
    roleEn: 'Frontend & Mobile Developer',
    roleId: 'Frontend & Mobile Developer',
    periodEn: 'Jul 2021 — Present',
    periodId: 'Jul 2021 — Sekarang',
    location: 'Jakarta, Indonesia',
    highlightsEn: [
      'Built and maintained responsive web interfaces for enterprise and government applications using Nuxt, Vue, and Svelte.',
      'Developed and maintained cross-platform mobile applications using Flutter and React Native.',
      'Implemented interactive Leaflet map modules, WebSocket real-time chat/helpdesk UIs, and REST API integrations within product teams.',
      'Handled bug fixes, stability improvements, and client-side mobile workflows such as camera ROI cropping and PDF generation.'
    ],
    highlightsId: [
      'Membangun dan merawat antarmuka web responsif untuk aplikasi enterprise dan pemerintahan menggunakan Nuxt, Vue, dan Svelte.',
      'Mengembangkan dan merawat aplikasi mobile lintas platform menggunakan Flutter dan React Native.',
      'Mengimplementasikan modul peta interaktif Leaflet, UI live chat/helpdesk berbasis WebSocket, dan integrasi REST API bersama tim produk.',
      'Menangani perbaikan bug, peningkatan stabilitas, serta alur kerja mobile seperti ROI cropping kamera dan pembuatan PDF di aplikasi.'
    ]
  }
];

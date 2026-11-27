import type { Locale } from '@portofolio/shared';

export interface UiCopy {
  nav: {
    work: string;
    services: string;
    experience: string;
    skills: string;
    contact: string;
    utility: string;
    downloadCv: string;
    noCvYet: string;
    backToWork: string;
    themeLight: string;
    themeDark: string;
    menu: string;
    close: string;
    primaryNav: string;
    copyEmail: string;
    emailCopied: string;
    skipToContent: string;
  };
  hero: {
    defaultBrand: string;
    defaultSubtitle: string;
    defaultHeadline: string;
    defaultBio: string;
    inspectWork: string;
    exploreServices: string;
    browseGithub: string;
    profilePlate: string;
    availableDefault: string;
    unavailableDefault: string;
    emptyProfileNote: string;
  };
  projects: {
    sectionTitle: string;
    featured: string;
    ndaBadge: string;
    ndaDefaultNotice: string;
    readCaseStudy: string;
    liveDemo: string;
    liveSite: string;
    sourceCode: string;
    interactiveDemo: string;
    role: string;
    period: string;
    stack: string;
    gallery: string;
    emptyTitle: string;
    emptyDescription: string;
    noNarrative: string;
    previousProject: string;
    nextProject: string;
  };
  services: {
    sectionTitle: string;
    defaultCta: string;
  };
  experience: {
    sectionTitle: string;
    skillsTitle: string;
  };
  footer: {
    directChannels: string;
    builtWith: string;
  };
  system: {
    apiUnavailableTitle: string;
    apiUnavailableDescription: string;
    reload: string;
  };
}

export const UI_COPY: Record<Locale, UiCopy> = {
  en: {
    nav: {
      work: 'Work',
      services: 'Services',
      experience: 'Experience',
      skills: 'Stack',
      contact: 'Contact',
      utility: 'Utility',
      downloadCv: 'Download CV',
      noCvYet: 'CV Not Uploaded',
      backToWork: 'Back to all work',
      themeLight: 'Light',
      themeDark: 'Dark',
      menu: 'Menu',
      close: 'Close',
      primaryNav: 'Primary navigation',
      copyEmail: 'Copy email',
      emailCopied: 'Copied',
      skipToContent: 'Skip to main content'
    },
    hero: {
      defaultBrand: 'FOLIO // ENG',
      defaultSubtitle: 'Software Engineering',
      defaultHeadline: 'Engineering Monograph',
      defaultBio:
        'Selected shipped systems, technical services, and direct contact channels are presented here.',
      inspectWork: 'Inspect Case Studies',
      exploreServices: 'Explore Services',
      browseGithub: 'Browse GitHub',
      profilePlate: 'Profile',
      availableDefault: 'Available for roles & freelance',
      unavailableDefault: 'Currently unavailable',
      emptyProfileNote: 'Profile overview is currently being updated.'
    },
    projects: {
      sectionTitle: 'Shipped Projects & Case Studies',
      featured: 'Featured',
      ndaBadge: 'NDA Restricted',
      ndaDefaultNotice:
        'Client identity, source repositories, and live links are omitted under non-disclosure agreement. Technical architecture and contribution remain documented below.',
      readCaseStudy: 'Read Case Study',
      liveDemo: 'Live Demo',
      liveSite: 'Live Site',
      sourceCode: 'Source Code',
      interactiveDemo: 'Interactive Demo',
      role: 'Role',
      period: 'Period',
      stack: 'Tech Stack',
      gallery: 'Visual Artifacts',
      emptyTitle: 'Case studies in preparation',
      emptyDescription:
        'Selected production architecture write-ups are currently being prepared for public release. Browse public repositories on GitHub or reach out directly for private work samples.',
      noNarrative: 'Detailed case study notes have not been added yet.',
      previousProject: 'Previous Case Study',
      nextProject: 'Next Case Study'
    },
    services: {
      sectionTitle: 'Services & Freelance',
      defaultCta: 'Start a Conversation'
    },
    experience: {
      sectionTitle: 'Work History',
      skillsTitle: 'Skills & Tech Stack'
    },
    footer: {
      directChannels: 'Direct Channels',
      builtWith: 'Engineering Portfolio'
    },
    system: {
      apiUnavailableTitle: 'Live portfolio data is temporarily unavailable',
      apiUnavailableDescription:
        'Some profile details and case studies could not be loaded right now. Try reloading the page in a moment.',
      reload: 'Reload'
    }
  },
  id: {
    nav: {
      work: 'Karya',
      services: 'Layanan',
      experience: 'Pengalaman',
      skills: 'Keahlian',
      contact: 'Kontak',
      utility: 'Utilitas',
      downloadCv: 'Unduh CV',
      noCvYet: 'CV Belum Diunggah',
      backToWork: 'Kembali ke daftar karya',
      themeLight: 'Terang',
      themeDark: 'Gelap',
      menu: 'Menu',
      close: 'Tutup',
      primaryNav: 'Navigasi utama',
      copyEmail: 'Salin email',
      emailCopied: 'Tersalin',
      skipToContent: 'Langsung ke konten utama'
    },
    hero: {
      defaultBrand: 'FOLIO // ENG',
      defaultSubtitle: 'Software Engineering',
      defaultHeadline: 'Monograf Engineering',
      defaultBio:
        'Sistem yang telah dirilis, layanan teknis, dan saluran kontak langsung ditampilkan di sini.',
      inspectWork: 'Lihat Studi Kasus',
      exploreServices: 'Lihat Layanan',
      browseGithub: 'Lihat GitHub',
      profilePlate: 'Profil',
      availableDefault: 'Tersedia untuk peran baru & freelance',
      unavailableDefault: 'Sedang tidak tersedia',
      emptyProfileNote: 'Ringkasan profil sedang diperbarui.'
    },
    projects: {
      sectionTitle: 'Proyek & Studi Kasus',
      featured: 'Unggulan',
      ndaBadge: 'Terikat NDA',
      ndaDefaultNotice:
        'Identitas klien, repositori kode, dan tautan produksi disembunyikan sesuai perjanjian kerahasiaan (NDA). Arsitektur teknis dan peran kontribusi tetap didokumentasikan di bawah.',
      readCaseStudy: 'Baca Studi Kasus',
      liveDemo: 'Demo Interaktif',
      liveSite: 'Situs Live',
      sourceCode: 'Kode Sumber',
      interactiveDemo: 'Demo Interaktif',
      role: 'Peran',
      period: 'Periode',
      stack: 'Tech Stack',
      gallery: 'Cuplikan Visual',
      emptyTitle: 'Studi kasus sedang disiapkan',
      emptyDescription:
        'Dokumentasi arsitektur proyek produksi sedang disiapkan untuk rilis publik. Jelajahi repositori publik di GitHub atau hubungi langsung untuk sampel karya privat.',
      noNarrative: 'Catatan studi kasus detail belum ditambahkan.',
      previousProject: 'Studi Kasus Sebelumnya',
      nextProject: 'Studi Kasus Berikutnya'
    },
    services: {
      sectionTitle: 'Layanan & Freelance',
      defaultCta: 'Mulai Diskusi'
    },
    experience: {
      sectionTitle: 'Riwayat Kerja',
      skillsTitle: 'Keahlian & Tech Stack'
    },
    footer: {
      directChannels: 'Kontak Langsung',
      builtWith: 'Portofolio Engineering'
    },
    system: {
      apiUnavailableTitle: 'Data portofolio live sementara tidak tersedia',
      apiUnavailableDescription:
        'Sebagian detail profil dan studi kasus belum dapat dimuat saat ini. Coba muat ulang halaman beberapa saat lagi.',
      reload: 'Muat Ulang'
    }
  }
};

import {
  LOCALE_COOKIE_NAME,
  type Locale,
  type PublicPortfolioResponse,
  type SiteProfile
} from '@portofolio/shared';
import { apiRequest } from '$lib/api/client';
import type { LayoutServerLoad } from './$types';

const EMPTY_PROFILE: SiteProfile = {
  id: 1,
  displayName: '',
  roleEn: '',
  roleId: '',
  taglineEn: '',
  taglineId: '',
  bioEn: '',
  bioId: '',
  isAvailable: false,
  availabilityEn: '',
  availabilityId: '',
  services: [],
  freelanceCtaEn: '',
  freelanceCtaId: '',
  freelanceCtaUrl: '',
  email: '',
  githubUrl: '',
  linkedinUrl: '',
  avatarKey: null,
  avatarUrl: null,
  cvPdfKey: null,
  cvPdfUrl: null,
  cvOriginalName: null,
  updatedAt: new Date(0).toISOString()
};

export const load: LayoutServerLoad = async ({ params, cookies, fetch }) => {
  const locale = params.lang as Locale;
  cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false
  });

  try {
    const data = await apiRequest<PublicPortfolioResponse>('/api/public/portfolio', {}, { fetchFn: fetch });
    return {
      locale,
      profile: data.profile,
      projects: data.projects,
      apiUnavailable: false
    };
  } catch {
    return {
      locale,
      profile: EMPTY_PROFILE,
      projects: [],
      apiUnavailable: true
    };
  }
};

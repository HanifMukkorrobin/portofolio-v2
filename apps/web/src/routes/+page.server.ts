import { redirect } from '@sveltejs/kit';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME } from '@portofolio/shared';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
  const saved = cookies.get(LOCALE_COOKIE_NAME);
  const target = isLocale(saved) ? saved : DEFAULT_LOCALE;
  throw redirect(302, `/${target}`);
};

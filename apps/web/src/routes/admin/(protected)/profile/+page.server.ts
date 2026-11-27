import type { SiteProfile } from '@portofolio/shared';
import { apiRequest } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, fetch }) => {
  const cookieHeader = request.headers.get('cookie');
  const res = await apiRequest<{ profile: SiteProfile }>(
    '/api/admin/profile',
    {},
    { fetchFn: fetch, cookieHeader }
  );
  return { profile: res.profile };
};

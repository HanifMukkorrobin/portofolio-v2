import type { ProjectRecord } from '@portofolio/shared';
import { apiRequest } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, fetch }) => {
  const cookieHeader = request.headers.get('cookie');
  const res = await apiRequest<{ projects: ProjectRecord[] }>(
    '/api/admin/projects',
    {},
    { fetchFn: fetch, cookieHeader }
  );
  return { projects: res.projects };
};

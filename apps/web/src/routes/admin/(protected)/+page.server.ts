import type { ProjectRecord, SiteProfile } from '@portofolio/shared';
import { apiRequest } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, fetch }) => {
  const cookieHeader = request.headers.get('cookie');
  const [profileRes, projectsRes] = await Promise.all([
    apiRequest<{ profile: SiteProfile }>('/api/admin/profile', {}, { fetchFn: fetch, cookieHeader }),
    apiRequest<{ projects: ProjectRecord[] }>('/api/admin/projects', {}, { fetchFn: fetch, cookieHeader })
  ]);

  return {
    profile: profileRes.profile,
    projects: projectsRes.projects
  };
};

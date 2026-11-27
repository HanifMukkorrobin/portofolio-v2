import { error } from '@sveltejs/kit';
import type { ProjectRecord } from '@portofolio/shared';
import { ApiError, apiRequest } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, request, fetch }) => {
  const cookieHeader = request.headers.get('cookie');
  try {
    const res = await apiRequest<{ project: ProjectRecord }>(
      `/api/admin/projects/${encodeURIComponent(params.id)}`,
      {},
      { fetchFn: fetch, cookieHeader }
    );
    return { project: res.project };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw error(404, 'Project not found');
    }
    throw error(500, 'Failed to load project');
  }
};

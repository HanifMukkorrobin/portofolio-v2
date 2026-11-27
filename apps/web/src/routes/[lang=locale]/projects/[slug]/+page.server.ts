import { error } from '@sveltejs/kit';
import type { ProjectRecord } from '@portofolio/shared';
import { ApiError, apiRequest } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const res = await apiRequest<{ project: ProjectRecord }>(
      `/api/public/projects/${encodeURIComponent(params.slug)}`,
      {},
      { fetchFn: fetch }
    );
    return { project: res.project };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw error(404, 'Project not found');
    }
    throw error(503, 'Unable to load project');
  }
};

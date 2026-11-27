import { redirect } from '@sveltejs/kit';
import type { AdminUser } from '@portofolio/shared';
import { apiRequest } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, fetch }) => {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return {};

  try {
    await apiRequest<{ user: AdminUser }>('/api/auth/me', {}, { fetchFn: fetch, cookieHeader });
  } catch {
    return {};
  }

  throw redirect(302, '/admin');
};

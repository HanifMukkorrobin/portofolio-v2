import { redirect } from '@sveltejs/kit';
import type { AdminUser } from '@portofolio/shared';
import { apiRequest } from '$lib/api/client';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, fetch }) => {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    throw redirect(302, '/admin/login');
  }

  try {
    const res = await apiRequest<{ user: AdminUser }>(
      '/api/auth/me',
      {},
      { fetchFn: fetch, cookieHeader }
    );
    return { adminUser: res.user };
  } catch {
    throw redirect(302, '/admin/login');
  }
};

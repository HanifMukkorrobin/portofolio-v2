import type { RequestHandler } from './$types';
import { resolveSiteOrigin } from '$lib/seo';

export const GET: RequestHandler = ({ url }) => {
  const siteOrigin = resolveSiteOrigin(url.origin);
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteOrigin}/sitemap.xml`,
    ''
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
};

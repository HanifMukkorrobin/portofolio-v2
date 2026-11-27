import type { PublicPortfolioResponse } from '@portofolio/shared';
import type { RequestHandler } from './$types';
import { apiRequest } from '$lib/api/client';
import { escapeXml, resolveSiteOrigin } from '$lib/seo';

function renderUrlEntry(params: {
  loc: string;
  enHref: string;
  idHref: string;
  lastmod?: string;
}): string {
  const lastmodTag = params.lastmod ? `\n    <lastmod>${escapeXml(params.lastmod)}</lastmod>` : '';
  return [
    '  <url>',
    `    <loc>${escapeXml(params.loc)}</loc>${lastmodTag}`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(params.enHref)}" />`,
    `    <xhtml:link rel="alternate" hreflang="id" href="${escapeXml(params.idHref)}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(params.enHref)}" />`,
    '  </url>'
  ].join('\n');
}

export const GET: RequestHandler = async ({ url, fetch }) => {
  const siteOrigin = resolveSiteOrigin(url.origin);
  let profileLastMod: string | undefined;
  let projects: PublicPortfolioResponse['projects'] = [];

  try {
    const data = await apiRequest<PublicPortfolioResponse>(
      '/api/public/portfolio',
      {},
      { fetchFn: fetch }
    );
    profileLastMod = data.profile.updatedAt;
    projects = data.projects;
  } catch {
    // Emit static root locales even if API is momentarily unavailable
  }

  const entries: string[] = [
    renderUrlEntry({
      loc: `${siteOrigin}/en`,
      enHref: `${siteOrigin}/en`,
      idHref: `${siteOrigin}/id`,
      lastmod: profileLastMod
    }),
    renderUrlEntry({
      loc: `${siteOrigin}/id`,
      enHref: `${siteOrigin}/en`,
      idHref: `${siteOrigin}/id`,
      lastmod: profileLastMod
    })
  ];

  for (const project of projects) {
    const enHref = `${siteOrigin}/en/projects/${encodeURIComponent(project.slug)}`;
    const idHref = `${siteOrigin}/id/projects/${encodeURIComponent(project.slug)}`;
    entries.push(
      renderUrlEntry({ loc: enHref, enHref, idHref, lastmod: project.updatedAt }),
      renderUrlEntry({ loc: idHref, enHref, idHref, lastmod: project.updatedAt })
    );
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    ''
  ].join('\n');

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
};

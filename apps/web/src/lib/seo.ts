export function resolveSiteOrigin(fallbackOrigin: string): string {
  const configured =
    typeof process !== 'undefined' ? process.env.PUBLIC_SITE_URL?.trim() : undefined;
  return (configured || fallbackOrigin).replace(/\/$/, '');
}

export function toAbsoluteUrl(
  origin: string,
  pathOrUrl: string | null | undefined
): string | null {
  if (!pathOrUrl) return null;
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${origin.replace(/\/$/, '')}${normalizedPath}`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

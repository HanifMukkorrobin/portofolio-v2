import type { Handle } from '@sveltejs/kit';

const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'upgrade',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer'
]);

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  'connection',
  'transfer-encoding',
  'keep-alive',
  'upgrade',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer'
]);

function getApiInternalUrl(): string {
  return (process.env.API_INTERNAL_URL || 'http://localhost:3001').replace(/\/$/, '');
}

async function proxyApiRequest(event: Parameters<Handle>[0]['event']): Promise<Response> {
  const targetUrl = `${getApiInternalUrl()}${event.url.pathname}${event.url.search}`;
  const headers = new Headers();

  for (const [key, value] of event.request.headers.entries()) {
    if (!HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.append(key, value);
    }
  }

  try {
    const clientAddress = event.getClientAddress();
    if (clientAddress) {
      const existingForwarded = headers.get('x-forwarded-for');
      headers.set(
        'x-forwarded-for',
        existingForwarded ? `${existingForwarded}, ${clientAddress}` : clientAddress
      );
    }
  } catch {
    // Client address unavailable in non-adapter contexts
  }

  const method = event.request.method.toUpperCase();
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await event.request.arrayBuffer();

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: 'manual'
    });

    const responseHeaders = new Headers();
    for (const [key, value] of upstream.headers.entries()) {
      const lower = key.toLowerCase();
      if (lower === 'set-cookie' || HOP_BY_HOP_RESPONSE_HEADERS.has(lower)) {
        continue;
      }
      responseHeaders.append(key, value);
    }

    const setCookies =
      typeof upstream.headers.getSetCookie === 'function'
        ? upstream.headers.getSetCookie()
        : upstream.headers.get('set-cookie')
          ? [upstream.headers.get('set-cookie')!]
          : [];

    for (const cookie of setCookies) {
      responseHeaders.append('set-cookie', cookie);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Upstream API unavailable' }), {
      status: 502,
      headers: { 'content-type': 'application/json' }
    });
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname === '/api' || event.url.pathname.startsWith('/api/')) {
    return proxyApiRequest(event);
  }

  const firstSegment = event.url.pathname.split('/')[1];
  const lang = firstSegment === 'id' ? 'id' : 'en';

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('<html lang="en">', `<html lang="${lang}">`)
  });
};

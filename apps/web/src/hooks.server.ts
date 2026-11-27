import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const firstSegment = event.url.pathname.split('/')[1];
  const lang = firstSegment === 'id' ? 'id' : 'en';

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('<html lang="en">', `<html lang="${lang}">`)
  });
};

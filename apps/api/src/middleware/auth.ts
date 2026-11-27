import type { AdminUser } from '@portofolio/shared';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { AppDb } from '../db/index.js';
import { getSessionUser, SESSION_COOKIE_NAME } from '../lib/session.js';

export type AuthEnv = {
  Variables: {
    adminUser: AdminUser;
  };
};

export function createRequireAdmin(db: AppDb) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const token = getCookie(c, SESSION_COOKIE_NAME);
    const user = await getSessionUser(db, token);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('adminUser', user);
    await next();
  });
}

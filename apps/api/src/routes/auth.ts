import { loginSchema } from '@portofolio/shared';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { AppDb } from '../db/index.js';
import { adminUsers } from '../db/schema.js';
import type { ApiEnv } from '../env.js';
import { verifyPassword } from '../lib/password.js';
import { createRateLimiter } from '../lib/rate-limit.js';
import {
  createSession,
  revokeSession,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS
} from '../lib/session.js';
import { createRequireAdmin, type AuthEnv } from '../middleware/auth.js';

export function createAuthRoutes(db: AppDb, env: ApiEnv) {
  const app = new Hono<AuthEnv>();
  const requireAdmin = createRequireAdmin(db);
  const loginLimiter = createRateLimiter(10, 15 * 60 * 1000);

  app.post('/login', async (c) => {
    const clientIp = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
    const limit = loginLimiter.consume(clientIp);
    if (!limit.allowed) {
      c.header('Retry-After', String(limit.retryAfterSec));
      return c.json({ error: 'Too many login attempts. Try again later.' }, 429);
    }

    const body = await c.req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid credentials payload', details: parsed.error.flatten() }, 400);
    }

    const email = parsed.data.email.toLowerCase();
    const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    const user = rows[0];

    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    loginLimiter.reset(clientIp);
    const { token } = await createSession(db, user.id);

    setCookie(c, SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: env.COOKIE_SECURE,
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000)
    });

    return c.json({ user: { id: user.id, email: user.email } });
  });

  app.post('/logout', requireAdmin, async (c) => {
    const token = getCookie(c, SESSION_COOKIE_NAME);
    await revokeSession(db, token);
    deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
    return c.json({ ok: true });
  });

  app.get('/me', requireAdmin, (c) => {
    return c.json({ user: c.get('adminUser') });
  });

  return app;
}

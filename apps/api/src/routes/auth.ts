import { getConnInfo } from '@hono/node-server/conninfo';
import { loginSchema } from '@portofolio/shared';
import { eq } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
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

/**
 * Extracts the client IP from X-Forwarded-For using right-to-left hop counting
 * so spoofed left-side values injected by clients cannot bypass rate limiting.
 */
export function extractClientIpFromForwardedHeader(
  headerValue: string | undefined,
  trustProxyHops: number
): string | null {
  if (trustProxyHops <= 0 || !headerValue) return null;
  const ips = headerValue
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (ips.length === 0) return null;
  const index = Math.max(0, ips.length - trustProxyHops);
  return ips[index] ?? null;
}

function resolveClientIp(c: Context, trustProxyHops: number): string {
  const forwardedIp = extractClientIpFromForwardedHeader(
    c.req.header('x-forwarded-for'),
    trustProxyHops
  );
  if (forwardedIp) return forwardedIp;

  try {
    const info = getConnInfo(c);
    if (info.remote.address) return info.remote.address;
  } catch {
    // Non-node runtime or test harness without socket info
  }

  return 'unknown';
}

export function createAuthRoutes(db: AppDb, env: ApiEnv) {
  const app = new Hono<AuthEnv>();
  const requireAdmin = createRequireAdmin(db, env.SESSION_SECRET);
  const loginLimiter = createRateLimiter(10, 15 * 60 * 1000);

  app.post('/login', async (c) => {
    const clientIp = resolveClientIp(c, env.TRUST_PROXY_HOPS);
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
    const { token } = await createSession(db, user.id, env.SESSION_SECRET);

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
    await revokeSession(db, token, env.SESSION_SECRET);
    deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
    return c.json({ ok: true });
  });

  app.get('/me', requireAdmin, (c) => {
    return c.json({ user: c.get('adminUser') });
  });

  return app;
}

import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import type { AdminUser } from '@portofolio/shared';
import type { AppDb } from '../db/index.js';
import { adminUsers, sessions } from '../db/schema.js';

export const SESSION_COOKIE_NAME = 'portfolio_session';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(db: AppDb, userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt
  });

  return { token, expiresAt };
}

export async function getSessionUser(db: AppDb, token: string | undefined): Promise<AdminUser | null> {
  if (!token) return null;
  const tokenHash = hashSessionToken(token);

  const rows = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email
    })
    .from(sessions)
    .innerJoin(adminUsers, eq(sessions.userId, adminUsers.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return rows[0] ?? null;
}

export async function revokeSession(db: AppDb, token: string | undefined): Promise<void> {
  if (!token) return;
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

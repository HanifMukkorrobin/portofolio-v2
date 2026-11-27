import { createHmac, randomBytes } from 'node:crypto';
import { and, eq, gt, lte } from 'drizzle-orm';
import type { AdminUser } from '@portofolio/shared';
import type { AppDb } from '../db/index.js';
import { adminUsers, sessions } from '../db/schema.js';

export const SESSION_COOKIE_NAME = 'portfolio_session';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}

export async function pruneExpiredSessions(db: AppDb, now: Date = new Date()): Promise<void> {
  await db.delete(sessions).where(lte(sessions.expiresAt, now));
}

export async function revokeUserSessions(db: AppDb, userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function createSession(
  db: AppDb,
  userId: string,
  secret: string
): Promise<{ token: string; expiresAt: Date }> {
  const now = new Date();
  await pruneExpiredSessions(db, now);

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token, secret);
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt
  });

  return { token, expiresAt };
}

export async function getSessionUser(
  db: AppDb,
  token: string | undefined,
  secret: string
): Promise<AdminUser | null> {
  if (!token) return null;
  const tokenHash = hashSessionToken(token, secret);

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

export async function revokeSession(
  db: AppDb,
  token: string | undefined,
  secret: string
): Promise<void> {
  if (!token) return;
  const tokenHash = hashSessionToken(token, secret);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

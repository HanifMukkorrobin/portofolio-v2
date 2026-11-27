import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppDb } from '../db/index.js';

export function createHealthRoutes(db: AppDb) {
  const app = new Hono();

  app.get('/health', async (c) => {
    try {
      await db.execute(sql`SELECT 1`);
      return c.json({ status: 'ok', database: 'connected' });
    } catch {
      return c.json({ status: 'degraded', database: 'disconnected' }, 503);
    }
  });

  return app;
}

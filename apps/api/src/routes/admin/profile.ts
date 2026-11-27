import { updateProfileSchema } from '@portofolio/shared';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppDb } from '../../db/index.js';
import { siteProfile } from '../../db/schema.js';
import { ensureSiteProfileRow, serializeProfile } from '../../lib/serializers.js';
import type { StorageAdapter } from '../../lib/storage/types.js';
import type { AuthEnv } from '../../middleware/auth.js';

export function createAdminProfileRoutes(db: AppDb, storage: StorageAdapter) {
  const app = new Hono<AuthEnv>();

  app.get('/', async (c) => {
    const row = await ensureSiteProfileRow(db);
    return c.json({ profile: serializeProfile(row, storage) });
  });

  app.put('/', async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid profile payload', details: parsed.error.flatten() }, 400);
    }

    await ensureSiteProfileRow(db);

    const updated = await db
      .update(siteProfile)
      .set({
        ...parsed.data,
        updatedAt: new Date()
      })
      .where(eq(siteProfile.id, 1))
      .returning();

    if (!updated[0]) {
      return c.json({ error: 'Failed to update profile' }, 500);
    }

    return c.json({ profile: serializeProfile(updated[0], storage) });
  });

  return app;
}

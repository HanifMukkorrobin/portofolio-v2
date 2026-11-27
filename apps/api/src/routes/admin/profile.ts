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

    const previous = await ensureSiteProfileRow(db);

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

    const staleKeys: string[] = [];
    if (previous.avatarKey && previous.avatarKey !== updated[0].avatarKey) {
      staleKeys.push(previous.avatarKey);
    }
    if (previous.cvPdfKey && previous.cvPdfKey !== updated[0].cvPdfKey) {
      staleKeys.push(previous.cvPdfKey);
    }
    if (staleKeys.length > 0) {
      await Promise.allSettled(staleKeys.map((key) => storage.delete(key)));
    }

    return c.json({ profile: serializeProfile(updated[0], storage) });
  });

  return app;
}

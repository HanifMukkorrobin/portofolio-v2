import { projectPayloadSchema, reorderProjectsSchema } from '@portofolio/shared';
import { asc, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppDb } from '../../db/index.js';
import { projects } from '../../db/schema.js';
import { serializeProject } from '../../lib/serializers.js';
import type { StorageAdapter } from '../../lib/storage/types.js';
import type { AuthEnv } from '../../middleware/auth.js';

const uuidSchema = z.string().uuid();

function isUniqueViolation(err: unknown): boolean {
  const pgErr = err as { code?: string; cause?: { code?: string } };
  return pgErr?.code === '23505' || pgErr?.cause?.code === '23505';
}

export function createAdminProjectRoutes(db: AppDb, storage: StorageAdapter) {
  const app = new Hono<AuthEnv>();

  app.get('/', async (c) => {
    const rows = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.sortOrder), desc(projects.createdAt));

    return c.json({
      projects: rows.map((row) => serializeProject(row, storage))
    });
  });

  app.patch('/reorder', async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = reorderProjectsSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid reorder payload', details: parsed.error.flatten() }, 400);
    }

    await db.transaction(async (tx) => {
      for (const item of parsed.data.items) {
        await tx
          .update(projects)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(projects.id, item.id));
      }
    });

    return c.json({ ok: true });
  });

  app.post('/', async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = projectPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid project payload', details: parsed.error.flatten() }, 400);
    }

    try {
      const inserted = await db
        .insert(projects)
        .values(parsed.data)
        .returning();

      if (!inserted[0]) {
        return c.json({ error: 'Failed to create project' }, 500);
      }

      return c.json({ project: serializeProject(inserted[0], storage) }, 201);
    } catch (err) {
      if (isUniqueViolation(err)) {
        return c.json({ error: `Slug "${parsed.data.slug}" is already in use` }, 409);
      }
      throw err;
    }
  });

  app.get('/:id', async (c) => {
    const id = c.req.param('id');
    if (!uuidSchema.safeParse(id).success) {
      return c.json({ error: 'Invalid project id' }, 400);
    }

    const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!rows[0]) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json({ project: serializeProject(rows[0], storage) });
  });

  app.put('/:id', async (c) => {
    const id = c.req.param('id');
    if (!uuidSchema.safeParse(id).success) {
      return c.json({ error: 'Invalid project id' }, 400);
    }

    const body = await c.req.json().catch(() => null);
    const parsed = projectPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid project payload', details: parsed.error.flatten() }, 400);
    }

    try {
      const updated = await db
        .update(projects)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();

      if (!updated[0]) {
        return c.json({ error: 'Project not found' }, 404);
      }

      return c.json({ project: serializeProject(updated[0], storage) });
    } catch (err) {
      if (isUniqueViolation(err)) {
        return c.json({ error: `Slug "${parsed.data.slug}" is already in use` }, 409);
      }
      throw err;
    }
  });

  app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    if (!uuidSchema.safeParse(id).success) {
      return c.json({ error: 'Invalid project id' }, 400);
    }

    const deleted = await db.delete(projects).where(eq(projects.id, id)).returning();
    const removed = deleted[0];
    if (!removed) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const mediaKeys = [
      ...(removed.coverImageKey ? [removed.coverImageKey] : []),
      ...(removed.galleryImageKeys ?? [])
    ];
    await Promise.allSettled(mediaKeys.map((key) => storage.delete(key)));

    return c.json({ ok: true });
  });

  return app;
}

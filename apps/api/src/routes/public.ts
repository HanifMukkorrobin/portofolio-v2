import { and, asc, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppDb } from '../db/index.js';
import { projects } from '../db/schema.js';
import {
  ensureSiteProfileRow,
  serializeProfile,
  serializeProject
} from '../lib/serializers.js';
import type { StorageAdapter } from '../lib/storage/types.js';

export function createPublicRoutes(db: AppDb, storage: StorageAdapter) {
  const app = new Hono();

  app.get('/public/portfolio', async (c) => {
    const [profileRow, projectRows] = await Promise.all([
      ensureSiteProfileRow(db),
      db
        .select()
        .from(projects)
        .where(eq(projects.status, 'published'))
        .orderBy(asc(projects.sortOrder), desc(projects.createdAt))
    ]);

    return c.json({
      profile: serializeProfile(profileRow, storage),
      projects: projectRows.map((row) => serializeProject(row, storage, { publicMode: true }))
    });
  });

  app.get('/public/projects/:slug', async (c) => {
    const slug = c.req.param('slug');
    const rows = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.status, 'published')))
      .limit(1);

    const project = rows[0];
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json({
      project: serializeProject(project, storage, { publicMode: true })
    });
  });

  app.get('/media/:category/:filename', async (c) => {
    const key = `${c.req.param('category')}/${c.req.param('filename')}`;
    const stored = await storage.read(key);
    if (!stored) {
      return c.json({ error: 'File not found' }, 404);
    }

    const headers: Record<string, string> = {
      'Content-Type': stored.contentType,
      'Content-Length': String(stored.size),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable'
    };

    if (c.req.query('download') === '1') {
      const safeName = (c.req.query('name') ?? c.req.param('filename')).replace(/["\r\n]/g, '');
      headers['Content-Disposition'] = `attachment; filename="${safeName}"`;
    }

    return new Response(new Uint8Array(stored.body), { status: 200, headers });
  });

  return app;
}

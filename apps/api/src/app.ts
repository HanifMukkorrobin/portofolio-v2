import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AppDb } from './db/index.js';
import type { ApiEnv } from './env.js';
import type { StorageAdapter } from './lib/storage/types.js';
import { createRequireAdmin } from './middleware/auth.js';
import { createAdminMediaRoutes } from './routes/admin/media.js';
import { createAdminProfileRoutes } from './routes/admin/profile.js';
import { createAdminProjectRoutes } from './routes/admin/projects.js';
import { createAuthRoutes } from './routes/auth.js';
import { createHealthRoutes } from './routes/health.js';
import { createPublicRoutes } from './routes/public.js';

export interface AppDependencies {
  db: AppDb;
  storage: StorageAdapter;
  env: ApiEnv;
}

export function createApp({ db, storage, env }: AppDependencies) {
  const app = new Hono();

  app.use(
    '/api/*',
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type']
    })
  );

  app.onError((err, c) => {
    console.error('[api error]', err);
    return c.json({ error: 'Internal server error' }, 500);
  });

  app.route('/api', createHealthRoutes(db));
  app.route('/api/auth', createAuthRoutes(db, env));
  app.route('/api', createPublicRoutes(db, storage));

  const requireAdmin = createRequireAdmin(db);
  app.use('/api/admin/*', requireAdmin);
  app.route('/api/admin/profile', createAdminProfileRoutes(db, storage));
  app.route('/api/admin/projects', createAdminProjectRoutes(db, storage));
  app.route('/api/admin', createAdminMediaRoutes(storage));

  return app;
}

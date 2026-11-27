import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { createDb } from './db/index.js';
import { loadEnv } from './env.js';
import { createStorageAdapter } from './lib/storage/index.js';

const env = loadEnv();
const { db, pool } = createDb(env.DATABASE_URL);
const storage = createStorageAdapter(env);
const app = createApp({ db, storage, env });

const server = serve(
  {
    fetch: app.fetch,
    port: env.API_PORT
  },
  (info) => {
    console.log(`[api] listening on http://localhost:${info.port}`);
  }
);

async function shutdown() {
  server.close();
  await pool.end();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

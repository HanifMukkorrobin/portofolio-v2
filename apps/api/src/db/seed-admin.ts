import { eq } from 'drizzle-orm';
import { loginSchema } from '@portofolio/shared';
import { loadEnv } from '../env.js';
import { createDb } from './index.js';
import { adminUsers, siteProfile } from './schema.js';
import { hashPassword } from '../lib/password.js';

async function main() {
  const env = loadEnv();
  const parsed = loginSchema.safeParse({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
  });

  if (!parsed.success) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) in .env before running db:seed:admin.');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  const { db, pool } = createDb(env.DATABASE_URL);
  try {
    const email = parsed.data.email.toLowerCase();
    const passwordHash = await hashPassword(parsed.data.password);

    const existing = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      await db
        .update(adminUsers)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(adminUsers.id, existing[0].id));
      console.log(`Updated existing admin user: ${email}`);
    } else {
      await db.insert(adminUsers).values({ email, passwordHash });
      console.log(`Created admin user: ${email}`);
    }

    await db
      .insert(siteProfile)
      .values({ id: 1 })
      .onConflictDoNothing({ target: siteProfile.id });

    console.log('Ensured clean singleton site_profile row (id=1).');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});

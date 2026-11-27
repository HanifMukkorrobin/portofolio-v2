import { config } from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

config({ path: resolve(process.cwd(), '../../.env') });

export const DEFAULT_DEV_SESSION_SECRET = 'dev-only-insecure-session-secret-change-me';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    API_PORT: z.coerce.number().int().positive().default(3001),
    WEB_ORIGIN: z.string().default('http://localhost:6001'),
    SESSION_SECRET: z
      .string()
      .min(16, 'SESSION_SECRET must be at least 16 characters')
      .default(DEFAULT_DEV_SESSION_SECRET),
    TRUST_PROXY: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    LOCAL_UPLOAD_DIR: z.string().default('./uploads'),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().default('auto'),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_BASE_URL: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && data.SESSION_SECRET === DEFAULT_DEV_SESSION_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SESSION_SECRET'],
        message: 'SESSION_SECRET must be set to a strong non-default secret in production'
      });
    }
  });

export type ApiEnv = z.infer<typeof envSchema>;

export function loadEnv(source: Record<string, string | undefined> = process.env): ApiEnv {
  return envSchema.parse(source);
}

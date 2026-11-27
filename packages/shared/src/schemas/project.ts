import { z } from 'zod';
import { coverKeySchema, galleryKeySchema } from './media.js';

const optionalCoverKey = z
  .string()
  .trim()
  .nullable()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => v === null || coverKeySchema.safeParse(v).success, 'Invalid cover media storage key');

export const projectStatusSchema = z.enum(['draft', 'published']);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

const optionalHttpUrl = z
  .string()
  .trim()
  .nullable()
  .transform((v) => (v === '' ? null : v))
  .refine(
    (val) => val === null || /^https?:\/\/.+/.test(val),
    'Must be a valid http(s) URL'
  );

const optionalDemoRoute = z
  .string()
  .trim()
  .nullable()
  .transform((v) => (v === '' ? null : v))
  .refine(
    (val) => val === null || val.startsWith('/') || /^https?:\/\/.+/.test(val),
    'Must be a relative route path (e.g. /en/demos/...) or valid http(s) URL'
  );

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only');

export const projectPayloadSchema = z
  .object({
    slug: slugSchema,
    status: projectStatusSchema.default('draft'),
    featured: z.boolean().default(false),
    sortOrder: z.number().int().min(0).max(10000).default(0),
    role: z.string().trim().max(120).default(''),
    period: z.string().trim().max(80).default(''),
    techStack: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
    coverImageKey: optionalCoverKey.default(null),
    galleryImageKeys: z.array(galleryKeySchema).max(20).default([]),
    repoUrl: optionalHttpUrl.default(null),
    liveUrl: optionalHttpUrl.default(null),
    demoRoute: optionalDemoRoute.default(null),
    isNda: z.boolean().default(false),
    ndaNoticeEn: z.string().trim().max(500).default(''),
    ndaNoticeId: z.string().trim().max(500).default(''),
    titleEn: z.string().trim().max(180).default(''),
    titleId: z.string().trim().max(180).default(''),
    summaryEn: z.string().trim().max(600).default(''),
    summaryId: z.string().trim().max(600).default(''),
    contentMdEn: z.string().max(100000).default(''),
    contentMdId: z.string().max(100000).default('')
  })
  .superRefine((data, ctx) => {
    if (data.status === 'published') {
      if (data.titleEn.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['titleEn'],
          message: 'English title is required to publish'
        });
      }
      if (data.summaryEn.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['summaryEn'],
          message: 'English summary is required to publish'
        });
      }
    }
  });

export type ProjectPayload = z.infer<typeof projectPayloadSchema>;

export const reorderProjectsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int().min(0).max(10000)
      })
    )
    .min(1)
});

export type ReorderProjectsInput = z.infer<typeof reorderProjectsSchema>;

export interface ProjectRecord extends ProjectPayload {
  id: string;
  coverImageUrl: string | null;
  galleryImageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicPortfolioResponse {
  profile: import('./profile.js').SiteProfile;
  projects: ProjectRecord[];
}

import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (val) =>
      val === '' ||
      val.startsWith('mailto:') ||
      val.startsWith('/') ||
      /^https?:\/\/.+/.test(val),
    'Must be a valid http(s), mailto, or relative URL'
  );

const optionalEmail = z
  .string()
  .trim()
  .refine((val) => val === '' || z.string().email().safeParse(val).success, 'Must be a valid email');

export const serviceItemSchema = z.object({
  titleEn: z.string().trim().min(1, 'English service title is required').max(120),
  titleId: z.string().trim().max(120).default(''),
  descriptionEn: z.string().trim().max(600).default(''),
  descriptionId: z.string().trim().max(600).default('')
});

export type ServiceItem = z.infer<typeof serviceItemSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().trim().max(120).default(''),
  roleEn: z.string().trim().max(160).default(''),
  roleId: z.string().trim().max(160).default(''),
  taglineEn: z.string().trim().max(240).default(''),
  taglineId: z.string().trim().max(240).default(''),
  bioEn: z.string().trim().max(4000).default(''),
  bioId: z.string().trim().max(4000).default(''),
  isAvailable: z.boolean().default(false),
  availabilityEn: z.string().trim().max(160).default(''),
  availabilityId: z.string().trim().max(160).default(''),
  services: z.array(serviceItemSchema).max(12).default([]),
  freelanceCtaEn: z.string().trim().max(200).default(''),
  freelanceCtaId: z.string().trim().max(200).default(''),
  freelanceCtaUrl: optionalUrl.default(''),
  email: optionalEmail.default(''),
  githubUrl: optionalUrl.default(''),
  linkedinUrl: optionalUrl.default(''),
  avatarKey: z.string().trim().nullable().default(null),
  cvPdfKey: z.string().trim().nullable().default(null),
  cvOriginalName: z.string().trim().max(200).nullable().default(null)
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export interface SiteProfile extends UpdateProfileInput {
  id: number;
  avatarUrl: string | null;
  cvPdfUrl: string | null;
  updatedAt: string;
}

/**
 * Resolves a concise display headline and structured role line.
 * Uses explicit role when supplied; otherwise cleanly splits legacy "Role · Positioning" taglines.
 */
export function resolveHeadlineAndRole(
  tagline: string,
  explicitRole?: string | null
): { headline: string; role: string } {
  const cleanTagline = tagline.trim();
  const cleanRole = (explicitRole ?? '').trim();

  if (cleanRole) {
    return { headline: cleanTagline, role: cleanRole };
  }

  const separatorIndex = cleanTagline.indexOf('·');
  if (separatorIndex > 0) {
    const left = cleanTagline.slice(0, separatorIndex).trim();
    const right = cleanTagline.slice(separatorIndex + 1).trim();
    if (left && right) {
      return { headline: right, role: left };
    }
  }

  return { headline: cleanTagline, role: '' };
}

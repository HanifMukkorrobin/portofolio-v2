import { z } from 'zod';

export const UPLOAD_CATEGORIES = ['avatar', 'cover', 'gallery', 'cv'] as const;
export const uploadCategorySchema = z.enum(UPLOAD_CATEGORIES);
export type UploadCategory = z.infer<typeof uploadCategorySchema>;

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif'
] as const;

export const CV_MIME_TYPES = ['application/pdf'] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_CV_BYTES = 10 * 1024 * 1024; // 10 MB

export const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'application/pdf': 'pdf'
};

export const MEDIA_KEY_REGEX =
  /^(?:(?:avatar|cover|gallery)\/[a-f0-9-]+\.(?:jpg|png|webp|avif)|cv\/[a-f0-9-]+\.pdf)$/;

export const mediaKeySchema = z
  .string()
  .trim()
  .regex(MEDIA_KEY_REGEX, 'Invalid media storage key');

export function createCategoryMediaKeySchema(category: UploadCategory) {
  const pattern =
    category === 'cv'
      ? /^cv\/[a-f0-9-]+\.pdf$/
      : new RegExp(`^${category}\\/[a-f0-9-]+\\.(?:jpg|png|webp|avif)$`);
  return z.string().trim().regex(pattern, `Invalid ${category} media storage key`);
}

export const avatarKeySchema = createCategoryMediaKeySchema('avatar');
export const coverKeySchema = createCategoryMediaKeySchema('cover');
export const galleryKeySchema = createCategoryMediaKeySchema('gallery');
export const cvKeySchema = createCategoryMediaKeySchema('cv');

export const deleteMediaSchema = z.object({
  key: mediaKeySchema
});

export interface UploadedMedia {
  key: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

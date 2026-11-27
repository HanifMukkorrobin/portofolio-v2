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

export const deleteMediaSchema = z.object({
  key: z
    .string()
    .trim()
    .regex(
      /^(avatar|cover|gallery|cv)\/[a-f0-9-]+\.(jpg|png|webp|avif|pdf)$/,
      'Invalid media storage key'
    )
});

export interface UploadedMedia {
  key: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

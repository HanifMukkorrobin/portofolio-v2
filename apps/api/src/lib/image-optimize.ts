import type { UploadCategory } from '@portofolio/shared';
import sharp from 'sharp';

const MAX_DIMENSION_BY_CATEGORY: Record<Exclude<UploadCategory, 'cv'>, number> = {
  avatar: 960,
  cover: 1600,
  gallery: 1600
};

/**
 * Resizes and compresses uploaded raster images to prevent multi-megabyte raw uploads
 * from degrading mobile LCP while keeping the original MIME type and file extension intact.
 */
export async function optimizeUploadedImage(input: {
  body: Uint8Array;
  mimeType: string;
  category: Exclude<UploadCategory, 'cv'>;
}): Promise<Uint8Array> {
  const maxDimension = MAX_DIMENSION_BY_CATEGORY[input.category];

  try {
    const base = sharp(input.body).rotate().resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true
    });

    let optimized: Buffer;
    switch (input.mimeType) {
      case 'image/jpeg':
        optimized = await base.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
        break;
      case 'image/webp':
        optimized = await base.webp({ quality: 82 }).toBuffer();
        break;
      case 'image/avif':
        optimized = await base.avif({ quality: 68 }).toBuffer();
        break;
      case 'image/png':
        optimized = await base.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
        break;
      default:
        return input.body;
    }

    return optimized.byteLength < input.body.byteLength ? new Uint8Array(optimized) : input.body;
  } catch {
    return input.body;
  }
}

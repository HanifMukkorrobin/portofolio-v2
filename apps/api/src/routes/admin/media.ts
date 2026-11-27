import {
  CV_MIME_TYPES,
  deleteMediaSchema,
  IMAGE_MIME_TYPES,
  MAX_CV_BYTES,
  MAX_IMAGE_BYTES,
  MIME_TO_EXT,
  uploadCategorySchema
} from '@portofolio/shared';
import { Hono } from 'hono';
import { optimizeUploadedImage } from '../../lib/image-optimize.js';
import { matchesDeclaredMimeType } from '../../lib/media-validation.js';
import type { StorageAdapter } from '../../lib/storage/types.js';
import type { AuthEnv } from '../../middleware/auth.js';

export function createAdminMediaRoutes(storage: StorageAdapter) {
  const app = new Hono<AuthEnv>();

  app.post('/upload', async (c) => {
    const form = await c.req.parseBody();
    const categoryParsed = uploadCategorySchema.safeParse(form.category);
    if (!categoryParsed.success) {
      return c.json({ error: 'Invalid upload category (avatar | cover | gallery | cv)' }, 400);
    }

    const file = form.file;
    if (!(file instanceof File)) {
      return c.json({ error: 'Missing file in multipart form-data' }, 400);
    }

    const category = categoryParsed.data;
    const isCv = category === 'cv';
    const allowedMimes: readonly string[] = isCv ? CV_MIME_TYPES : IMAGE_MIME_TYPES;
    const maxBytes = isCv ? MAX_CV_BYTES : MAX_IMAGE_BYTES;

    if (!allowedMimes.includes(file.type)) {
      return c.json(
        { error: `Unsupported file type "${file.type}". Allowed: ${allowedMimes.join(', ')}` },
        400
      );
    }

    if (file.size === 0 || file.size > maxBytes) {
      return c.json(
        { error: `File size must be between 1 byte and ${Math.floor(maxBytes / (1024 * 1024))} MB` },
        400
      );
    }

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return c.json({ error: 'Unsupported file extension' }, 400);
    }

    const rawBody = new Uint8Array(await file.arrayBuffer());
    if (!matchesDeclaredMimeType(rawBody, file.type)) {
      return c.json({ error: 'File content does not match the declared file type' }, 400);
    }

    let body: Uint8Array;
    if (isCv) {
      body = rawBody;
    } else {
      try {
        body = await optimizeUploadedImage({
          body: rawBody,
          mimeType: file.type,
          category
        });
      } catch {
        return c.json({ error: 'Invalid or corrupted image file' }, 400);
      }
    }
    const key = await storage.save({
      category,
      body,
      ext,
      contentType: file.type
    });

    return c.json(
      {
        media: {
          key,
          url: storage.getPublicUrl(key),
          originalName: file.name,
          size: body.byteLength,
          mimeType: file.type
        }
      },
      201
    );
  });

  app.delete('/media', async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = deleteMediaSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid media key' }, 400);
    }

    await storage.delete(parsed.data.key);
    return c.json({ ok: true });
  });

  return app;
}

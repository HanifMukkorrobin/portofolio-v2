import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { deleteMediaSchema } from '@portofolio/shared';
import type { StorageAdapter, StoredFileRead } from './types.js';

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf'
};

export class LocalDiskStorageAdapter implements StorageAdapter {
  private readonly baseDir: string;

  constructor(uploadDir: string) {
    this.baseDir = resolve(uploadDir);
  }

  private resolveSafePath(key: string): string {
    const parsed = deleteMediaSchema.safeParse({ key });
    if (!parsed.success) {
      throw new Error('Invalid storage key');
    }
    const targetPath = resolve(this.baseDir, parsed.data.key);
    if (!targetPath.startsWith(this.baseDir)) {
      throw new Error('Path traversal rejected');
    }
    return targetPath;
  }

  async save({
    category,
    body,
    ext
  }: {
    category: 'avatar' | 'cover' | 'gallery' | 'cv';
    body: Uint8Array;
    ext: string;
    contentType: string;
  }): Promise<string> {
    const filename = `${randomUUID()}.${ext}`;
    const key = `${category}/${filename}`;
    const dir = join(this.baseDir, category);
    await mkdir(dir, { recursive: true });
    await writeFile(this.resolveSafePath(key), body);
    return key;
  }

  async read(key: string): Promise<StoredFileRead | null> {
    let targetPath: string;
    try {
      targetPath = this.resolveSafePath(key);
    } catch {
      return null;
    }

    try {
      const buffer = await readFile(targetPath);
      const ext = extname(targetPath).toLowerCase();
      return {
        body: new Uint8Array(buffer),
        contentType: EXT_TO_MIME[ext] ?? 'application/octet-stream',
        size: buffer.byteLength
      };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const targetPath = this.resolveSafePath(key);
    try {
      await unlink(targetPath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
  }

  getPublicUrl(key: string): string {
    return `/api/media/${key}`;
  }
}

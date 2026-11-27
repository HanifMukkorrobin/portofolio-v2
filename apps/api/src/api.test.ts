import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ProjectRow } from './db/schema.js';
import { hashPassword, verifyPassword } from './lib/password.js';
import { optimizeUploadedImage } from './lib/image-optimize.js';
import { createRateLimiter } from './lib/rate-limit.js';
import { serializeProject } from './lib/serializers.js';
import { LocalDiskStorageAdapter } from './lib/storage/local.js';

describe('password hashing (scrypt)', () => {
  it('hashes and verifies matching passwords while rejecting mismatches', async () => {
    const hash = await hashPassword('super-secret-password');
    expect(hash).toContain(':');
    expect(await verifyPassword('super-secret-password', hash)).toBe(true);
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });
});

describe('LocalDiskStorageAdapter', () => {
  let tempDir: string;
  let storage: LocalDiskStorageAdapter;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'portofolio-storage-'));
    storage = new LocalDiskStorageAdapter(tempDir);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('saves, reads, and deletes files safely', async () => {
    const content = new TextEncoder().encode('%PDF-1.4 sample');
    const key = await storage.save({
      category: 'cv',
      body: content,
      ext: 'pdf',
      contentType: 'application/pdf'
    });

    expect(key).toMatch(/^cv\/[a-f0-9-]+\.pdf$/);
    expect(storage.getPublicUrl(key)).toBe(`/api/media/${key}`);

    const read = await storage.read(key);
    expect(read).not.toBeNull();
    expect(read?.contentType).toBe('application/pdf');
    expect(read?.size).toBe(content.byteLength);

    await storage.delete(key);
    expect(await storage.read(key)).toBeNull();
  });

  it('rejects path traversal keys', async () => {
    expect(await storage.read('../package.json')).toBeNull();
    await expect(storage.delete('cv/../../etc/passwd')).rejects.toThrow();
  });
});

describe('serializeProject NDA confidentiality', () => {
  const baseRow: ProjectRow = {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'confidential-platform',
    status: 'published',
    featured: true,
    sortOrder: 0,
    role: 'Lead Engineer',
    period: '2025',
    techStack: ['SvelteKit', 'PostgreSQL'],
    coverImageKey: null,
    galleryImageKeys: [],
    repoUrl: 'https://github.com/private/repo',
    liveUrl: 'https://internal.client.example',
    demoRoute: '/en/demos/architecture',
    isNda: true,
    ndaNoticeEn: 'Client details anonymized under NDA.',
    ndaNoticeId: '',
    titleEn: 'Enterprise Platform',
    titleId: '',
    summaryEn: 'High-level system architecture.',
    summaryId: '',
    contentMdEn: '## Architecture',
    contentMdId: '',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z')
  };

  const storage = new LocalDiskStorageAdapter('/tmp');

  it('strips repoUrl and liveUrl in public mode when isNda is true', () => {
    const publicDto = serializeProject(baseRow, storage, { publicMode: true });
    expect(publicDto.repoUrl).toBeNull();
    expect(publicDto.liveUrl).toBeNull();
    expect(publicDto.demoRoute).toBe('/en/demos/architecture');
  });

  it('retains repoUrl and liveUrl in admin mode', () => {
    const adminDto = serializeProject(baseRow, storage, { publicMode: false });
    expect(adminDto.repoUrl).toBe('https://github.com/private/repo');
    expect(adminDto.liveUrl).toBe('https://internal.client.example');
  });
});

describe('login rate limiter', () => {
  it('blocks requests after max attempts and resets cleanly', () => {
    const limiter = createRateLimiter(2, 60_000);
    expect(limiter.consume('ip-1').allowed).toBe(true);
    expect(limiter.consume('ip-1').allowed).toBe(true);
    expect(limiter.consume('ip-1').allowed).toBe(false);
    limiter.reset('ip-1');
    expect(limiter.consume('ip-1').allowed).toBe(true);
  });
});

describe('optimizeUploadedImage', () => {
  it('resizes oversized images down to category bounds and shrinks payload size', async () => {
    const { default: sharp } = await import('sharp');
    const oversized = await sharp({
      create: { width: 2400, height: 1600, channels: 3, background: { r: 220, g: 80, b: 30 } }
    })
      .jpeg({ quality: 100 })
      .toBuffer();

    const optimized = await optimizeUploadedImage({
      body: new Uint8Array(oversized),
      mimeType: 'image/jpeg',
      category: 'avatar'
    });

    const meta = await sharp(optimized).metadata();
    expect(meta.width).toBeLessThanOrEqual(960);
    expect(meta.height).toBeLessThanOrEqual(960);
    expect(optimized.byteLength).toBeLessThan(oversized.byteLength);
  });
});

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ProjectRow } from './db/schema.js';
import { DEFAULT_DEV_SESSION_SECRET, loadEnv } from './env.js';
import { optimizeUploadedImage } from './lib/image-optimize.js';
import { detectMediaMimeType, matchesDeclaredMimeType } from './lib/media-validation.js';
import { hashPassword, verifyPassword } from './lib/password.js';
import { createRateLimiter } from './lib/rate-limit.js';
import { serializeProject } from './lib/serializers.js';
import { hashSessionToken } from './lib/session.js';
import { LocalDiskStorageAdapter } from './lib/storage/local.js';
import { createAdminMediaRoutes } from './routes/admin/media.js';
import { extractClientIpFromForwardedHeader } from './routes/auth.js';

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

  it('prunes expired buckets and caps memory growth', () => {
    let clock = 1_000;
    const limiter = createRateLimiter(2, 10_000, { maxEntries: 3, now: () => clock });
    limiter.consume('ip-a');
    limiter.consume('ip-b');
    expect(limiter.size()).toBe(2);

    clock += 15_000;
    limiter.consume('ip-c');
    expect(limiter.size()).toBe(1);

    limiter.consume('ip-d');
    limiter.consume('ip-e');
    limiter.consume('ip-f');
    expect(limiter.size()).toBeLessThanOrEqual(3);
  });
});

describe('session token HMAC & env security', () => {
  it('hashes session tokens with HMAC keyed by SESSION_SECRET', () => {
    const h1 = hashSessionToken('sample-token', 'secret-a-1234567890');
    const h2 = hashSessionToken('sample-token', 'secret-b-1234567890');
    expect(h1).toHaveLength(64);
    expect(h1).not.toBe(h2);
  });

  it('rejects default insecure SESSION_SECRET in production', () => {
    expect(() =>
      loadEnv({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://localhost/test',
        SESSION_SECRET: DEFAULT_DEV_SESSION_SECRET
      })
    ).toThrow();

    const prodEnv = loadEnv({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://localhost/test',
      SESSION_SECRET: 'a-very-strong-production-secret-key'
    });
    expect(prodEnv.TRUST_PROXY_HOPS).toBe(1);
  });

  it('extracts client IP right-to-left from X-Forwarded-For to prevent client spoofing', () => {
    // Client injected fake IP on the left; trusted 1-hop proxy appended real IP on the right
    expect(extractClientIpFromForwardedHeader('1.1.1.1, 203.0.113.42', 1)).toBe('203.0.113.42');
    // 2 trusted hops (e.g. CDN -> SvelteKit -> API)
    expect(extractClientIpFromForwardedHeader('1.1.1.1, 203.0.113.42, 10.0.0.5', 2)).toBe(
      '203.0.113.42'
    );
    // Disabled when TRUST_PROXY_HOPS=0
    expect(extractClientIpFromForwardedHeader('203.0.113.42', 0)).toBeNull();
  });
});

describe('media magic-byte validation', () => {
  it('detects supported image and PDF signatures and rejects spoofed content', () => {
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const pdfHeader = new TextEncoder().encode('%PDF-1.7\n...');
    const htmlPayload = new TextEncoder().encode('<script>alert(1)</script>');

    expect(detectMediaMimeType(pngHeader)).toBe('image/png');
    expect(detectMediaMimeType(pdfHeader)).toBe('application/pdf');
    expect(detectMediaMimeType(htmlPayload)).toBeNull();
    expect(matchesDeclaredMimeType(htmlPayload, 'image/png')).toBe(false);
    expect(matchesDeclaredMimeType(pdfHeader, 'image/jpeg')).toBe(false);
    expect(matchesDeclaredMimeType(pdfHeader, 'application/pdf')).toBe(true);
  });

  it('rejects spoofed uploads on /upload endpoint with 400', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'portofolio-upload-'));
    try {
      const storage = new LocalDiskStorageAdapter(tempDir);
      const app = createAdminMediaRoutes(storage);

      const form = new FormData();
      form.set('category', 'avatar');
      form.set('file', new File(['<html>not a png</html>'], 'evil.png', { type: 'image/png' }));

      const res = await app.request('/upload', { method: 'POST', body: form });
      expect(res.status).toBe(400);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
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

  it('throws on corrupted image bytes instead of returning raw payload silently', async () => {
    const fakeJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0x00, 0x01, 0x02]);
    await expect(
      optimizeUploadedImage({
        body: fakeJpeg,
        mimeType: 'image/jpeg',
        category: 'avatar'
      })
    ).rejects.toThrow();
  });
});

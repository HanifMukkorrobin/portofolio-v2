import { describe, expect, it } from 'vitest';
import {
  hasMissingIndonesianTranslation,
  isLocale,
  projectPayloadSchema,
  resolveHeadlineAndRole,
  resolveLocalized,
  updateProfileSchema
} from './index.js';

describe('i18n helpers', () => {
  it('validates supported locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('id')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('falls back to English when Indonesian is empty or whitespace', () => {
    expect(resolveLocalized('Hello', 'Halo', 'id')).toBe('Halo');
    expect(resolveLocalized('Hello', '', 'id')).toBe('Hello');
    expect(resolveLocalized('Hello', '   ', 'id')).toBe('Hello');
    expect(resolveLocalized('Hello', null, 'id')).toBe('Hello');
    expect(resolveLocalized('Hello', 'Halo', 'en')).toBe('Hello');
  });

  it('detects missing Indonesian translations when English content exists', () => {
    expect(
      hasMissingIndonesianTranslation([
        { en: 'Title', id: 'Judul' },
        { en: 'Summary', id: '' }
      ])
    ).toBe(true);

    expect(
      hasMissingIndonesianTranslation([
        { en: 'Title', id: 'Judul' },
        { en: '', id: '' }
      ])
    ).toBe(false);
  });
});

describe('projectPayloadSchema', () => {
  it('allows draft projects with incomplete English fields', () => {
    const parsed = projectPayloadSchema.safeParse({
      slug: 'my-draft-project',
      status: 'draft'
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects published projects without English title and summary', () => {
    const parsed = projectPayloadSchema.safeParse({
      slug: 'my-live-project',
      status: 'published',
      titleEn: '',
      summaryEn: ''
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts published projects with English fields even when Indonesian is empty', () => {
    const parsed = projectPayloadSchema.safeParse({
      slug: 'shipped-app',
      status: 'published',
      titleEn: 'Shipped App',
      summaryEn: 'A real production system.',
      demoRoute: '/en/demos/grid'
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid slugs', () => {
    const parsed = projectPayloadSchema.safeParse({
      slug: 'Invalid Slug!',
      status: 'draft'
    });
    expect(parsed.success).toBe(false);
  });
});

describe('resolveHeadlineAndRole', () => {
  it('prefers explicit role when provided', () => {
    expect(
      resolveHeadlineAndRole('Engineering Resilient Web Systems', 'Senior Frontend Engineer')
    ).toEqual({
      headline: 'Engineering Resilient Web Systems',
      role: 'Senior Frontend Engineer'
    });
  });

  it('splits legacy "Role · Positioning" taglines when explicit role is empty', () => {
    expect(
      resolveHeadlineAndRole(
        'Senior Frontend & Mobile Engineer · Geospatial, High-Scale Web & Legacy Re-Engineering',
        ''
      )
    ).toEqual({
      headline: 'Geospatial, High-Scale Web & Legacy Re-Engineering',
      role: 'Senior Frontend & Mobile Engineer'
    });
  });

  it('keeps tagline intact when no separator or explicit role exists', () => {
    expect(resolveHeadlineAndRole('Systems Built for Clarity', '')).toEqual({
      headline: 'Systems Built for Clarity',
      role: ''
    });
  });
});

describe('media key schema validation', () => {
  it('accepts valid category-scoped keys on profile and project payloads', () => {
    const profileParsed = updateProfileSchema.safeParse({
      avatarKey: 'avatar/123e4567-e89b-12d3-a456-426614174000.webp',
      cvPdfKey: 'cv/123e4567-e89b-12d3-a456-426614174000.pdf'
    });
    expect(profileParsed.success).toBe(true);

    const projectParsed = projectPayloadSchema.safeParse({
      slug: 'media-valid',
      status: 'draft',
      coverImageKey: 'cover/123e4567-e89b-12d3-a456-426614174000.jpg',
      galleryImageKeys: ['gallery/123e4567-e89b-12d3-a456-426614174000.png']
    });
    expect(projectParsed.success).toBe(true);
  });

  it('rejects traversal, wrong category, or invalid extension keys', () => {
    expect(
      updateProfileSchema.safeParse({ avatarKey: '../etc/passwd' }).success
    ).toBe(false);
    expect(
      updateProfileSchema.safeParse({
        avatarKey: 'cv/123e4567-e89b-12d3-a456-426614174000.pdf'
      }).success
    ).toBe(false);
    expect(
      updateProfileSchema.safeParse({
        cvPdfKey: 'cv/123e4567-e89b-12d3-a456-426614174000.png'
      }).success
    ).toBe(false);
    expect(
      projectPayloadSchema.safeParse({
        slug: 'bad-media',
        status: 'draft',
        coverImageKey: 'gallery/123e4567-e89b-12d3-a456-426614174000.jpg'
      }).success
    ).toBe(false);
    expect(
      projectPayloadSchema.safeParse({
        slug: 'bad-gallery',
        status: 'draft',
        galleryImageKeys: ['gallery/../../secret.png']
      }).success
    ).toBe(false);
  });
});

import type { ProjectRecord, SiteProfile } from '@portofolio/shared';
import { eq } from 'drizzle-orm';
import type { AppDb } from '../db/index.js';
import { siteProfile, type ProjectRow, type SiteProfileRow } from '../db/schema.js';
import type { StorageAdapter } from './storage/types.js';

export async function ensureSiteProfileRow(db: AppDb): Promise<SiteProfileRow> {
  const rows = await db.select().from(siteProfile).where(eq(siteProfile.id, 1)).limit(1);
  if (rows[0]) return rows[0];

  const inserted = await db
    .insert(siteProfile)
    .values({ id: 1 })
    .onConflictDoNothing({ target: siteProfile.id })
    .returning();

  if (inserted[0]) return inserted[0];

  const fallback = await db.select().from(siteProfile).where(eq(siteProfile.id, 1)).limit(1);
  if (!fallback[0]) {
    throw new Error('Failed to initialize site_profile singleton row');
  }
  return fallback[0];
}

export function serializeProfile(row: SiteProfileRow, storage: StorageAdapter): SiteProfile {
  return {
    id: row.id,
    displayName: row.displayName,
    roleEn: row.roleEn,
    roleId: row.roleId,
    taglineEn: row.taglineEn,
    taglineId: row.taglineId,
    bioEn: row.bioEn,
    bioId: row.bioId,
    isAvailable: row.isAvailable,
    availabilityEn: row.availabilityEn,
    availabilityId: row.availabilityId,
    services: row.services ?? [],
    freelanceCtaEn: row.freelanceCtaEn,
    freelanceCtaId: row.freelanceCtaId,
    freelanceCtaUrl: row.freelanceCtaUrl,
    email: row.email,
    githubUrl: row.githubUrl,
    linkedinUrl: row.linkedinUrl,
    avatarKey: row.avatarKey,
    avatarUrl: row.avatarKey ? storage.getPublicUrl(row.avatarKey) : null,
    cvPdfKey: row.cvPdfKey,
    cvPdfUrl: row.cvPdfKey ? storage.getPublicUrl(row.cvPdfKey) : null,
    cvOriginalName: row.cvOriginalName,
    updatedAt: row.updatedAt.toISOString()
  };
}

export function serializeProject(
  row: ProjectRow,
  storage: StorageAdapter,
  options: { publicMode?: boolean } = {}
): ProjectRecord {
  const hideConfidentialLinks = Boolean(options.publicMode && row.isNda);
  const galleryKeys = row.galleryImageKeys ?? [];

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    featured: row.featured,
    sortOrder: row.sortOrder,
    role: row.role,
    period: row.period,
    techStack: row.techStack ?? [],
    coverImageKey: row.coverImageKey,
    coverImageUrl: row.coverImageKey ? storage.getPublicUrl(row.coverImageKey) : null,
    galleryImageKeys: galleryKeys,
    galleryImageUrls: galleryKeys.map((k) => storage.getPublicUrl(k)),
    repoUrl: hideConfidentialLinks ? null : row.repoUrl,
    liveUrl: hideConfidentialLinks ? null : row.liveUrl,
    demoRoute: row.demoRoute,
    isNda: row.isNda,
    ndaNoticeEn: row.ndaNoticeEn,
    ndaNoticeId: row.ndaNoticeId,
    titleEn: row.titleEn,
    titleId: row.titleId,
    summaryEn: row.summaryEn,
    summaryId: row.summaryId,
    contentMdEn: row.contentMdEn,
    contentMdId: row.contentMdId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

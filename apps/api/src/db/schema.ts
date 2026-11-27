import type { ServiceItem } from '@portofolio/shared';
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';

export const projectStatusEnum = pgEnum('project_status', ['draft', 'published']);

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => adminUsers.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const siteProfile = pgTable('site_profile', {
  id: integer('id').primaryKey().default(1),
  displayName: text('display_name').notNull().default(''),
  roleEn: text('role_en').notNull().default(''),
  roleId: text('role_id').notNull().default(''),
  taglineEn: text('tagline_en').notNull().default(''),
  taglineId: text('tagline_id').notNull().default(''),
  bioEn: text('bio_en').notNull().default(''),
  bioId: text('bio_id').notNull().default(''),
  isAvailable: boolean('is_available').notNull().default(false),
  availabilityEn: text('availability_en').notNull().default(''),
  availabilityId: text('availability_id').notNull().default(''),
  services: jsonb('services').$type<ServiceItem[]>().notNull().default([]),
  freelanceCtaEn: text('freelance_cta_en').notNull().default(''),
  freelanceCtaId: text('freelance_cta_id').notNull().default(''),
  freelanceCtaUrl: text('freelance_cta_url').notNull().default(''),
  email: text('email').notNull().default(''),
  githubUrl: text('github_url').notNull().default(''),
  linkedinUrl: text('linkedin_url').notNull().default(''),
  avatarKey: text('avatar_key'),
  cvPdfKey: text('cv_pdf_key'),
  cvOriginalName: text('cv_original_name'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  status: projectStatusEnum('status').notNull().default('draft'),
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  role: text('role').notNull().default(''),
  period: text('period').notNull().default(''),
  techStack: jsonb('tech_stack').$type<string[]>().notNull().default([]),
  coverImageKey: text('cover_image_key'),
  galleryImageKeys: jsonb('gallery_image_keys').$type<string[]>().notNull().default([]),
  repoUrl: text('repo_url'),
  liveUrl: text('live_url'),
  demoRoute: text('demo_route'),
  isNda: boolean('is_nda').notNull().default(false),
  ndaNoticeEn: text('nda_notice_en').notNull().default(''),
  ndaNoticeId: text('nda_notice_id').notNull().default(''),
  titleEn: text('title_en').notNull().default(''),
  titleId: text('title_id').notNull().default(''),
  summaryEn: text('summary_en').notNull().default(''),
  summaryId: text('summary_id').notNull().default(''),
  contentMdEn: text('content_md_en').notNull().default(''),
  contentMdId: text('content_md_id').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export type SiteProfileRow = typeof siteProfile.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;

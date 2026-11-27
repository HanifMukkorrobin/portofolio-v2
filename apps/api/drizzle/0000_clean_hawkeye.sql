CREATE TYPE "public"."project_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"period" text DEFAULT '' NOT NULL,
	"tech_stack" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cover_image_key" text,
	"gallery_image_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"repo_url" text,
	"live_url" text,
	"demo_route" text,
	"is_nda" boolean DEFAULT false NOT NULL,
	"nda_notice_en" text DEFAULT '' NOT NULL,
	"nda_notice_id" text DEFAULT '' NOT NULL,
	"title_en" text DEFAULT '' NOT NULL,
	"title_id" text DEFAULT '' NOT NULL,
	"summary_en" text DEFAULT '' NOT NULL,
	"summary_id" text DEFAULT '' NOT NULL,
	"content_md_en" text DEFAULT '' NOT NULL,
	"content_md_id" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "site_profile" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"display_name" text DEFAULT '' NOT NULL,
	"role_en" text DEFAULT '' NOT NULL,
	"role_id" text DEFAULT '' NOT NULL,
	"tagline_en" text DEFAULT '' NOT NULL,
	"tagline_id" text DEFAULT '' NOT NULL,
	"bio_en" text DEFAULT '' NOT NULL,
	"bio_id" text DEFAULT '' NOT NULL,
	"is_available" boolean DEFAULT false NOT NULL,
	"availability_en" text DEFAULT '' NOT NULL,
	"availability_id" text DEFAULT '' NOT NULL,
	"services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"freelance_cta_en" text DEFAULT '' NOT NULL,
	"freelance_cta_id" text DEFAULT '' NOT NULL,
	"freelance_cta_url" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"github_url" text DEFAULT '' NOT NULL,
	"linkedin_url" text DEFAULT '' NOT NULL,
	"avatar_key" text,
	"cv_pdf_key" text,
	"cv_original_name" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
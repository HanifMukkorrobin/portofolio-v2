# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- **Monorepo (`pnpm workspaces`)**:
  - `apps/web`: **SvelteKit (TypeScript) + Tailwind CSS** — SSR for public portfolio routes (`/en`, `/id`) to maximize SEO and fast reading, plus the integrated `/admin` dashboard.
  - `apps/api`: **Node.js + Hono (`@hono/node-server`) + Drizzle ORM + local PostgreSQL** (`DATABASE_URL`, with optional `docker-compose.yml`) — REST API, session auth, validation, and file uploads.
  - `packages/shared`: Shared **Zod** schemas, TypeScript types, and i18n helpers/constants shared across `web` and `api`.
- **Authentication**: Single-owner email + password (strong password hashing) with **HttpOnly Session Cookie** stored in PostgreSQL. No public registration page; the initial admin account is created via CLI seed script (`pnpm db:seed:admin`).
- **Media Storage**: Local disk default (`apps/api/uploads`) wrapped behind a thin `StorageAdapter` interface so production can switch to S3-compatible storage (Cloudflare R2 / S3 / MinIO) via environment variables.
- **Deploy Target**: Undecided (self-hostable Node + Postgres or managed Node + Postgres + S3/R2).

## Users

- **Hiring teams & recruiters** evaluating the owner for a full-time full-stack or frontend engineering role — scanning shipped products, technical depth, GitHub code, work history, and CV/resume to decide whether to move forward.
- **Prospective freelance / project clients** deciding whether to commission the owner — looking for reliable shipped outcomes, clear scope of services, freelance CTA, and direct ways to start a conversation.
- **Portfolio owner (single admin)** — managing profile content, services, freelance CTA, CV PDF, and projects/case studies live via `/admin` without rebuilding or redeploying.
- Public audiences may read in **English (EN)** or **Indonesian (ID)**.

## Product Purpose

A personal full-stack web portfolio paired with a lean single-owner `/admin` panel. The public site showcases shipped products, inspectable code, interactive demos (linked to static playground routes in the codebase), work history, services, and a downloadable CV/resume so hiring teams and prospective freelance clients can verify real engineering capability quickly and reach out directly via email, LinkedIn, or GitHub. The `/admin` panel enables instant, database-backed content updates for Profile and Projects/Case Studies.

## Positioning

Anchored in real full-stack and frontend engineering craft demonstrated through shipped products, source code, and interactive demos rather than static claims. A specific personal differentiator or headline positioning statement is still an open decision and must be supplied by the owner rather than invented.

## Operating Context

- Supports two evaluation speeds: fast screening (overview of role, services/availability, top shipped work, CV/resume, and direct contact links) and deeper technical inspection (Markdown case studies, linked static playground demos, and GitHub repositories).
- Operates bilingually via URL prefixes **`/en`** (default landing language; `/` redirects to `/en` while respecting remembered user preference via cookie/localStorage) and **`/id`**.
- Primary outreach happens directly through external channels: **email**, **LinkedIn**, and **GitHub** (no contact form or admin inbox in V1).
- Live content management happens in `/admin` with `draft` / `published` workflow, manual `sortOrder`, `EN` & `ID` editor tabs, Markdown editing with live preview, and direct image/CV upload.
- Visual direction: **Technical Editorial / Engineering Craft** (crisp sans-serif + monospace metadata/tech stack, structured grid, high contrast, Light & Dark mode toggle) for the public site, paired with a clean utilitarian Tailwind UI for `/admin`.

## Capabilities and Constraints

- **V1 Lean Scope (YAGNI)**:
  - **Managed in `/admin` (PostgreSQL via Drizzle)**:
    1. **Profile & Site Settings**: Display name, tagline/positioning (`EN`/`ID`), bio (`EN`/`ID`), availability status (`EN`/`ID` + toggle), **Services** (`EN`/`ID`), **Freelance CTA** (`EN`/`ID` + target link/mailto), contact/social links (email, GitHub, LinkedIn), avatar image, and **1 single CV PDF slot**.
    2. **Projects & Case Studies**: Structured metadata (`slug`, `status`: `draft` | `published`, `featured`, `sortOrder`, `role`, `period`, `techStack`, cover & gallery images, `repoUrl`, `liveUrl`, optional `demoRoute` path/URL pointing to a static playground route in the codebase — no embedded sandbox/code editor), bilingual content (`EN`/`ID`: `title`, `summary`, `contentMarkdown` with live preview in `/admin` and sanitized rendering publicly), and NDA settings.
  - **Static in codebase (`TS/JSON`, bilingual `EN`/`ID`)**:
    - **Work History** and **Skills / Tech Stack** (kept out of `/admin` CRUD in V1 to stay lean).
  - **Explicitly out of scope for V1**:
    - Blog / Technical Articles, Education / Certifications, Testimonials, Contact Form + Admin Inbox, per-project NDA passcodes, multi-language CV PDF slots, and interactive sandbox editors in `/admin`.
- **Bilingual support (`EN` / `ID`)**:
  - Default language is **English (`/en`)**; Indonesian lives at **`/id`**.
  - In `/admin`, `EN` is required to publish; if `ID` fields are left blank, the public `/id` route falls back automatically to `EN`, and `/admin` displays an untranslated indicator badge.
- **NDA constraints**:
  - Public limited NDA mode (no passcode): `isNda` toggle + optional `ndaNotice` (`EN`/`ID`). When active, displays an NDA badge, hides or anonymizes client names, repo URLs, live URLs, and confidential artifacts, and focuses case studies on architecture, role, constraints, and high-level contribution.
- **No fabricated content**:
  - The application starts in a **clean empty state** (plus CLI admin seed and empty/commented static Work History & Skills templates). Never invent placeholder case studies, metrics, testimonials, or clients.
- **Open decisions (undecided — ask or gather before shipping final copy)**:
  - Owner's display name, brand/handle, domain, and voice guidelines.
  - Specific personal positioning angle / tagline and Services list.
  - Final real project list, NDA anonymization boundaries per project, and static playground demos.
  - Concrete contact URLs/handles (email, LinkedIn, GitHub), real Work History/Skills entries, and CV PDF file.
  - Final production hosting/deploy target and S3/R2 storage provider.

## Evidence on Hand

- **Ready off-repo (to be entered via `/admin` or static config by the owner)**:
  - Selected project case studies, live demo links, and GitHub repositories.
  - Bio, work history, services, and CV / resume PDF.
- **Restricted**:
  - NDA-covered projects requiring anonymized or high-level framing.
- **Not yet on hand (must not be fabricated)**:
  - Additional project entries still being compiled.
  - Actual file paths, live URLs, and contact addresses (none are committed to the repository yet).
  - Client testimonials, press mentions, third-party endorsements, or unverified impact metrics.

## Product Principles

1. **Proof over self-description** — Let shipped products, live interactive demos, and inspectable code carry credibility instead of generic skill claims.
2. **Respect NDA boundaries while preserving engineering substance** — Explain architecture, constraints, and contribution on confidential work without leaking restricted identities or assets.
3. **Never fabricate missing evidence** — Ship in a clean empty state until real owner bio, projects, work history, and links are supplied; never fill gaps with invented copy or metrics.
4. **Serve both evaluators without friction** — Give hiring teams direct access to code depth, work history, and CV while giving prospective clients clear services, proof of delivery, and direct contact paths.
5. **First-class bilingual UX with pragmatic publishing** — Maintain clean `/en` and `/id` routing with automatic fallback to `EN` when `ID` copy is pending.
6. **Lean V1 discipline (YAGNI)** — Keep the admin panel and schema focused strictly on what is needed now, avoiding speculative features and unnecessary complexity.

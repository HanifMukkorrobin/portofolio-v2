# Project Guidelines (`portofolio`)

Panduan konteks proyek dan aturan kerja wajib untuk setiap sesi AI agent di repositori **portofolio**.

> **Wajib dibaca di awal sesi**: Selalu baca `AGENTS.md` ini dan `PRODUCT.md` sebelum membuat rencana atau menyentuh kode agar konteks proyek selalu sinkron.

## Protokol Kerja Agen (Wajib Dipatuhi Tanpa Pengecualian)

1. **Prinsip YAGNI (You Aren't Gonna Need It)**: Hanya bangun fitur dan kode yang benar-benar dibutuhkan saat ini. Jangan menambahkan abstraksi, modul, atau fitur spekulatif untuk kebutuhan masa depan.
2. **Jangan Over-Engineer**: Gunakan solusi yang paling sederhana, langsung, dan mudah dipelihara.
3. **Dilarang Improvisasi Tanpa Klarifikasi**: Jangan pernah menambahkan fitur tambahan, mengubah alur, atau membuat asumsi sepihak di luar yang telah disepakati bersama pengguna.
4. **Wajib Planning Sebelum Menyentuh Kode**: Selalu buat dan paparkan rencana kerja (*plan*) yang jelas sebelum membuat atau memodifikasi file kode apa pun.
5. **Selalu Minta Klarifikasi untuk Hal Ambigu**: Jika menemukan instruksi, kontrak data, atau kebutuhan yang kurang jelas/ambigu, berhenti dan tanyakan kepada pengguna terlebih dahulu.
6. **Tunggu Konfirmasi Pengguna**: Jangan langsung mengeksekusi penulisan/perubahan kode sebelum pengguna memberikan persetujuan/konfirmasi atas rencana yang diajukan.
7. **Gunakan Skill Impeccable**: Wajib gunakan skill `impeccable` (`.agents/skills/impeccable/SKILL.md`) selama proses development yang berhubungan dengan UI, desain, layout, tipografi, interaksi, maupun review tampilan.
8. **Prinsip Clean Code**: Tulis kode yang bersih, terstruktur, mudah dibaca, penamaan deskriptif, fungsi fokus pada satu tanggung jawab, dan minim kompleksitas yang tidak perlu.
9. **Prinsip Reusable**: Jangan selalu membuat fungsi, komponen UI, schema, atau helper baru jika sebelumnya sudah ada — selalu periksa codebase terlebih dahulu dan gunakan ulang atau perluas secara bersih yang sudah tersedia.

## Project Overview & Konteks Arsitektur

- **Nama Proyek**: Portofolio + Single-Owner Admin Panel (V1)
- **Status**: Implementasi V1 selesai dibangun & terverifikasi (`pnpm check`, `pnpm test`, `pnpm build`, dan `impeccable detect` bersih); siap koneksi `.env` PostgreSQL lokal untuk `pnpm db:push` & `pnpm db:seed:admin`.
- **Tujuan**: Web portofolio bilingual (`EN`/`ID`) untuk full-stack / frontend engineer beserta halaman `/admin` kustom untuk mengelola konten secara live.
- **Tech Stack**:
  - **Monorepo**: `pnpm workspaces`
  - **`apps/web`**: SvelteKit (TypeScript) + Tailwind CSS (SSR untuk halaman publik `/en`, `/id`, dan dashboard `/admin`)
  - **`apps/api`**: Node.js + Hono (`@hono/node-server`) + Drizzle ORM + PostgreSQL lokal (`DATABASE_URL`, opsional `docker-compose.yml`)
  - **`packages/shared`**: Zod schemas, TypeScript types, dan konstanta/helper i18n bersama
- **Autentikasi Admin**: Single-owner email + password dengan **HttpOnly Session Cookie** yang disimpan di PostgreSQL. Tanpa halaman signup publik; akun admin pertama dibuat lewat CLI seed script (`pnpm db:seed:admin`).
- **Storage Media**: Local disk default (`apps/api/uploads`) dibungkus `StorageAdapter` tipis agar siap beralih ke S3 / Cloudflare R2 / MinIO via environment variables.

## Batasan Scope V1 (Kontrak Produk)

- **Dikelola via `/admin` (PostgreSQL)**:
  - **Profil & Site Settings**: nama tampilan, tagline/positioning (`EN`/`ID`), bio (`EN`/`ID`), status availability (`EN`/`ID` + toggle), **Services** (`EN`/`ID`), **Freelance CTA** (`EN`/`ID` + link), link sosial/kontak (Email, GitHub, LinkedIn), avatar, dan **1 slot CV PDF tunggal**.
  - **Projects & Case Studies**: `slug`, `status` (`draft` | `published`), `featured`, `sortOrder`, `role`, `period`, `techStack`, cover & galeri, `repoUrl`, `liveUrl`, `demoRoute` (path/URL ke route playground statis di codebase — **jangan** buat upload/sandbox editor), mode **NDA** (`isNda` + `ndaNotice` `EN`/`ID`, **tanpa passcode**), serta narasi **Markdown dengan live preview** di `/admin` (dirender aman/ter-sanitasi di publik).
- **Statis di Codebase (`TS/JSON`, bilingual `EN`/`ID`)**:
  - **Work History** dan **Skills / Tech Stack**.
- **Eksplisit Di-skip di V1 (Jangan Ditambahkan)**:
  - Blog / Technical Articles, Pendidikan / Sertifikasi, Testimoni, Contact Form + Admin Inbox (kontak cukup link langsung Email/LinkedIn/GitHub), NDA passcode, slot CV multi-bahasa, dan sandbox demo editor.
- **Bilingual (`EN` / `ID`)**:
  - Route prefix `/en` (default, `/` redirect ke `/en` dengan menyimpan preferensi user via cookie/localStorage) dan `/id`.
  - Di `/admin`, tab `EN` & `ID`: `EN` wajib diisi untuk publish; bila `ID` kosong, halaman publik otomatis fallback ke `EN` dan `/admin` menampilkan indikator belum diterjemahkan.
- **Arah Visual**:
  - Publik: *Technical Editorial / Engineering Craft* (sans-serif bersih + monospace metadata/tech stack, grid rapi, kontras tinggi, Light & Dark mode toggle).
  - `/admin`: Clean utilitarian dashboard yang selaras dengan Tailwind CSS.
- **No Fabricated Content**:
  - Mulai dari **clean empty state** (tanpa proyek, klien, testimoni, atau metrik fiktif). Hanya tampilkan konten nyata yang diinput pemilik.

## Commands

Perintah monorepo yang sudah aktif di `package.json`:

- **Install dependencies**: `pnpm install`
- **Development server**: `pnpm dev` (menjalankan `apps/api` di `:3001` dan `apps/web` di `:6001` secara paralel)
- **Database generate / push / migrate**: `pnpm db:generate` / `pnpm db:push` / `pnpm db:migrate`
- **Seed admin pertama**: `pnpm db:seed:admin` (membaca `ADMIN_EMAIL` & `ADMIN_PASSWORD` dari `.env`)
- **Build**: `pnpm build`
- **Typecheck & Unit Tests**: `pnpm check` / `pnpm test`

## Coding Conventions

- Jaga kode tetap modular, ringkas, dan mudah dipelihara (Clean Code & Reusable).
- Jangan duplikasi logika; manfaatkan `packages/shared` untuk schema Zod, tipe data, dan helper bersama antara `apps/web` dan `apps/api`.
- Pastikan seluruh input API tervalidasi dengan Zod dan output Markdown di halaman publik ter-sanitasi dari XSS.
- Pertahankan komentar dan dokumentasi yang sudah ada kecuali diminta diubah.
- Hindari menaruh secret, API key, atau kredensial langsung di dalam kode maupun file konfigurasi `.agents/` (gunakan `.env` yang ter-ignore git + sediakan `.env.example`).

## Workspace Customizations (`.agents/`)

- **Skills**: Skill spesifik proyek berada di `.agents/skills/<skill-name>/SKILL.md` (termasuk `impeccable` yang wajib digunakan untuk pekerjaan UI).
- **MCP Servers**: Konfigurasi MCP server khusus proyek berada di `.agents/plugins/project-mcp/mcp_config.json`.

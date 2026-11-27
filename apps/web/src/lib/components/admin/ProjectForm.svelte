<script lang="ts">
  import {
    hasMissingIndonesianTranslation,
    type Locale,
    type ProjectPayload,
    type ProjectRecord,
    type UploadedMedia
  } from '@portofolio/shared';
  import { untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '$lib/api/client';
  import BilingualTabs from '$lib/components/admin/BilingualTabs.svelte';
  import MarkdownEditor from '$lib/components/admin/MarkdownEditor.svelte';
  import MediaUploader from '$lib/components/admin/MediaUploader.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';

  let {
    mode,
    initial
  }: {
    mode: 'create' | 'edit';
    initial?: ProjectRecord;
  } = $props();

  let activeLocale = $state<Locale>('en');
  let saving = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');

  const seed = untrack(() => initial);
  let slug = $state(seed?.slug ?? '');
  let status = $state<'draft' | 'published'>(seed?.status ?? 'draft');
  let featured = $state(seed?.featured ?? false);
  let sortOrder = $state(seed?.sortOrder ?? 0);
  let role = $state(seed?.role ?? '');
  let period = $state(seed?.period ?? '');
  let techStackText = $state((seed?.techStack ?? []).join(', '));
  let coverImageKey = $state<string | null>(seed?.coverImageKey ?? null);
  let coverImageUrl = $state<string | null>(seed?.coverImageUrl ?? null);
  let galleryItems = $state<Array<{ key: string; url: string }>>(
    (seed?.galleryImageKeys ?? []).map((key, idx) => ({
      key,
      url: seed?.galleryImageUrls[idx] ?? `/api/media/${key}`
    }))
  );
  let repoUrl = $state(seed?.repoUrl ?? '');
  let liveUrl = $state(seed?.liveUrl ?? '');
  let demoRoute = $state(seed?.demoRoute ?? '');
  let isNda = $state(seed?.isNda ?? false);
  let ndaNoticeEn = $state(seed?.ndaNoticeEn ?? '');
  let ndaNoticeId = $state(seed?.ndaNoticeId ?? '');
  let titleEn = $state(seed?.titleEn ?? '');
  let titleId = $state(seed?.titleId ?? '');
  let summaryEn = $state(seed?.summaryEn ?? '');
  let summaryId = $state(seed?.summaryId ?? '');
  let contentMdEn = $state(seed?.contentMdEn ?? '');
  let contentMdId = $state(seed?.contentMdId ?? '');

  let missingId = $derived(
    hasMissingIndonesianTranslation([
      { en: titleEn, id: titleId },
      { en: summaryEn, id: summaryId },
      { en: contentMdEn, id: contentMdId },
      ...(isNda ? [{ en: ndaNoticeEn, id: ndaNoticeId }] : [])
    ])
  );

  function generateSlugFromTitle() {
    if (!titleEn.trim()) return;
    slug = titleEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function handleCoverUploaded(media: UploadedMedia) {
    coverImageKey = media.key;
    coverImageUrl = media.url;
  }

  function handleGalleryUploaded(media: UploadedMedia) {
    galleryItems = [...galleryItems, { key: media.key, url: media.url }];
  }

  async function removeGalleryItem(key: string) {
    galleryItems = galleryItems.filter((item) => item.key !== key);
    await apiRequest('/api/admin/media', {
      method: 'DELETE',
      body: JSON.stringify({ key })
    }).catch(() => {});
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errorMsg = '';
    successMsg = '';
    saving = true;

    const techStack = techStackText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: ProjectPayload = {
      slug: slug.trim(),
      status,
      featured,
      sortOrder: Number(sortOrder) || 0,
      role: role.trim(),
      period: period.trim(),
      techStack,
      coverImageKey,
      galleryImageKeys: galleryItems.map((i) => i.key),
      repoUrl: repoUrl.trim() || null,
      liveUrl: liveUrl.trim() || null,
      demoRoute: demoRoute.trim() || null,
      isNda,
      ndaNoticeEn: ndaNoticeEn.trim(),
      ndaNoticeId: ndaNoticeId.trim(),
      titleEn: titleEn.trim(),
      titleId: titleId.trim(),
      summaryEn: summaryEn.trim(),
      summaryId: summaryId.trim(),
      contentMdEn,
      contentMdId
    };

    try {
      if (mode === 'create') {
        const res = await apiRequest<{ project: ProjectRecord }>('/api/admin/projects', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        await goto(`/admin/projects/${res.project.id}`);
      } else if (initial) {
        await apiRequest<{ project: ProjectRecord }>(`/api/admin/projects/${initial.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        successMsg = 'Project saved.';
      }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Failed to save project';
    } finally {
      saving = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-8">
  {#if errorMsg}
    <div role="alert" class="border border-[var(--spot-accent)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--spot-accent)]">
      {errorMsg}
    </div>
  {/if}
  {#if successMsg}
    <div role="status" aria-live="polite" class="border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-primary)]">
      {successMsg}
    </div>
  {/if}

  <!-- Bilingual Content Section -->
  <section class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
    <BilingualTabs bind:active={activeLocale} {missingId} />

    {#if activeLocale === 'en'}
      <div class="mt-5 space-y-5">
        <div>
          <label for="titleEn" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Title (EN) *
          </label>
          <input
            id="titleEn"
            type="text"
            bind:value={titleEn}
            placeholder="e.g. Distributed Settlement Platform"
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label for="summaryEn" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Summary (EN) *
          </label>
          <textarea
            id="summaryEn"
            rows={3}
            bind:value={summaryEn}
            placeholder="Concise engineering summary shown on cards and case study header."
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
          ></textarea>
        </div>

        <MarkdownEditor id="contentMdEn" label="Case Study Narrative (EN · Markdown)" bind:value={contentMdEn} />

        {#if isNda}
          <div>
            <label for="ndaNoticeEn" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
              NDA Notice (EN · Optional)
            </label>
            <textarea
              id="ndaNoticeEn"
              rows={2}
              bind:value={ndaNoticeEn}
              placeholder="Leave blank to use default NDA disclosure notice."
              class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
            ></textarea>
          </div>
        {/if}
      </div>
    {:else}
      <div class="mt-5 space-y-5">
        <div>
          <label for="titleId" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Judul (ID · Opsional, fallback ke EN)
          </label>
          <input
            id="titleId"
            type="text"
            bind:value={titleId}
            placeholder={titleEn || 'Judul versi Bahasa Indonesia'}
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label for="summaryId" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Ringkasan (ID · Opsional, fallback ke EN)
          </label>
          <textarea
            id="summaryId"
            rows={3}
            bind:value={summaryId}
            placeholder={summaryEn || 'Ringkasan singkat versi Bahasa Indonesia'}
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
          ></textarea>
        </div>

        <MarkdownEditor
          id="contentMdId"
          label="Narasi Studi Kasus (ID · Markdown)"
          bind:value={contentMdId}
          placeholder="Kosongkan bila ingin otomatis fallback ke versi EN."
        />

        {#if isNda}
          <div>
            <label for="ndaNoticeId" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
              Catatan NDA (ID · Opsional)
            </label>
            <textarea
              id="ndaNoticeId"
              rows={2}
              bind:value={ndaNoticeId}
              placeholder={ndaNoticeEn || 'Kosongkan untuk memakai catatan NDA default.'}
              class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
            ></textarea>
          </div>
        {/if}
      </div>
    {/if}
  </section>

  <!-- Structured Metadata & Publishing Controls -->
  <section class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
    <h2 class="font-display text-2xl text-[var(--ink-primary)]">Metadata & Publishing</h2>

    <div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
      <div>
        <div class="flex items-center justify-between">
          <label for="slug" class="font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Slug *
          </label>
          <button
            type="button"
            onclick={generateSlugFromTitle}
            class="font-mono-tabular text-[11px] uppercase text-[var(--spot-accent)] hover:underline"
          >
            From EN Title
          </button>
        </div>
        <input
          id="slug"
          type="text"
          required
          bind:value={slug}
          placeholder="my-project-slug"
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="status" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Status
          </label>
          <select
            id="status"
            bind:value={status}
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3 py-2.5 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label for="sortOrder" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Sort Order
          </label>
          <input
            id="sortOrder"
            type="number"
            min="0"
            bind:value={sortOrder}
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
          />
        </div>
      </div>

      <div>
        <label for="role" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
          Role
        </label>
        <input
          id="role"
          type="text"
          bind:value={role}
          placeholder="e.g. Lead Full-Stack Engineer"
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
        />
      </div>

      <div>
        <label for="period" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
          Period
        </label>
        <input
          id="period"
          type="text"
          bind:value={period}
          placeholder="e.g. 2025 — 2026"
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
        />
      </div>

      <div class="md:col-span-2">
        <label for="techStack" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
          Tech Stack (comma separated)
        </label>
        <input
          id="techStack"
          type="text"
          bind:value={techStackText}
          placeholder="TypeScript, SvelteKit, Node.js, PostgreSQL"
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
        />
      </div>

      <div>
        <label for="demoRoute" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
          Static Demo Route / URL
        </label>
        <input
          id="demoRoute"
          type="text"
          bind:value={demoRoute}
          placeholder="/en/demos/my-playground or https://..."
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
        />
      </div>

      <div>
        <label for="liveUrl" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
          Live URL {isNda ? '(Hidden publicly when NDA active)' : ''}
        </label>
        <input
          id="liveUrl"
          type="url"
          bind:value={liveUrl}
          placeholder="https://app.example.com"
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
        />
      </div>

      <div class="md:col-span-2">
        <label for="repoUrl" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
          GitHub / Repository URL {isNda ? '(Hidden publicly when NDA active)' : ''}
        </label>
        <input
          id="repoUrl"
          type="url"
          bind:value={repoUrl}
          placeholder="https://github.com/username/repo"
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
        />
      </div>
    </div>

    <div class="mt-6 flex flex-wrap gap-6 border-t border-[var(--border-subtle)] pt-5">
      <label class="inline-flex cursor-pointer items-center gap-2.5 text-sm">
        <input type="checkbox" bind:checked={featured} class="h-4 w-4 accent-[var(--spot-accent)]" />
        <span>Featured project</span>
      </label>

      <label class="inline-flex cursor-pointer items-center gap-2.5 text-sm">
        <input type="checkbox" bind:checked={isNda} class="h-4 w-4 accent-[var(--spot-accent)]" />
        <span>NDA / Confidential project (hides Repo & Live URL publicly)</span>
      </label>
    </div>
  </section>

  <!-- Cover & Gallery Media -->
  <section class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
    <h2 class="font-display text-2xl text-[var(--ink-primary)]">Cover & Gallery</h2>

    <div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
      <MediaUploader
        category="cover"
        label="Cover Image (JPG/PNG/WebP/AVIF, max 5MB)"
        accept="image/jpeg,image/png,image/webp,image/avif"
        currentUrl={coverImageUrl}
        onUploaded={handleCoverUploaded}
        onRemove={() => {
          coverImageKey = null;
          coverImageUrl = null;
        }}
      />

      <MediaUploader
        category="gallery"
        label="Add Gallery Image"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onUploaded={handleGalleryUploaded}
      />
    </div>

    {#if galleryItems.length > 0}
      <div class="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {#each galleryItems as item (item.key)}
          <div class="border border-[var(--border-subtle)] bg-[var(--bg-page)] p-2">
            <img src={item.url} alt="Gallery" class="aspect-[16/10] w-full object-cover" />
            <button
              type="button"
              onclick={() => removeGalleryItem(item.key)}
              class="mt-2 inline-flex w-full items-center justify-center gap-1 border border-[var(--border-subtle)] py-1 font-mono-tabular text-[11px] uppercase text-[var(--ink-muted)] hover:border-[var(--spot-accent)] hover:text-[var(--spot-accent)]"
            >
              <Icon name="trash" size={12} />
              <span>Remove</span>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <div class="flex items-center justify-between border-t border-[var(--border-hairline)] pt-6">
    <a
      href="/admin/projects"
      class="border border-[var(--border-hairline)] px-4 py-2.5 font-mono-tabular text-xs uppercase tracking-[0.1em] hover:bg-[var(--bg-subtle)]"
    >
      Back to Projects
    </a>

    <button
      type="submit"
      disabled={saving}
      class="bg-[var(--spot-accent)] px-6 py-2.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--spot-ink)] hover:bg-[var(--spot-accent-hover)] disabled:opacity-60"
    >
      {saving ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}
    </button>
  </div>
</form>

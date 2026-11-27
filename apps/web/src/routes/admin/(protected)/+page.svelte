<script lang="ts">
  import { hasMissingIndonesianTranslation } from '@portofolio/shared';
  import Icon from '$lib/components/ui/Icon.svelte';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let publishedCount = $derived(data.projects.filter((p) => p.status === 'published').length);
  let draftCount = $derived(data.projects.filter((p) => p.status === 'draft').length);
  let untranslatedCount = $derived(
    data.projects.filter((p) =>
      hasMissingIndonesianTranslation([
        { en: p.titleEn, id: p.titleId },
        { en: p.summaryEn, id: p.summaryId },
        { en: p.contentMdEn, id: p.contentMdId }
      ])
    ).length
  );
  let profileComplete = $derived(
    Boolean(data.profile.displayName.trim() && data.profile.taglineEn.trim())
  );
</script>

<svelte:head>
  <title>Overview — Portfolio Admin</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
  <div>
    <h1 class="font-display text-4xl text-[var(--ink-primary)]">Overview</h1>
    <p class="mt-1 text-sm text-[var(--ink-secondary)]">
      Live status of your bilingual portfolio content in PostgreSQL.
    </p>
  </div>

  <a
    href="/admin/projects/new"
    class="inline-flex items-center gap-2 bg-[var(--spot-accent)] px-5 py-2.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--spot-ink)] hover:bg-[var(--spot-accent-hover)]"
  >
    <Icon name="plus" size={14} />
    <span>New Project</span>
  </a>
</div>

<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <a
    href="/admin/projects"
    class="group block border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-hairline)]"
  >
    <div class="flex items-center justify-between font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">
      <span>Published Projects</span>
      <Icon name="arrow-right" size={13} class="text-[var(--ink-muted)] group-hover:text-[var(--spot-accent)]" />
    </div>
    <div class="mt-2 font-mono-tabular text-3xl text-[var(--ink-primary)]">{publishedCount}</div>
  </a>

  <a
    href="/admin/projects"
    class="group block border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-hairline)]"
  >
    <div class="flex items-center justify-between font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">
      <span>Drafts</span>
      <Icon name="arrow-right" size={13} class="text-[var(--ink-muted)] group-hover:text-[var(--spot-accent)]" />
    </div>
    <div class="mt-2 font-mono-tabular text-3xl text-[var(--ink-primary)]">{draftCount}</div>
  </a>

  <a
    href="/admin/projects"
    class="group block border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-hairline)]"
  >
    <div class="flex items-center justify-between font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">
      <span>Missing ID Translation</span>
      <Icon name="arrow-right" size={13} class="text-[var(--ink-muted)] group-hover:text-[var(--spot-accent)]" />
    </div>
    <div class="mt-2 font-mono-tabular text-3xl text-[var(--ink-primary)]">{untranslatedCount}</div>
  </a>

  <a
    href="/admin/profile"
    class="group block border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-hairline)]"
  >
    <div class="flex items-center justify-between font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">
      <span>CV PDF Slot</span>
      <Icon name="arrow-right" size={13} class="text-[var(--ink-muted)] group-hover:text-[var(--spot-accent)]" />
    </div>
    <div class="mt-3">
      {#if data.profile.cvPdfKey}
        <StatusBadge variant="solid">Uploaded</StatusBadge>
      {:else}
        <StatusBadge variant="warn">Not Uploaded</StatusBadge>
      {/if}
    </div>
  </a>
</div>

<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
  <div class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-2xl text-[var(--ink-primary)]">Profile & Services</h2>
      <StatusBadge variant={profileComplete ? 'solid' : 'warn'}>
        {profileComplete ? 'Configured' : 'Empty State'}
      </StatusBadge>
    </div>
    <p class="mt-2 text-sm text-[var(--ink-secondary)]">
      Manage display name, bilingual tagline & bio, availability status, services, freelance CTA, social links, avatar, and your single CV PDF.
    </p>
    <a
      href="/admin/profile"
      class="mt-5 inline-flex items-center gap-2 border border-[var(--border-hairline)] px-4 py-2 font-mono-tabular text-xs uppercase tracking-[0.1em] hover:bg-[var(--bg-subtle)]"
    >
      <span>Edit Profile</span>
      <Icon name="arrow-right" size={14} />
    </a>
  </div>

  <div class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-2xl text-[var(--ink-primary)]">Projects & Case Studies</h2>
      <span class="font-mono-tabular text-xs text-[var(--ink-muted)]">
        {data.projects.length} total
      </span>
    </div>
    <p class="mt-2 text-sm text-[var(--ink-secondary)]">
      Create Markdown case studies with live preview, manage NDA visibility, link static playground routes, and adjust display sort order.
    </p>
    <a
      href="/admin/projects"
      class="mt-5 inline-flex items-center gap-2 border border-[var(--border-hairline)] px-4 py-2 font-mono-tabular text-xs uppercase tracking-[0.1em] hover:bg-[var(--bg-subtle)]"
    >
      <span>Manage Projects</span>
      <Icon name="arrow-right" size={14} />
    </a>
  </div>
</div>

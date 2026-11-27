<script lang="ts">
  import { resolveLocalized } from '@portofolio/shared';
  import Icon from '$lib/components/ui/Icon.svelte';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import { UI_COPY } from '$lib/i18n/ui-copy';
  import { renderSafeMarkdown } from '$lib/markdown';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let copy = $derived(UI_COPY[data.locale]);
  let project = $derived(data.project);
  let title = $derived(resolveLocalized(project.titleEn, project.titleId, data.locale));
  let summary = $derived(resolveLocalized(project.summaryEn, project.summaryId, data.locale));
  let ndaNotice = $derived(
    resolveLocalized(project.ndaNoticeEn, project.ndaNoticeId, data.locale).trim() ||
      copy.projects.ndaDefaultNotice
  );
  let markdownSource = $derived(
    resolveLocalized(project.contentMdEn, project.contentMdId, data.locale)
  );
  let renderedHtml = $derived(renderSafeMarkdown(markdownSource));
  let currentIndex = $derived(data.projects.findIndex((item) => item.slug === project.slug));
  let prevProject = $derived(currentIndex > 0 ? data.projects[currentIndex - 1] : null);
  let nextProject = $derived(
    currentIndex >= 0 && currentIndex < data.projects.length - 1
      ? data.projects[currentIndex + 1]
      : null
  );
</script>

<svelte:head>
  <title>{title} — {data.profile.displayName || copy.footer.builtWith}</title>
  <meta name="description" content={summary} />
</svelte:head>

<article>
  <!-- Top Return Rail -->
  <div class="border-b border-[var(--border-subtle)] px-6 py-4 md:px-10 lg:px-12">
    <a
      href={`/${data.locale}#work`}
      class="inline-flex items-center gap-2 font-mono-tabular text-xs uppercase tracking-[0.12em] text-[var(--ink-secondary)] transition-colors hover:text-[var(--spot-accent)]"
    >
      <Icon name="arrow-left" size={14} />
      <span>{copy.nav.backToWork}</span>
    </a>
  </div>

  <!-- Case Study Header -->
  <header class="px-6 py-10 md:px-10 lg:px-12 lg:py-12">
    <div class="flex flex-wrap items-center gap-2.5">
      {#if project.isNda}
        <StatusBadge variant="accent">
          <Icon name="lock" size={11} />
          <span>{copy.projects.ndaBadge}</span>
        </StatusBadge>
      {/if}
      {#if project.featured}
        <StatusBadge variant="solid">{copy.projects.featured}</StatusBadge>
      {/if}
    </div>

    <h1 class="mt-4 max-w-[24ch] font-display text-5xl leading-[1.02] text-[var(--ink-primary)] md:text-6xl">
      {title}
    </h1>

    <p class="mt-5 max-w-[68ch] text-base leading-relaxed text-[var(--ink-secondary)] md:text-lg">
      {summary}
    </p>

    <!-- Action Bar -->
    {#if project.demoRoute || (!project.isNda && (project.liveUrl || project.repoUrl))}
      <div class="mt-7 flex flex-wrap items-center gap-3">
        {#if project.demoRoute}
          <a
            href={project.demoRoute}
            target={project.demoRoute.startsWith('http') ? '_blank' : undefined}
            rel={project.demoRoute.startsWith('http') ? 'noreferrer noopener' : undefined}
            class="inline-flex min-h-11 items-center gap-2 bg-[var(--spot-accent)] px-5 py-2.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--spot-ink)] hover:bg-[var(--spot-accent-hover)]"
          >
            <span>{copy.projects.interactiveDemo}</span>
            <Icon name="arrow-up-right" size={14} />
          </a>
        {/if}

        {#if !project.isNda && project.liveUrl}
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            class="inline-flex min-h-11 items-center gap-2 border border-[var(--border-hairline)] px-5 py-2.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink-primary)] hover:bg-[var(--ink-primary)] hover:text-[var(--bg-page)]"
          >
            <span>{copy.projects.liveSite}</span>
            <Icon name="arrow-up-right" size={14} />
          </a>
        {/if}

        {#if !project.isNda && project.repoUrl}
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            class="inline-flex min-h-11 items-center gap-2 border border-[var(--border-hairline)] px-5 py-2.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink-primary)] hover:bg-[var(--ink-primary)] hover:text-[var(--bg-page)]"
          >
            <span>{copy.projects.sourceCode}</span>
            <Icon name="arrow-up-right" size={14} />
          </a>
        {/if}
      </div>
    {/if}

    <!-- NDA Disclosure Banner -->
    {#if project.isNda}
      <div class="mt-8 border border-[var(--spot-accent)] bg-[var(--bg-surface)] p-5">
        <div class="flex items-start gap-3">
          <Icon name="lock" size={16} class="mt-0.5 shrink-0 text-[var(--spot-accent)]" />
          <p class="text-sm leading-relaxed text-[var(--ink-secondary)]">
            {ndaNotice}
          </p>
        </div>
      </div>
    {/if}
  </header>

  <!-- Structured Spec Bar -->
  <dl class="grid grid-cols-1 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-hairline)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
    <div class="px-6 py-4 md:px-10">
      <dt class="font-mono-tabular text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
        {copy.projects.role}
      </dt>
      <dd class="mt-1 text-sm font-medium text-[var(--ink-primary)]">
        {project.role || '—'}
      </dd>
    </div>
    <div class="px-6 py-4 md:px-10">
      <dt class="font-mono-tabular text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
        {copy.projects.period}
      </dt>
      <dd class="mt-1 font-mono-tabular text-sm text-[var(--ink-primary)]">
        {project.period || '—'}
      </dd>
    </div>
    <div class="px-6 py-4 md:px-10">
      <dt class="font-mono-tabular text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
        {copy.projects.stack}
      </dt>
      <dd class="mt-1.5 flex flex-wrap gap-1.5">
        {#if project.techStack.length > 0}
          {#each project.techStack as tech}
            <span class="border border-[var(--border-hairline)] px-2 py-0.5 font-mono-tabular text-[11px] uppercase">
              {tech}
            </span>
          {/each}
        {:else}
          <span class="text-sm text-[var(--ink-muted)]">—</span>
        {/if}
      </dd>
    </div>
  </dl>

  <!-- Cover Media -->
  {#if project.coverImageUrl}
    <div class="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-8 md:px-10 lg:px-12">
      <img
        src={project.coverImageUrl}
        alt={title}
        width="1280"
        height="720"
        decoding="async"
        fetchpriority="high"
        class="max-h-[560px] w-full border border-[var(--border-hairline)] object-cover"
      />
    </div>
  {/if}

  <!-- Sanitized Markdown Body -->
  <div class="px-6 py-10 md:px-10 lg:px-12 lg:py-12">
    {#if renderedHtml}
      <div class="prose-editorial">
        {@html renderedHtml}
      </div>
    {:else}
      <p class="text-sm text-[var(--ink-muted)]">{copy.projects.noNarrative}</p>
    {/if}
  </div>

  <!-- Gallery Artifacts -->
  {#if project.galleryImageUrls.length > 0}
    <section class="border-t-[3px] border-[var(--border-heavy)] px-6 py-10 md:px-10 lg:px-12">
      <h2 class="font-display text-3xl text-[var(--ink-primary)]">{copy.projects.gallery}</h2>
      <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {#each project.galleryImageUrls as imgUrl, idx}
          <figure class="border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            <img
              src={imgUrl}
              alt={`${title} — ${idx + 1}`}
              width="960"
              height="600"
              loading="lazy"
              decoding="async"
              class="aspect-[16/10] w-full object-cover"
            />
          </figure>
        {/each}
      </div>
    </section>
  {/if}

  {#if prevProject || nextProject}
    <nav
      aria-label={copy.projects.sectionTitle}
      class="grid grid-cols-1 divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)] sm:grid-cols-2 sm:divide-x sm:divide-y-0"
    >
      <div class="p-6 md:px-10 lg:px-12">
        {#if prevProject}
          <a
            href={`/${data.locale}/projects/${prevProject.slug}`}
            class="group block min-h-11"
          >
            <span class="inline-flex items-center gap-1.5 font-mono-tabular text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)] group-hover:text-[var(--spot-accent)]">
              <Icon name="arrow-left" size={13} />
              <span>{copy.projects.previousProject}</span>
            </span>
            <span class="mt-1.5 block font-display text-2xl text-[var(--ink-primary)] group-hover:text-[var(--spot-accent)]">
              {resolveLocalized(prevProject.titleEn, prevProject.titleId, data.locale)}
            </span>
          </a>
        {/if}
      </div>

      <div class="p-6 sm:text-right md:px-10 lg:px-12">
        {#if nextProject}
          <a
            href={`/${data.locale}/projects/${nextProject.slug}`}
            class="group block min-h-11"
          >
            <span class="inline-flex items-center gap-1.5 font-mono-tabular text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)] group-hover:text-[var(--spot-accent)]">
              <span>{copy.projects.nextProject}</span>
              <Icon name="arrow-right" size={13} />
            </span>
            <span class="mt-1.5 block font-display text-2xl text-[var(--ink-primary)] group-hover:text-[var(--spot-accent)]">
              {resolveLocalized(nextProject.titleEn, nextProject.titleId, data.locale)}
            </span>
          </a>
        {/if}
      </div>
    </nav>
  {/if}
</article>

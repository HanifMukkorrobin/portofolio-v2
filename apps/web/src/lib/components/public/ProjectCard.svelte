<script lang="ts">
  import { resolveLocalized, type Locale, type ProjectRecord } from '@portofolio/shared';
  import { UI_COPY } from '$lib/i18n/ui-copy';
  import Icon from '$lib/components/ui/Icon.svelte';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';

  let {
    project,
    index,
    locale
  }: {
    project: ProjectRecord;
    index: number;
    locale: Locale;
  } = $props();

  let copy = $derived(UI_COPY[locale]);
  let title = $derived(resolveLocalized(project.titleEn, project.titleId, locale));
  let summary = $derived(resolveLocalized(project.summaryEn, project.summaryId, locale));
  let formattedIndex = $derived(String(index + 1).padStart(2, '0'));
</script>

<article class="flex h-full flex-col justify-between p-6 md:p-8 lg:p-10">
  <div>
    <!-- Meta row -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2 font-mono-tabular text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)]">
        <span>{project.period || project.role || formattedIndex}</span>
        {#if project.period && project.role}
          <span>·</span>
          <span>{project.role}</span>
        {/if}
      </div>

      <div class="flex flex-wrap items-center gap-2">
        {#if project.isNda}
          <StatusBadge variant="accent">
            <Icon name="lock" size={11} />
            <span>{copy.projects.ndaBadge}</span>
          </StatusBadge>
        {:else if project.featured}
          <StatusBadge variant="solid">{copy.projects.featured}</StatusBadge>
        {/if}
      </div>
    </div>

    <!-- Numbered Editorial Title -->
    <h3 class="mt-4 font-display text-3xl leading-[1.08] text-[var(--ink-primary)] md:text-[2.15rem]">
      <a
        href={`/${locale}/projects/${project.slug}`}
        class="group inline-flex items-baseline gap-2 transition-colors hover:text-[var(--spot-accent)]"
      >
        <span class="shrink-0 font-mono-tabular text-lg text-[var(--spot-accent)]">{formattedIndex} /</span>
        <span>{title}</span>
      </a>
    </h3>

    {#if project.coverImageUrl}
      <a
        href={`/${locale}/projects/${project.slug}`}
        class="mt-5 block overflow-hidden border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
      >
        <img
          src={project.coverImageUrl}
          alt={title}
          width="960"
          height="540"
          loading="lazy"
          decoding="async"
          class="aspect-[16/9] w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-[1.015]"
        />
      </a>
    {/if}

    <p class="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-[var(--ink-secondary)]">
      {summary}
    </p>

    {#if project.techStack.length > 0}
      <div class="mt-5 flex flex-wrap gap-1.5">
        {#each project.techStack as tech}
          <span
            class="border border-[var(--border-hairline)] px-2 py-0.5 font-mono-tabular text-[11px] uppercase tracking-[0.06em] text-[var(--ink-primary)]"
          >
            {tech}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Action Row -->
  <div class="mt-7 flex flex-wrap items-center gap-5 pt-4 border-t border-[var(--border-subtle)]">
    <a
      href={`/${locale}/projects/${project.slug}`}
      class="inline-flex items-center gap-1.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.1em] text-[var(--ink-primary)] transition-colors hover:text-[var(--spot-accent)]"
    >
      <span>{copy.projects.readCaseStudy}</span>
      <Icon name="arrow-right" size={14} class="text-[var(--spot-accent)]" />
    </a>

    {#if project.demoRoute}
      <a
        href={project.demoRoute}
        target={project.demoRoute.startsWith('http') ? '_blank' : undefined}
        rel={project.demoRoute.startsWith('http') ? 'noreferrer noopener' : undefined}
        class="inline-flex items-center gap-1.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.1em] text-[var(--ink-secondary)] transition-colors hover:text-[var(--spot-accent)]"
      >
        <span>{copy.projects.liveDemo}</span>
        <Icon name="arrow-up-right" size={14} />
      </a>
    {/if}

    {#if !project.isNda && project.repoUrl}
      <a
        href={project.repoUrl}
        target="_blank"
        rel="noreferrer noopener"
        class="inline-flex items-center gap-1.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.1em] text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink-primary)]"
      >
        <span>GitHub</span>
        <Icon name="arrow-up-right" size={14} />
      </a>
    {/if}
  </div>
</article>

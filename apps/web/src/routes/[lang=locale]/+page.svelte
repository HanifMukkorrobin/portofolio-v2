<script lang="ts">
  import { resolveHeadlineAndRole, resolveLocalized } from '@portofolio/shared';
  import ProjectCard from '$lib/components/public/ProjectCard.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import { skillGroups } from '$lib/data/skills';
  import { workHistory } from '$lib/data/work-history';
  import { UI_COPY } from '$lib/i18n/ui-copy';
  import { toAbsoluteUrl } from '$lib/seo';
  import type { LayoutData } from './$types';

  let { data }: { data: LayoutData } = $props();

  let copy = $derived(UI_COPY[data.locale]);
  let profile = $derived(data.profile);
  let projects = $derived(data.projects);
  let hasProjects = $derived(projects.length > 0);
  let emailCopied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  let rawTagline = $derived(resolveLocalized(profile.taglineEn, profile.taglineId, data.locale));
  let rawRole = $derived(resolveLocalized(profile.roleEn ?? '', profile.roleId ?? '', data.locale));
  let parsedIdentity = $derived(resolveHeadlineAndRole(rawTagline, rawRole));

  let headline = $derived(parsedIdentity.headline || copy.hero.defaultHeadline);
  let roleLine = $derived(parsedIdentity.role);

  let bio = $derived(
    resolveLocalized(profile.bioEn, profile.bioId, data.locale).trim() || copy.hero.defaultBio
  );
  let availabilityText = $derived(
    resolveLocalized(profile.availabilityEn, profile.availabilityId, data.locale).trim() ||
      (profile.isAvailable ? copy.hero.availableDefault : '')
  );
  let freelanceCtaLabel = $derived(
    resolveLocalized(profile.freelanceCtaEn, profile.freelanceCtaId, data.locale).trim() ||
      copy.services.defaultCta
  );
  let freelanceCtaHref = $derived(
    profile.freelanceCtaUrl.trim() || (profile.email ? `mailto:${profile.email}` : '')
  );
  let isMailtoCta = $derived(freelanceCtaHref.startsWith('mailto:'));
  let hasServices = $derived(
    profile.services.length > 0 || profile.freelanceCtaEn.trim().length > 0
  );

  let featuredProject = $derived(
    projects.find((p) => p.featured && p.coverImageUrl) ??
      projects.find((p) => p.coverImageUrl) ??
      projects[0] ??
      null
  );
  let featuredTitle = $derived(
    featuredProject
      ? resolveLocalized(featuredProject.titleEn, featuredProject.titleId, data.locale)
      : ''
  );

  let pageTitle = $derived(
    profile.displayName.trim()
      ? `${profile.displayName} — ${roleLine || headline}`
      : copy.footer.builtWith
  );
  let metaDescription = $derived(bio.replace(/\s+/g, ' ').trim().slice(0, 160));
  let canonicalUrl = $derived(`${data.siteOrigin}/${data.locale}`);
  let enUrl = $derived(`${data.siteOrigin}/en`);
  let idUrl = $derived(`${data.siteOrigin}/id`);
  let ogImageUrl = $derived(
    toAbsoluteUrl(data.siteOrigin, featuredProject?.coverImageUrl ?? profile.avatarUrl)
  );

  async function copyEmailAddress() {
    if (!profile.email || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(profile.email);
      emailCopied = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        emailCopied = false;
      }, 2200);
    } catch {
      // clipboard permission unavailable
    }
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={metaDescription} />
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="en" href={enUrl} />
  <link rel="alternate" hreflang="id" href={idUrl} />
  <link rel="alternate" hreflang="x-default" href={enUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:locale" content={data.locale === 'id' ? 'id_ID' : 'en_US'} />
  <meta property="og:locale:alternate" content={data.locale === 'id' ? 'en_US' : 'id_ID'} />
  {#if ogImageUrl}
    <meta property="og:image" content={ogImageUrl} />
  {/if}
  <meta name="twitter:card" content={ogImageUrl ? 'summary_large_image' : 'summary'} />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={metaDescription} />
  {#if ogImageUrl}
    <meta name="twitter:image" content={ogImageUrl} />
  {/if}
</svelte:head>

<!-- Opening Asymmetric Editorial Spread -->
<section class="px-6 py-10 md:px-10 lg:px-12 lg:py-14">
  <div class="grid grid-cols-1 gap-10 xl:grid-cols-12 xl:items-center xl:gap-12">
    <div class="xl:col-span-7">
      <h1 class="font-display text-[clamp(2.25rem,3.6vw,3.5rem)] leading-[1.06] text-[var(--ink-primary)]">
        {headline}
      </h1>

      {#if roleLine || profile.isAvailable || availabilityText}
        <div class="mt-4 flex flex-col gap-1.5 border-y border-[var(--border-subtle)] py-3 font-mono-tabular text-xs font-medium uppercase tracking-[0.11em]">
          {#if roleLine}
            <span class="text-[var(--ink-primary)]">{roleLine}</span>
          {/if}
          {#if profile.isAvailable || availabilityText}
            <span class="inline-flex items-center gap-2 text-[var(--ink-secondary)]">
              <span
                class={`h-2 w-2 shrink-0 ${profile.isAvailable ? 'bg-[var(--spot-accent)]' : 'bg-[var(--ink-muted)]'}`}
              ></span>
              <span>{availabilityText}</span>
            </span>
          {/if}
        </div>
      {/if}

      <p class="mt-6 max-w-[62ch] whitespace-pre-line text-base leading-relaxed text-[var(--ink-secondary)] md:text-lg">
        {bio}
      </p>

      <div class="mt-8 flex flex-wrap items-center gap-3.5">
        {#if hasProjects}
          <a
            href="#work"
            class="inline-flex min-h-11 items-center gap-2.5 bg-[var(--spot-accent)] px-6 py-3 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--spot-ink)] transition-colors hover:bg-[var(--spot-accent-hover)]"
          >
            <span>{copy.hero.inspectWork}</span>
            <Icon name="arrow-right" size={14} />
          </a>

          {#if freelanceCtaHref && profile.freelanceCtaEn.trim()}
            <a
              href={freelanceCtaHref}
              target={freelanceCtaHref.startsWith('http') ? '_blank' : undefined}
              rel={freelanceCtaHref.startsWith('http') ? 'noreferrer noopener' : undefined}
              class="inline-flex min-h-11 items-center gap-2 border border-[var(--border-hairline)] px-5 py-3 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink-primary)] transition-colors hover:bg-[var(--ink-primary)] hover:text-[var(--bg-page)]"
            >
              <span>{freelanceCtaLabel}</span>
              <Icon name={isMailtoCta ? 'mail' : 'arrow-up-right'} size={14} />
            </a>
          {/if}
        {:else}
          {#if freelanceCtaHref}
            <a
              href={freelanceCtaHref}
              target={freelanceCtaHref.startsWith('http') ? '_blank' : undefined}
              rel={freelanceCtaHref.startsWith('http') ? 'noreferrer noopener' : undefined}
              class="inline-flex min-h-11 items-center gap-2.5 bg-[var(--spot-accent)] px-6 py-3 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--spot-ink)] transition-colors hover:bg-[var(--spot-accent-hover)]"
            >
              <span>{freelanceCtaLabel}</span>
              <Icon name={isMailtoCta ? 'mail' : 'arrow-up-right'} size={14} />
            </a>
          {/if}

          {#if hasServices}
            <a
              href="#services"
              class="inline-flex min-h-11 items-center gap-2 border border-[var(--border-hairline)] px-5 py-3 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink-primary)] transition-colors hover:bg-[var(--ink-primary)] hover:text-[var(--bg-page)]"
            >
              <span>{copy.hero.exploreServices}</span>
              <Icon name="arrow-right" size={14} />
            </a>
          {:else if profile.githubUrl}
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              class="inline-flex min-h-11 items-center gap-2 border border-[var(--border-hairline)] px-5 py-3 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink-primary)] transition-colors hover:bg-[var(--ink-primary)] hover:text-[var(--bg-page)]"
            >
              <span>{copy.hero.browseGithub}</span>
              <Icon name="arrow-up-right" size={14} />
            </a>
          {/if}
        {/if}
      </div>

      {#if profile.email}
        <div class="mt-4 flex flex-wrap items-center gap-2 font-mono-tabular text-xs text-[var(--ink-muted)]">
          <a
            href={`mailto:${profile.email}`}
            class="inline-flex min-h-11 items-center gap-1.5 text-[var(--ink-secondary)] underline decoration-[var(--border-subtle)] hover:text-[var(--ink-primary)]"
          >
            <Icon name="mail" size={13} />
            <span>{profile.email}</span>
          </a>
          <button
            type="button"
            onclick={copyEmailAddress}
            aria-label={emailCopied ? copy.nav.emailCopied : copy.nav.copyEmail}
            class="inline-flex min-h-11 items-center gap-1.5 border border-[var(--border-subtle)] px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-[var(--ink-secondary)] transition-colors hover:border-[var(--border-hairline)] hover:text-[var(--ink-primary)]"
          >
            <Icon name={emailCopied ? 'check' : 'copy'} size={12} />
            <span>{emailCopied ? copy.nav.emailCopied : copy.nav.copyEmail}</span>
          </button>
        </div>
      {/if}
    </div>

    <!-- Right Featured Plate (shipped cover image, framed profile plate, or clean empty ledger) -->
    <div class="xl:col-span-5">
      {#if featuredProject && featuredProject.coverImageUrl}
        <a
          href={`/${data.locale}/projects/${featuredProject.slug}`}
          class="group block border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
        >
          <div class="flex items-center justify-between border-b border-[var(--border-hairline)] px-4 py-2.5 font-mono-tabular text-xs uppercase tracking-[0.1em]">
            <span class="truncate text-[var(--ink-primary)]">{featuredTitle}</span>
            {#if featuredProject.isNda}
              <StatusBadge variant="accent">{copy.projects.ndaBadge}</StatusBadge>
            {:else if featuredProject.period}
              <span class="shrink-0 text-[var(--ink-muted)]">{featuredProject.period}</span>
            {/if}
          </div>
          <div class="overflow-hidden">
            <img
              src={featuredProject.coverImageUrl}
              alt={featuredTitle}
              width="960"
              height="600"
              decoding="async"
              fetchpriority="high"
              class="aspect-[16/10] w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.015]"
            />
          </div>
        </a>
      {:else if profile.avatarUrl}
        <figure class="m-0 border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
          <div class="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5 font-mono-tabular text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)]">
            <span>{copy.hero.profilePlate}</span>
            {#if profile.displayName.trim()}
              <span class="truncate text-[var(--ink-primary)]">{profile.displayName}</span>
            {/if}
          </div>
          <div class="p-3">
            <img
              src={profile.avatarUrl}
              alt={profile.displayName || copy.hero.defaultBrand}
              width="960"
              height="720"
              decoding="async"
              fetchpriority="high"
              class="aspect-[4/3] w-full object-cover object-top"
            />
          </div>
        </figure>
      {:else}
        <div class="border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6">
          <div class="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 font-mono-tabular text-xs uppercase tracking-[0.12em] text-[var(--ink-muted)]">
            <span>{data.locale.toUpperCase()}</span>
            <span>{projects.length} {copy.nav.work}</span>
          </div>
          <p class="mt-4 text-sm leading-relaxed text-[var(--ink-secondary)]">
            {copy.hero.emptyProfileNote}
          </p>
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- Heavy 3px Editorial Rule + Two-Column Shipped Projects Grid -->
<section id="work" class="border-t-[3px] border-[var(--border-heavy)]">
  <div class="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-5 md:px-10 lg:px-12">
    <h2 class="font-display text-3xl text-[var(--ink-primary)] md:text-4xl">
      {copy.projects.sectionTitle}
    </h2>
    <span class="font-mono-tabular text-xs uppercase tracking-[0.12em] text-[var(--ink-muted)]">
      {String(projects.length).padStart(2, '0')}
    </span>
  </div>

  {#if !hasProjects}
    <div class="p-6 md:p-10 lg:p-12">
      <EmptyState title={copy.projects.emptyTitle} description={copy.projects.emptyDescription}>
        {#snippet action()}
          <div class="flex flex-wrap items-center gap-3">
            {#if profile.githubUrl}
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                class="inline-flex min-h-11 items-center gap-2 border border-[var(--border-hairline)] px-4 py-2.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.1em] text-[var(--ink-primary)] transition-colors hover:bg-[var(--ink-primary)] hover:text-[var(--bg-page)]"
              >
                <span>{copy.hero.browseGithub}</span>
                <Icon name="arrow-up-right" size={14} />
              </a>
            {/if}
            {#if profile.email}
              <a
                href={`mailto:${profile.email}`}
                class="inline-flex min-h-11 items-center gap-2 border border-[var(--border-subtle)] px-4 py-2.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.1em] text-[var(--ink-secondary)] transition-colors hover:border-[var(--border-hairline)] hover:text-[var(--ink-primary)]"
              >
                <Icon name="mail" size={14} />
                <span>{freelanceCtaLabel}</span>
              </a>
            {/if}
          </div>
        {/snippet}
      </EmptyState>
    </div>
  {:else}
    <div class="grid grid-cols-1 divide-y divide-[var(--border-hairline)] lg:grid-cols-2 lg:divide-y-0">
      {#each projects as project, i (project.id)}
        <div
          class={`border-[var(--border-hairline)] ${
            i % 2 === 1 ? 'lg:border-l' : ''
          } ${i >= 2 ? 'lg:border-t' : ''}`}
        >
          <ProjectCard {project} index={i} locale={data.locale} />
        </div>
      {/each}
    </div>
  {/if}
</section>

<!-- Services & Freelance Section (renders only when owner added services or CTA) -->
{#if hasServices}
  <section id="services" class="border-t-[3px] border-[var(--border-heavy)]">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-5 md:px-10 lg:px-12">
      <h2 class="font-display text-3xl text-[var(--ink-primary)] md:text-4xl">
        {copy.services.sectionTitle}
      </h2>

      {#if freelanceCtaHref}
        <a
          href={freelanceCtaHref}
          target={freelanceCtaHref.startsWith('http') ? '_blank' : undefined}
          rel={freelanceCtaHref.startsWith('http') ? 'noreferrer noopener' : undefined}
          class={hasProjects
            ? 'inline-flex min-h-11 items-center gap-2 bg-[var(--spot-accent)] px-5 py-2.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--spot-ink)] transition-colors hover:bg-[var(--spot-accent-hover)]'
            : 'inline-flex min-h-11 items-center gap-2 border border-[var(--border-hairline)] px-5 py-2.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink-primary)] transition-colors hover:bg-[var(--ink-primary)] hover:text-[var(--bg-page)]'}
        >
          <span>{freelanceCtaLabel}</span>
          <Icon name={isMailtoCta ? 'mail' : 'arrow-up-right'} size={14} />
        </a>
      {/if}
    </div>

    {#if profile.services.length > 0}
      <div class="grid grid-cols-1 divide-y divide-[var(--border-subtle)] md:grid-cols-2 md:divide-y-0 xl:grid-cols-3">
        {#each profile.services as service, i}
          <div
            class={`border-[var(--border-subtle)] p-6 md:p-8 lg:p-10 ${
              i % 2 === 1 ? 'md:border-l xl:border-l-0' : ''
            } ${i >= 2 ? 'md:border-t xl:border-t-0' : ''} ${
              i % 3 !== 0 ? 'xl:border-l' : ''
            } ${i >= 3 ? 'xl:border-t' : ''}`}
          >
            <h3 class="font-display text-2xl leading-[1.15] text-[var(--ink-primary)]">
              {resolveLocalized(service.titleEn, service.titleId, data.locale)}
            </h3>
            {#if service.descriptionEn || service.descriptionId}
              <p class="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
                {resolveLocalized(service.descriptionEn, service.descriptionId, data.locale)}
              </p>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>
{/if}

<!-- Static Work History & Skills (V1 codebase data — renders only when populated by owner) -->
{#if workHistory.length > 0 || skillGroups.length > 0}
  <section id="experience" class="border-t-[3px] border-[var(--border-heavy)]">
    <div class="grid grid-cols-1 divide-y divide-[var(--border-hairline)] lg:grid-cols-12 lg:divide-x lg:divide-y-0">
      {#if workHistory.length > 0}
        <div class={skillGroups.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <div class="border-b border-[var(--border-subtle)] px-6 py-5 md:px-10">
            <h2 class="font-display text-3xl text-[var(--ink-primary)]">
              {copy.experience.sectionTitle}
            </h2>
          </div>

          <ol class="divide-y divide-[var(--border-subtle)]">
            {#each workHistory as item (item.id)}
              <li class="px-6 py-6 md:px-10">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 class="font-display text-2xl text-[var(--ink-primary)]">
                    {resolveLocalized(item.roleEn, item.roleId, data.locale)}
                  </h3>
                  <span class="font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">
                    {resolveLocalized(item.periodEn, item.periodId, data.locale)}
                  </span>
                </div>
                <div class="mt-1 font-mono-tabular text-xs uppercase tracking-[0.1em] text-[var(--ink-secondary)]">
                  {item.company}{item.location ? ` · ${item.location}` : ''}
                </div>
                {#if item.highlightsEn.length > 0}
                  <ul class="mt-3 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {#each data.locale === 'id' && item.highlightsId?.length ? item.highlightsId : item.highlightsEn as bullet}
                      <li>{bullet}</li>
                    {/each}
                  </ul>
                {/if}
              </li>
            {/each}
          </ol>
        </div>
      {/if}

      {#if skillGroups.length > 0}
        <div class={workHistory.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12'}>
          <div class="border-b border-[var(--border-subtle)] px-6 py-5 md:px-10">
            <h2 class="font-display text-3xl text-[var(--ink-primary)]">
              {copy.experience.skillsTitle}
            </h2>
          </div>

          <div class="divide-y divide-[var(--border-subtle)]">
            {#each skillGroups as group (group.id)}
              <div class="px-6 py-6 md:px-10">
                <h3 class="font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                  {resolveLocalized(group.categoryEn, group.categoryId, data.locale)}
                </h3>
                <div class="mt-3 flex flex-wrap gap-1.5">
                  {#each group.items as skill}
                    <span class="border border-[var(--border-hairline)] px-2.5 py-1 font-mono-tabular text-xs text-[var(--ink-primary)]">
                      {skill}
                    </span>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </section>
{/if}

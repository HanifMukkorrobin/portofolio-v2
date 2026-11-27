<script lang="ts">
  import type { Snippet } from 'svelte';
  import EditorialSpine from '$lib/components/public/EditorialSpine.svelte';
  import { skillGroups } from '$lib/data/skills';
  import { workHistory } from '$lib/data/work-history';
  import { UI_COPY } from '$lib/i18n/ui-copy';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  let copy = $derived(UI_COPY[data.locale]);
  let hasServices = $derived(
    data.profile.services.length > 0 || data.profile.freelanceCtaEn.trim().length > 0
  );
  let hasExperience = $derived(workHistory.length > 0 || skillGroups.length > 0);

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = data.locale;
    }
  });
</script>

<div class="min-h-screen bg-[var(--bg-page)] text-[var(--ink-primary)] lg:flex">
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--spot-accent)] focus:px-4 focus:py-2.5 focus:font-mono-tabular focus:text-xs focus:font-medium focus:uppercase focus:tracking-[0.12em] focus:text-[var(--spot-ink)]"
  >
    {copy.nav.skipToContent}
  </a>

  <EditorialSpine
    locale={data.locale}
    profile={data.profile}
    {hasServices}
    {hasExperience}
  />

  <div class="flex min-w-0 flex-1 flex-col">
    <main id="main-content" class="flex-1">
      {#if data.apiUnavailable}
        <div
          role="alert"
          class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--spot-accent)] bg-[var(--bg-surface)] px-6 py-4 md:px-10 lg:px-12"
        >
          <div>
            <p class="font-mono-tabular text-xs font-medium uppercase tracking-[0.1em] text-[var(--spot-accent)]">
              {copy.system.apiUnavailableTitle}
            </p>
            <p class="mt-1 text-sm text-[var(--ink-secondary)]">
              {copy.system.apiUnavailableDescription}
            </p>
          </div>
          <button
            type="button"
            onclick={() => window.location.reload()}
            class="min-h-11 border border-[var(--border-hairline)] px-4 py-2 font-mono-tabular text-xs font-medium uppercase tracking-[0.1em] text-[var(--ink-primary)] transition-colors hover:bg-[var(--ink-primary)] hover:text-[var(--bg-page)]"
          >
            {copy.system.reload}
          </button>
        </div>
      {/if}

      {@render children()}
    </main>

    <footer class="border-t border-[var(--border-hairline)] px-6 py-5 md:px-10">
      <div class="flex flex-wrap items-center justify-between gap-4 font-mono-tabular text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)]">
        <span>{data.profile.displayName || copy.footer.builtWith}</span>
        <div class="flex flex-wrap items-center gap-4">
          {#if data.profile.email}
            <a
              href={`mailto:${data.profile.email}`}
              class="inline-flex min-h-11 items-center px-1 hover:text-[var(--ink-primary)]"
            >
              Email
            </a>
          {/if}
          {#if data.profile.githubUrl}
            <a
              href={data.profile.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              class="inline-flex min-h-11 items-center px-1 hover:text-[var(--ink-primary)]"
            >
              GitHub
            </a>
          {/if}
          {#if data.profile.linkedinUrl}
            <a
              href={data.profile.linkedinUrl}
              target="_blank"
              rel="noreferrer noopener"
              class="inline-flex min-h-11 items-center px-1 hover:text-[var(--ink-primary)]"
            >
              LinkedIn
            </a>
          {/if}
        </div>
      </div>
    </footer>
  </div>
</div>

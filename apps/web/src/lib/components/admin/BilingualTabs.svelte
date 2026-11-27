<script lang="ts">
  import type { Locale } from '@portofolio/shared';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';

  let {
    active = $bindable<Locale>('en'),
    missingId = false
  }: {
    active: Locale;
    missingId?: boolean;
  } = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
  <div class="inline-flex border border-[var(--border-hairline)] font-mono-tabular text-xs uppercase">
    <button
      type="button"
      aria-pressed={active === 'en'}
      onclick={() => (active = 'en')}
      class={`min-h-11 px-4 py-2 transition-colors ${
        active === 'en'
          ? 'bg-[var(--ink-primary)] text-[var(--bg-page)]'
          : 'bg-transparent text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]'
      }`}
    >
      EN · Primary
    </button>
    <button
      type="button"
      aria-pressed={active === 'id'}
      onclick={() => (active = 'id')}
      class={`min-h-11 border-l border-[var(--border-hairline)] px-4 py-2 transition-colors ${
        active === 'id'
          ? 'bg-[var(--ink-primary)] text-[var(--bg-page)]'
          : 'bg-transparent text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]'
      }`}
    >
      ID · Indonesian
    </button>
  </div>

  {#if missingId}
    <StatusBadge variant="warn">ID belum diterjemahkan (fallback ke EN)</StatusBadge>
  {/if}
</div>

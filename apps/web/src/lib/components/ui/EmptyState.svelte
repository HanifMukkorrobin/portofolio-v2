<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    description,
    action
  }: {
    title: string;
    description: string;
    action?: Snippet;
  } = $props();
</script>

<div class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 md:p-10">
  <h3 class="font-display text-2xl md:text-3xl text-[var(--ink-primary)]">{title}</h3>
  <p class="mt-2 max-w-[60ch] text-sm leading-relaxed text-[var(--ink-secondary)]">
    {description}
  </p>
  {#if action}
    <div class="mt-6">
      {@render action()}
    </div>
  {/if}
</div>

<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'outline',
    children
  }: {
    variant?: 'accent' | 'solid' | 'outline' | 'warn';
    children: Snippet;
  } = $props();

  const styles: Record<'accent' | 'solid' | 'outline' | 'warn', string> = {
    accent: 'bg-[var(--spot-accent)] text-[var(--spot-ink)] border-[var(--spot-accent)]',
    solid: 'bg-[var(--ink-primary)] text-[var(--bg-page)] border-[var(--ink-primary)]',
    outline: 'bg-transparent text-[var(--ink-primary)] border-[var(--border-hairline)]',
    warn: 'bg-[var(--warn-bg)] text-[var(--warn-ink)] border-[var(--warn-border)]'
  };
</script>

<span
  class={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-mono-tabular text-[11px] font-medium uppercase tracking-[0.08em] ${styles[variant]}`}
>
  {@render children()}
</span>

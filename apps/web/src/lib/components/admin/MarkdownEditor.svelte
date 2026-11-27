<script lang="ts">
  import { renderSafeMarkdown } from '$lib/markdown';

  let {
    id,
    label,
    value = $bindable(''),
    placeholder = '## Architecture\n\nWrite case study narrative in Markdown...'
  }: {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
  } = $props();

  let mode = $state<'write' | 'preview'>('write');
  let previewHtml = $derived(mode === 'preview' ? renderSafeMarkdown(value) : '');
</script>

<div>
  <div class="flex items-center justify-between gap-2">
    <label for={id} class="font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
      {label}
    </label>
    <div class="inline-flex border border-[var(--border-subtle)] font-mono-tabular text-[11px] uppercase">
      <button
        type="button"
        aria-pressed={mode === 'write'}
        onclick={() => (mode = 'write')}
        class={`px-3 py-1.5 ${
          mode === 'write'
            ? 'bg-[var(--ink-primary)] text-[var(--bg-page)]'
            : 'text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]'
        }`}
      >
        Write
      </button>
      <button
        type="button"
        aria-pressed={mode === 'preview'}
        onclick={() => (mode = 'preview')}
        class={`border-l border-[var(--border-subtle)] px-3 py-1.5 ${
          mode === 'preview'
            ? 'bg-[var(--ink-primary)] text-[var(--bg-page)]'
            : 'text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]'
        }`}
      >
        Live Preview
      </button>
    </div>
  </div>

  {#if mode === 'write'}
    <textarea
      {id}
      bind:value
      rows={14}
      {placeholder}
      class="mt-2 w-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 font-mono-tabular text-sm leading-relaxed text-[var(--ink-primary)]"
    ></textarea>
  {:else}
    <div class="mt-2 min-h-[320px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
      {#if previewHtml}
        <div class="prose-editorial">
          {@html previewHtml}
        </div>
      {:else}
        <p class="text-sm text-[var(--ink-muted)]">Nothing to preview yet.</p>
      {/if}
    </div>
  {/if}
</div>

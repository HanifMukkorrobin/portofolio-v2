<script lang="ts">
  import type { UploadCategory, UploadedMedia } from '@portofolio/shared';
  import { apiRequest } from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let {
    category,
    label,
    accept,
    currentUrl = null,
    currentName = null,
    onUploaded,
    onRemove
  }: {
    category: UploadCategory;
    label: string;
    accept: string;
    currentUrl?: string | null;
    currentName?: string | null;
    onUploaded: (media: UploadedMedia) => void;
    onRemove?: () => void;
  } = $props();

  let uploading = $state(false);
  let errorMsg = $state('');

  async function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    errorMsg = '';
    uploading = true;

    try {
      const form = new FormData();
      form.set('category', category);
      form.set('file', file);

      const res = await apiRequest<{ media: UploadedMedia }>('/api/admin/upload', {
        method: 'POST',
        body: form
      });

      onUploaded(res.media);
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      uploading = false;
      input.value = '';
    }
  }
</script>

<div class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <span class="font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
      {label}
    </span>

    <div class="flex items-center gap-2">
      <label
        class="inline-flex cursor-pointer items-center gap-1.5 border border-[var(--border-hairline)] px-3 py-1.5 font-mono-tabular text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
      >
        <Icon name="upload" size={13} />
        <span>{uploading ? 'Uploading...' : 'Upload'}</span>
        <input
          type="file"
          {accept}
          disabled={uploading}
          onchange={handleFileChange}
          class="sr-only"
        />
      </label>

      {#if currentUrl && onRemove}
        <button
          type="button"
          onclick={onRemove}
          class="inline-flex items-center gap-1 border border-[var(--border-subtle)] px-2.5 py-1.5 font-mono-tabular text-[11px] uppercase text-[var(--ink-muted)] hover:border-[var(--spot-accent)] hover:text-[var(--spot-accent)]"
        >
          <Icon name="trash" size={13} />
          <span>Remove</span>
        </button>
      {/if}
    </div>
  </div>

  {#if errorMsg}
    <p role="alert" class="mt-2 text-xs text-[var(--spot-accent)]">{errorMsg}</p>
  {/if}

  {#if currentUrl}
    {#if category === 'cv'}
      <div class="mt-3 flex items-center justify-between border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2">
        <div class="flex items-center gap-2 truncate text-xs text-[var(--ink-primary)]">
          <Icon name="file" size={15} class="shrink-0 text-[var(--spot-accent)]" />
          <span class="truncate font-mono-tabular">{currentName || 'CV.pdf'}</span>
        </div>
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer noopener"
          class="font-mono-tabular text-[11px] uppercase text-[var(--spot-accent)] underline"
        >
          Preview
        </a>
      </div>
    {:else}
      <img
        src={currentUrl}
        alt={label}
        class="mt-3 max-h-44 w-full border border-[var(--border-subtle)] object-cover"
      />
    {/if}
  {/if}
</div>

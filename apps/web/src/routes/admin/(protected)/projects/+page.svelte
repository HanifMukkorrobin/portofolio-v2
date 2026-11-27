<script lang="ts">
  import { untrack } from 'svelte';
  import { hasMissingIndonesianTranslation, type ProjectRecord } from '@portofolio/shared';
  import { apiRequest } from '$lib/api/client';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let items = $state<ProjectRecord[]>([...untrack(() => data.projects)]);
  let filter = $state<'all' | 'published' | 'draft'>('all');
  let busy = $state(false);
  let errorMsg = $state('');

  let filtered = $derived(
    filter === 'all' ? items : items.filter((p) => p.status === filter)
  );

  function isMissingId(p: ProjectRecord): boolean {
    return hasMissingIndonesianTranslation([
      { en: p.titleEn, id: p.titleId },
      { en: p.summaryEn, id: p.summaryId },
      { en: p.contentMdEn, id: p.contentMdId }
    ]);
  }

  async function moveProject(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length || busy) return;

    const next = [...items];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);

    const reindexed = next.map((p, i) => ({ ...p, sortOrder: i }));
    items = reindexed;
    busy = true;
    errorMsg = '';

    try {
      await apiRequest('/api/admin/projects/reorder', {
        method: 'PATCH',
        body: JSON.stringify({
          items: reindexed.map((p) => ({ id: p.id, sortOrder: p.sortOrder }))
        })
      });
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Failed to reorder projects';
    } finally {
      busy = false;
    }
  }

  async function deleteProject(project: ProjectRecord) {
    if (!confirm(`Delete "${project.titleEn || project.slug}" permanently?`)) return;
    busy = true;
    errorMsg = '';
    try {
      await apiRequest(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
      items = items.filter((p) => p.id !== project.id);
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Failed to delete project';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head>
  <title>Projects — Portfolio Admin</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
  <div>
    <h1 class="font-display text-4xl text-[var(--ink-primary)]">Projects & Case Studies</h1>
    <p class="mt-1 text-sm text-[var(--ink-secondary)]">
      Draft, publish, reorder, and monitor Indonesian translation coverage.
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

{#if errorMsg}
  <div role="alert" class="mt-5 border border-[var(--spot-accent)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--spot-accent)]">
    {errorMsg}
  </div>
{/if}

<div class="mt-6 flex items-center gap-2">
  {#each ['all', 'published', 'draft'] as tab}
    <button
      type="button"
      aria-pressed={filter === tab}
      onclick={() => (filter = tab as 'all' | 'published' | 'draft')}
      class={`min-h-11 border px-4 py-2 font-mono-tabular text-xs uppercase tracking-[0.08em] ${
        filter === tab
          ? 'border-[var(--border-hairline)] bg-[var(--ink-primary)] text-[var(--bg-page)]'
          : 'border-[var(--border-subtle)] text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]'
      }`}
    >
      {tab}
    </button>
  {/each}
</div>

<div class="mt-6">
  {#if filtered.length === 0}
    <EmptyState
      title="No projects in this view"
      description="Create your first real project case study using the button above."
    />
  {:else}
    <div class="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      {#each filtered as project, i (project.id)}
        {@const fullIndex = items.findIndex((x) => x.id === project.id)}
        <div class="flex flex-wrap items-center justify-between gap-4 p-5">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono-tabular text-xs text-[var(--ink-muted)]">
                #{project.sortOrder}
              </span>
              <StatusBadge variant={project.status === 'published' ? 'solid' : 'outline'}>
                {project.status}
              </StatusBadge>
              {#if project.featured}
                <StatusBadge variant="outline">Featured</StatusBadge>
              {/if}
              {#if project.isNda}
                <StatusBadge variant="accent">NDA</StatusBadge>
              {/if}
              {#if isMissingId(project)}
                <StatusBadge variant="warn">ID Belum Diterjemahkan</StatusBadge>
              {/if}
            </div>

            <h2 class="mt-2 font-display text-2xl text-[var(--ink-primary)]">
              <a href={`/admin/projects/${project.id}`} class="hover:text-[var(--spot-accent)]">
                {project.titleEn || '(Untitled Draft)'}
              </a>
            </h2>
            <div class="mt-1 font-mono-tabular text-xs text-[var(--ink-muted)]">
              /{project.slug}{project.period ? ` · ${project.period}` : ''}
            </div>
          </div>

          <div class="flex items-center gap-2">
            {#if filter === 'all'}
              <button
                type="button"
                disabled={busy || fullIndex <= 0}
                onclick={() => moveProject(fullIndex, -1)}
                aria-label="Move up"
                class="inline-flex h-11 w-11 items-center justify-center border border-[var(--border-subtle)] text-[var(--ink-secondary)] hover:border-[var(--border-hairline)] disabled:opacity-30"
              >
                <Icon name="chevron-up" size={14} />
              </button>
              <button
                type="button"
                disabled={busy || fullIndex >= items.length - 1}
                onclick={() => moveProject(fullIndex, 1)}
                aria-label="Move down"
                class="inline-flex h-11 w-11 items-center justify-center border border-[var(--border-subtle)] text-[var(--ink-secondary)] hover:border-[var(--border-hairline)] disabled:opacity-30"
              >
                <Icon name="chevron-down" size={14} />
              </button>
            {/if}

            <a
              href={`/admin/projects/${project.id}`}
              class="inline-flex min-h-11 items-center border border-[var(--border-hairline)] px-4 py-2 font-mono-tabular text-xs uppercase tracking-[0.08em] hover:bg-[var(--bg-subtle)]"
            >
              Edit
            </a>

            <button
              type="button"
              disabled={busy}
              onclick={() => deleteProject(project)}
              aria-label="Delete project"
              class="inline-flex h-11 w-11 items-center justify-center border border-[var(--border-subtle)] text-[var(--ink-muted)] hover:border-[var(--spot-accent)] hover:text-[var(--spot-accent)]"
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

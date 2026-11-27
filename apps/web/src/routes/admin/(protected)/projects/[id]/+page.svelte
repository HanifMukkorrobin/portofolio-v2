<script lang="ts">
  import ProjectForm from '$lib/components/admin/ProjectForm.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Edit {data.project.titleEn || data.project.slug} — Portfolio Admin</title>
</svelte:head>

<div class="border-b border-[var(--border-hairline)] pb-5">
  <h1 class="font-display text-4xl text-[var(--ink-primary)]">
    Edit: {data.project.titleEn || data.project.slug}
  </h1>
  <p class="mt-1 font-mono-tabular text-xs text-[var(--ink-muted)]">
    /{data.project.slug}
  </p>
</div>

<div class="mt-8">
  <ProjectForm mode="edit" initial={data.project} />
</div>

<script lang="ts">
  import ProjectForm from '$lib/components/admin/ProjectForm.svelte';
</script>

<svelte:head>
  <title>New Project — Portfolio Admin</title>
</svelte:head>

<div class="border-b border-[var(--border-hairline)] pb-5">
  <h1 class="font-display text-4xl text-[var(--ink-primary)]">New Project</h1>
  <p class="mt-1 text-sm text-[var(--ink-secondary)]">
    Save as Draft anytime; English title and summary are required to Publish.
  </p>
</div>

<div class="mt-8">
  <ProjectForm mode="create" />
</div>

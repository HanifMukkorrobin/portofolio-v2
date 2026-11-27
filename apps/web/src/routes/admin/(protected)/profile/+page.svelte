<script lang="ts">
  import {
    hasMissingIndonesianTranslation,
    type Locale,
    type ServiceItem,
    type SiteProfile,
    type UpdateProfileInput,
    type UploadedMedia
  } from '@portofolio/shared';
  import { untrack } from 'svelte';
  import { apiRequest } from '$lib/api/client';
  import BilingualTabs from '$lib/components/admin/BilingualTabs.svelte';
  import MediaUploader from '$lib/components/admin/MediaUploader.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let activeLocale = $state<Locale>('en');
  let saving = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');

  const seed = untrack(() => data.profile);
  let displayName = $state(seed.displayName);
  let roleEn = $state(seed.roleEn ?? '');
  let roleId = $state(seed.roleId ?? '');
  let taglineEn = $state(seed.taglineEn);
  let taglineId = $state(seed.taglineId);
  let bioEn = $state(seed.bioEn);
  let bioId = $state(seed.bioId);
  let isAvailable = $state(seed.isAvailable);
  let availabilityEn = $state(seed.availabilityEn);
  let availabilityId = $state(seed.availabilityId);
  let services = $state<ServiceItem[]>(structuredClone(seed.services));
  let freelanceCtaEn = $state(seed.freelanceCtaEn);
  let freelanceCtaId = $state(seed.freelanceCtaId);
  let freelanceCtaUrl = $state(seed.freelanceCtaUrl);
  let email = $state(seed.email);
  let githubUrl = $state(seed.githubUrl);
  let linkedinUrl = $state(seed.linkedinUrl);
  let avatarKey = $state<string | null>(seed.avatarKey);
  let avatarUrl = $state<string | null>(seed.avatarUrl);
  let cvPdfKey = $state<string | null>(seed.cvPdfKey);
  let cvPdfUrl = $state<string | null>(seed.cvPdfUrl);
  let cvOriginalName = $state<string | null>(seed.cvOriginalName);

  let missingId = $derived(
    hasMissingIndonesianTranslation([
      { en: roleEn, id: roleId },
      { en: taglineEn, id: taglineId },
      { en: bioEn, id: bioId },
      { en: availabilityEn, id: availabilityId },
      { en: freelanceCtaEn, id: freelanceCtaId },
      ...services.flatMap((s) => [
        { en: s.titleEn, id: s.titleId },
        { en: s.descriptionEn, id: s.descriptionId }
      ])
    ])
  );

  function addService() {
    services = [...services, { titleEn: '', titleId: '', descriptionEn: '', descriptionId: '' }];
  }

  function removeService(idx: number) {
    services = services.filter((_, i) => i !== idx);
  }

  function handleAvatarUploaded(media: UploadedMedia) {
    avatarKey = media.key;
    avatarUrl = media.url;
  }

  function handleCvUploaded(media: UploadedMedia) {
    cvPdfKey = media.key;
    cvPdfUrl = media.url;
    cvOriginalName = media.originalName;
  }

  async function handleSave(event: SubmitEvent) {
    event.preventDefault();
    errorMsg = '';
    successMsg = '';
    saving = true;

    const payload: UpdateProfileInput = {
      displayName: displayName.trim(),
      roleEn: roleEn.trim(),
      roleId: roleId.trim(),
      taglineEn: taglineEn.trim(),
      taglineId: taglineId.trim(),
      bioEn: bioEn.trim(),
      bioId: bioId.trim(),
      isAvailable,
      availabilityEn: availabilityEn.trim(),
      availabilityId: availabilityId.trim(),
      services: services.filter((s) => s.titleEn.trim().length > 0),
      freelanceCtaEn: freelanceCtaEn.trim(),
      freelanceCtaId: freelanceCtaId.trim(),
      freelanceCtaUrl: freelanceCtaUrl.trim(),
      email: email.trim(),
      githubUrl: githubUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      avatarKey,
      cvPdfKey,
      cvOriginalName
    };

    try {
      const res = await apiRequest<{ profile: SiteProfile }>('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      services = res.profile.services;
      successMsg = 'Profile settings saved and live.';
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Failed to save profile';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Profile & Settings — Portfolio Admin</title>
</svelte:head>

<div class="border-b border-[var(--border-hairline)] pb-5">
  <h1 class="font-display text-4xl text-[var(--ink-primary)]">Profile & Site Settings</h1>
  <p class="mt-1 text-sm text-[var(--ink-secondary)]">
    Updates here reflect immediately on both /en and /id public routes.
  </p>
</div>

<form onsubmit={handleSave} class="mt-8 space-y-8">
  {#if errorMsg}
    <div role="alert" class="border border-[var(--spot-accent)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--spot-accent)]">
      {errorMsg}
    </div>
  {/if}
  {#if successMsg}
    <div role="status" aria-live="polite" class="border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 font-mono-tabular text-xs uppercase tracking-[0.08em]">
      {successMsg}
    </div>
  {/if}

  <!-- Identity & Bilingual Copy -->
  <section class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
    <div class="mb-6">
      <label for="displayName" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
        Display Name / Brand Wordmark
      </label>
      <input
        id="displayName"
        type="text"
        bind:value={displayName}
        placeholder="Your full name or handle"
        class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
      />
    </div>

    <BilingualTabs bind:active={activeLocale} {missingId} />

    {#if activeLocale === 'en'}
      <div class="mt-5 space-y-5">
        <div>
          <label for="roleEn" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Role / Title (EN · Optional)
          </label>
          <input
            id="roleEn"
            type="text"
            bind:value={roleEn}
            placeholder="e.g. Senior Frontend & Mobile Engineer"
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
          />
          <p class="mt-1 text-xs text-[var(--ink-muted)]">
            Shown in the editorial spine and metadata line beneath the hero headline.
          </p>
        </div>

        <div>
          <label for="taglineEn" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Display Headline (EN)
          </label>
          <input
            id="taglineEn"
            type="text"
            bind:value={taglineEn}
            placeholder="e.g. Geospatial, High-Scale Web & Legacy Re-Engineering"
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
          />
          <p class="mt-1 text-xs text-[var(--ink-muted)]">
            Keep concise (4–8 words) for sharp editorial display typography.
          </p>
        </div>

        <div>
          <label for="bioEn" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Bio (EN)
          </label>
          <textarea
            id="bioEn"
            rows={4}
            bind:value={bioEn}
            placeholder="Concise engineering background and focus."
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label for="availabilityEn" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
              Availability Status Label (EN)
            </label>
            <input
              id="availabilityEn"
              type="text"
              bind:value={availabilityEn}
              placeholder="e.g. Open to senior roles & freelance"
              class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label for="freelanceCtaEn" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
              Freelance CTA Label (EN)
            </label>
            <input
              id="freelanceCtaEn"
              type="text"
              bind:value={freelanceCtaEn}
              placeholder="e.g. Discuss a Project"
              class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>
    {:else}
      <div class="mt-5 space-y-5">
        <div>
          <label for="roleId" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Peran / Jabatan (ID · Opsional)
          </label>
          <input
            id="roleId"
            type="text"
            bind:value={roleId}
            placeholder={roleEn || 'Fallback ke EN jika kosong'}
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label for="taglineId" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Display Headline (ID · Opsional)
          </label>
          <input
            id="taglineId"
            type="text"
            bind:value={taglineId}
            placeholder={taglineEn || 'Fallback ke EN jika kosong'}
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label for="bioId" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            Bio (ID · Opsional)
          </label>
          <textarea
            id="bioId"
            rows={4}
            bind:value={bioId}
            placeholder={bioEn || 'Fallback ke EN jika kosong'}
            class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label for="availabilityId" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
              Status Availability (ID · Opsional)
            </label>
            <input
              id="availabilityId"
              type="text"
              bind:value={availabilityId}
              placeholder={availabilityEn || 'Fallback ke EN jika kosong'}
              class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label for="freelanceCtaId" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
              Label CTA Freelance (ID · Opsional)
            </label>
            <input
              id="freelanceCtaId"
              type="text"
              bind:value={freelanceCtaId}
              placeholder={freelanceCtaEn || 'Fallback ke EN jika kosong'}
              class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>
    {/if}

    <div class="mt-6 border-t border-[var(--border-subtle)] pt-5">
      <label class="inline-flex cursor-pointer items-center gap-2.5 text-sm">
        <input type="checkbox" bind:checked={isAvailable} class="h-4 w-4 accent-[var(--spot-accent)]" />
        <span>Show active availability indicator publicly</span>
      </label>
    </div>
  </section>

  <!-- Services -->
  <section class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-display text-2xl text-[var(--ink-primary)]">Services ({activeLocale.toUpperCase()})</h2>
        <p class="mt-0.5 text-xs text-[var(--ink-muted)]">
          Displayed on the Services & Freelance section. Switch EN/ID tabs above to translate each item.
        </p>
      </div>
      <button
        type="button"
        onclick={addService}
        class="inline-flex items-center gap-1.5 border border-[var(--border-hairline)] px-3 py-1.5 font-mono-tabular text-xs uppercase hover:bg-[var(--bg-subtle)]"
      >
        <Icon name="plus" size={13} />
        <span>Add Service</span>
      </button>
    </div>

    {#if services.length === 0}
      <p class="mt-4 text-sm text-[var(--ink-muted)]">No services added yet.</p>
    {:else}
      <div class="mt-5 space-y-4">
        {#each services as service, idx}
          <div class="border border-[var(--border-subtle)] bg-[var(--bg-page)] p-4">
            <div class="flex items-center justify-between">
              <span class="font-mono-tabular text-xs uppercase text-[var(--spot-accent)]">
                Service {String(idx + 1).padStart(2, '0')}
              </span>
              <button
                type="button"
                onclick={() => removeService(idx)}
                class="inline-flex items-center gap-1 font-mono-tabular text-[11px] uppercase text-[var(--ink-muted)] hover:text-[var(--spot-accent)]"
              >
                <Icon name="trash" size={12} />
                <span>Remove</span>
              </button>
            </div>

            {#if activeLocale === 'en'}
              <div class="mt-3 grid grid-cols-1 gap-3">
                <input
                  type="text"
                  aria-label={`Service ${idx + 1} title (EN)`}
                  bind:value={service.titleEn}
                  placeholder="Service Title (EN) *"
                  class="w-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                />
                <textarea
                  rows={2}
                  aria-label={`Service ${idx + 1} description (EN)`}
                  bind:value={service.descriptionEn}
                  placeholder="Scope & deliverables (EN)"
                  class="w-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                ></textarea>
              </div>
            {:else}
              <div class="mt-3 grid grid-cols-1 gap-3">
                <input
                  type="text"
                  aria-label={`Judul layanan ${idx + 1} (ID)`}
                  bind:value={service.titleId}
                  placeholder={service.titleEn || 'Judul Layanan (ID)'}
                  class="w-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                />
                <textarea
                  rows={2}
                  aria-label={`Deskripsi layanan ${idx + 1} (ID)`}
                  bind:value={service.descriptionId}
                  placeholder={service.descriptionEn || 'Deskripsi layanan (ID)'}
                  class="w-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                ></textarea>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Direct Contact Links & Freelance CTA URL -->
  <section class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
    <h2 class="font-display text-2xl text-[var(--ink-primary)]">Direct Contact & Links</h2>
    <div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
      <div>
        <label for="email" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="you@domain.com"
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
        />
      </div>

      <div>
        <label for="freelanceCtaUrl" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
          Freelance CTA URL (defaults to mailto:email)
        </label>
        <input
          id="freelanceCtaUrl"
          type="text"
          bind:value={freelanceCtaUrl}
          placeholder="mailto:you@domain.com or https://cal.com/..."
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
        />
      </div>

      <div>
        <label for="githubUrl" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
          GitHub URL
        </label>
        <input
          id="githubUrl"
          type="url"
          bind:value={githubUrl}
          placeholder="https://github.com/username"
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
        />
      </div>

      <div>
        <label for="linkedinUrl" class="block font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
          LinkedIn URL
        </label>
        <input
          id="linkedinUrl"
          type="url"
          bind:value={linkedinUrl}
          placeholder="https://linkedin.com/in/username"
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 font-mono-tabular text-sm"
        />
      </div>
    </div>
  </section>

  <!-- Avatar & Single CV PDF Slot -->
  <section class="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
    <h2 class="font-display text-2xl text-[var(--ink-primary)]">Avatar & CV PDF (Single Slot)</h2>
    <div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
      <MediaUploader
        category="avatar"
        label="Profile Avatar (JPG/PNG/WebP/AVIF, max 5MB)"
        accept="image/jpeg,image/png,image/webp,image/avif"
        currentUrl={avatarUrl}
        onUploaded={handleAvatarUploaded}
        onRemove={() => {
          avatarKey = null;
          avatarUrl = null;
        }}
      />

      <MediaUploader
        category="cv"
        label="CV / Resume (Single PDF slot, max 10MB)"
        accept="application/pdf"
        currentUrl={cvPdfUrl}
        currentName={cvOriginalName}
        onUploaded={handleCvUploaded}
        onRemove={() => {
          cvPdfKey = null;
          cvPdfUrl = null;
          cvOriginalName = null;
        }}
      />
    </div>
  </section>

  <div class="flex justify-end border-t border-[var(--border-hairline)] pt-6">
    <button
      type="submit"
      disabled={saving}
      class="bg-[var(--spot-accent)] px-6 py-2.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--spot-ink)] hover:bg-[var(--spot-accent-hover)] disabled:opacity-60"
    >
      {saving ? 'Saving...' : 'Save Profile'}
    </button>
  </div>
</form>

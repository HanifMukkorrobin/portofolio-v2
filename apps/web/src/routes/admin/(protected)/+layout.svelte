<script lang="ts">
  import type { Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { apiRequest } from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { applyTheme, getInitialTheme, type ThemeMode } from '$lib/theme.svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  let theme = $state<ThemeMode>(getInitialTheme());
  let loggingOut = $state(false);
  let mobileMenuOpen = $state(false);
  let menuButtonEl = $state<HTMLButtonElement | null>(null);

  $effect(() => {
    theme = getInitialTheme();
  });

  function toggleTheme() {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    theme = next;
    applyTheme(next);
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && mobileMenuOpen) {
      mobileMenuOpen = false;
      menuButtonEl?.focus();
    }
  }

  async function handleLogout() {
    loggingOut = true;
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      await goto('/admin/login');
    }
  }

  const navItems = [
    { href: '/admin', label: 'Overview', exact: true },
    { href: '/admin/profile', label: 'Profile & Settings', exact: false },
    { href: '/admin/projects', label: 'Projects', exact: false }
  ];

  function isActive(href: string, exact: boolean): boolean {
    return exact ? page.url.pathname === href : page.url.pathname.startsWith(href);
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div class="min-h-screen bg-[var(--bg-page)] text-[var(--ink-primary)] lg:flex">
  <a
    href="#admin-main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--spot-accent)] focus:px-4 focus:py-2.5 focus:font-mono-tabular focus:text-xs focus:font-medium focus:uppercase focus:tracking-[0.12em] focus:text-[var(--spot-ink)]"
  >
    Skip to main content
  </a>

  <!-- Mobile Admin Sticky Bar + Drawer -->
  <div class="sticky top-0 z-40 lg:hidden">
    <header
      class="relative z-40 flex items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2"
    >
      <a
        href="/admin"
        class="inline-flex min-h-11 min-w-0 items-center truncate font-display text-xl text-[var(--ink-primary)]"
      >
        Portfolio Admin
      </a>

      <div class="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onclick={toggleTheme}
          aria-label="Toggle theme"
          class="inline-flex h-11 w-11 items-center justify-center border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
        </button>

        <button
          bind:this={menuButtonEl}
          type="button"
          onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="admin-mobile-drawer"
          aria-label={mobileMenuOpen ? 'Close admin menu' : 'Open admin menu'}
          class="inline-flex h-11 w-11 items-center justify-center border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
        >
          <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={16} />
        </button>
      </div>
    </header>

    {#if mobileMenuOpen}
      <button
        type="button"
        tabindex="-1"
        aria-label="Close admin menu"
        onclick={() => (mobileMenuOpen = false)}
        class="fixed inset-0 z-30 bg-[var(--ink-primary)]/20"
      ></button>

      <div
        id="admin-mobile-drawer"
        class="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-61px)] overflow-y-auto border-b-2 border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-4"
      >
        <div class="truncate font-mono-tabular text-xs text-[var(--ink-muted)]">
          {data.adminUser.email}
        </div>

        <nav aria-label="Admin navigation" class="mt-4 flex flex-col gap-1.5">
          {#each navItems as item}
            <a
              href={item.href}
              aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
              onclick={() => (mobileMenuOpen = false)}
              class={`flex min-h-11 items-center border px-3 py-2 font-mono-tabular text-xs uppercase tracking-[0.08em] transition-colors ${
                isActive(item.href, item.exact)
                  ? 'border-[var(--border-hairline)] bg-[var(--ink-primary)] text-[var(--bg-page)]'
                  : 'border-transparent text-[var(--ink-secondary)] hover:border-[var(--border-subtle)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {item.label}
            </a>
          {/each}
        </nav>

        <div class="mt-4 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-4">
          <div class="grid grid-cols-2 gap-2">
            <a
              href="/en"
              target="_blank"
              rel="noreferrer noopener"
              class="inline-flex min-h-11 items-center justify-center gap-1.5 border border-[var(--border-hairline)] px-3 py-2 font-mono-tabular text-xs uppercase tracking-[0.08em] hover:bg-[var(--bg-subtle)]"
            >
              <span>Site (EN)</span>
              <Icon name="external" size={12} />
            </a>
            <a
              href="/id"
              target="_blank"
              rel="noreferrer noopener"
              class="inline-flex min-h-11 items-center justify-center gap-1.5 border border-[var(--border-hairline)] px-3 py-2 font-mono-tabular text-xs uppercase tracking-[0.08em] hover:bg-[var(--bg-subtle)]"
            >
              <span>Site (ID)</span>
              <Icon name="external" size={12} />
            </a>
          </div>

          <button
            type="button"
            disabled={loggingOut}
            onclick={handleLogout}
            class="inline-flex min-h-11 items-center justify-center gap-1.5 border border-[var(--border-subtle)] px-3 py-2 font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)] hover:border-[var(--spot-accent)] hover:text-[var(--spot-accent)]"
          >
            <Icon name="logout" size={13} />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Desktop Admin Sidebar -->
  <aside
    class="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:justify-between lg:overflow-y-auto lg:border-r lg:border-[var(--border-hairline)] lg:bg-[var(--bg-surface)] lg:px-6 lg:py-7"
  >
    <div>
      <a href="/admin" class="font-display text-2xl text-[var(--ink-primary)]">
        Portfolio Admin
      </a>
      <div class="mt-0.5 truncate font-mono-tabular text-xs text-[var(--ink-muted)]">
        {data.adminUser.email}
      </div>

      <nav aria-label="Admin navigation" class="mt-8 flex flex-col gap-1.5">
        {#each navItems as item}
          <a
            href={item.href}
            aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
            class={`border px-3 py-2.5 font-mono-tabular text-xs uppercase tracking-[0.08em] transition-colors ${
              isActive(item.href, item.exact)
                ? 'border-[var(--border-hairline)] bg-[var(--ink-primary)] text-[var(--bg-page)]'
                : 'border-transparent text-[var(--ink-secondary)] hover:border-[var(--border-subtle)] hover:text-[var(--ink-primary)]'
            }`}
          >
            {item.label}
          </a>
        {/each}
      </nav>
    </div>

    <div class="mt-6 flex flex-col items-stretch gap-2 border-t border-[var(--border-subtle)] pt-4">
      <div class="flex gap-2">
        <a
          href="/en"
          target="_blank"
          rel="noreferrer noopener"
          class="inline-flex flex-1 items-center justify-center gap-1 border border-[var(--border-hairline)] px-2.5 py-2 font-mono-tabular text-xs uppercase tracking-[0.06em] hover:bg-[var(--bg-subtle)]"
        >
          <span>EN</span>
          <Icon name="external" size={12} />
        </a>
        <a
          href="/id"
          target="_blank"
          rel="noreferrer noopener"
          class="inline-flex flex-1 items-center justify-center gap-1 border border-[var(--border-hairline)] px-2.5 py-2 font-mono-tabular text-xs uppercase tracking-[0.06em] hover:bg-[var(--bg-subtle)]"
        >
          <span>ID</span>
          <Icon name="external" size={12} />
        </a>

        <button
          type="button"
          onclick={toggleTheme}
          aria-label="Toggle theme"
          class="inline-flex items-center justify-center border border-[var(--border-hairline)] px-3 py-2 hover:bg-[var(--bg-subtle)]"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
        </button>
      </div>

      <button
        type="button"
        disabled={loggingOut}
        onclick={handleLogout}
        class="inline-flex items-center justify-center gap-1.5 border border-[var(--border-subtle)] px-3 py-2 font-mono-tabular text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)] hover:border-[var(--spot-accent)] hover:text-[var(--spot-accent)]"
      >
        <Icon name="logout" size={13} />
        <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
      </button>
    </div>
  </aside>

  <main id="admin-main-content" class="min-w-0 flex-1 px-5 py-7 md:px-10 md:py-10">
    <div class="mx-auto max-w-5xl">
      {@render children()}
    </div>
  </main>
</div>

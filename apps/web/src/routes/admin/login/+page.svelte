<script lang="ts">
  import { goto } from '$app/navigation';
  import { apiRequest } from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { applyTheme, getInitialTheme, type ThemeMode } from '$lib/theme.svelte';

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let theme = $state<ThemeMode>(getInitialTheme());
  let submitting = $state(false);
  let errorMsg = $state('');

  $effect(() => {
    theme = getInitialTheme();
  });

  function toggleTheme() {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    theme = next;
    applyTheme(next);
  }

  async function handleLogin(event: SubmitEvent) {
    event.preventDefault();
    errorMsg = '';
    submitting = true;

    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      await goto('/admin');
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Login failed';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Admin Login — Portfolio</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4 py-12">
  <div class="w-full max-w-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-8">
    <div class="border-b border-[var(--border-subtle)] pb-5">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <h1 class="font-display text-4xl text-[var(--ink-primary)]">Admin Sign In</h1>
          <Icon name="lock" size={18} class="text-[var(--spot-accent)]" />
        </div>
        <button
          type="button"
          onclick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          class="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--border-hairline)] text-[var(--ink-primary)] transition-colors hover:bg-[var(--bg-subtle)]"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
        </button>
      </div>
      <p class="mt-2 text-sm text-[var(--ink-secondary)]">
        Single-owner dashboard for managing portfolio profile, CV PDF, and project case studies.
      </p>
    </div>

    <form onsubmit={handleLogin} class="mt-6 space-y-5">
      {#if errorMsg}
        <div
          role="alert"
          class="border border-[var(--spot-accent)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm text-[var(--spot-accent)]"
        >
          {errorMsg}
        </div>
      {/if}

      <div>
        <label for="email" class="block font-mono-tabular text-xs uppercase tracking-[0.1em] text-[var(--ink-secondary)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autocomplete="email"
          bind:value={email}
          class="mt-1.5 w-full border border-[var(--border-hairline)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)]"
        />
      </div>

      <div>
        <label for="password" class="block font-mono-tabular text-xs uppercase tracking-[0.1em] text-[var(--ink-secondary)]">
          Password
        </label>
        <div class="mt-1.5 flex border border-[var(--border-hairline)] bg-[var(--bg-page)]">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            minlength="8"
            autocomplete="current-password"
            bind:value={password}
            class="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-[var(--ink-primary)]"
          />
          <button
            type="button"
            onclick={() => (showPassword = !showPassword)}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            class="inline-flex min-h-11 w-11 shrink-0 items-center justify-center border-l border-[var(--border-subtle)] text-[var(--ink-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--ink-primary)]"
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={15} />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        class="min-h-11 w-full bg-[var(--spot-accent)] px-4 py-3 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--spot-ink)] transition-colors hover:bg-[var(--spot-accent-hover)] disabled:opacity-60"
      >
        {submitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>

    <div class="mt-6 border-t border-[var(--border-subtle)] pt-4">
      <a
        href="/en"
        class="inline-flex min-h-11 items-center gap-1.5 font-mono-tabular text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
      >
        <Icon name="arrow-left" size={13} />
        <span>Return to public portfolio</span>
      </a>
    </div>
  </div>
</main>

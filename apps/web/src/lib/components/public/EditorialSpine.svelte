<script lang="ts">
  import {
    LOCALE_COOKIE_NAME,
    resolveHeadlineAndRole,
    resolveLocalized,
    type Locale,
    type SiteProfile
  } from '@portofolio/shared';
  import { page } from '$app/state';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { UI_COPY } from '$lib/i18n/ui-copy';
  import { applyTheme, getInitialTheme, type ThemeMode } from '$lib/theme.svelte';

  type SectionId = 'work' | 'services' | 'experience';

  let {
    locale,
    profile,
    hasServices,
    hasExperience
  }: {
    locale: Locale;
    profile: SiteProfile;
    hasServices: boolean;
    hasExperience: boolean;
  } = $props();

  let copy = $derived(UI_COPY[locale]);
  let theme = $state<ThemeMode>(getInitialTheme());
  let mobileMenuOpen = $state(false);
  let activeSection = $state<SectionId>('work');
  let menuButtonEl = $state<HTMLButtonElement | null>(null);

  let isHome = $derived(page.url.pathname === `/${locale}` || page.url.pathname === `/${locale}/`);

  $effect(() => {
    theme = getInitialTheme();
  });

  $effect(() => {
    if (typeof document === 'undefined') return;
    if (!isHome) {
      activeSection = 'work';
      return;
    }

    const sectionIds: SectionId[] = ['work', 'services', 'experience'];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const visibleRatios = new Map<SectionId, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          visibleRatios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let best: SectionId | null = null;
        let bestRatio = 0;
        for (const id of sectionIds) {
          const ratio = visibleRatios.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) {
          activeSection = best;
        }
      },
      { rootMargin: '-18% 0px -55% 0px', threshold: [0, 0.15, 0.35, 0.6] }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  });

  function toggleTheme() {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    theme = next;
    applyTheme(next);
  }

  function buildLocaleHref(target: Locale): string {
    const pathname = page.url.pathname;
    const stripped = pathname.replace(/^\/(en|id)(?=\/|$)/, '');
    return `/${target}${stripped}`;
  }

  function rememberLocale(target: Locale) {
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE_NAME}=${target}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
    mobileMenuOpen = false;
  }

  function handleNavClick(section: SectionId) {
    activeSection = section;
    mobileMenuOpen = false;
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && mobileMenuOpen) {
      mobileMenuOpen = false;
      menuButtonEl?.focus();
    }
  }

  let brandLabel = $derived(profile.displayName.trim() || copy.hero.defaultBrand);
  let rawTagline = $derived(resolveLocalized(profile.taglineEn, profile.taglineId, locale));
  let rawRole = $derived(resolveLocalized(profile.roleEn ?? '', profile.roleId ?? '', locale));
  let spineRole = $derived(resolveHeadlineAndRole(rawTagline, rawRole).role);

  let cvDownloadHref = $derived(
    profile.cvPdfKey
      ? `/api/media/${profile.cvPdfKey}?download=1&name=${encodeURIComponent(profile.cvOriginalName || 'CV.pdf')}`
      : null
  );

  let navItems = $derived<Array<{ id: SectionId; label: string }>>([
    { id: 'work', label: copy.nav.work },
    ...(hasServices ? [{ id: 'services' as const, label: copy.nav.services }] : []),
    ...(hasExperience ? [{ id: 'experience' as const, label: copy.nav.experience }] : [])
  ]);

  let contactLinks = $derived([
    ...(profile.email
      ? [{ label: 'Email', href: `mailto:${profile.email}`, external: false, isEmail: true }]
      : []),
    ...(profile.githubUrl
      ? [{ label: 'GitHub', href: profile.githubUrl, external: true, isEmail: false }]
      : []),
    ...(profile.linkedinUrl
      ? [{ label: 'LinkedIn', href: profile.linkedinUrl, external: true, isEmail: false }]
      : [])
  ]);
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<!-- Mobile Sticky Top Bar + Anchored Dropdown Drawer -->
<div class="sticky top-0 z-40 lg:hidden">
  <header
    class="relative z-40 flex items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[var(--bg-page)] px-4 py-2"
  >
    <a
      href={`/${locale}`}
      class="inline-flex min-h-11 min-w-0 items-center truncate font-display text-lg tracking-tight text-[var(--ink-primary)] sm:text-2xl"
    >
      <span class="truncate">{brandLabel}</span>
    </a>

    <div class="flex shrink-0 items-center gap-1.5">
      <div class="flex border border-[var(--border-hairline)] font-mono-tabular text-xs font-medium uppercase">
        <a
          href={buildLocaleHref('en')}
          hreflang="en"
          aria-current={locale === 'en' ? 'page' : undefined}
          onclick={() => rememberLocale('en')}
          class={`inline-flex min-h-11 min-w-11 items-center justify-center px-2.5 ${
            locale === 'en'
              ? 'bg-[var(--ink-primary)] text-[var(--bg-page)]'
              : 'text-[var(--ink-primary)]'
          }`}
        >
          EN
        </a>
        <a
          href={buildLocaleHref('id')}
          hreflang="id"
          aria-current={locale === 'id' ? 'page' : undefined}
          onclick={() => rememberLocale('id')}
          class={`inline-flex min-h-11 min-w-11 items-center justify-center border-l border-[var(--border-hairline)] px-2.5 ${
            locale === 'id'
              ? 'bg-[var(--ink-primary)] text-[var(--bg-page)]'
              : 'text-[var(--ink-primary)]'
          }`}
        >
          ID
        </a>
      </div>

      <button
        type="button"
        onclick={toggleTheme}
        aria-label={theme === 'dark' ? copy.nav.themeLight : copy.nav.themeDark}
        class="inline-flex h-11 w-11 items-center justify-center border border-[var(--border-hairline)] text-[var(--ink-primary)]"
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
      </button>

      <button
        bind:this={menuButtonEl}
        type="button"
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-nav-drawer"
        aria-label={mobileMenuOpen ? copy.nav.close : copy.nav.menu}
        class="inline-flex h-11 w-11 items-center justify-center border border-[var(--border-hairline)] text-[var(--ink-primary)]"
      >
        <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={16} />
      </button>
    </div>
  </header>

  {#if mobileMenuOpen}
    <button
      type="button"
      tabindex="-1"
      aria-label={copy.nav.close}
      onclick={() => (mobileMenuOpen = false)}
      class="fixed inset-0 z-30 bg-[var(--ink-primary)]/20"
    ></button>

    <div
      id="mobile-nav-drawer"
      class="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-61px)] overflow-y-auto border-b-2 border-[var(--border-hairline)] bg-[var(--bg-page)] px-4 py-4"
    >
      <nav
        aria-label={copy.nav.primaryNav}
        class="flex flex-col font-mono-tabular text-xs font-medium uppercase tracking-[0.12em]"
      >
        {#each navItems as item}
          <a
            href={isHome ? `#${item.id}` : `/${locale}#${item.id}`}
            onclick={() => handleNavClick(item.id)}
            class={`flex min-h-11 items-center gap-2.5 ${
              activeSection === item.id ? 'text-[var(--ink-primary)]' : 'pl-4 text-[var(--ink-secondary)]'
            }`}
          >
            {#if activeSection === item.id}
              <span class="h-1.5 w-1.5 shrink-0 bg-[var(--spot-accent)]"></span>
            {/if}
            <span>{item.label}</span>
          </a>
        {/each}
      </nav>

      {#if contactLinks.length > 0}
        <div class="mt-4 grid grid-cols-1 gap-2 border-t border-[var(--border-subtle)] pt-4">
          {#each contactLinks as link}
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer noopener' : undefined}
              onclick={() => (mobileMenuOpen = false)}
              class="flex min-h-11 items-center justify-between border border-[var(--border-hairline)] px-3.5 py-2.5 font-mono-tabular text-xs uppercase tracking-[0.1em] text-[var(--ink-primary)]"
            >
              <span>{link.label}</span>
              <Icon name={link.isEmail ? 'mail' : 'chevron-right'} size={14} />
            </a>
          {/each}
        </div>
      {/if}

      {#if cvDownloadHref}
        <a
          href={cvDownloadHref}
          class="mt-4 flex min-h-11 w-full items-center justify-center gap-2 bg-[var(--spot-accent)] px-4 py-3 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--spot-ink)] hover:bg-[var(--spot-accent-hover)]"
        >
          <Icon name="download" size={14} />
          <span>{copy.nav.downloadCv}</span>
        </a>
      {/if}
    </div>
  {/if}
</div>

<!-- Desktop Fixed Left Editorial Spine -->
<aside
  class="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[264px] lg:shrink-0 lg:flex-col lg:justify-between lg:overflow-y-auto lg:border-r lg:border-[var(--border-hairline)] lg:bg-[var(--bg-page)] lg:px-7 lg:py-8"
>
  <div>
    <!-- Masthead -->
    <a href={`/${locale}`} class="group block">
      <div class="font-display text-[2rem] leading-none tracking-[-0.02em] text-[var(--ink-primary)]">
        {brandLabel}
      </div>
      {#if spineRole}
        <div class="mt-2.5 font-mono-tabular text-xs leading-snug text-[var(--ink-muted)]">
          {spineRole}
        </div>
      {/if}
    </a>

    <!-- Vertical Section Index -->
    <nav
      aria-label={copy.nav.primaryNav}
      class="mt-10 flex flex-col gap-3.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.14em]"
    >
      {#each navItems as item}
        <a
          href={isHome ? `#${item.id}` : `/${locale}#${item.id}`}
          onclick={() => handleNavClick(item.id)}
          class={`flex items-center gap-2.5 transition-colors hover:text-[var(--spot-accent)] ${
            activeSection === item.id
              ? 'text-[var(--ink-primary)]'
              : 'pl-4 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
          }`}
        >
          {#if activeSection === item.id}
            <span class="h-1.5 w-1.5 shrink-0 bg-[var(--spot-accent)]"></span>
          {/if}
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>

    <!-- Utility Controls (EN|ID & Theme) -->
    <div class="mt-10 border-t border-[var(--border-subtle)] pt-6">
      <div class="font-mono-tabular text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)]">
        {copy.nav.utility}
      </div>
      <div class="mt-3 flex items-center gap-2">
        <div
          class="inline-flex border border-[var(--border-hairline)] font-mono-tabular text-xs font-medium uppercase"
        >
          <a
            href={buildLocaleHref('en')}
            hreflang="en"
            aria-current={locale === 'en' ? 'page' : undefined}
            onclick={() => rememberLocale('en')}
            class={`px-2.5 py-1.5 transition-colors ${
              locale === 'en'
                ? 'bg-[var(--ink-primary)] text-[var(--bg-page)]'
                : 'text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            EN
          </a>
          <a
            href={buildLocaleHref('id')}
            hreflang="id"
            aria-current={locale === 'id' ? 'page' : undefined}
            onclick={() => rememberLocale('id')}
            class={`border-l border-[var(--border-hairline)] px-2.5 py-1.5 transition-colors ${
              locale === 'id'
                ? 'bg-[var(--ink-primary)] text-[var(--bg-page)]'
                : 'text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            ID
          </a>
        </div>

        <button
          type="button"
          onclick={toggleTheme}
          class="inline-flex flex-1 items-center justify-center gap-1.5 border border-[var(--border-hairline)] px-2.5 py-1.5 font-mono-tabular text-xs font-medium uppercase tracking-[0.06em] text-[var(--ink-primary)] transition-colors hover:bg-[var(--bg-subtle)]"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={13} />
          <span>{theme === 'dark' ? copy.nav.themeLight : copy.nav.themeDark}</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Bottom Contact Channels & Primary CV Download -->
  <div class="mt-8 border-t border-[var(--border-subtle)] pt-6">
    {#if contactLinks.length > 0}
      <div class="font-mono-tabular text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)]">
        {copy.nav.contact}
      </div>
      <div class="mt-3 flex flex-col gap-2">
        {#each contactLinks as link}
          <a
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noreferrer noopener' : undefined}
            class="flex items-center justify-between border border-[var(--border-hairline)] px-3 py-2 font-mono-tabular text-xs font-medium uppercase tracking-[0.1em] text-[var(--ink-primary)] transition-colors hover:bg-[var(--ink-primary)] hover:text-[var(--bg-page)]"
          >
            <span>{link.label}</span>
            <Icon name={link.isEmail ? 'mail' : 'chevron-right'} size={13} />
          </a>
        {/each}
      </div>
    {/if}

    {#if cvDownloadHref}
      <a
        href={cvDownloadHref}
        class="mt-5 flex w-full items-center justify-center gap-2 bg-[var(--spot-accent)] px-4 py-3 font-mono-tabular text-xs font-medium uppercase tracking-[0.12em] text-[var(--spot-ink)] transition-colors hover:bg-[var(--spot-accent-hover)]"
      >
        <Icon name="download" size={14} />
        <span>{copy.nav.downloadCv}</span>
      </a>
    {/if}
  </div>
</aside>

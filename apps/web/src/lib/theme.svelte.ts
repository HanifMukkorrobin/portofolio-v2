export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'portfolio_theme';

export function getInitialTheme(): ThemeMode {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.dataset.theme;
    if (attr === 'dark' || attr === 'light') return attr;
  }
  return 'light';
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
  document.documentElement.classList.toggle('dark', mode === 'dark');
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore storage quota errors
  }
}

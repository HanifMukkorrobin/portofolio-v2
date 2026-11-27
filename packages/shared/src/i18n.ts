export const SUPPORTED_LOCALES = ['en', 'id'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE_NAME = 'portfolio_locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Resolves localized text for the requested locale.
 * English (`en`) is the primary language; Indonesian (`id`) falls back to `en` when empty.
 */
export function resolveLocalized(
  en: string,
  id: string | null | undefined,
  locale: Locale
): string {
  if (locale === 'id' && typeof id === 'string' && id.trim().length > 0) {
    return id;
  }
  return en;
}

export interface LocalizedPair {
  en: string | null | undefined;
  id: string | null | undefined;
}

/**
 * Returns true if any non-empty English field is missing its Indonesian translation.
 * Used in /admin to surface untranslated status indicators.
 */
export function hasMissingIndonesianTranslation(fields: LocalizedPair[]): boolean {
  return fields.some(({ en, id }) => {
    const hasEn = typeof en === 'string' && en.trim().length > 0;
    const hasId = typeof id === 'string' && id.trim().length > 0;
    return hasEn && !hasId;
  });
}

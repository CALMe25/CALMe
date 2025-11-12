/* TypeScript declarations for Paraglide runtime */

export type AvailableLanguageTag = "en" | "he";

export const availableLanguageTags: readonly AvailableLanguageTag[];
export const baseLocale: AvailableLanguageTag;
export const locales: readonly AvailableLanguageTag[];

export function languageTag(): AvailableLanguageTag;
export function setLanguageTag(
  tag: AvailableLanguageTag | (() => AvailableLanguageTag),
): void;
export function onSetLanguageTag(
  fn: (languageTag: AvailableLanguageTag) => void,
): () => void;
export function isAvailableLanguageTag(
  thing: unknown,
): thing is AvailableLanguageTag;

export const cookieName: string;
export const cookieMaxAge: number;
export const cookieDomain: string;
export const localStorageKey: string;

export function isLocale(locale: unknown): locale is AvailableLanguageTag;
export function assertIsLocale(input: unknown): AvailableLanguageTag;

export const isServer: boolean;

export function getLocale(): AvailableLanguageTag;
export function setLocale(
  newLocale: AvailableLanguageTag,
  options?: { cookie?: boolean },
): void;

export function extractLocaleFromCookie(): string | undefined;
export function extractLocaleFromNavigator(): AvailableLanguageTag | undefined;

export function trackMessageCall(
  message: string,
  locale: AvailableLanguageTag,
): void;

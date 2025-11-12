// Legacy i18n stub for backwards compatibility during migration
// This file exists only to prevent breaking imports while migrating to Paraglide
import * as m from "../paraglide/messages.js";
import type { ReactNode } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export type LanguageTag = "en" | "he";
export type Messages = any; // Stub type

// Stub hook that provides basic compatibility
export function useI18n() {
  const { currentLanguage } = useLanguage();
  const currentLanguageTag = currentLanguage as LanguageTag;

  const t = (key: string, params?: Record<string, any>): string => {
    const fnName = key.replace(/\./g, "_");
    const fn = (m as any)[fnName];

    if (typeof fn === "function") {
      return fn(params || {});
    }

    // Try with number suffixes
    for (let i = 1; i <= 10; i++) {
      const numberedFn = (m as any)[`${fnName}${i}`];
      if (typeof numberedFn === "function") {
        return numberedFn(params || {});
      }
    }

    console.warn(`Translation key not found: ${key}`);
    return key;
  };

  return {
    languageTag: currentLanguageTag,
    setLanguageTag: () => {}, // Deprecated, use LanguageSwitcher component
    t,
    messages: {}, // Deprecated, use Paraglide messages directly
    dir: currentLanguageTag === "he" ? "rtl" as const : "ltr" as const,
  };
}

// Stub provider that does nothing (Paraglide doesn't need a provider)
export function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

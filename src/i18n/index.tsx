import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import enMessages from "./messages/en.json";
import heMessages from "./messages/he.json";
import enConversationNodes from "./messages/conversationNodes-en.json";
import heConversationNodes from "./messages/conversationNodes-he.json";

export type LanguageTag = "en" | "he";

export type Messages = typeof enMessages;

interface I18nContextType {
  languageTag: LanguageTag;
  setLanguageTag: (lang: LanguageTag) => void;
  messages: Messages;
  t: (key: string, params?: Record<string, string>) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Merge conversation nodes into main messages
const messages: Record<LanguageTag, Messages> = {
  en: { ...enMessages, conversationNodes: enConversationNodes } as Messages,
  he: { ...heMessages, conversationNodes: heConversationNodes } as Messages,
};

const RTL_LANGUAGES: LanguageTag[] = ["he"];

const STORAGE_KEY = "calme-language";

// Map language tags to full locale codes for HTML lang attribute and external tools
const LOCALE_MAP: Record<LanguageTag, string> = {
  en: "en-US",
  he: "he-IL",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (isRecord(current) && key in current) {
      current = current[key];
    } else {
      return ""; // Return empty string if not found (allows fallback)
    }
  }

  return typeof current === "string" ? current : "";
}

function interpolate(
  template: string,
  params?: Record<string, string>,
): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    return params[key] ?? `{${key}}`;
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [languageTag, setLanguageTagState] = useState<LanguageTag>(() => {
    // Try to get from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "he") {
      return stored;
    }

    // Try to detect from browser
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("he")) {
      return "he";
    }

    return "en";
  });

  const setLanguageTag = useCallback((lang: LanguageTag) => {
    setLanguageTagState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = LOCALE_MAP[lang];
    document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const message = getNestedValue(messages[languageTag], key);
      return interpolate(message, params);
    },
    [languageTag],
  );

  const dir = RTL_LANGUAGES.includes(languageTag) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = LOCALE_MAP[languageTag];
    document.documentElement.dir = dir;
    document.title = messages[languageTag].app.title;
  }, [languageTag, dir]);

  const value: I18nContextType = {
    languageTag,
    setLanguageTag,
    messages: messages[languageTag],
    t,
    dir,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getLocale, setLocale, locales } from "../paraglide/runtime.js";

interface LanguageContextType {
  currentLocale: string;
  triggerUpdate: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLocale: "en",
  triggerUpdate: () => {},
});

const LOCALE_STORAGE_KEY = "calme-locale";

const isSupportedLocale = (
  value: string | null,
): value is (typeof locales)[number] => {
  if (value == null || value === "") return false;
  return (locales as readonly string[]).includes(value);
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLocale, setCurrentLocale] = useState(getLocale());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isSupportedLocale(stored)) {
      void setLocale(stored, { reload: false });
      setCurrentLocale(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, currentLocale);
    const dir = currentLocale === "he" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", currentLocale);
  }, [currentLocale]);

  const triggerUpdate = () => {
    setCurrentLocale(getLocale());
  };

  return (
    <LanguageContext.Provider value={{ currentLocale, triggerUpdate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

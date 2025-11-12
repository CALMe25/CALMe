import { createContext, useContext, type ReactNode } from "react";
import { getLocale } from "../paraglide/runtime.js";

interface LanguageContextType {
  currentLanguage: string;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "en",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageContext.Provider value={{ currentLanguage: getLocale() }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

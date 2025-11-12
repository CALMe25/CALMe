import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { languageTag, onSetLanguageTag } from "../paraglide/runtime.js";

interface LanguageContextType {
  currentLanguage: string;
}

const LanguageContext = createContext<LanguageContextType>({ currentLanguage: "en" });

// Track if we've already set up the callback
let callbackSet = false;
let setLanguageState: ((lang: string) => void) | null = null;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => languageTag());

  useEffect(() => {
    // Only set up the callback once globally
    if (!callbackSet) {
      callbackSet = true;
      setLanguageState = setCurrentLanguage;

      onSetLanguageTag((newTag) => {
        if (setLanguageState) {
          setLanguageState(newTag);
        }
      });
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

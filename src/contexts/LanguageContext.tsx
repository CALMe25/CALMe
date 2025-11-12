import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { languageTag, onSetLanguageTag } from "../paraglide/runtime.js";

interface LanguageContextType {
  currentLanguage: string;
}

const LanguageContext = createContext<LanguageContextType>({ currentLanguage: "en" });

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Use a simple counter to force re-renders when language changes
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    // Set up callback to trigger re-render on language change
    return onSetLanguageTag(() => {
      forceUpdate();
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage: languageTag() }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

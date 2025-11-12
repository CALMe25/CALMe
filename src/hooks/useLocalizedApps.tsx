import { useMemo } from "react";
import * as m from "../paraglide/messages.js";
import { InnerApps, type AppInterface } from "../appsData";
import { useLanguage } from "../contexts/LanguageContext";

export function useLocalizedApps(): AppInterface[] {
  const { currentLanguage } = useLanguage();

  return useMemo(() => {
    // Helper to get message by key
    const getMessage = (key: string): string => {
      const fnName = key.replace(/\./g, "_");
      const fn = (m as any)[fnName];
      if (typeof fn === "function") {
        return fn();
      }
      console.warn(`Translation key not found: ${key}`);
      return key;
    };

    // Map kebab-case names to camelCase for lookup
    const nameMap: Record<string, string> = {
      "matching-cards": "matchingCards",
      "number-guessing": "numberGuessing",
    };

    return InnerApps.map((app) => {
      const lookupName = nameMap[app.name] || app.name;

      return {
        ...app,
        label: getMessage(`activities.${lookupName}.label`),
        description: getMessage(`activities.${lookupName}.description`),
      };
    });
    // currentLanguage intentionally included to trigger re-evaluation on language change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);
}

import { useMemo } from "react";
import { useI18n } from "../i18n";
import { InnerApps, type AppInterface } from "../appsData";

export function useLocalizedApps(): AppInterface[] {
  const { t } = useI18n();

  return useMemo(() => {
    // Map kebab-case names to camelCase for lookup
    const nameMap: Record<string, string> = {
      "matching-cards": "matchingCards",
      "number-guessing": "numberGuessing",
    };

    return InnerApps.map((app) => {
      const lookupName = nameMap[app.name] || app.name;

      return {
        ...app,
        label: t(`activities.${lookupName}.label`),
        description: t(`activities.${lookupName}.description`),
      };
    });
  }, [t]);
}

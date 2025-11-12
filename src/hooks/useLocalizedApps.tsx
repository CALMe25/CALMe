import { useMemo } from "react";
import * as m from "../paraglide/messages.js";
import { InnerApps, type AppInterface } from "../appsData";
import { useLanguage } from "../contexts/LanguageContext";

export function useLocalizedApps(): AppInterface[] {
  const { currentLanguage } = useLanguage();

  return useMemo(() => {
    // Force recomputation when language changes by referencing currentLanguage
    void currentLanguage;

    // Map app names to their localized labels and descriptions
    const translations: Record<string, { label: string; description: string }> =
      {
        breathing: {
          label: m.activities_breathing_label(),
          description: m.activities_breathing_description(),
        },
        stretching: {
          label: m.activities_stretching_label(),
          description: m.activities_stretching_description(),
        },
        "matching-cards": {
          label: m.activities_matchingCards_label(),
          description: m.activities_matchingCards_description(),
        },
        sudoku: {
          label: m.activities_sudoku_label(),
          description: m.activities_sudoku_description(),
        },
        puzzle: {
          label: m.activities_puzzle_label(),
          description: m.activities_puzzle_description(),
        },
        paint: {
          label: m.activities_paint_label(),
          description: m.activities_paint_description(),
        },
        snake: {
          label: m.activities_snake_label(),
          description: m.activities_snake_description(),
        },
        "number-guessing": {
          label: m.activities_numberGuessing_label(),
          description: m.activities_numberGuessing_description(),
        },
      };

    return InnerApps.map((app) => ({
      ...app,
      label: translations[app.name]?.label || app.label,
      description: translations[app.name]?.description || app.description,
    }));
  }, [currentLanguage]);
}

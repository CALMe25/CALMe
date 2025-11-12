import { Languages } from "lucide-react";
import { Button } from "../chat_interface/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../chat_interface/ui/dropdown-menu";
import { setLocale, locales } from "../paraglide/runtime.js";
import { useState } from "react";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  he: "עברית",
};

export function LanguageSwitcher() {
  const [currentLocale] = useState();

  const handleSetLocale = (locale: (typeof locales)[number]) => {
    void setLocale(locale, { reload: false });

    // Apply RTL for Hebrew
    if (locale === "he") {
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "he");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
      document.documentElement.setAttribute("lang", "en");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
          <Languages className="w-4 h-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => {
              handleSetLocale(locale);
            }}
            className={
              currentLocale === locale ? "bg-accent font-semibold" : ""
            }
          >
            <span className="flex items-center gap-2">
              {LANGUAGE_NAMES[locale]}
              {currentLocale === locale && <span className="text-xs">✓</span>}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { Languages } from "lucide-react";
import { Button } from "../chat_interface/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../chat_interface/ui/dropdown-menu";
import { setLocale, locales } from "../paraglide/runtime.js";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages.js";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  he: "עברית",
};

interface LanguageSwitcherProps {
  variant?: "icon" | "menu";
}

export function LanguageSwitcher({ variant = "icon" }: LanguageSwitcherProps) {
  const { currentLocale, triggerUpdate } = useLanguage();

  const handleSetLocale = (locale: (typeof locales)[number]) => {
    void setLocale(locale, { reload: false });
    triggerUpdate();
  };

  const triggerContent = (
    <>
      <Languages className="w-4 h-4" />
      {variant === "icon" ? (
        <span className="sr-only">{m.common_switchLanguage()}</span>
      ) : (
        <span className="text-sm font-medium">
          {LANGUAGE_NAMES[currentLocale]}
        </span>
      )}
    </>
  );

  const triggerClassName =
    variant === "icon"
      ? "h-10 w-10 p-0"
      : "h-10 px-3 gap-2 border border-border rounded-lg";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={triggerClassName}>
          {triggerContent}
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

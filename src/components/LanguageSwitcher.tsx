import { Languages } from "lucide-react";
import { Button } from "../chat_interface/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../chat_interface/ui/dropdown-menu";
import { useI18n, type LanguageTag } from "../i18n";

const LANGUAGES: { code: LanguageTag; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
];

export function LanguageSwitcher() {
  const { languageTag, setLanguageTag } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
          <Languages className="w-4 h-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLanguageTag(lang.code);
            }}
            className={
              languageTag === lang.code ? "bg-accent font-semibold" : ""
            }
          >
            <span className="flex items-center gap-2">
              {lang.nativeName}
              {languageTag === lang.code && <span className="text-xs">✓</span>}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

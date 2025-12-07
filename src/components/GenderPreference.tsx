import { UserRound } from "lucide-react";
import { Button } from "../chat_interface/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../chat_interface/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../chat_interface/ui/select";
import { useUserPreferences, type UserGender } from "../contexts/UserPreferencesContext";
import { m } from "../paraglide/messages.js";

function useGenderOptions() {
  return [
    {
      value: "unspecified" as UserGender,
      label: m.preferences_gender_option_unspecified(),
    },
    {
      value: "male" as UserGender,
      label: m.preferences_gender_option_male(),
    },
    {
      value: "female" as UserGender,
      label: m.preferences_gender_option_female(),
    },
  ];
}

export function GenderPreferenceSwitcher() {
  const { userGender, setUserGender } = useUserPreferences();
  const options = useGenderOptions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
          <UserRound className="w-4 h-4" />
          <span className="sr-only">{m.preferences_gender_switcher()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => {
              setUserGender(option.value);
            }}
            className={userGender === option.value ? "bg-accent font-semibold" : ""}
          >
            <span className="flex w-full items-center justify-between gap-2">
              {option.label}
              {userGender === option.value && <span className="text-xs">✓</span>}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface GenderPreferenceSelectProps {
  showLabel?: boolean;
  className?: string;
}

export function GenderPreferenceSelect({
  showLabel = true,
  className = "",
}: GenderPreferenceSelectProps) {
  const { userGender, setUserGender } = useUserPreferences();
  const options = useGenderOptions();

  return (
    <div className={`flex flex-col gap-1 ${showLabel ? "px-3" : ""} ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          {m.preferences_gender_switcher()}
        </span>
      )}
      <Select
        value={userGender}
        onValueChange={(value: UserGender) => {
          setUserGender(value);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={m.preferences_gender_switcher()} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

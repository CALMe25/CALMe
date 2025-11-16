import { Button } from "../chat_interface/ui/button";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function DarkModeToggle() {
  const { theme, cycleTheme } = useTheme();

  const renderIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      case "system":
        return <Laptop className="w-4 h-4" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8"
      onClick={cycleTheme}
      aria-label="Toggle theme"
    >
      {renderIcon()}
    </Button>
  );
}

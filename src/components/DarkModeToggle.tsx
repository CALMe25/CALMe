
import { useState, useEffect } from 'react';
import { Button } from "../chat_interface/ui/button";
import { Sun, Moon, Laptop } from "lucide-react";

type Theme = 'light' | 'dark' | 'system';

export function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (theme === 'system' && isDarkMode)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const cycleTheme = () => {
    const themes: Theme[] = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const renderIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      default:
        return <Laptop className="w-4 h-4" />;
    }
  };

  return (
    <Button variant="ghost" size="sm" className="h-8 w-8" onClick={cycleTheme}>
      {renderIcon()}
    </Button>
  );
}

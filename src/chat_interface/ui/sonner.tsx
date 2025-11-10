"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const toastStyles: React.CSSProperties & {
  "--normal-bg"?: string;
  "--normal-text"?: string;
  "--normal-border"?: string;
} = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
};

const isToasterTheme = (
  value: string | undefined,
): value is NonNullable<ToasterProps["theme"]> =>
  value === "light" || value === "dark" || value === "system";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const resolvedTheme: ToasterProps["theme"] = isToasterTheme(theme)
    ? theme
    : "system";

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      style={toastStyles}
      {...props}
    />
  );
};

export { Toaster };

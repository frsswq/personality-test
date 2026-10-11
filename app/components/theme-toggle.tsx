import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useTheme } from "~/lib/use-theme";

/**
 * The icon follows the stored choice. Until that has been read the theme is
 * `null` and the light icon shows, which keeps the first client render equal to
 * the pre-rendered shell.
 */
export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      aria-label={`Use the ${nextTheme} theme`}
      onClick={() => {
        setTheme(nextTheme);
      }}
      size="icon"
      variant="ghost"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};

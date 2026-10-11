import { MoonIcon, SunIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import type { Theme } from "~/lib/theme";
import { applyTheme, readTheme, saveTheme } from "~/lib/theme";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      aria-label={`Use the ${nextTheme} theme`}
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
        saveTheme(nextTheme);
      }}
      size="icon"
      variant="ghost"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};

"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("dynamis-theme") as "light" | "dark" | null;
    if (storedTheme === "dark") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dynamis-theme", theme);
  }, [theme, mounted]);

  if (!mounted) {
    return <div className="w-11 h-11 min-h-[44px] min-w-[44px]" aria-hidden="true" />; // Placeholder to avoid shift
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
      className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-main bg-surface-subtle hover:bg-surface-hover border border-border-default shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </button>
  );
}

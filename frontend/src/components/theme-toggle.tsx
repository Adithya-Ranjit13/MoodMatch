"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="w-20 h-9" />;
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex items-center gap-1.5 text-sm font-medium border transition-colors duration-200
        ${
          isDark
            ? "bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800 hover:text-white"
            : "bg-white text-black border-zinc-300 hover:bg-zinc-100 hover:text-black"
        }`}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5" />
          Light
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5" />
          Dark
        </>
      )}
    </Button>
  );
}
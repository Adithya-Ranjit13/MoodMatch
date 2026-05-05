"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">☀️</span>
      <Switch
        checked={isDark}
        onCheckedChange={setIsDark}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-amber-400"
      />
      <span className="text-sm">🌙</span>
    </div>
  );
}
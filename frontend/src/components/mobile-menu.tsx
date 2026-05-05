"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col gap-1.5 p-2 rounded-md hover:bg-primary transition-all duration-300 group"
        aria-label="Toggle menu"
      >
        <span
          className={`block w-5 h-0.5 bg-muted-foreground group-hover:bg-white transition-all duration-300 ${
            open ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-muted-foreground group-hover:bg-white transition-all duration-300 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-muted-foreground group-hover:bg-white transition-all duration-300 ${
            open ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border shadow-2xl z-50 p-4 flex flex-col gap-2">
          <Link
            href="/scan"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-primary transition-all duration-300"
          >
            🎭 Scan Mood
          </Link>
          <Link
            href="/journal"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-primary transition-all duration-300"
          >
            📓 Journal
          </Link>
        </div>
      )}
    </div>
  );
}
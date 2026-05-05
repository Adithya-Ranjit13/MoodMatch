"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface AccountDropdownProps {
  name: string | null | undefined;
  email: string | null | undefined;
}

export default function AccountDropdown({ name, email }: AccountDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-white hover:bg-primary transition-all duration-300"
      >
        <span className="w-7 h-7 shrink-0 aspect-square rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
          {initials}
        </span>
        <span className="hidden md:inline">Account</span>
        <span className={`hidden md:inline transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 shrink-0 aspect-square rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
            {initials}
            </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-35">{email}</p>
              </div>
            </div>
          </div>

          <div className="p-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-primary transition-all duration-300 w-full"
            >
              👤 View Account Details
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:text-white hover:bg-destructive transition-all duration-300 w-full text-left"
            >
              🚪 Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
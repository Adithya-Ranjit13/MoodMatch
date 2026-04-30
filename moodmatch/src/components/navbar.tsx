import Link from "next/link";
import { auth } from "@/lib/auth";
import AccountDropdown from "@/components/account-dropdown";
import ThemeToggle from "@/components/theme-toggle";
import MobileMenu from "@/components/mobile-menu";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-border px-6 py-4 flex justify-between items-center bg-background relative">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <div className="flex items-center gap-2 transition-all duration-300 group-hover:drop-shadow-[0_0_12px_var(--primary)]">
          <img
            src="/moodMatch_transparent.png"
            alt="MoodMatch"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-xl font-bold text-foreground transition-all duration-300 group-hover:text-primary">
            MoodMatch
          </span>
        </div>
      </Link>

      {/* Desktop Links — hidden on mobile */}
      <div className="hidden md:flex items-center gap-2">
        <Link
          href="/scan"
          className="text-sm text-muted-foreground hover:text-white hover:bg-primary px-3 py-1.5 rounded-md transition-all duration-300"
        >
          Scan
        </Link>
        <Link
          href="/journal"
          className="text-sm text-muted-foreground hover:text-white hover:bg-primary px-3 py-1.5 rounded-md transition-all duration-300"
        >
          Journal
        </Link>
        <AccountDropdown
          name={session?.user?.name}
          email={session?.user?.email}
        />
        <ThemeToggle />
      </div>

      {/* Mobile — hamburger + account + theme */}
      <div className="flex md:hidden items-center gap-2">
        {/* <ThemeToggle /> */}
        <AccountDropdown
          name={session?.user?.name}
          email={session?.user?.email}
        />
        <MobileMenu />
      </div>
    </nav>
  );
}
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

export default function AuthNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 border-b border-border px-6 py-4 flex justify-between items-center bg-background/80 backdrop-blur-md z-50">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="flex items-center gap-2 transition-all duration-300 group-hover:drop-shadow-[0_0_12px_var(--primary)]">
          <img
            src="/moodMatch_transparent.png"
            alt="MoodMatch"
            width={40}
            height={40}
            className="object-contain drop-shadow-[0_1px_0px_var(--foreground)] opacity-70"
          />
          <span className="text-xl font-bold text-primary transition-all duration-300">
            MoodMatch
          </span>
        </div>
      </Link>

      <ThemeToggle />
    </nav>
  );
}
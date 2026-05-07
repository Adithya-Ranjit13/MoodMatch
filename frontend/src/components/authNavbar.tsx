import Link from "next/link";

export default function AuthNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 border-b border-border px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md z-50">
      <div className="relative flex items-center justify-center md:justify-start">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-2 transition-all duration-300 group-hover:drop-shadow-[0_0_12px_var(--primary)]">
            <img
              src="/moodMatch_transparent.png"
              alt="MoodMatch"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-lg sm:text-xl font-bold text-foreground transition-all duration-300 group-hover:text-primary">
              MoodMatch
            </span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
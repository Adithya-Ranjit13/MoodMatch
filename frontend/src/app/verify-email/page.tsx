import Link from "next/link";

type Status = "ok" | "expired" | "invalid" | "missing" | "error";

const COPY: Record<Status, { icon: string; title: string; body: string; cta: { href: string; label: string } }> = {
  ok: {
    icon: "✅",
    title: "Email Verified!",
    body: "Your account is ready. You can now log in.",
    cta: { href: "/login", label: "Go to Login" },
  },
  expired: {
    icon: "⌛",
    title: "Link Expired",
    body: "This verification link has expired. Please sign up again.",
    cta: { href: "/signup", label: "Back to Signup" },
  },
  invalid: {
    icon: "❌",
    title: "Invalid Link",
    body: "This verification link is invalid.",
    cta: { href: "/signup", label: "Back to Signup" },
  },
  missing: {
    icon: "❌",
    title: "Invalid Link",
    body: "No verification token provided.",
    cta: { href: "/signup", label: "Back to Signup" },
  },
  error: {
    icon: "⚠️",
    title: "Something went wrong",
    body: "We couldn't verify your email. Please try again.",
    cta: { href: "/signup", label: "Back to Signup" },
  },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const key: Status = (status as Status) in COPY ? (status as Status) : "invalid";
  const c = COPY[key];

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black">
        <div className="text-center">
          <div className="text-5xl mb-4">{c.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{c.title}</h2>
          <p className="text-slate-400 mb-6">{c.body}</p>
          <Link
            href={c.cta.href}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {c.cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

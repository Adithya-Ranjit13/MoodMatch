import { verifyToken } from "@/lib/token";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <VerifyLayout>
        <p className="text-red-400">Invalid verification link.</p>
      </VerifyLayout>
    );
  }

  const result = await verifyToken(token);

  return (
    <VerifyLayout>
      {result.success ? (
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p className="text-slate-400 mb-6">
            Your account is ready. You can now log in.
          </p>
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {result.error === "Token expired" ? "Link Expired" : "Invalid Link"}
          </h2>
          <p className="text-slate-400 mb-6">
            {result.error === "Token expired"
              ? "This verification link has expired. Please sign up again."
              : "This verification link is invalid."}
          </p>
          <Link
            href="/signup"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Back to Signup
          </Link>
        </div>
      )}
    </VerifyLayout>
  );
}

function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black">
        {children}
      </div>
    </div>
  );
}
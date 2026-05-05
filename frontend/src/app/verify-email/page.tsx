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
        <p className="text-destructive">Invalid verification link.</p>
      </VerifyLayout>
    );
  }

  // const response = await fetch(
  //   `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`
  // );
  // const result = await response.json();
let result;
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`
    );
    result = await response.json();
  } catch (error) {
    return (
      <VerifyLayout>
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Server Error</h2>
          <p className="text-muted-foreground mb-6">Could not connect to server. Make sure backend is running.</p>
          <Link href="/signup" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold">
            Back to Signup
          </Link>
        </div>
      </VerifyLayout>
    );
  }
  return (
    <VerifyLayout>
      {result.success ? (
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h2>
          <p className="text-muted-foreground mb-6">
            Your account is ready. You can now log in.
          </p>
          <Link
            href="/login"
            className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {result.error === "Token expired" ? "Link Expired" : "Invalid Link"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {result.error === "Token expired"
              ? "This verification link has expired. Please sign up again."
              : "This verification link is invalid."}
          </p>
          <Link
            href="/signup"
            className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition"
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-2xl">
        {children}
      </div>
    </div>
  );
}
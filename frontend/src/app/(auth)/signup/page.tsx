"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import AuthNavbar from "@/components/authNavbar";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    setSuccess("");

    const name = formData.get("name");
    const email = formData.get("email");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Signup failed");
      } else {
        setSuccess("Check your email!");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }

    setLoading(false);
  }

  return (
      <>
      <AuthNavbar />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create account</h1>
          <p className="text-muted-foreground mb-8">Start tracking your mood today</p>

          {success ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">📧</div>
              <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-2">Check your email!</p>
              <p className="text-muted-foreground text-sm">
                We sent a verification link to your email. Click it to activate your account.
              </p>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" type="text" required className="mt-1" placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required className="mt-1" placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="mt-1" placeholder="Min. 6 characters" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  className="mt-1" placeholder="Re-enter password" />
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-destructive text-sm">Passwords do not match</p>
              )}
              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button type="submit" className="w-full"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}>
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
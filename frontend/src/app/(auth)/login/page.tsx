"use client";

import { useState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import AuthNavbar from "@/components/authNavbar";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
      setLoading(true);
      setError("");

      try {
        // Call backend directly for JWT token
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password"),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Login failed");
          setLoading(false);
          return;
        }

        // Save JWT token
        localStorage.setItem("moodmatch_token", data.token);

        // Also sign in with Auth.js for session
        const result = await login(formData);
        if (result?.error) {
          setError(result.error);
          setLoading(false);
        }
      } catch (err: any) {
        // Ignore redirect errors from Auth.js
        if (err?.digest?.includes("NEXT_REDIRECT")) {
          return;
        }

        setError("Something went wrong");
        setLoading(false);
      }
    }

  return (
      <>
          <AuthNavbar />
          <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-2xl">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
              <p className="text-muted-foreground mb-8">Log in to your MoodMatch journal</p>

              <form action={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required className="mt-1" placeholder="you@example.com" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required className="mt-1" placeholder="••••••••" />
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Log in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-muted-foreground text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </>
  );
}
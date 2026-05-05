"use client";

import { useState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
  <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-slate-400 mb-8">Log in to your MoodMatch journal</p>

        <form action={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 bg-slate-800 border-slate-700 text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 bg-slate-800 border-slate-700 text-white"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
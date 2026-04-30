"use client";

import { useState } from "react";
import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    setSuccess("");
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    if (result?.success) {
      setSuccess(result.success);
      setLoading(false);
    }
  }

  return (
<div className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
  <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black">
        <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
        <p className="text-slate-400 mb-8">Start tracking your mood today</p>

        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-green-400 font-semibold text-lg mb-2">
              Check your email!
            </p>
            <p className="text-slate-400 text-sm">
              We sent a verification link to your email. Click it to activate
              your account.
            </p>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-slate-300">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 bg-slate-800 border-slate-700 text-white"
                placeholder="Your name"
              />
            </div>
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
                placeholder="Min. 6 characters"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-slate-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    console.log("BACKEND_URL:", process.env.BACKEND_URL);
    console.log("Calling:", `${process.env.BACKEND_URL}/api/auth/signup`);

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/auth/signup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      }
    );

    console.log("Response status:", response.status);

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error };
    }

    return { success: data.message };
  } catch (error) {
    console.error("Fetch error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}
"use server";

import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

export async function signUp(formData: FormData) {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  };
  // Step 1 - Validate input
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password, name } = parsed.data;
  // Step 2 - Check if email already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already in use" };

  // Step 3 - Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Step 4 - Create the user
  await db.user.create({
    data: { email, hashedPassword, name },
  });

  // Step 5 - Generate verification token
  const token = await generateVerificationToken(email);

  // Step 6 - Send verification email
  await sendVerificationEmail(email, token);

  return { success: "Check your email to verify your account!" };
}

export async function login(formData: FormData) {
  try {
    // Step 1 - Check if email is verified
    const user = await db.user.findUnique({
      where: { email: formData.get("email") as string },
    });

    if (!user) return { error: "Invalid email or password" };

    if (!user.emailVerified) {
      return { error: "Please verify your email before logging in" };
    }

    // Step 2 - Sign in
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
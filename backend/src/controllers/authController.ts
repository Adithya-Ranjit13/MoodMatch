import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../lib/db";
import {
  generateJWT,
  generateVerificationToken,
  verifyEmailToken,
} from "../lib/token";
import { sendVerificationEmail } from "../lib/email";

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password is required"),
});

// ─── SIGNUP ───────────────────────────────────────────────
export async function signup(req: Request, res: Response): Promise<void> {
  console.log("Signup called with:", req.body);  // ← add this
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { name, email, password } = parsed.data;
    console.log("Creating user:", email);  // ← add this

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await db.user.create({ data: { name, email, hashedPassword } });
    console.log("User created!");  // ← add this

    const token = await generateVerificationToken(email);
    console.log("Verification URL:", `${process.env.FRONTEND_URL}/verify-email?token=${token}`);

    await sendVerificationEmail(email, token);
    console.log("Email sent!");  // ← add this

    res.status(201).json({
      success: true,
      message: "Account created! Check your email to verify your account.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// ─── LOGIN ────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.emailVerified) {
      res.status(401).json({ error: "Please verify your email before logging in" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword!);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = generateJWT(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// ─── VERIFY EMAIL ─────────────────────────────────────────
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const result = await verifyEmailToken(token);

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(200).json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// ─── LOGOUT ───────────────────────────────────────────────
export async function logout(req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, message: "Logged out successfully" });
}
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET!;

// Generate JWT token for logged in user
export function generateJWT(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Verify JWT token
export function verifyJWT(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// Generate email verification token
export async function generateVerificationToken(email: string): Promise<string> {
  try {
    // Delete any existing token for this email
    await db.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiry to 24 hours
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save to database
    await db.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    return token;
  } catch (error) {
    console.error("Token generation failed:", error);
    throw new Error("Failed to generate verification token");
  }
}

// Verify email token
export async function verifyEmailToken(token: string) {
  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) return { error: "Invalid token" };

    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({ where: { token } });
      return { error: "Token expired" };
    }

    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    await db.verificationToken.delete({ where: { token } });

    return { success: true };
  } catch (error) {
    console.error("Token verification failed:", error);
    return { error: "Failed to verify token" };
  }
}
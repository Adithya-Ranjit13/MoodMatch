import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "./db";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"];
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d";

// Generate JWT access token
export function generateJWT(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyJWT(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// Generate refresh token and save to DB
export async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(64).toString("hex");

  const days = parseInt(REFRESH_TOKEN_EXPIRES_IN) || 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await db.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

// Verify refresh token
export async function verifyRefreshToken(token: string) {
  const refreshToken = await db.refreshToken.findUnique({
    where: { token },
  });

  if (!refreshToken) return null;
  if (refreshToken.expiresAt < new Date()) {
    await db.refreshToken.delete({ where: { token } });
    return null;
  }

  return refreshToken;
}

// Delete refresh token (logout)
export async function deleteRefreshToken(token: string) {
  await db.refreshToken.deleteMany({ where: { token } });
}

// Generate email verification token
export async function generateVerificationToken(email: string): Promise<string> {
  await db.verificationToken.deleteMany({ where: { identifier: email } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return token;
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
    return { error: "Failed to verify token" };
  }
}
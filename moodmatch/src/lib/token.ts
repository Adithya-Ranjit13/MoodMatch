import { db } from "./db";
import crypto from "crypto";

export async function generateVerificationToken(email: string) {
  // Delete any existing token for this email
  await db.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Generate a new random token
  const token = crypto.randomBytes(32).toString("hex");

  // Set expiry to 24 hours from now
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Save to database
  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

export async function verifyToken(token: string) {
  // Find the token in the database
  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  });

  // Token doesn't exist
  if (!verificationToken) return { error: "Invalid token" };

  // Token has expired
  if (verificationToken.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } });
    return { error: "Token expired" };
  }

  // Mark the user's email as verified
  await db.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Delete the used token
  await db.verificationToken.delete({ where: { token } });

  return { success: true };
}
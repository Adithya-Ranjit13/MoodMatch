import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  try {
    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`;

    const result = await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM!,
      to: email,
      subject: "Verify your MoodMatch email",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Welcome to MoodMatch 👋</h2>
          <p style="color: #475569;">Click the button below to verify your email address.</p>
          <a href="${verificationUrl}"
             style="display: inline-block; background: #7C3AED; color: white;
                    padding: 12px 24px; border-radius: 8px; text-decoration: none;
                    font-weight: bold; margin: 16px 0;">
            Verify Email
          </a>
          <p style="color: #94a3b8; font-size: 13px;">This link expires in 24 hours.</p>
          <p style="color: #94a3b8; font-size: 13px;">If you didn't sign up, ignore this email.</p>
        </div>
      `,
    });

    console.log("Resend result:", result);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send verification email");
  }
}
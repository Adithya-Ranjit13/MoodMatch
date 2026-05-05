import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.AUTH_EMAIL_FROM!,
    to: email,
    subject: "Verify your MoodMatch email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Welcome to MoodMatch 👋</h2>
        <p style="color: #475569;">Click the button below to verify your email address.</p>
        <a href="${verificationUrl}"
           style="display: inline-block; background: #3b82f6; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: bold; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #94a3b8; font-size: 13px;">
          If you didn't sign up for MoodMatch, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: "MoodMatch <onboarding@resend.dev>",
    to: email,
    subject: "Verify your MoodMatch email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Welcome to MoodMatch 👋</h2>
        <p style="color: #475569;">
          Click the button below to verify your email address.
        </p>
        <a href="${verificationUrl}"
           style="display: inline-block; background: #7C3AED; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: bold; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #94a3b8; font-size: 13px;">This link expires in 24 hours.</p>
        <p style="color: #94a3b8; font-size: 13px;">
          If you didn't sign up for MoodMatch, ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send verification email");
  }

  console.log("Email sent to:", email);
}
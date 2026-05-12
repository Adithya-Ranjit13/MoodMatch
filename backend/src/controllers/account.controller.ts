import { Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { AuthRequest } from "../middleware/auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
const deleteAccountSchema = z.object({
  password: z.string().min(6),
});
// ─── GET ACCOUNT INFO ─────────────────────────────────────
export async function getAccount(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { journalEntries: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get account error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// ─── CHANGE PASSWORD ──────────────────────────────────────
export async function changePassword(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;

    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedPassword) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );

    if (!passwordMatch) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.hashedPassword
    );

    if (samePassword) {
      res.status(400).json({
        error: "New password must be different from current password",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// ─── EXPORT JOURNAL ───────────────────────────────────────
export async function exportJournal(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;

    const entries = await db.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        recommendations: true,
        youtubeMedia: true,
      },
    });

    res.status(200).json({
      success: true,
      exportedAt: new Date().toISOString(),
      totalEntries: entries.length,
      entries,
    });
  } catch (error) {
    console.error("Export journal error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// ─── DELETE ACCOUNT ───────────────────────────────────────
export async function deleteAccount(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;

    const parsed = deleteAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { password } = parsed.data;

    // Verify password before deleting
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedPassword) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatch) {
      res.status(400).json({ error: "Incorrect password" });
      return;
    }

    await db.user.delete({ where: { id: userId } });

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}
import { Response } from "express";
import { z } from "zod";
import { db } from "../lib/db";
import { AuthRequest } from "../middleware/auth";

const updateNoteSchema = z.object({
  userNote: z.string().max(500, "Note too long"),
});

// ─── GET ALL ENTRIES ──────────────────────────────────────
export async function getJournalEntries(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const mood = req.query.mood as string | undefined;

    const where = {
      userId,
      ...(mood && { mood: mood as any }),
    };

    const [entries, total] = await Promise.all([
      db.journalEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { recommendations: true },
      }),
      db.journalEntry.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get journal entries error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// ─── GET SINGLE ENTRY ─────────────────────────────────────
export async function getJournalEntry(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const entry = await db.journalEntry.findUnique({
      where: { id: id as string },
      include: { recommendations: true },
    });

    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    // Make sure entry belongs to logged in user
    if (entry.userId !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    res.status(200).json({ success: true, entry });
  } catch (error) {
    console.error("Get journal entry error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// ─── UPDATE NOTE ──────────────────────────────────────────
export async function updateNote(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const parsed = updateNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    // Check entry exists and belongs to user
    const existing = await db.journalEntry.findUnique({ where: { id: id as string } });
    if (!existing) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const entry = await db.journalEntry.update({
      where: { id: id as string },
      data: { userNote: parsed.data.userNote },
      include: { recommendations: true },
    });

    res.status(200).json({ success: true, entry });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// ─── DELETE ENTRY ─────────────────────────────────────────
export async function deleteEntry(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existing = await db.journalEntry.findUnique({ where: { id:id as string } });
    if (!existing) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    await db.journalEntry.delete({ where: { id: id as string } });

    res.status(200).json({ success: true, message: "Entry deleted" });
  } catch (error) {
    console.error("Delete entry error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// ─── TOGGLE LIKED ─────────────────────────────────────────
export async function toggleLiked(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const recommendation = await db.recommendation.findUnique({
      where: { id:id as string },
      include: { journalEntry: true },
    });

    if (!recommendation) {
      res.status(404).json({ error: "Recommendation not found" });
      return;
    }

    if (recommendation.journalEntry.userId !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const updated = await db.recommendation.update({
      where: { id: id as string },
      data: { liked: !recommendation.liked },
    });

    res.status(200).json({ success: true, recommendation: updated });
  } catch (error) {
    console.error("Toggle liked error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}
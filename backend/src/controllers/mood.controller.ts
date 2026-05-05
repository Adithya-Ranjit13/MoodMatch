import { Request, Response } from "express";
import { z } from "zod";
import Groq from "groq-sdk";
import { db } from "../lib/db";
import { AuthRequest } from "../middleware/auth";

const moodSchema = z.object({
  mood: z.enum(["happy", "sad", "stressed", "calm", "energetic", "tired"]),
  source: z.enum(["webcam", "manual"]),
  confidenceScore: z.number().optional(),
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function saveMood(req: AuthRequest, res: Response): Promise<void> {
  try {
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);
    const parsed = moodSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { mood, source, confidenceScore } = parsed.data;
    const userId = req.userId!;

    // Get last 3 journal entries for context
    const recentEntries = await db.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const context = recentEntries.length > 0
      ? recentEntries.map((entry) =>
          `${entry.createdAt.toDateString()}: felt ${entry.mood}`
        ).join("\n")
      : "This is the user's first mood entry.";

    // Call Groq AI
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: "You are a supportive mood coach. Always respond with valid JSON only, no extra text.",
        },
        {
          role: "user",
          content: `The user is feeling ${mood} right now.

Recent mood history:
${context}

Give exactly 3 personalized recommendations in this JSON format:
{
  "recommendations": [
    { "category": "music", "content": "specific song or playlist suggestion" },
    { "category": "activity", "content": "specific activity suggestion" },
    { "category": "reflection", "content": "a short supportive message" }
  ]
}

Only respond with the JSON, nothing else.`,
        },
      ],
    });

    // Parse AI response
    const aiText = completion.choices[0].message.content ?? "";
    const aiData = JSON.parse(aiText);

    // Save journal entry + recommendations
    const journalEntry = await db.journalEntry.create({
      data: {
        userId,
        mood,
        source,
        confidenceScore,
        recommendations: {
          create: aiData.recommendations.map((rec: {
            category: string;
            content: string;
          }) => ({
            category: rec.category,
            content: rec.content,
          })),
        },
      },
      include: { recommendations: true },
    });

    res.status(201).json({
      success: true,
      entry: journalEntry,
    });
  } catch (error) {
    console.error("Save mood error:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
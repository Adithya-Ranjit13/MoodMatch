import { Response } from "express";
import { z } from "zod";
import Groq from "groq-sdk";
import { db } from "../lib/db";
import { AuthRequest } from "../middleware/auth";
import { searchYoutubeMusic, searchYoutubeVideo } from "../lib/youtube";

const moodSchema = z.object({
  mood: z.enum(["happy", "sad", "stressed", "calm", "energetic", "tired"]),
  source: z.enum(["webcam", "manual"]),
  confidenceScore: z.number().optional(),
  note: z.string().max(500).optional(),
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function saveMood(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = moodSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { mood, source, confidenceScore, note } = parsed.data;
    const userId = req.userId!;

    // Get last 3 journal entries for context
    const recentEntries = await db.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { recommendations: true },
    });

    const context = recentEntries.length > 0
      ? recentEntries.map((entry: any) => {
          const recs = entry.recommendations
            .map((r: any) => `${r.category}: ${r.content}`)
            .join(", ");
          return `${entry.createdAt.toDateString()}: felt ${entry.mood}
          Suggestions given: ${recs}`;
        }).join("\n\n")
      : "This is the user's first mood entry.";
    // Call Groq AI
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: "You are a supportive mood coach. Always respond with valid JSON only, no extra text.",
        },
        {
          role: "user",
          content: `The user is currently feeling "${mood}".

User note:
${note || "No additional note provided."}

Recent mood history and previous recommendations:
${context}

Your task:
Generate emotionally supportive and highly specific recommendations.

IMPORTANT RULES:
- NEVER repeat previous recommendations
- Recommendations should match the user's emotional state
- If the user provided a note, personalize suggestions around it
- Music suggestions MUST be real songs that exist on YouTube/Spotify
- Include artist names for all music
- Video suggestions MUST be highly searchable on YouTube
- Avoid vague searches like:
  - "motivation"
  - "relaxing video"
  - "happy content"

INSTEAD generate searchable phrases like:
- "10 minute guided meditation for anxiety"
- "TED talk about overcoming burnout"
- "deep focus lofi playlist"
- "calming piano music for stress relief"
- "morning motivation speech"
- "breathing exercise for panic attacks"

The goal is to maximize YouTube search accuracy.

Return ONLY valid JSON in this exact format:

{
  "recommendations": [
    {
      "category": "music",
      "content": "Blinding Lights by The Weeknd"
    },
    {
      "category": "activity",
      "content": "Take a 15 minute walk outside without your phone"
    },
    {
      "category": "reflection",
      "content": "Write down 3 things currently causing stress"
    }
  ],
  "musicSearch": "exact searchable music query",
  "videoSearch": "exact searchable YouTube video query"
}

DO NOT include markdown.
DO NOT include explanations.
ONLY return JSON.`,
        },
      ],
    });

    const aiText = completion.choices[0].message.content ?? "";
    const aiData = JSON.parse(aiText);

    // Use the music recommendation content as the search query
    const musicRec = aiData.recommendations.find(
      (r: { category: string }) => r.category === "music"
    );

    const [music, video] = await Promise.all([
      searchYoutubeMusic(musicRec?.content ?? aiData.musicSearch),
      searchYoutubeVideo(aiData.videoSearch),
    ]);

    console.log("Music:", music);
    console.log("Video:", video);

    // Save journal entry + recommendations + youtube media
    const journalEntry = await db.journalEntry.create({
      data: {
        userId,
        mood,
        source,
        confidenceScore,
        userNote: note,
        recommendations: {
          create: aiData.recommendations.map((rec: {
            category: string;
            content: string;
          }) => ({
            category: rec.category,
            content: rec.content,
          })),
        },
        youtubeMedia: {
          create: [
            ...(music ? [{
              type: "music",
              title: music.title,
              youtubeId: music.youtubeId,
            }] : []),
            ...(video ? [{
              type: "video",
              title: video.title,
              youtubeId: video.youtubeId,
            }] : []),
          ],
        },
      },
      include: {
        recommendations: true,
        youtubeMedia: true,
      },
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
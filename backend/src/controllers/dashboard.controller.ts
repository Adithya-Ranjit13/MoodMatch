import { Response } from "express";
import { db } from "../lib/db";
import { AuthRequest } from "../middleware/auth";

export async function getDashboardStats(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
      },
    });
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Total entries
    const totalEntries = await db.journalEntry.count({
      where: { userId },
    });

    // This week's entries
    const weekEntries = await db.journalEntry.count({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
    });
    
    // Most common mood this week
    const weekMoods = await db.journalEntry.groupBy({
      by: ["mood"],
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      _count: { mood: true },
      orderBy: { _count: { mood: "desc" } },
      take: 1,
    });

    const topMood = weekMoods[0]?.mood ?? null;

    // Last 7 days mood data for chart
    const chartData = await db.journalEntry.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        mood: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by day
    const moodToNumber: Record<string, number> = {
      
      energetic: 5,
      happy: 4,
      calm: 3,
      tired: 2,
      sad: 1,
      stressed: 0,
    };

    const days: Record<string, { date: string; mood: string; value: number }[]> = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const key = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      days[key] = [];
    }

    for (const entry of chartData) {
      const key = new Date(entry.createdAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (days[key]) {
        days[key].push({
          date: key,
          mood: entry.mood,
          value: moodToNumber[entry.mood] ?? 0,
        });
      }
    }

    const chart = Object.entries(days).map(([date, entries]) => {
      if (entries.length === 0) {
        return {
          date,
          value: null,
          mood: null,
          count: 0,
          topMoodCount: 0,
        };
      }

      // Count frequency of moods
      const frequency: Record<string, number> = {};

      for (const entry of entries) {
        frequency[entry.mood] = (frequency[entry.mood] || 0) + 1;
      }

      // Find most frequent mood
      let topMood = entries[0].mood;
      let topMoodCount = frequency[topMood];

      for (const mood in frequency) {
        if (frequency[mood] > topMoodCount) {
          topMood = mood;
          topMoodCount = frequency[mood];
        }
      }

      return {
        date,
        value: moodToNumber[topMood],
        mood: topMood,
        count: entries.length,
        topMoodCount,
      };
    });
    
    res.status(200).json({
      success: true,
      user,
      stats: {
        totalEntries,
        weekEntries,
        topMood,
      },
      chart,
    });
    
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}
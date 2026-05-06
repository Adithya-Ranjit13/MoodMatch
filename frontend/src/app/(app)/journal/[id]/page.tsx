"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/token";
import { Button } from "@/components/ui/button";

type Mood = "happy" | "sad" | "stressed" | "calm" | "energetic" | "tired";

interface Recommendation {
  id: string;
  category: string;
  content: string;
  liked: boolean | null;
}

interface JournalEntry {
  id: string;
  mood: Mood;
  source: string;
  userNote: string | null;
  createdAt: string;
  recommendations: Recommendation[];
}

const moodEmoji: Record<Mood, string> = {
  happy: "😊",
  sad: "😢",
  stressed: "😤",
  calm: "😌",
  energetic: "⚡",
  tired: "😴",
};

const categoryIcon: Record<string, string> = {
  music: "🎵",
  activity: "🏃",
  reflection: "💭",
};

export default function JournalEntryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  async function fetchEntry() {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/journal/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setEntry(data.entry);
        setNote(data.entry.userNote ?? "");
        setRecommendations(data.entry.recommendations);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleSaveNote() {
    setSavingNote(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/journal/${id}/note`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userNote: note }),
        }
      );

      if (res.ok) setEditingNote(false);
    } catch (err) {
      console.error(err);
    }
    setSavingNote(false);
  }

  async function handleToggleLiked(recId: string) {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/journal/recommendation/${recId}/liked`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setRecommendations(recommendations.map((r) =>
          r.id === recId ? { ...r, liked: data.recommendation.liked } : r
        ));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/journal/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) router.push("/journal");
    } catch (err) {
      console.error(err);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground font-medium">Entry not found</p>
        <Button asChild className="mt-4">
          <Link href="/journal">Back to Journal</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/journal">← Back to Journal</Link>
      </Button>

      {/* Entry Header */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{moodEmoji[entry.mood]}</span>
            <div>
              <h1 className="text-2xl font-bold text-foreground capitalize">
                Feeling {entry.mood}
              </h1>
              <p className="text-muted-foreground text-sm">
                {formatDate(entry.createdAt)} · via {entry.source}
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>

        {/* Note Section */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Your Note</p>
            {!editingNote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingNote(true)}
              >
                {note ? "Edit" : "+ Add Note"}
              </Button>
            )}
          </div>

          {editingNote ? (
            <div className="space-y-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                placeholder="How are you feeling? What's on your mind?"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {note.length}/500
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingNote(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNote}
                    disabled={savingNote}
                  >
                    {savingNote ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">
              {note ? `"${note}"` : "No note added yet."}
            </p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <h2 className="text-xl font-bold text-foreground mb-4">
        Your Recommendations
      </h2>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-card border border-border rounded-2xl p-5 transition-all duration-300 hover:border-primary"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{categoryIcon[rec.category]}</span>
                <span className="text-sm font-semibold text-primary capitalize">
                  {rec.category}
                </span>
              </div>
              <button
                onClick={() => handleToggleLiked(rec.id)}
                className="text-xl transition-all duration-300 hover:scale-125"
              >
                {rec.liked === true ? "❤️" : "👎"}
              </button>
            </div>
            <p className="text-foreground">{rec.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
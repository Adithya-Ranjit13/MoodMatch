"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

type Mood = "happy" | "sad" | "stressed" | "calm" | "energetic" | "tired";

interface Recommendation {
  id: string;
  category: string;
  content: string;
  liked: boolean | null;
}

interface YoutubeMedia {
  id: string;
  type: string;
  title: string;
  youtubeId: string;
}

interface JournalEntry {
  id: string;
  mood: Mood;
  source: string;
  userNote: string | null;
  createdAt: string;
  recommendations: Recommendation[];
  youtubeMedia: YoutubeMedia[];
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
  const [youtubeMedia, setYoutubeMedia] = useState<YoutubeMedia[]>([]);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  async function fetchEntry() {
    try {
      const res = await api.get(`/api/journal/${id}`);
      setEntry(res.data.entry);
      setNote(res.data.entry.userNote ?? "");
      setRecommendations(res.data.entry.recommendations);
      setYoutubeMedia(res.data.entry.youtubeMedia ?? []);

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleSaveNote() {
    setSavingNote(true);
    try {
      await api.patch(`/api/journal/${id}/note`, { userNote: note }); // ← add body
      setEditingNote(false);
    } catch (err) {
      console.error(err);
    }
    setSavingNote(false);
  }

  async function handleToggleLiked(recId: string) {
    try {
      const current = recommendations.find(r => r.id === recId);
      const newLiked = current?.liked === true ? null : true;
      
      const res = await api.patch(
        `/api/journal/recommendation/${recId}/liked`,
        { liked: newLiked }
      );
      setRecommendations(recommendations.map((r) =>
        r.id === recId ? { ...r, liked: res.data.recommendation.liked } : r
      ));
    } catch (err) {
      console.error(err);
    }
}

  async function handleDelete() {
    try {
      await api.delete(`/api/journal/${id}`);
      router.push("/journal");
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
    <div className="w-full lg:w-[80%] max-w-6xl mx-auto mt-8 px-4">
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
      <div className="grid lg:grid-cols-2 gap-6 items-stretch min-h-150">
      {/* LEFT - Recommendations */}
      <div className="flex flex-col h-full">
        {/* We use flex-col and h-full on the wrapper */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              /* 1. flex-1: Makes cards grow to fill space
                2. flex flex-col: Allows internal content to be positioned
                3. min-h-[150px]: Ensures they don't get too squashed
              */
              className="flex-1 flex flex-col justify-center bg-card border border-border rounded-2xl p-8 hover:border-primary transition-all min-h-[150px]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{categoryIcon[rec.category]}</span>
                  <span className="text-sm font-bold tracking-wider text-primary uppercase">
                    {rec.category}
                  </span>
                </div>
                  <button
                    onClick={() => handleToggleLiked(rec.id)}
                    className={`text-xl hover:scale-125 transition-all duration-300 ${
                      rec.liked === null || rec.liked === undefined ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    {rec.liked === false ? "👎" : "❤️"}
                  </button>
              </div>

              {/* leading-relaxed adds more space between lines of text */}
              <p className="text-lg text-foreground leading-relaxed">
                {rec.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT - YouTube */}
      <div className="flex flex-col h-full">
        {/* We add flex flex-col to the wrapper to allow children to grow */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
          {youtubeMedia.map((media) => (
            <div key={media.id} className="flex-1 flex flex-col">
              <p className="text-sm text-muted-foreground mb-2">
                {media.type === "music" ? "🎵" : "🎬"} {media.title}
              </p>

              {/* 1. flex-1: Tells the iframe container to fill vertical space
                2. min-h-[220px]: Prevents it from getting too small
                3. Removed height="220" 
              */}
              <iframe
                className="w-full flex-1 rounded-xl border border-border min-h-[220px]"
                src={`https://www.youtube.com/embed/${media.youtubeId}`}
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>
      </div>
      </div>
  );
}
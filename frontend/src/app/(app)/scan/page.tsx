"use client";

import { useState } from "react";
import WebcamScanner from "@/components/webcam-scanner";
import MoodPicker from "@/components/mood-picker";
import { getToken } from "@/lib/token";
import Link from "next/link";

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

export default function ScanPage() {
  const [detectedMood, setDetectedMood] = useState<Mood | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [mode, setMode] = useState<"webcam" | "manual">("webcam");
  const [step, setStep] = useState<"scan" | "confirm" | "results">("scan");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean | null>>({});
  const [youtubeMedia, setYoutubeMedia] = useState<YoutubeMedia[]>([]);

  function handleMoodDetected(mood: Mood) {
    setDetectedMood(mood);
    setSelectedMood(mood);
    setStep("confirm");
  }

  function handleMoodSelect(mood: Mood) {
    setSelectedMood(mood);
    if (mode === "manual") setStep("confirm");
  }

  async function handleConfirm() {
    if (!selectedMood) return;
    setLoading(true);

    try {
      const token = getToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mood`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
          source: mode,
          note,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setRecommendations(data.entry.recommendations);
  setYoutubeMedia(data.entry.youtubeMedia ?? []);
        setStep("results");
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  async function handleToggleLiked(recId: string, value: boolean) {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/journal/recommendation/${recId}/liked`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            liked: liked[recId] === value ? null : value,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setLiked((prev) => ({
          ...prev,
          [recId]: data.recommendation.liked,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="w-full lg:w-[80%] max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        How are you feeling?
      </h1>
      <p className="text-muted-foreground mb-8">
        Scan your mood or pick manually
      </p>

      {/* Mode Toggle */}
      {step === "scan" && (
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => { setMode("webcam"); setDetectedMood(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
              ${mode === "webcam"
                ? "bg-primary text-white"
                : "bg-card text-muted-foreground border border-border"
              }`}
          >
            📸 Webcam Scan
          </button>
          <button
            onClick={() => { setMode("manual"); setDetectedMood(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
              ${mode === "manual"
                ? "bg-primary text-white"
                : "bg-card text-muted-foreground border border-border"
              }`}
          >
            ✋ Manual Pick
          </button>
        </div>
      )}

      {/* Webcam Scan */}
      {mode === "webcam" && step === "scan" && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <WebcamScanner onMoodDetected={handleMoodDetected} />
        </div>
      )}

      {/* Manual Pick */}
      {mode === "manual" && step === "scan" && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-foreground font-medium mb-4">Pick your mood:</p>
          <MoodPicker
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
          />
        </div>
      )}

      {/* Confirm Step */}
      {step === "confirm" && (
        <div className="bg-card border border-border rounded-2xl p-6">
          {detectedMood && (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-muted-foreground text-sm mb-1">Detected mood</p>
              <p className="text-3xl mb-1">{moodEmoji[detectedMood]}</p>
              <p className="text-xl font-bold text-primary capitalize">
                {detectedMood}
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                💡 Feeling energetic or tired? Override below!
              </p>
            </div>
          )}

          <p className="text-foreground font-medium mb-4">
            {detectedMood ? "Override your mood:" : "Confirm your mood:"}
          </p>

          <MoodPicker
            selectedMood={selectedMood}
            onMoodSelect={setSelectedMood}
          />

          {/* Note Input */}
          <div className="mt-6">
            <label className="text-sm font-medium text-foreground mb-1 block">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-3 text-foreground text-sm resize-none focus:outline-none focus:border-primary transition-colors"
              placeholder="How are you feeling? What's on your mind?"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {note.length}/500
            </p>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setStep("scan")}
              className="flex-1 border border-border text-muted-foreground py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-card"
            >
              ← Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedMood || loading}
              className="flex-1 bg-primary hover:opacity-90 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Getting recommendations..." : "Confirm ✨"}
            </button>
          </div>
        </div>
      )}

      {/* Results Step */}
      {step === "results" && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-4xl mb-2">{moodEmoji[selectedMood!]}</p>
            <p className="text-xl font-bold text-foreground capitalize">
              Feeling {selectedMood}
            </p>
            <p className="text-muted-foreground text-sm">
              Here are your personalized recommendations
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* LEFT - Recommendations */}
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-card border border-border rounded-2xl p-5 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{categoryIcon[rec.category]}</span>
                      <span className="text-sm font-semibold text-primary capitalize">
                        {rec.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleToggleLiked(
                            rec.id,
                            liked[rec.id] === true ? false : true
                          )
                        }
                        className={`text-xl transition-all duration-300 hover:scale-125 ${
                          liked[rec.id] === null || liked[rec.id] === undefined
                            ? "opacity-40"
                            : "opacity-100"
                        }`}
                      >
                        {liked[rec.id] === false ? "👎" : "👍"}
                      </button>
                    </div>
                  </div>
                  <p className="text-foreground">{rec.content}</p>
                </div>
              ))}
            </div>

            {/* RIGHT - YouTube */}
            <div className="space-y-4">
              {youtubeMedia.map((media) => (
                <div key={media.id}>
                  <p className="text-sm text-muted-foreground mb-2">
                    {media.type === "music" ? "🎵" : "🎬"} {media.title}
                  </p>
                  <iframe
                    className="w-full rounded-lg"
                    height="200"
                    src={`https://www.youtube.com/embed/${media.youtubeId}`}
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>

          {/* <button
            onClick={() => {
              setStep("scan");
              setDetectedMood(null);
              setSelectedMood(null);
              setRecommendations([]);
              setNote("");
              setLiked({});
            }}
            className="w-full mt-4 border border-border text-muted-foreground py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary"
          >
            Scan Again 🔄
          </button> */}
          <Link
            href="/dashboard"
            className="block w-full mt-4 border border-border text-muted-foreground py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary text-center"
          >
            Go to Dashboard 🏠
          </Link>
        </div>
      )}
    </div>
  );
}
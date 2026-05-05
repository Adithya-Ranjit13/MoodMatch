"use client";

type Mood = "happy" | "sad" | "stressed" | "calm" | "energetic" | "tired";

const MOODS: { value: Mood; emoji: string; label: string; color: string }[] = [
  { value: "happy", emoji: "😊", label: "Happy", color: "hover:bg-yellow-500/20 hover:border-yellow-500" },
  { value: "sad", emoji: "😢", label: "Sad", color: "hover:bg-blue-500/20 hover:border-blue-500" },
  { value: "stressed", emoji: "😤", label: "Stressed", color: "hover:bg-red-500/20 hover:border-red-500" },
  { value: "calm", emoji: "😌", label: "Calm", color: "hover:bg-green-500/20 hover:border-green-500" },
  { value: "energetic", emoji: "⚡", label: "Energetic", color: "hover:bg-orange-500/20 hover:border-orange-500" },
  { value: "tired", emoji: "😴", label: "Tired", color: "hover:bg-purple-500/20 hover:border-purple-500" },
];

interface MoodPickerProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

export default function MoodPicker({ selectedMood, onMoodSelect }: MoodPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onMoodSelect(mood.value)}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300
            ${selectedMood === mood.value
              ? "border-primary bg-primary/20 scale-105"
              : `border-border bg-card ${mood.color}`
            }`}
        >
          <span className="text-3xl">{mood.emoji}</span>
          <span className="text-sm font-medium text-foreground">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
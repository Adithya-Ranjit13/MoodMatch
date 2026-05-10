"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Mood = "happy" | "sad" | "stressed" | "calm" | "energetic" | "tired";

const moodEmoji: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  stressed: "😤",
  calm: "😌",
  energetic: "⚡",
  tired: "😴",
};

const moodLabels: Record<number, string> = {
  0: "Stressed",
  1: "Sad",
  2: "Tired",
  3: "Calm",
  4: "Happy",
  5: "Energetic",
};

interface ChartPoint {
  date: string;
  value: number | null;
  mood: string | null;
  count: number;
  topMoodCount: number;
}

interface Stats {
  totalEntries: number;
  weekEntries: number;
  topMood: Mood | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length && payload[0].value !== null) {
    const mood = payload[0].payload.mood;
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-primary text-sm">
          {moodEmoji[mood]} {mood}
        </p>
          <p className="text-muted-foreground text-xs">
            {payload[0].payload.topMoodCount} out of{" "}
            {payload[0].payload.count} entries
          </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setChartWidth(entries[0].contentRect.width);
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  async function fetchStats() {
    try {
      const res = await api.get(`/api/dashboard/stats`);
      console.log("Data",res.data);
      setStats(res.data.stats);
      setChart(res.data.chart);
      setUserName(res.data.user?.name ?? null);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const hasEntries = stats && stats.totalEntries > 0;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="max-w-125">
          <h1 className="text-2xl font-bold text-foreground break-words leading-tight">
            Hey, {userName ?? "there"} 👋
          </h1>
          <p className="text-muted-foreground">
            Your mood overview
          </p>
        </div>

        <Link
          href="/scan"
          className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 w-fit"
        >
          + Log Mood
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-card border border-border p-4 hover:border-primary transition-all duration-300">
          <p className="text-muted-foreground text-sm mb-1">Total Entries</p>
          <p className="text-4xl font-bold text-foreground">
            {stats?.totalEntries ?? "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 hover:border-primary transition-all duration-300">
          <p className="text-muted-foreground text-sm mb-1">This Week</p>
          <p className="text-4xl font-bold text-foreground">
            {stats?.weekEntries ?? "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 hover:border-primary transition-all duration-300">
          <p className="text-muted-foreground text-sm mb-1">Top Mood</p>
          {stats?.topMood ? (
            <div className="flex items-center gap-2">
              <span className="text-3xl">{moodEmoji[stats.topMood]}</span>
              <span className="text-xl font-bold text-foreground capitalize">
                {stats.topMood}
              </span>
            </div>
          ) : (
            <p className="text-4xl font-bold text-foreground">—</p>
          )}
        </div>
      </div>

      {/* Mood Chart */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h2 className="text-lg font-bold text-foreground mb-3 text-center sm:text-left">
          7-Day Mood Trend
        </h2>

        {!hasEntries ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-muted-foreground text-sm">
              No mood data yet. Start logging to see your trend!
            </p>
            <Link
              href="/scan"
              className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Log Your First Mood
            </Link>
          </div>
        ) : (
          <div ref={chartRef} className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <LineChart
                data={chart}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={true}
                  horizontal={true}
                />
                <XAxis
                  dataKey="date"
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);

                    return isMobile
                      ? date.toLocaleDateString("en-US", {
                          weekday: "short"
                        })
                      : date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                        });
                  }}
                />
                <YAxis
                  domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                    interval={0}
                    tickFormatter={(v) => moodLabels[v] ?? ""}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: "var(--primary)" }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
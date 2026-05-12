"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

const moodColor: Record<Mood, string> = {
  happy: "bg-yellow-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-400",
  sad: "bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-400",
  stressed: "bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-400",
  calm: "bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-400",
  energetic: "bg-orange-500/20 border-orange-500/30 text-orange-700 dark:text-orange-400",
  tired: "bg-purple-500/20 border-purple-500/30 text-purple-700 dark:text-purple-400",
};

const MOODS: Mood[] = ["happy", "sad", "stressed", "calm", "energetic", "tired"];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [moodFilter, setMoodFilter] = useState<Mood | "">("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [page, moodFilter]);

  async function fetchEntries() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(moodFilter && { mood: moodFilter }),
      });
      const res = await api.get(`/api/journal?${params}`);
      setEntries(res.data.entries);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/journal/${id}`);
      setEntries(entries.filter((e) => e.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteSelected() {
    setBulkDeleting(true);
    try {
      await Promise.all([...selectedIds].map((id) => api.delete(`/api/journal/${id}`)));
      setEntries(entries.filter((e) => !selectedIds.has(e.id)));
      setSelectedIds(new Set());
      setSelectMode(false);
      setDeleteMultipleOpen(false);
    } catch (err) {
      console.error(err);
    }
    setBulkDeleting(false);
  }

  async function handleDeleteAll() {
    setBulkDeleting(true);
    try {
      await Promise.all(entries.map((e) => api.delete(`/api/journal/${e.id}`)));
      setEntries([]);
      setSelectedIds(new Set());
      setSelectMode(false);
      setDeleteAllOpen(false);
    } catch (err) {
      console.error(err);
    }
    setBulkDeleting(false);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map((e) => e.id)));
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Journal</h1>
          <p className="text-muted-foreground">Your mood history</p>
        </div>
        <Button asChild>
          <Link href="/scan">+ New Entry</Link>
        </Button>
      </div>

      {/* Action Bar */}
      <div className="flex gap-2 flex-wrap mb-4">
        <Button
          variant={selectMode ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setSelectMode(!selectMode);
            setSelectedIds(new Set());
          }}
        >
          {selectMode ? "Cancel" : "Select"}
        </Button>

        {selectMode && (
          <>
            <Button variant="outline" size="sm" onClick={toggleSelectAll}>
              {selectedIds.size === entries.length ? "Deselect All" : "Select All"}
            </Button>
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteMultipleOpen(true)}
              >
                Delete Selected ({selectedIds.size})
              </Button>
            )}
          </>
        )}

        {!selectMode && entries.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteAllOpen(true)}
          >
            Delete All
          </Button>
        )}
      </div>

      {/* Mood Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Button
          variant={moodFilter === "" ? "default" : "outline"}
          size="sm"
          onClick={() => { setMoodFilter(""); setPage(1); }}
        >
          All
        </Button>
        {MOODS.map((mood) => (
          <Button
            key={mood}
            variant={moodFilter === mood ? "default" : "outline"}
            size="sm"
            onClick={() => { setMoodFilter(mood); setPage(1); }}
          >
            {moodEmoji[mood]} {mood}
          </Button>
        ))}
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <p className="text-4xl mb-3">📓</p>
          <p className="text-foreground font-medium">No entries yet</p>
          <p className="text-muted-foreground text-sm mb-4">Start by scanning your mood</p>
          <Button asChild><Link href="/scan">Scan Mood</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => selectMode && toggleSelect(entry.id)}
              className={`bg-card border rounded-2xl p-5 transition-all duration-300 cursor-pointer
                ${selectMode ? "hover:border-primary" : "hover:border-primary"}
                ${selectedIds.has(entry.id)
                  ? "border-primary bg-primary/5"
                  : "border-border"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Checkbox in select mode */}
                  {selectMode && (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                      ${selectedIds.has(entry.id)
                        ? "bg-primary border-primary"
                        : "border-border"
                      }`}
                    >
                      {selectedIds.has(entry.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  )}

                  <span className="text-3xl">{moodEmoji[entry.mood]}</span>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${moodColor[entry.mood]}`}>
                      {entry.mood}
                    </span>
                    <p className="text-muted-foreground text-xs mt-1">
                      {formatDate(entry.createdAt)} · via {entry.source}
                    </p>
                  </div>
                </div>

                {!selectMode && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary">
                      <Link href={`/journal/${entry.id}`}>View →</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(entry.id); }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {entry.userNote && (
                <p className="text-muted-foreground text-sm mb-3 italic">
                  "{entry.userNote}"
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                {entry.recommendations.map((rec) => (
                  <span key={rec.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                    {rec.category === "music" ? "🎵" : rec.category === "activity" ? "🏃" : "💭"} {rec.category}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>← Prev</Button>
          <span className="px-4 py-2 text-muted-foreground text-sm">{page} / {totalPages}</span>
          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next →</Button>
        </div>
      )}

      {/* Single Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry?</DialogTitle>
            <DialogDescription>This will permanently delete this journal entry and all its recommendations.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteId!)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Selected Dialog */}
      <Dialog open={deleteMultipleOpen} onOpenChange={setDeleteMultipleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} entries?</DialogTitle>
            <DialogDescription>This will permanently delete the selected journal entries and all their recommendations.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMultipleOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSelected} disabled={bulkDeleting}>
              {bulkDeleting ? "Deleting..." : `Delete ${selectedIds.size} entries`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Dialog */}
      <Dialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Entries?</DialogTitle>
            <DialogDescription>This will permanently delete ALL your journal entries and recommendations. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAllOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAll} disabled={bulkDeleting}>
              {bulkDeleting ? "Deleting..." : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
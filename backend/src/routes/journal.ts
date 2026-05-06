import { Router } from "express";
import {
  getJournalEntries,
  getJournalEntry,
  updateNote,
  deleteEntry,
  toggleLiked,
} from "../controllers/journal.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All routes protected
router.get("/", authMiddleware, getJournalEntries);
router.get("/:id", authMiddleware, getJournalEntry);
router.patch("/:id/note", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteEntry);
router.patch("/recommendation/:id/liked", authMiddleware, toggleLiked);

export default router;
import { Router } from "express";
import { saveMood } from "../controllers/mood.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All mood routes are protected
router.post("/", authMiddleware, saveMood);

export default router;
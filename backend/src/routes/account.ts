import { Router } from "express";
import {
  getAccount,
  changePassword,
  exportJournal,
  deleteAccount,
} from "../controllers/account.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getAccount);
router.patch("/password", authMiddleware, changePassword);
router.get("/export", authMiddleware, exportJournal);
router.delete("/", authMiddleware, deleteAccount);

export default router;
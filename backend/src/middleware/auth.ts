import { Router } from "express";
import { signup, login, verifyEmail, logout } from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", verifyEmail);
router.post("/logout", logout);

export default router;
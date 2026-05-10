import express from "express";
import { signup, login, verifyEmail, logout, refreshToken } from "../controllers/authController";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", verifyEmail);
router.post("/refresh", refreshToken);
export default router;
import express from "express";
import authRoutes from "./routes/auth";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "MoodMatch API is running!" });
});

// Routes
app.use("/api/auth", authRoutes);
console.log("Before listen");
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
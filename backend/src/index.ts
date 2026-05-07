import express from "express";
import authRoutes from "./routes/auth";
import moodRoutes from "./routes/mood";
import journalRoutes from "./routes/journal";
import cors from "cors";
import dotenv from "dotenv";
import dashboardRoutes from "./routes/dashboard";//TRIAL123

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "MoodMatch API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/journal", journalRoutes);

app.use("/api/dashboard", dashboardRoutes);//TRIAL123

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
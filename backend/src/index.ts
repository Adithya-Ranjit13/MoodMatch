import express from "express";
import authRoutes from "./routes/auth";
import moodRoutes from "./routes/mood";
import journalRoutes from "./routes/journal";
import cors from "cors";
import dotenv from "dotenv";
import dashboardRoutes from "./routes/dashboard";
import accountRoutes from "./routes/account";


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
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      process.env.FRONTEND_URL,
      /\.vercel\.app$/,
    ];
    if (!origin || allowed.some(a => typeof a === 'string' ? a === origin : a.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/journal", journalRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/account", accountRoutes);//TRIAL123

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
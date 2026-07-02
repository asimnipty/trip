import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import apiRouter from "./routes/api";

// Load environment variables
dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to strictly allow your GitHub Pages domain
app.use(cors({
  origin: "https://asimnipty.github.io", 
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true
}));

app.use(express.json());

// ─────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────
app.use("/api", apiRouter);

// Health check endpoint so you can verify the server is live
app.get("/", (req, res) => {
  res.send("Backend API is online.");
});

// ─────────────────────────────────────────────────────────────────
// SERVER STARTUP
// ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import apiRouter from "./routes/api";

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// REGISTER MODULAR BACKEND ROUTERS
app.use("/api", apiRouter);

// VITE DEV SERVER / PRODUCTION BUNDLER INTEGRATION
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving of static compiled site
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Travel ERP Server running at http://localhost:${PORT}`);
    console.log(`📡 Ingress routing is online. Ready for connections.`);
  });
}

startServer();
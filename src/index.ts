import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs";
import { config } from "./config";
import { connectDb } from "./db";
import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";

async function main() {
  fs.mkdirSync(config.uploadsDir, { recursive: true });

  const db = await connectDb();

  const app = express();
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (config.corsOrigins.includes(origin) || config.corsOrigins.includes("*")) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "8mb" }));
  app.use("/uploads", express.static(config.uploadsDir));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "sanwra-traders-api",
      db: db.mode,
      time: new Date().toISOString(),
    });
  });

  app.get("/", (_req, res) => {
    res.json({
      name: "Sanwra Traders API",
      health: "/health",
      products: "/api/products",
      auth: "/api/auth/login",
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(err);
      if (err.message.startsWith("CORS")) {
        res.status(403).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: err.message || "Server error" });
    }
  );

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`[server] Sanwra Traders API on http://127.0.0.1:${config.port}`);
    console.log(`[server] Health: http://127.0.0.1:${config.port}/health`);
    console.log(`[server] DB mode: ${db.mode}`);
  });
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { config } from "./config";
import { seedProductsIfEmpty, seedSettings } from "./seedData";

let memoryServer: MongoMemoryServer | null = null;

export async function connectDb(): Promise<{ mode: "atlas" | "memory"; uri: string }> {
  if (config.mongodbUri) {
    try {
      await mongoose.connect(config.mongodbUri);
      console.log("[db] Connected to MongoDB Atlas (MONGODB_URI)");
      await seedProductsIfEmpty();
      await seedSettings();
      return { mode: "atlas", uri: "(redacted)" };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[db] Failed to connect with MONGODB_URI:", message);
      console.error(
        "[db] Check your Atlas URI, network access (0.0.0.0/0 for Render), and database user password."
      );
      throw err;
    }
  }

  if (config.isProd) {
    throw new Error(
      "MONGODB_URI is required in production. Create a free Atlas M0 cluster and set MONGODB_URI on Render."
    );
  }

  console.warn(
    "[db] MONGODB_URI not set — starting in-memory MongoDB for local/dev. Data resets when the process exits."
  );
  const dataDir = path.join(process.cwd(), ".memory-db");
  fs.mkdirSync(dataDir, { recursive: true });
  memoryServer = await MongoMemoryServer.create({
    instance: { dbName: "sanwra" },
  });
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
  console.log("[db] Connected to in-memory MongoDB");
  await seedProductsIfEmpty();
  await seedSettings();
  return { mode: "memory", uri };
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

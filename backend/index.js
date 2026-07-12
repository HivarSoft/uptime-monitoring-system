import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";
import config from "./config/config.js";
import { schedulerTick } from "./loggService/loggService.js";
import cron from "node-cron";

const MONGODB_URL = process.env.MongoDBURL;

if (!MONGODB_URL) {
  console.error("❌ MongoDBURL is not set"); process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set"); process.exit(1);
}

mongoose.connect(MONGODB_URL, { serverSelectionTimeoutMS: 10_000 })
  .then(async () => {
    console.log("✅ MongoDB connected");

    // ── Start BullMQ worker (gracefully skipped if Redis unavailable) ───────
    try {
      const { startWorker } = await import("./queue/monitorWorker.js");
      startWorker();
      console.log("✅ BullMQ worker started");
    } catch (err) {
      console.warn("⚠️  BullMQ worker could not start (Redis may be unavailable):", err.message);
      console.warn("   Checks will run directly in the scheduler process instead.");
    }

    // ── HTTP server ──────────────────────────────────────────────────────────
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Server on port ${config.PORT}`);
    });

    // ── Scheduler — runs every minute, enqueues due services ────────────────
    await schedulerTick().catch((e) => console.error("[Startup Tick]", e.message));

    cron.schedule("* * * * *", () => {
      schedulerTick().catch((e) => console.error("[Cron Tick]", e.message));
    });

    // ── Graceful shutdown ────────────────────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`${signal} received — shutting down…`);
      server.close(async () => {
        try {
          const { stopWorker } = await import("./queue/monitorWorker.js");
          await stopWorker();
        } catch { /* ignore */ }
        await mongoose.connection.close();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 15_000); // force-kill after 15s
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));
  })
  .catch((err) => {
    console.error("❌ MongoDB failed:", err.message);
    process.exit(1);
  });

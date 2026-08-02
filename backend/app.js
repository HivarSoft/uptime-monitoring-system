import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";

import { configurePassport } from "./config/passport.js";
import authRoutes    from "./routes/authRoutes.js";
import userRoutes    from "./routes/userRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import alertRoutes   from "./routes/alertRoutes.js";
import { jwtAuthGuard } from "./middlewares/jwtAuthGuard.js";

// ── Passport strategies ────────────────────────────────────────────────────────
configurePassport();

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile/curl/server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// ── Body & cookie parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ── Passport (stateless — no session middleware needed) ────────────────────────
app.use(passport.initialize());

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",    authRoutes);
app.use("/api/v1/user",    jwtAuthGuard, userRoutes);
app.use("/api/v1/service", jwtAuthGuard, serviceRoutes);
app.use("/api/v1/alerts",  jwtAuthGuard, alertRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use("*", (_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Express Error]", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;

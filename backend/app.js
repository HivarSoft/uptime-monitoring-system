import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import { jwtAuthGuard } from "./middlewares/jwtAuthGuard.js";
import cors from "cors";

const app = express();

// CORS — allow both localhost dev ports and production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
  "https://uptime-monitoring-system.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth",    authRoutes);
app.use("/api/v1/user",    jwtAuthGuard, userRoutes);
app.use("/api/v1/service", jwtAuthGuard, serviceRoutes);
app.use("/api/v1/alerts",  jwtAuthGuard, alertRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Express Error]", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;

import express from "express";
import passport from "passport";
import {
  oauthSuccess,
  checkLogin,
  getCsrfToken,
  logout,
} from "../controllers/authController.js";
import { jwtAuthGuard } from "../middlewares/jwtAuthGuard.js";

const router = express.Router();

// ── Google OAuth ───────────────────────────────────────────────────────────────
router.get(
  "/google",
  (req, res, next) => {
    if (!passport._strategy("google")) {
      return res.status(503).json({ success: false, message: "Google OAuth is not configured on this server. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL to backend/.env and restart." });
    }
    next();
  },
  passport.authenticate("google", { session: false, scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!passport._strategy("google")) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=google_not_configured`);
    }
    next();
  },
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=google_auth_failed`,
  }),
  oauthSuccess
);

// ── GitHub OAuth ───────────────────────────────────────────────────────────────
router.get(
  "/github",
  (req, res, next) => {
    if (!passport._strategy("github")) {
      return res.status(503).json({ success: false, message: "GitHub OAuth is not configured on this server. Add GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_CALLBACK_URL to backend/.env and restart." });
    }
    next();
  },
  passport.authenticate("github", { session: false, scope: ["user:email"] })
);

router.get(
  "/github/callback",
  (req, res, next) => {
    if (!passport._strategy("github")) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=github_not_configured`);
    }
    next();
  },
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=github_auth_failed`,
  }),
  oauthSuccess
);

// ── Session & CSRF ─────────────────────────────────────────────────────────────
router.get("/checkLogin", jwtAuthGuard, checkLogin);
router.get("/csrf-token", jwtAuthGuard, getCsrfToken);
router.post("/logout",    jwtAuthGuard, logout);

export default router;

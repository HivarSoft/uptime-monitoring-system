import jwt from "jsonwebtoken";
import { COOKIE_NAME, CSRF_COOKIE_NAME } from "../helpers/authHelper.js";

/**
 * Cookie-based JWT auth guard.
 *
 * Reads the HttpOnly session_token cookie and verifies:
 *   1. JWT signature & expiry
 *   2. CSRF double-submit check — compares the X-CSRF-Token request header
 *      against the csrf_token cookie value.
 *
 * Safe methods (GET, HEAD, OPTIONS) skip the CSRF check.
 */
export const jwtAuthGuard = (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Session expired — please sign in again" });
    }

    // CSRF double-submit check for mutating methods
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (!safeMethods.includes(req.method)) {
      const csrfHeader = req.headers["x-csrf-token"];
      const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];

      if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        return res.status(403).json({ success: false, message: "Invalid CSRF token" });
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Auth check failed" });
  }
};

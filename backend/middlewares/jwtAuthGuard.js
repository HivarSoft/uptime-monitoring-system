import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "../helpers/authHelper.js";

/**
 * Cookie-based JWT auth guard.
 *
 * Reads the HttpOnly session_token cookie and verifies JWT signature & expiry.
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

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Auth check failed" });
  }
};

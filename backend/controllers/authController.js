import crypto from "crypto";
import {
  generateToken,
  setAuthCookies,
  clearAuthCookies,
  CSRF_COOKIE_NAME,
} from "../helpers/authHelper.js";

/**
 * Called after a successful OAuth callback (Google or GitHub).
 * Issues an HttpOnly JWT cookie + a readable CSRF cookie, then
 * redirects the browser back to the frontend dashboard.
 */
export const oauthSuccess = (req, res) => {
  try {
    const user = req.user; // set by Passport

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=auth_failed`
      );
    }

    const accessToken = generateToken(
      user._id,
      user.email,
      user.firstName,
      user.lastName
    );

    // Generate a random CSRF token for this session
    const csrfToken = crypto.randomBytes(32).toString("hex");

    setAuthCookies(res, accessToken, csrfToken);

    // Redirect to frontend — no sensitive data in the URL
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`
    );
  } catch (err) {
    console.error("[oauthSuccess]", err);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=server_error`
    );
  }
};

/**
 * Verifies the session cookie is still valid and returns the user payload.
 * Used by the frontend on every page-load to hydrate the auth state.
 */
export const checkLogin = (req, res) => {
  // req.user was attached by jwtAuthGuard
  if (req.user) {
    return res.status(200).json({
      success: true,
      user: {
        id:        req.user.id,
        email:     req.user.email,
        firstName: req.user.firstName,
        lastName:  req.user.lastName,
      },
    });
  }
  return res.status(401).json({ success: false, message: "Not authenticated" });
};

/**
 * Provides a fresh CSRF token to authenticated clients.
 * Called once after the OAuth redirect completes, so the frontend
 * can read the value from the cookie and attach it to mutation requests.
 */
export const getCsrfToken = (req, res) => {
  // The csrf_token cookie was already set during oauthSuccess.
  // This endpoint just lets the client confirm it's there.
  const token = req.cookies?.[CSRF_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ success: false, message: "No active session" });
  }
  return res.status(200).json({ success: true, csrfToken: token });
};

/**
 * Logout — clear auth cookies and end the passport session.
 */
export const logout = (req, res) => {
  req.logout?.((err) => {
    if (err) console.error("[logout]", err);
  });
  clearAuthCookies(res);
  return res.status(200).json({ success: true, message: "Logged out" });
};

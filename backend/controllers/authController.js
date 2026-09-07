import {
  generateToken,
  setAuthCookies,
  clearAuthCookies,
} from "../helpers/authHelper.js";

/**
 * Called after a successful OAuth callback (Google or GitHub).
 * Issues an HttpOnly JWT cookie, then redirects the browser back to the frontend dashboard.
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

    setAuthCookies(res, accessToken);

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
 * Logout — clear auth cookies and end the passport session.
 */
export const logout = (req, res) => {
  req.logout?.((err) => {
    if (err) console.error("[logout]", err);
  });
  clearAuthCookies(res);
  return res.status(200).json({ success: true, message: "Logged out" });
};

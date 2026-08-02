import jwt from "jsonwebtoken";

const COOKIE_NAME = "session_token";
const CSRF_COOKIE_NAME = "csrf_token";

/** Sign a short-lived access JWT */
export const generateToken = (id, email, firstName, lastName) => {
  return jwt.sign(
    { id: String(id), email, firstName, lastName },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

/** Sign a long-lived refresh JWT */
export const generateRefreshToken = (id) => {
  return jwt.sign(
    { id: String(id), type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
};

/**
 * Set the HttpOnly session cookie (access token) and the
 * readable CSRF cookie on the response.
 */
export const setAuthCookies = (res, accessToken, csrfToken) => {
  const isProd = process.env.NODE_ENV === "production";

  // HttpOnly — not accessible to JS, prevents XSS token theft
  res.cookie(COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge:   60 * 60 * 1000, // 1 hour
    path:     "/",
  });

  // Readable by JS — used for double-submit CSRF pattern
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure:   isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge:   60 * 60 * 1000,
    path:     "/",
  });
};

/** Clear both auth cookies on logout */
export const clearAuthCookies = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  const opts = { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax", path: "/" };
  res.clearCookie(COOKIE_NAME, opts);
  res.clearCookie(CSRF_COOKIE_NAME, { ...opts, httpOnly: false });
};

export { COOKIE_NAME, CSRF_COOKIE_NAME };

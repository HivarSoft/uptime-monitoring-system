import jwt from "jsonwebtoken";

const COOKIE_NAME = "session_token";

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
 * Set the HttpOnly session cookie (access token).
 */
export const setAuthCookies = (res, accessToken) => {
  const isProd = process.env.NODE_ENV === "production";

  // HttpOnly — not accessible to JS, prevents XSS token theft
  res.cookie(COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge:   60 * 60 * 1000, // 1 hour
    path:     "/",
    domain:   isProd ? ".hivarsoft.com" : undefined,
  });
};

/** Clear auth cookies on logout */
export const clearAuthCookies = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  
  const opts = { 
    httpOnly: true, 
    secure: isProd, 
    sameSite: isProd ? "none" : "lax",
    path: "/",
    domain: isProd ? ".hivarsoft.com" : undefined,
  };
  
  res.clearCookie(COOKIE_NAME, opts);
};

export { COOKIE_NAME };

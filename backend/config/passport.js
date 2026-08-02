import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User.js";

/**
 * Find or create a user for a given OAuth profile.
 *
 * Rules:
 *  - If a user already has this provider/id pair linked → return user
 *  - If a user exists with the same email but without this provider → link it
 *  - Otherwise → create a new user
 */
async function findOrCreate(provider, profile, done) {
  try {
    const email = (profile.emails?.[0]?.value ?? "").toLowerCase().trim();
    const providerId = String(profile.id);
    const firstName  = profile.name?.givenName || profile.displayName?.split(" ")[0] || "User";
    const lastName   = profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || "";
    const imgUrl     = profile.photos?.[0]?.value ?? "";

    // Already linked?
    let user = await User.findOne({
      providers: { $elemMatch: { provider, providerId } },
    });
    if (user) return done(null, user);

    // Same email, different provider → link
    if (email) {
      user = await User.findOne({ email });
      if (user) {
        user.providers.push({ provider, providerId });
        if (!user.imgUrl && imgUrl) user.imgUrl = imgUrl;
        await user.save();
        return done(null, user);
      }
    }

    // Brand new user
    user = await User.create({
      firstName, lastName, email, imgUrl,
      providers: [{ provider, providerId }],
    });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}

export function configurePassport() {
  const missing = [];

  // ── Google ─────────────────────────────────────────────────────────────────
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
    passport.use(
      new GoogleStrategy(
        {
          clientID:     process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL:  process.env.GOOGLE_CALLBACK_URL,
          scope:        ["profile", "email"],
        },
        (_at, _rt, profile, done) => findOrCreate("google", profile, done)
      )
    );
    console.log("✅ Google OAuth strategy registered");
  } else {
    missing.push("Google (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL)");
  }

  // ── GitHub ─────────────────────────────────────────────────────────────────
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL) {
    passport.use(
      new GitHubStrategy(
        {
          clientID:     process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL:  process.env.GITHUB_CALLBACK_URL,
          scope:        ["user:email"],
        },
        (_at, _rt, profile, done) => findOrCreate("github", profile, done)
      )
    );
    console.log("✅ GitHub OAuth strategy registered");
  } else {
    missing.push("GitHub (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET / GITHUB_CALLBACK_URL)");
  }

  if (missing.length) {
    console.warn(
      `⚠️  OAuth strategies NOT registered (missing env vars):\n   ${missing.join("\n   ")}\n` +
      "   Add the credentials to backend/.env and restart the server."
    );
  }

  // Passport session hooks (minimal — we use our own JWT cookies)
  passport.serializeUser((user, done)   => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

import { Box, Button, Typography, Divider, IconButton, Tooltip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { MonitorHeart, LightMode, DarkMode, FiberManualRecord } from "@mui/icons-material";
import { FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useThemeMode } from "../../theme/ThemeContext";
import { T } from "../../theme/theme";

/** Back-end base URL without the /api/v1 suffix — used for OAuth redirects */
const AUTH_BASE = (import.meta.env.VITE_BASE_URL as string ?? "http://localhost:911/api/v1")
  .replace(/\/api\/v1\/?$/, "");

const FEATURES = [
  { dot: T.up,   text: "HTTP checks every minute — powered by BullMQ workers" },
  { dot: T.brand, text: "Multi-channel alerts: Email, Slack, Discord, Telegram, Webhook" },
  { dot: "#0891b2", text: "Response time analytics with P95 latency tracking" },
  { dot: T.warn,  text: "Configurable fail & recovery thresholds — zero false positives" },
];

// Animated live-status widget shown on the left panel
const SERVICES = [
  { name: "Auth API",        rt: "48ms",  up: "100%",  status: "up"   },
  { name: "Payment Gateway", rt: "112ms", up: "99.9%", status: "up"   },
  { name: "Database Proxy",  rt: "340ms", up: "99.3%", status: "warn" },
  { name: "CDN Edge",        rt: "18ms",  up: "100%",  status: "up"   },
];

export default function LoginPage() {
  const theme   = useTheme();
  const { toggle } = useThemeMode();
  const L       = theme.palette.mode === "light";
  const navigate = useNavigate();

  const handleOAuth = (provider: "google" | "github") => {
    window.location.href = `${AUTH_BASE}/api/v1/auth/${provider}`;
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      backgroundColor: theme.palette.background.default,
      overflow: "hidden",
    }}>

      {/* ── Left panel — brand + feature showcase ─────────────────────── */}
      <Box sx={{
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        flex: "0 0 52%",
        position: "relative",
        overflow: "hidden",
        background: L
          ? `linear-gradient(145deg, #0f0f1a 0%, #1a1040 40%, #0d1b3e 100%)`
          : `linear-gradient(145deg, #0a0a14 0%, #130d30 40%, #091230 100%)`,
      }}>

        {/* Grid overlay */}
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(129,140,248,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Orbs */}
        <Box sx={{
          position: "absolute", top: "-10%", left: "20%",
          width: 500, height: 500, borderRadius: "50%", pointerEvents: "none",
          background: `radial-gradient(ellipse, ${alpha(T.brand, 0.22)} 0%, transparent 65%)`,
          animation: "orb1 9s ease-in-out infinite",
          transform: "translate(-50%, -50%)",
        }} />
        <Box sx={{
          position: "absolute", bottom: "5%", right: "-5%",
          width: 360, height: 360, borderRadius: "50%", pointerEvents: "none",
          background: `radial-gradient(ellipse, ${alpha("#0891b2", 0.18)} 0%, transparent 65%)`,
          animation: "orb2 11s ease-in-out infinite",
        }} />
        <Box sx={{
          position: "absolute", bottom: "35%", left: "5%",
          width: 240, height: 240, borderRadius: "50%", pointerEvents: "none",
          background: `radial-gradient(ellipse, ${alpha(T.up, 0.14)} 0%, transparent 65%)`,
          animation: "orb3 8s ease-in-out infinite",
        }} />

        {/* Content */}
        <Box sx={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column",
          height: "100%", p: { md: 5, lg: 7 },
        }}>
          {/* Logo */}
          <Box
            onClick={() => navigate("/")}
            sx={{ display: "flex", alignItems: "center", gap: 1.25, cursor: "pointer", userSelect: "none", mb: "auto" }}
          >
            <Box sx={{
              width: 34, height: 34, borderRadius: 1.75,
              background: `linear-gradient(140deg, ${T.brand} 0%, #4f46e5 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 14px ${alpha(T.brand, 0.5)}`,
            }}>
              <MonitorHeart sx={{ fontSize: 18, color: "#fff" }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.0625rem", letterSpacing: "-0.025em", color: "#fff", lineHeight: 1 }}>
              PulseWatch
            </Typography>
          </Box>

          {/* Headline */}
          <Box sx={{ my: "auto" }}>
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 1,
              px: 1.5, py: 0.5, borderRadius: 99, mb: 3,
              border: `1px solid ${alpha(T.up, 0.35)}`,
              backgroundColor: alpha(T.up, 0.1),
            }}>
              <FiberManualRecord sx={{ fontSize: 8, color: T.up }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: T.up }}>
                Live monitoring · BullMQ-powered
              </Typography>
            </Box>

            <Typography sx={{
              fontSize: { md: "2.375rem", lg: "2.875rem" },
              fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08,
              color: "#fff", mb: 1.5,
            }}>
              Know the moment
              <br />
              <Box component="span" sx={{
                background: `linear-gradient(130deg, #818cf8 0%, #38bdf8 55%, ${T.up} 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                something breaks.
              </Box>
            </Typography>

            <Typography sx={{ fontSize: "1rem", color: "rgba(248,250,252,0.6)", lineHeight: 1.75, maxWidth: 400, mb: 4 }}>
              Monitor APIs, endpoints, and services with configurable intervals,
              smart incident detection, and instant multi-channel alerts.
            </Typography>

            {/* Feature list */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 5 }}>
              {FEATURES.map((f) => (
                <Box key={f.text} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box sx={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0, mt: 0.125,
                    backgroundColor: alpha(f.dot, 0.15),
                    border: `1px solid ${alpha(f.dot, 0.35)}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: f.dot }} />
                  </Box>
                  <Typography sx={{ fontSize: "0.875rem", color: "rgba(248,250,252,0.7)", lineHeight: 1.6 }}>
                    {f.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Live dashboard card */}
            <Box sx={{
              borderRadius: 2, overflow: "hidden",
              border: `1px solid rgba(129,140,248,0.18)`,
              backgroundColor: "rgba(15,15,30,0.75)",
              backdropFilter: "blur(12px)",
              maxWidth: 400,
            }}>
              {/* Card header */}
              <Box sx={{
                px: 2, py: 1.25,
                borderBottom: "1px solid rgba(129,140,248,0.12)",
                backgroundColor: "rgba(129,140,248,0.06)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: T.up, boxShadow: `0 0 6px ${T.up}`, animation: "pulse 2s ease-in-out infinite" }} />
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(248,250,252,0.8)" }}>
                    All systems monitored
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: "0.6875rem", color: "rgba(248,250,252,0.35)", fontFamily: "monospace" }}>
                  live
                </Typography>
              </Box>

              {/* Service rows */}
              {SERVICES.map((s) => (
                <Box key={s.name} sx={{
                  px: 2, py: 0.875,
                  display: "flex", alignItems: "center", gap: 1.5,
                  borderBottom: "1px solid rgba(129,140,248,0.07)",
                  "&:last-child": { borderBottom: 0 },
                }}>
                  <Box sx={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    backgroundColor: s.status === "up" ? T.up : T.warn,
                    boxShadow: s.status === "up" ? `0 0 5px ${T.up}` : `0 0 5px ${T.warn}`,
                    animation: s.status === "up" ? "pulse 2.5s ease-in-out infinite" : "none",
                  }} />
                  <Typography sx={{ fontSize: "0.8125rem", color: "rgba(248,250,252,0.75)", flex: 1, fontWeight: 500 }} noWrap>
                    {s.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "rgba(248,250,252,0.35)", minWidth: 38, textAlign: "right", fontFamily: "monospace" }}>
                    {s.rt}
                  </Typography>
                  <Typography sx={{
                    fontSize: "0.6875rem", fontWeight: 700, minWidth: 36, textAlign: "right",
                    color: s.status === "up" ? T.up : T.warn,
                  }}>
                    {s.up}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Bottom legal */}
          <Box sx={{ display: "flex", gap: 2.5, mt: "auto", pt: 4 }}>
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
            ].map((l) => (
              <Box
                key={l.label}
                component="a"
                href={l.href}
                sx={{
                  fontSize: "0.75rem", color: "rgba(248,250,252,0.35)",
                  textDecoration: "none", fontWeight: 500,
                  "&:hover": { color: "rgba(248,250,252,0.65)" },
                  transition: "color 0.15s",
                }}
              >
                {l.label}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Right panel — sign-in card ─────────────────────────────────── */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 5, md: 6 },
        py: 6,
        position: "relative",
        backgroundColor: theme.palette.background.default,
      }}>

        {/* Theme toggle — top right */}
        <Box sx={{ position: "absolute", top: 20, right: 20 }}>
          <Tooltip title={L ? "Dark mode" : "Light mode"}>
            <IconButton
              onClick={toggle}
              size="small"
              sx={{
                width: 34, height: 34, color: "text.secondary",
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": { color: "text.primary" },
              }}
            >
              {L ? <DarkMode sx={{ fontSize: 15 }} /> : <LightMode sx={{ fontSize: 15 }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Mobile logo (only visible when left panel is hidden) */}
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center", gap: 1.25,
            cursor: "pointer", userSelect: "none", mb: 5,
          }}
        >
          <Box sx={{
            width: 32, height: 32, borderRadius: 1.5,
            background: `linear-gradient(140deg, ${T.brand} 0%, #4f46e5 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 3px 10px ${alpha(T.brand, 0.4)}`,
          }}>
            <MonitorHeart sx={{ fontSize: 17, color: "#fff" }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.025em", color: "text.primary" }}>
            PulseWatch
          </Typography>
        </Box>

        {/* Sign-in card */}
        <Box sx={{ width: "100%", maxWidth: 380 }}>

          {/* Card heading */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" color="text.primary" sx={{ mb: 0.75 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Sign in to your account to monitor your services and manage alerts.
            </Typography>
          </Box>

          {/* OAuth buttons */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <OAuthButton
              icon={<GoogleIcon />}
              label="Continue with Google"
              onClick={() => handleOAuth("google")}
              hoverBorder="#4285F4"
              hoverBg={alpha("#4285F4", 0.05)}
            />
            <OAuthButton
              icon={<FaGithub size={18} />}
              label="Continue with GitHub"
              onClick={() => handleOAuth("github")}
              hoverBorder={L ? "#24292e" : "#aaa"}
              hoverBg={alpha(L ? "#24292e" : "#fff", 0.05)}
            />
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.disabled" sx={{ px: 1 }}>
              secure OAuth — no password required
            </Typography>
          </Divider>

          {/* 
          <Box sx={{
            p: 2, borderRadius: 1.5,
            backgroundColor: L ? T.n50 : alpha("#fff", 0.03),
            border: `1px solid ${theme.palette.divider}`,
            display: "flex", flexDirection: "column", gap: 1,
          }}>
            {[
              { dot: T.up,   text: "Session stored in HttpOnly cookie — safe from XSS" },
              { dot: T.brand, text: "CSRF double-submit protection on every request" },
              { dot: "#0891b2", text: "We never see or store your Google or GitHub password" },
            ].map((item) => (
              <Box key={item.text} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <Box sx={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                  backgroundColor: item.dot, mt: 0.625,
                }} />
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box> */}

          {/* Legal */}
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 3, textAlign: "center", lineHeight: 1.7 }}>
            By signing in you agree to our{" "}
            <Box
              component="a" href="/terms"
              sx={{ color: T.brand, textDecoration: "none", fontWeight: 500, "&:hover": { textDecoration: "underline" } }}
            >
              Terms of Service
            </Box>
            {" "}and{" "}
            <Box
              component="a" href="/privacy"
              sx={{ color: T.brand, textDecoration: "none", fontWeight: 500, "&:hover": { textDecoration: "underline" } }}
            >
              Privacy Policy
            </Box>.
          </Typography>
        </Box>

        {/* Bottom: back to home */}
        <Box sx={{ position: "absolute", bottom: 20, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Box
            onClick={() => navigate("/")}
            sx={{
              display: "flex", alignItems: "center", gap: 0.625,
              cursor: "pointer", color: "text.disabled",
              fontSize: "0.75rem", fontWeight: 500,
              "&:hover": { color: "text.secondary" },
              transition: "color 0.15s",
            }}
          >
            <Box component="span" sx={{ fontSize: "0.75rem" }}>←</Box>
            Back to home
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function OAuthButton({
  icon, label, onClick, hoverBorder, hoverBg,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  hoverBorder: string;
  hoverBg: string;
}) {
  const theme = useTheme();
  return (
    <Button
      fullWidth
      variant="outlined"
      size="large"
      onClick={onClick}
      sx={{
        justifyContent: "flex-start",
        px: 2.5, py: 1.375,
        borderColor: theme.palette.divider,
        color: "text.primary",
        fontWeight: 600,
        fontSize: "0.9375rem",
        gap: 1.5,
        transition: "all 0.18s",
        "&:hover": {
          borderColor: hoverBorder,
          backgroundColor: hoverBg,
          transform: "translateY(-1px)",
          boxShadow: `0 4px 14px ${alpha(hoverBorder, 0.12)}`,
        },
        "&:active": { transform: "translateY(0)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        {icon}
      </Box>
      {label}
    </Button>
  );
}

/** Official Google coloured "G" SVG */
function GoogleIcon() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      sx={{ width: 18, height: 18, display: "block" }}
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Box>
  );
}

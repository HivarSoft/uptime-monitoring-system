import { Box, Typography, Button, Grid, Chip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  MonitorHeartRounded, SpeedRounded, BarChartRounded,
  NotificationsActiveRounded, CheckCircleRounded,
  ArrowForwardRounded, FiberManualRecord, TuneRounded,
  MailOutlineRounded, WebhookRounded, QueryStatsRounded,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { selectUser } from "../../redux/reducers/userReducer";
import { SignUpDialog } from "../../layout/layout";
import { T } from "../../theme/theme";

// ── Mock dashboard widget ────────────────────────────────────────────────────

const mockServices = [
  { name: "Auth API",        status: "up",   rt: "48ms",  up: "100%"  },
  { name: "Payment Gateway", status: "up",   rt: "112ms", up: "99.9%" },
  { name: "CDN Edge",        status: "up",   rt: "18ms",  up: "100%"  },
  { name: "Database Proxy",  status: "warn", rt: "340ms", up: "99.3%" },
  { name: "Email Worker",    status: "up",   rt: "67ms",  up: "100%"  },
];

function StatusDot({ status }: { status: string }) {
  const c = status === "up" ? T.up : status === "warn" ? T.warn : T.down;
  return (
    <Box sx={{
      width: 7, height: 7, borderRadius: "50%", backgroundColor: c,
      flexShrink: 0, boxShadow: `0 0 0 2px ${c}28`,
      animation: status === "up" ? "pulse 2.5s ease-in-out infinite" : "none",
    }} />
  );
}

function MockDashboard() {
  const theme = useTheme();
  const L = theme.palette.mode === "light";
  return (
    <Box sx={{
      borderRadius: 2.5, overflow: "hidden",
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      boxShadow: L
        ? "0 28px 64px rgba(91,91,214,0.16), 0 8px 20px rgba(0,0,0,0.08)"
        : "0 28px 64px rgba(0,0,0,0.55), 0 8px 20px rgba(0,0,0,0.35)",
    }}>
      {/* Browser chrome */}
      <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", gap: 1.25, borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: L ? T.n50 : alpha("#fff", 0.025) }}>
        {["#ef4444","#f59e0b","#22c55e"].map(c => <Box key={c} sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: c }} />)}
        <Box sx={{ flex: 1, mx: 2, height: 20, borderRadius: 0.75, backgroundColor: L ? T.n200 : alpha("#fff", 0.06), display: "flex", alignItems: "center", px: 1.5 }}>
          <Typography sx={{ fontSize: "0.625rem", color: "text.disabled", fontFamily: "monospace" }}>pulsewatch.hivarsoft.com/dashboard</Typography>
        </Box>
      </Box>
      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Stat row */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          {[{ l:"Projects", v:"3", c:T.brand },{ l:"Services", v:"5", c:"#0891b2" },{ l:"Healthy", v:"4", c:T.up },{ l:"Incidents", v:"1", c:T.warn }].map(s => (
            <Box key={s.l} sx={{ flex: 1, p: "8px 10px", borderRadius: 1.5, backgroundColor: alpha(s.c, L ? 0.08 : 0.14), border: `1px solid ${alpha(s.c, 0.2)}` }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</Typography>
              <Typography sx={{ fontSize: "0.6rem", color: s.c, opacity: 0.7, fontWeight: 500, mt: 0.25 }}>{s.l}</Typography>
            </Box>
          ))}
        </Box>
        {/* Services */}
        <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "text.disabled", mb: 1, letterSpacing: "0.07em", textTransform: "uppercase" }}>
          Services · 5 monitored
        </Typography>
        {mockServices.map((s) => (
          <Box key={s.name} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75, borderBottom: `1px solid ${theme.palette.divider}`, "&:last-child": { borderBottom: 0 } }}>
            <StatusDot status={s.status} />
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: "text.primary", flex: 1 }} noWrap>{s.name}</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "text.disabled", minWidth: 38, textAlign: "right" }}>{s.rt}</Typography>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, minWidth: 36, textAlign: "right", color: s.status === "up" ? T.up : T.warn }}>{s.up}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

function Home() {
  const theme      = useTheme();
  const L          = theme.palette.mode === "light";
  const navigate   = useNavigate();
  const user       = useAppSelector(selectUser);
  const isLoggedIn = !!user.token;
  const [signUpOpen, setSignUpOpen] = useState(false);
  const handleCTA = () => isLoggedIn ? navigate("/dashboard") : setSignUpOpen(true);
  const p = theme.palette.primary.main;
  const s = theme.palette.secondary.main;

  return (
    <Box sx={{ overflowX: "hidden" }}>
      <SignUpDialog open={signUpOpen} onClose={() => setSignUpOpen(false)} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", pt: { xs: 4, md: 0 }, pb: { xs: 6, md: 0 }, overflow: "hidden" }}>
        <Box className={L ? "hero-line-grid" : "hero-line-grid-dark"} sx={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: L ? `linear-gradient(to top,${T.n50},transparent)` : `linear-gradient(to top,${T.dBase},transparent)`, pointerEvents: "none" }} />

        {/* Orbs */}
        {[
          { top: "8%", left: "50%", w: 900, h: 700, c: p, anim: "orb1 8s ease-in-out infinite", extra: { transform: "translate(-50%,-50%)" } },
          { top: "60%", left: "4%", w: 380, h: 380, c: s, anim: "orb2 11s ease-in-out infinite", extra: {} },
          { top: "25%", right: "4%", w: 300, h: 300, c: T.up, anim: "orb3 9s ease-in-out infinite", extra: {} },
        ].map((o, i) => (
          <Box key={i} sx={{ position: "absolute", width: o.w, height: o.h, borderRadius: "50%", pointerEvents: "none",
            background: `radial-gradient(ellipse at center, ${alpha(o.c, L ? 0.11 : 0.18)} 0%, transparent 65%)`,
            animation: o.anim, top: o.top, left: (o as any).left, right: (o as any).right, ...o.extra }} />
        ))}

        <Box sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1320, mx: "auto", px: { xs: 2, md: 4 }, display: "flex", alignItems: "center", gap: { xs: 6, lg: 10 }, flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between" }}>

          {/* Left — text */}
          <Box sx={{ flex: 1, maxWidth: 580, textAlign: { xs: "center", md: "left" } }}>
            <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" }, mb: 3 }}>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.75, py: 0.625, borderRadius: 99, border: `1px solid ${alpha(p, 0.3)}`, backgroundColor: alpha(p, L ? 0.07 : 0.12) }}>
                <FiberManualRecord sx={{ fontSize: 8, color: T.up }} />
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: p }}>BullMQ-powered · custom intervals · multi-channel alerts</Typography>
              </Box>
            </Box>

            <Typography sx={{ fontSize: { xs: "2.5rem", sm: "3.125rem", md: "3.75rem", lg: "4.125rem" }, fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.06, color: "text.primary", mb: 0.5 }}>
              Your services,
            </Typography>
            <Typography sx={{ fontSize: { xs: "2.5rem", sm: "3.125rem", md: "3.75rem", lg: "4.125rem" }, fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.06, mb: 1, background: `linear-gradient(130deg, ${p} 0%, ${s} 55%, ${T.up} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              always online.
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mt: 3, mb: 4, fontSize: { xs: "1rem", md: "1.0625rem" }, lineHeight: 1.75, maxWidth: 480, mx: { xs: "auto", md: 0 } }}>
              PulseWatch monitors your APIs and endpoints on your schedule — every minute to every day — with configurable failure thresholds, BullMQ-backed workers, and instant alerts via Email, Slack, Discord, Telegram, or webhooks.
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" }, mb: 4 }}>
              <Button onClick={handleCTA} variant="contained" size="large" endIcon={<ArrowForwardRounded />} sx={{ fontSize: "1rem", px: 3.5, py: 1.375, borderRadius: 2 }}>
                {isLoggedIn ? "Open Dashboard" : "Start for Free"}
              </Button>
            </Box>

            {/* Trust strip */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" } }}>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[...Array(5)].map((_, i) => <Typography key={i} sx={{ color: "#f59e0b", fontSize: 13 }}>★</Typography>)}
              </Box>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.8125rem" }}>Loved by developers</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: T.up }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.8125rem" }}>99.97% avg uptime tracked</Typography>
              </Box>
            </Box>
          </Box>

          {/* Right — floating mock */}
          <Box sx={{ flex: "0 0 auto", width: { xs: "100%", sm: 420, md: 440, lg: 480 }, position: "relative" }}>
            <Box sx={{ position: "absolute", inset: -40, borderRadius: "50%", pointerEvents: "none", background: `radial-gradient(ellipse at center, ${alpha(p, L ? 0.14 : 0.24)} 0%, transparent 65%)`, filter: "blur(20px)" }} />

            {/* Floating pill top-left */}
            <Box className="float-slow" sx={{ position: "absolute", top: -25, left: -14, zIndex: 2, px: 1.5, py: 0.875, borderRadius: 2, backgroundColor: theme.palette.background.paper, border: `1px solid ${alpha(T.up, 0.35)}`, boxShadow: `0 4px 16px ${alpha(T.up, 0.14)}`, display: "flex", alignItems: "center", gap: 0.875 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: T.up, boxShadow: `0 0 5px ${T.up}` }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: T.up }}>All systems operational</Typography>
            </Box>

            {/* Floating pill bottom-right */}
            <Box className="float-fast" sx={{ position: "absolute", bottom: -30, right: -10, zIndex: 2, px: 1.5, py: 0.875, borderRadius: 2, backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, boxShadow: `0 4px 14px ${alpha(p, 0.12)}`, display: "flex", alignItems: "center", gap: 0.75 }}>
              <SpeedRounded sx={{ fontSize: 13, color: s }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "text.primary" }}>Scalable</Typography>
            </Box>

            {/* Alert pill */}
            <Box className="float-med" sx={{ position: "absolute", top: 115, right: -20, zIndex: 2, px: 1.25, py: 0.75, borderRadius: 2, backgroundColor: theme.palette.background.paper, border: `1px solid ${alpha(T.warn, 0.35)}`, boxShadow: `0 4px 14px ${alpha(T.warn, 0.12)}`, display: "flex", alignItems: "center", gap: 0.75 }}>
              <MailOutlineRounded sx={{ fontSize: 13, color: T.warn }} />
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: T.warn }}>Alert sent → Slack</Typography>
            </Box>

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <MockDashboard />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <Box sx={{ py: 4, px: { xs: 3, md: 6 }, mb: 8, border: `1px solid ${theme.palette.divider}`, borderRadius: 2.5, backgroundColor: theme.palette.background.paper, display: "flex", gap: { xs: 3, md: 0 }, justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${p},${s},${T.up})` }} />
        {[
          { v: "1 min",   l: "Minimum check interval",     c: p    },
          { v: "50×",     l: "Concurrent BullMQ workers",  c: T.brand },
          { v: "5",       l: "Alert channel types",         c: s    },
          { v: "Instant", l: "Down → alert dispatch",      c: T.up  },
        ].map((item) => (
          <Box key={item.l} sx={{ textAlign: "center", px: 2, py: 1 }}>
            <Typography sx={{ fontSize: { xs: "1.625rem", md: "2rem" }, fontWeight: 900, letterSpacing: "-0.03em", color: item.c, lineHeight: 1.1, mb: 0.5 }}>{item.v}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.8125rem" }}>{item.l}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 10 }}>
        <Box sx={{ textAlign: "center", mb: 7 }}>
          <Chip label="Features" size="small" sx={{ mb: 2, backgroundColor: alpha(p, L ? 0.08 : 0.14), color: p, border: `1px solid ${alpha(p, 0.2)}`, fontWeight: 600 }} />
          <Typography sx={{ fontSize: { xs: "1.875rem", md: "2.5rem" }, fontWeight: 800, letterSpacing: "-0.035em", color: "text.primary", lineHeight: 1.15, mb: 1.5 }}>
            Enterprise-grade monitoring, zero complexity
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: "auto", lineHeight: 1.75 }}>
            Everything you need to run reliable services — configurable checks, smart incident detection, and real alerts on your preferred channels.
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Box sx={{ p: 3, height: "100%", backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 2.5, transition: "all 0.2s ease", "&:hover": { borderColor: alpha(f.color, 0.5), transform: "translateY(-3px)", boxShadow: `0 12px 32px ${alpha(f.color, L ? 0.1 : 0.18)}` } }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, mb: 2.5, background: `linear-gradient(135deg,${alpha(f.color, L ? 0.12 : 0.2)},${alpha(f.color, L ? 0.06 : 0.1)})`, border: `1px solid ${alpha(f.color, L ? 0.18 : 0.28)}`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color }}>
                  {f.icon}
                </Box>
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700, mb: 1 }}>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>{f.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <Box sx={{ mb: 10, maxWidth: 720, mx: "auto" }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip label="How it works" size="small" sx={{ mb: 2, backgroundColor: alpha(T.up, L ? 0.08 : 0.14), color: T.up, border: `1px solid ${alpha(T.up, 0.2)}`, fontWeight: 600 }} />
          <Typography sx={{ fontSize: { xs: "1.875rem", md: "2.5rem" }, fontWeight: 800, letterSpacing: "-0.035em", color: "text.primary", lineHeight: 1.15 }}>
            Up and running in 60 seconds
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {steps.map((step, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3, backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 2.5, transition: "all 0.15s", "&:hover": { borderColor: alpha(p, 0.4), transform: "translateX(4px)", boxShadow: `0 4px 16px ${alpha(p, L ? 0.07 : 0.14)}` } }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1.5, flexShrink: 0, background: `linear-gradient(135deg,${p},${s})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, boxShadow: `0 4px 12px ${alpha(p, 0.35)}` }}>
                {i + 1}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700, mb: 0.5 }}>{step.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>{step.desc}</Typography>
              </Box>
              <CheckCircleRounded sx={{ fontSize: 20, color: T.up, flexShrink: 0, mt: 0.25 }} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── ALERT CHANNELS HIGHLIGHT ─────────────────────────────────────── */}
      <Box sx={{ mb: 10, p: { xs: "32px 24px", md: "48px 48px" }, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, backgroundColor: theme.palette.background.paper }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Chip label="Alert Channels" size="small" sx={{ mb: 2, backgroundColor: alpha(T.warn, L ? 0.08 : 0.14), color: T.warn, border: `1px solid ${alpha(T.warn, 0.2)}`, fontWeight: 600 }} />
            <Typography sx={{ fontSize: { xs: "1.5rem", md: "1.875rem" }, fontWeight: 800, letterSpacing: "-0.03em", color: "text.primary", lineHeight: 1.2, mb: 1.5 }}>
              Get alerted exactly where your team works
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, mb: 3 }}>
              Connect your own SMTP server, paste a Slack or Discord webhook, add a Telegram bot, or call any HTTP endpoint. Alerts fire the moment your configured failure threshold is crossed — not before.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {alertTypes.map((a) => (
                <Box key={a.label} sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.5, py: 0.625, borderRadius: 1.5, backgroundColor: alpha(a.color, L ? 0.08 : 0.14), border: `1px solid ${alpha(a.color, 0.2)}` }}>
                  <Box sx={{ color: a.color, display: "flex" }}>{a.icon}</Box>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: a.color }}>{a.label}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {alertScenarios.map((sc) => (
                <Box key={sc.title} sx={{ p: 2, borderRadius: 2, backgroundColor: L ? T.n50 : alpha("#fff", 0.03), border: `1px solid ${theme.palette.divider}`, display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: sc.color, mt: 0.5, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="caption" fontWeight={700} sx={{ color: sc.color, display: "block", mb: 0.25 }}>{sc.event}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>{sc.title}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <Box sx={{ mb: 6, position: "relative", overflow: "hidden", borderRadius: 3, border: `1px solid ${alpha(p, 0.2)}`, background: L ? `linear-gradient(140deg,${alpha(p,0.05)},${alpha(s,0.04)},${alpha(T.up,0.04)})` : `linear-gradient(140deg,${alpha(p,0.12)},${alpha(s,0.09)},${alpha(T.up,0.08)})` }}>
        <Box sx={{ position: "absolute", top: "50%", right: "-5%", width: 400, height: 400, borderRadius: "50%", pointerEvents: "none", background: `radial-gradient(ellipse,${alpha(s, L ? 0.1 : 0.18)} 0%,transparent 70%)`, transform: "translateY(-50%)" }} />
        <Box className={L ? "hero-grid" : "hero-grid-dark"} sx={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" }} />
        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", p: { xs: "48px 24px", md: "72px 48px" } }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.75, py: 0.625, borderRadius: 99, mb: 3, border: `1px solid ${alpha(T.up, 0.35)}`, backgroundColor: alpha(T.up, L ? 0.07 : 0.12) }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: T.up, animation: "pulse 2s ease-in-out infinite" }} />
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: T.up }}>Free to start · No credit card · No agents</Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: "2rem", md: "2.875rem" }, fontWeight: 900, letterSpacing: "-0.04em", color: "text.primary", lineHeight: 1.1, mb: 2 }}>
            Start monitoring your stack today.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 440, mx: "auto", lineHeight: 1.75 }}>
            Set your check interval, configure failure thresholds, connect alert channels, and get notified instantly when something breaks.
          </Typography>
          <Button onClick={handleCTA} variant="contained" size="large" endIcon={<ArrowForwardRounded />} sx={{ fontSize: "1.0625rem", px: 4, py: 1.5, borderRadius: 2 }}>
            {isLoggedIn ? "Open Dashboard" : "Get Started Free"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ── Static data ───────────────────────────────────────────────────────────────

const features = [
  { title: "Custom Check Intervals",   desc: "Set check frequency per service — from every 1 minute to every 24 hours. BullMQ workers process checks at scale with 50 concurrent threads.",                          icon: <TuneRounded sx={{ fontSize: 22 }} />,                   color: T.brand  },
  { title: "Smart Incident Detection", desc: "Configure how many consecutive failures trigger a DOWN alert, and how many successes confirm a recovery. Eliminates false positives completely.",                     icon: <QueryStatsRounded sx={{ fontSize: 22 }} />,             color: T.down   },
  { title: "Multi-Channel Alerts",     desc: "Email (SMTP), Slack, Discord, Telegram, and generic webhooks. Test any channel with one click before incidents happen.",                                               icon: <NotificationsActiveRounded sx={{ fontSize: 22 }} />,   color: T.warn   },
  { title: "Response Time Analytics",  desc: "Avg, min, max, and P95 latency tracked per service with interactive charts. Select any date range from 24h to 1 year.",                                               icon: <SpeedRounded sx={{ fontSize: 22 }} />,                  color: "#0891b2" },
  { title: "Uptime History & MTBF",    desc: "Accurate uptime %, incident counts, downtime duration, and Mean Time Between Failures across 24h, 7d, 30d, and 365d windows.",                                      icon: <BarChartRounded sx={{ fontSize: 22 }} />,               color: T.up     },
  { title: "BullMQ Queue Architecture",desc: "Checks are enqueued to Redis-backed BullMQ queues. Workers run concurrently, retry on failure, and scale horizontally. Falls back gracefully if Redis is unavailable.", icon: <MonitorHeartRounded sx={{ fontSize: 22 }} />,          color: T.brand  },
];

const steps = [
  { title: "Create a project",         desc: "Group your services — production, staging, or third-party dependencies — under a named project." },
  { title: "Add a service URL",        desc: "Paste any https:// endpoint. Set check interval (1–1440 min), fail threshold, and recovery threshold." },
  { title: "Connect alert channels",   desc: "Go to Settings → Alert Channels and add Email, Slack, Discord, Telegram, or a custom webhook." },
  { title: "Watch it in real time",    desc: "Charts and uptime stats populate immediately. When something breaks, your chosen channels get alerted at the exact threshold you set." },
];

const alertTypes = [
  { label: "Email (SMTP)",  color: "#7c3aed", icon: <MailOutlineRounded sx={{ fontSize: 14 }} /> },
  { label: "Slack",         color: "#4a154b", icon: <WebhookRounded sx={{ fontSize: 14 }} /> },
  { label: "Discord",       color: "#5865f2", icon: <WebhookRounded sx={{ fontSize: 14 }} /> },
  { label: "Telegram",      color: "#229ed9", icon: <NotificationsActiveRounded sx={{ fontSize: 14 }} /> },
  { label: "Webhook",       color: "#0891b2", icon: <WebhookRounded sx={{ fontSize: 14 }} /> },
];

const alertScenarios = [
  { event: "SERVICE DOWN",    title: "Auth API returned 503 three times in a row → alert fired to #ops-alerts Slack",    color: T.down },
  { event: "SERVICE RECOVERED", title: "Auth API returned 200 twice in a row → recovery notification sent via email",   color: T.up   },
  { event: "SLOW RESPONSE",  title: "Database Proxy P95 > 800ms — tracked in charts, threshold-based alert optional",  color: T.warn },
];

export default Home;

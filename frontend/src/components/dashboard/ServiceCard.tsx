import { Box, Typography, LinearProgress, Tooltip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { ArrowForwardRounded } from "@mui/icons-material";
import { T } from "../../theme/theme";

interface ServiceInterface {
  currentStatus: number; serviceName: string; url: string;
  monitorLogs: string[]; upCount: number; downCount: number;
  id: string; projectId: string; avgResponseTime?: number; lastCheckedAt?: string;
}

function ServiceCard(p: ServiceInterface) {
  const theme    = useTheme();
  const L        = theme.palette.mode === "light";
  const navigate  = useNavigate();

  const status     = Number(p.currentStatus);
  const total      = p.upCount + p.downCount;
  const pct        = total > 0 ? (p.upCount / total) * 100 : null;
  const isPending  = status === 0;
  const isUp       = status >= 200 && status < 300;
  const isRedirect = status >= 300 && status < 400;

  const meta = isPending
    ? { dot: T.pending, label: "Pending",             bg: alpha(T.pending, L ? 0.08 : 0.15),   border: alpha(T.pending, 0.25), text: T.pending }
    : isUp
    ? { dot: T.up,      label: `${status} OK`,        bg: L ? T.upBg     : alpha(T.up,   0.12), border: L ? T.upBorder   : alpha(T.up,   0.25), text: T.up }
    : isRedirect
    ? { dot: T.warn,    label: `${status} Redirect`,  bg: L ? T.warnBg   : alpha(T.warn, 0.12), border: L ? T.warnBorder : alpha(T.warn, 0.25), text: T.warn }
    : { dot: T.down,    label: `${status} Error`,     bg: L ? T.downBg   : alpha(T.down, 0.12), border: L ? T.downBorder : alpha(T.down, 0.25), text: T.down };

  const lastChecked = p.lastCheckedAt ? relFmt(new Date(p.lastCheckedAt)) : null;

  return (
    <Box onClick={() => navigate(`/service/${p.id}`)} sx={{
      p: 2.5,
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      cursor: "pointer",
      display: "flex", flexDirection: "column", gap: 2,
      transition: "all 0.15s ease",
      "&:hover": {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, L ? 0.1 : 0.2)}`,
        transform: "translateY(-1px)",
      },
      "&:active": { transform: "translateY(0)" },
    }}>
      {/* Row 1 — name + arrow */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" color="text.primary" noWrap fontWeight={600} sx={{ mb: 0.25 }}>
            {p.serviceName}
          </Typography>
          <Tooltip title={p.url} placement="bottom-start">
            <Typography variant="caption" color="text.disabled" noWrap sx={{ display: "block" }}>
              {p.url}
            </Typography>
          </Tooltip>
        </Box>
        <ArrowForwardRounded sx={{ fontSize: 16, color: "text.disabled", mt: 0.25, flexShrink: 0 }} />
      </Box>

      {/* Row 2 — status pill */}
      <Box>
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 0.75,
          px: 1.25, py: 0.5, borderRadius: 1.5,
          backgroundColor: meta.bg,
          border: `1px solid ${meta.border}`,
        }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: "50%",
            backgroundColor: meta.dot,
            animation: isUp ? "pulse 2.5s ease-in-out infinite" : "none",
          }} />
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: meta.text, lineHeight: 1 }}>
            {meta.label}
          </Typography>
        </Box>
      </Box>

      {/* Row 3 — uptime bar */}
      {pct !== null ? (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem", fontWeight: 500 }}>
              Uptime
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{
              fontSize: "0.75rem",
              color: pct >= 99 ? T.up : pct >= 95 ? T.warn : T.down,
            }}>
              {pct.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={pct} sx={{
            height: 3,
            "& .MuiLinearProgress-bar": {
              backgroundColor: pct >= 99 ? T.up : pct >= 95 ? T.warn : T.down,
            },
          }} />
        </Box>
      ) : (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
          Awaiting first check…
        </Typography>
      )}

      {/* Row 4 — meta footer */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
          {p.monitorLogs?.length ?? 0} checks
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {p.avgResponseTime && p.avgResponseTime > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", fontWeight: 500 }}>
              {p.avgResponseTime}ms avg
            </Typography>
          )}
          {lastChecked && (
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
              {lastChecked}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function relFmt(d: Date): string {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export default ServiceCard;

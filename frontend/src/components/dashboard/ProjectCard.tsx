import { Box, Typography, LinearProgress } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { ArrowForwardRounded } from "@mui/icons-material";
import { T } from "../../theme/theme";

interface Service { _id: string; serviceName: string; currentStatus: number; }
interface ProjectInterface { name: string; services: Service[]; id: string; }

function ProjectCard({ name, services, id }: ProjectInterface) {
  const theme   = useTheme();
  const L       = theme.palette.mode === "light";
  const navigate = useNavigate();

  const total     = services?.length ?? 0;
  const upCount   = services?.filter(s => Number(s.currentStatus) >= 200 && Number(s.currentStatus) < 300).length ?? 0;
  const downCount = total - upCount;
  const pct       = total > 0 ? Math.round((upCount / total) * 100) : null;

  return (
    <Box onClick={() => navigate(`/project/${id}`)} sx={{
      p: 2.5,
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, L ? 0.1 : 0.2)}`,
        transform: "translateY(-1px)",
      },
      "&:active": { transform: "translateY(0)" },
    }}>
      {/* Title row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
        <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
          <Typography variant="subtitle1" color="text.primary" noWrap sx={{ fontWeight: 600, mb: 0.25 }}>
            {name}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {total === 0 ? "No services" : `${total} service${total !== 1 ? "s" : ""}`}
          </Typography>
        </Box>
        <ArrowForwardRounded sx={{ fontSize: 16, color: "text.disabled", mt: 0.25, flexShrink: 0 }} />
      </Box>

      {/* Status indicators */}
      {total > 0 && (
        <Box sx={{ display: "flex", gap: 1, mb: 2.5 }}>
          <StatusPill count={upCount}   type="up"   />
          {downCount > 0 && <StatusPill count={downCount} type="down" />}
        </Box>
      )}

      {/* Progress bar + % */}
      {pct !== null ? (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem", fontWeight: 500 }}>
              Uptime
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{
              fontSize: "0.75rem",
              color: pct === 100 ? T.up : pct >= 95 ? T.warn : T.down,
            }}>
              {pct}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={pct} sx={{
            height: 3,
            "& .MuiLinearProgress-bar": {
              backgroundColor: pct === 100 ? T.up : pct >= 95 ? T.warn : T.down,
            },
          }} />
        </Box>
      ) : (
        <Box sx={{ pt: 0.5 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
            Add services to start monitoring →
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function StatusPill({ count, type }: { count: number; type: "up" | "down" }) {
  const L = useTheme().palette.mode === "light";
  const isUp = type === "up";
  const color  = isUp ? T.up   : T.down;
  const bg     = isUp ? (L ? T.upBg   : alpha(T.up,   0.12)) : (L ? T.downBg : alpha(T.down, 0.12));
  const border = isUp ? (L ? T.upBorder : alpha(T.up, 0.25))  : (L ? T.downBorder : alpha(T.down, 0.25));

  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.625,
      px: 1, py: 0.375, borderRadius: 1,
      backgroundColor: bg, border: `1px solid ${border}`,
    }}>
      <Box sx={{
        width: 5, height: 5, borderRadius: "50%", backgroundColor: color,
        animation: isUp ? "pulse 2.5s ease-in-out infinite" : "none",
      }} />
      <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color, lineHeight: 1 }}>
        {count} {type}
      </Typography>
    </Box>
  );
}

export default ProjectCard;

import { Box, Typography, Grid } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { LineChart } from "./LineChart";
import { BarChart } from "./BarChart";
import { T } from "../../../theme/theme";

interface Log { _id: string; hitTime: string; responseTime: number; status: number; }
interface StatsProps { Logs: Log[]; upCount: number; downCount: number; }

export const Stats: React.FC<StatsProps> = ({ Logs, upCount, downCount }) => {
  const theme = useTheme();
  const L = theme.palette.mode === "light";

  if (!Logs || Logs.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: "center", border: `1.5px dashed ${theme.palette.divider}`, borderRadius: 2 }}>
        <Typography variant="body2" color="text.disabled">
          No data yet — waiting for first check…
        </Typography>
      </Box>
    );
  }

  const rtData: number[] = [], labels: string[] = [];
  const upData: number[] = [], downData: number[] = [], redirData: number[] = [];
  let sum = 0;

  Logs.forEach((e) => {
    const rt = Number(e.responseTime), s = Number(e.status);
    rtData.push(rt); sum += rt;
    labels.push(new Date(e.hitTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    const isUp = s >= 200 && s < 300, isRedir = s >= 300 && s < 400;
    upData.push(isUp ? rt : 0);
    redirData.push(isRedir ? rt : 0);
    downData.push(!isUp && !isRedir ? rt : 0);
  });

  const avg  = sum / Logs.length;
  const srt  = [...rtData].sort((a, b) => a - b);
  const p95  = srt[Math.floor(srt.length * 0.95)] ?? 0;

  const metricTiles = [
    { label: "Avg",  value: `${avg.toFixed(0)}ms`,     color: theme.palette.primary.main   },
    { label: "Min",  value: `${Math.min(...rtData)}ms`, color: T.up                         },
    { label: "Max",  value: `${Math.max(...rtData)}ms`, color: T.down                       },
    { label: "P95",  value: `${p95}ms`,                 color: T.warn                       },
  ];

  const charts = [
    { data: upData,    type: "UP",   label: "Up",       color: T.up,   stat: `${upCount   * 10}m total` },
    { data: downData,  type: "DOWN", label: "Down",     color: T.down, stat: `${downCount * 10}m total` },
    { data: redirData, type: "REDIR",label: "Redirect", color: T.warn, stat: ""                          },
  ];

  return (
    <Box>
      {/* Metric tiles */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {metricTiles.map((m) => (
          <Grid item xs={6} sm={3} key={m.label}>
            <Box sx={{
              textAlign: "center", py: 2, px: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              backgroundColor: alpha(m.color, L ? 0.05 : 0.1),
            }}>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: m.color, lineHeight: 1.15 }}>
                {m.value}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                {m.label} response
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Response time line chart */}
      <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: "20px 20px 16px", mb: 2 }}>
        <LineChart lineData={rtData} labels={labels} title="Response Time (ms)" />
      </Box>

      {/* Up / Down / Redirect */}
      <Grid container spacing={1.5}>
        {charts.map((c) => (
          <Grid item xs={12} md={4} key={c.label}>
            <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: "16px 20px" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: c.color }} />
                  <Typography variant="caption" fontWeight={600} sx={{ color: c.color }}>{c.label}</Typography>
                </Box>
                {c.stat && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>{c.stat}</Typography>
                )}
              </Box>
              <BarChart lineData={c.data} labels={labels} title="" type={c.type} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, type TooltipItem } from "chart.js/auto";
import { T } from "../../../theme/theme";
Chart.register(CategoryScale);

interface PlotProps { lineData: number[]; labels: string[]; title: string; type: string; }

export const BarChart = ({ lineData, labels, title, type }: PlotProps) => {
  const theme = useTheme();
  const L     = theme.palette.mode === "light";
  const grid  = L ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
  const tick  = L ? "rgba(0,0,0,0.4)"  : "rgba(255,255,255,0.35)";
  const color = type === "UP" ? T.up : type === "DOWN" ? T.down : T.warn;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    interaction: { intersect: false, mode: "index" as const },
    scales: {
      x: {
        display: false,
        grid: { color: grid },
      },
      y: {
        grid: { color: grid },
        ticks: { color: tick, font: { size: 11, family: "'Inter',sans-serif" }, maxTicksLimit: 4 },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: L ? "#1f2937" : "#1e293b",
        borderColor: L ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.08)",
        borderWidth: 1,
        titleColor: L ? "#9ca3af" : "#94a3b8",
        bodyColor: "#f1f5f9",
        titleFont: { family: "'Inter',sans-serif", size: 11 },
        bodyFont:  { family: "'Inter',sans-serif", size: 12 },
        padding: 10, cornerRadius: 6,
        callbacks: { label: (ctx: TooltipItem<"bar">) => ` ${ctx.parsed.y ?? 0}ms` },
      },
    },
  } as const;

  return (
    <Box>
      {title && (
        <Typography variant="caption" color="text.secondary" fontWeight={500} mb={1.5} display="block">
          {title}
        </Typography>
      )}
      <Box sx={{ height: 120 }}>
        <Bar data={{
          labels,
          datasets: [{
            data: lineData,
            backgroundColor: `${color}90`,
            borderColor: color,
            borderWidth: 0,
            borderRadius: 3,
          }],
        }} options={options} />
      </Box>
    </Box>
  );
};

import {
  ArrowBack, OpenInNew, Refresh, CalendarToday,
  SettingsRounded, NotificationsRounded,
} from "@mui/icons-material";
import {
  Box, Typography, Skeleton, IconButton, Tooltip,
  LinearProgress, Grid, TextField, Button,
  ToggleButtonGroup, ToggleButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Switch, FormControlLabel, Chip, CircularProgress,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getServiceById, updateService, getAlertChannels } from "../../redux/apis/userApis";
import { Stats } from "./charts/MainStats";
import DeleteDialog from "../dialog/DeleteDialog";
import { T } from "../../theme/theme";
import { toast } from "react-toastify";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonitorLog {
  _id: string; hitTime: string; responseTime: number; status: number;
}
interface PeriodStat {
  uptime: number | null; incidents: number; downtimeMins: number;
  mtbf: number | null; checks: number;
}
interface ServiceData {
  currentStatus: number; downCount: number; upCount: number;
  serviceName: string; url: string; _id: string;
  avgResponseTime: number; lastCheckedAt: string; totalLogs: number;
  checkIntervalMins: number; failThreshold: number; recoveryThreshold: number;
  alertsEnabled: boolean; alertChannels: string[]; incidentState: string;
  projectId: { name: string; _id: string };
  monitorLogs: MonitorLog[];
  range: { from: string; to: string };
  periodStats: { "24h": PeriodStat; "7d": PeriodStat; "30d": PeriodStat; "365d": PeriodStat };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type Preset = "24h" | "7d" | "30d" | "custom";

function presetRange(p: Preset) {
  const now  = new Date();
  const days = ({ "24h": 1, "7d": 7, "30d": 30 } as Record<string, number>)[p] ?? 7;
  return { from: new Date(now.getTime() - days * 86_400_000), to: now };
}
const toInput = (d: Date) => d.toISOString().slice(0, 16);

function statusMeta(s: number) {
  if (s === 0)             return { color: T.pending,  label: "Pending" };
  if (s >= 200 && s < 300) return { color: T.up,       label: `${s} OK` };
  if (s >= 300 && s < 400) return { color: T.warn, label: `${s} Redirect` };
  return                          { color: T.down,     label: `${s} Error` };
}

function uptimeColor(pct: number | null): string {
  if (pct === null) return T.pending;
  if (pct >= 99.9)  return T.up;
  if (pct >= 99)    return "#65a30d";  // lime-600
  if (pct >= 95)    return T.warn;
  return T.down;
}

function fmtDuration(mins: number): string {
  if (mins === 0) return "0m";
  if (mins < 60)  return `${mins}m`;
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h < 24) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24), rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

function relativeTime(d: Date): string {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Main component ────────────────────────────────────────────────────────────

function ServicePage() {
  const theme    = useTheme();
  const isLight  = theme.palette.mode === "light";
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data,       setData]       = useState<ServiceData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [preset,     setPreset]     = useState<Preset>("7d");
  const [fromVal,    setFromVal]    = useState(() => toInput(presetRange("7d").from));
  const [toVal,      setToVal]      = useState(() => toInput(new Date()));

  // keep stable ref for the interval so it reads latest preset/range
  const rangeRef = useRef({ preset, fromVal, toVal });
  rangeRef.current = { preset, fromVal, toVal };

  const fetchData = useCallback(async (silent = false, from?: Date, to?: Date) => {
    if (!id) return;
    silent ? setRefreshing(true) : setLoading(true);
    const res = await getServiceById(id, from, to);
    if (res.status === 200 && res.data)
      setData((res.data as { data: ServiceData }).data);
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useEffect(() => {
    const { from, to } = presetRange("7d");
    fetchData(false, from, to);
    const tick = setInterval(() => {
      const { preset: p, fromVal: f, toVal: t } = rangeRef.current;
      const r = p === "custom" ? { from: new Date(f), to: new Date(t) } : presetRange(p);
      fetchData(true, r.from, r.to);
    }, 60_000);
    return () => clearInterval(tick);
  }, [fetchData]);

  const applyPreset = (p: Preset) => {
    setPreset(p);
    if (p !== "custom") {
      const { from, to } = presetRange(p);
      setFromVal(toInput(from));
      setToVal(toInput(to));
      fetchData(false, from, to);
    }
  };

  const applyCustom = () => {
    setPreset("custom");
    fetchData(false, new Date(fromVal), new Date(toVal));
  };

  const doRefresh = () => {
    const { preset: p, fromVal: f, toVal: t } = rangeRef.current;
    const r = p === "custom" ? { from: new Date(f), to: new Date(t) } : presetRange(p);
    fetchData(true, r.from, r.to);
  };

  if (loading && !data) return <ServicePageSkeleton />;
  if (!data)            return null;

  const sm       = statusMeta(Number(data.currentStatus));
  const allTotal = data.upCount + data.downCount;
  const allUp    = allTotal > 0 ? (data.upCount / allTotal) * 100 : null;
  const ucBar    = uptimeColor(allUp);

  const cardSx = {
    p: 3,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 2,
    backgroundColor: theme.palette.background.paper,
  };

  return (
    <Box>
      {/* ── Back breadcrumb ───────────────────────────────────────────────── */}
      <Box onClick={() => navigate(-1)} mt={3}
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, cursor: "pointer",
          color: "text.secondary", ":hover": { color: "text.primary" }, transition: "color 0.15s" }}>
        <ArrowBack sx={{ fontSize: 14 }} />
        <Typography variant="caption" fontWeight={500}>{data.projectId?.name ?? "Back"}</Typography>
      </Box>

      {/* ── Header card ───────────────────────────────────────────────────── */}
      <Box sx={{ mt: 2.5, ...cardSx }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>

          {/* Name + status + URL */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
              {/* Status dot */}
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: sm.color, flexShrink: 0,
                animation: sm.color === T.up ? "pulse 2.5s ease-in-out infinite" : "none" }} />

              <Typography variant="h4" color="text.primary" sx={{ fontWeight: 600 }}>
                {data.serviceName}
              </Typography>

              {/* Inline status badge */}
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3,
                borderRadius: 1,
                backgroundColor: isLight ? `${sm.color}18` : `${sm.color}22`,
                border: `1px solid ${sm.color}35` }}>
                <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: sm.color, lineHeight: 1 }}>
                  {sm.label}
                </Typography>
              </Box>

              {refreshing && (
                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
                  refreshing…
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">{data.url}</Typography>
              <Link to={data.url} target="_blank" onClick={(e) => e.stopPropagation()}>
                <OpenInNew sx={{ fontSize: 11, color: "text.disabled",
                  ":hover": { color: theme.palette.primary.main },
                  verticalAlign: "middle", ml: 0.25 }} />
              </Link>
            </Box>
            {/* Config summary */}
            <Box sx={{ display: "flex", gap: 0.75, mt: 1, flexWrap: "wrap" }}>
              <Chip label={`Every ${data.checkIntervalMins}m`} size="small"
                sx={{ height: 18, fontSize: "0.6875rem", backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} />
              <Chip label={`Down after ${data.failThreshold} fail${data.failThreshold !== 1 ? "s" : ""}`} size="small"
                sx={{ height: 18, fontSize: "0.6875rem", backgroundColor: alpha(T.down, 0.08), color: T.down }} />
              <Chip label={`Up after ${data.recoveryThreshold} ok`} size="small"
                sx={{ height: 18, fontSize: "0.6875rem", backgroundColor: alpha(T.up, 0.08), color: T.up }} />
              {data.alertsEnabled && (
                <Chip icon={<NotificationsRounded sx={{ fontSize: "11px !important" }} />}
                  label={`${data.alertChannels?.length ?? 0} alert${(data.alertChannels?.length ?? 0) !== 1 ? "s" : ""}`}
                  size="small"
                  sx={{ height: 18, fontSize: "0.6875rem", backgroundColor: alpha(T.warn, 0.08), color: T.warn }} />
              )}
            </Box>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Refresh now" arrow>
              <IconButton onClick={doRefresh} disabled={refreshing} size="small"
                sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Refresh sx={{ fontSize: 15,
                  animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              </IconButton>
            </Tooltip>
            <ServiceSettingsDialog data={data} onSaved={() => fetchData(true, new Date(fromVal), new Date(toVal))} />
            <DeleteDialog type="DELSER" projectId={data.projectId?._id}
              serviceId={data._id} projectName="" serviceName={data.serviceName} />
          </Box>
        </Box>

        {/* Quick stats */}
        <Box sx={{ display: "flex", gap: { md: 5, xs: 2 }, mt: 3, flexWrap: "wrap",
          pt: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          {[
            { label: "All-time uptime", value: allUp !== null ? `${allUp.toFixed(2)}%` : "—", color: ucBar },
            { label: "Avg response",    value: data.avgResponseTime > 0 ? `${data.avgResponseTime}ms` : "—", color: theme.palette.secondary.main },
            { label: "Total checks",    value: data.totalLogs.toLocaleString(), color: "text.secondary" },
            { label: "Last checked",    value: data.lastCheckedAt ? relativeTime(new Date(data.lastCheckedAt)) : "—", color: "text.secondary" },
          ].map((s) => (
            <Box key={s.label}>
              <Typography variant="overline" color="text.disabled" display="block" mb={0.25}>
                {s.label}
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: s.color }}>
                {s.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Uptime progress bar */}
        {allUp !== null && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={Math.min(allUp, 100)}
              sx={{ height: 4,
                "& .MuiLinearProgress-bar": { backgroundColor: ucBar } }} />
          </Box>
        )}
      </Box>

      {/* ── Period summary ─────────────────────────────────────────────────── */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="overline" color="text.disabled" display="block" mb={1.5}>
          Uptime Summary
        </Typography>
        <Grid container spacing={1.5}>
          {(["24h", "7d", "30d", "365d"] as const).map((p) => (
            <Grid item xs={6} sm={3} key={p}>
              <PeriodCard period={p} stat={data.periodStats[p]} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── Charts section ─────────────────────────────────────────────────── */}
      <Box sx={{ mt: 3, ...cardSx }}>

        {/* Range controls */}
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, flexWrap: "wrap", mb: 2.5 }}>
          <Box>
            <Typography variant="overline" color="text.disabled" display="block" mb={0.75}>
              Time range
            </Typography>
            <ToggleButtonGroup value={preset} exclusive size="small"
              onChange={(_, v) => v && applyPreset(v as Preset)}>
              {(["24h", "7d", "30d", "custom"] as Preset[]).map((v) => (
                <ToggleButton key={v} value={v}>{v === "custom" ? "Custom" : v}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, flexWrap: "wrap" }}>
            <DateField label="From" value={fromVal} max={toVal}
              onChange={(v) => { setFromVal(v); setPreset("custom"); }} />
            <DateField label="To" value={toVal} min={fromVal}
              onChange={(v) => { setToVal(v); setPreset("custom"); }} />
            <Button onClick={applyCustom} variant="contained" size="small"
              startIcon={<CalendarToday sx={{ fontSize: 13 }} />}>
              Apply
            </Button>
          </Box>

          <Typography variant="caption" color="text.disabled"
            sx={{ ml: "auto", alignSelf: "center", whiteSpace: "nowrap" }}>
            {data.monitorLogs.length} checks · {new Date(data.range.from).toLocaleDateString()} → {new Date(data.range.to).toLocaleDateString()}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stats Logs={data.monitorLogs} upCount={data.upCount} downCount={data.downCount} />
      </Box>
    </Box>
  );
}

// ── Period stat card ──────────────────────────────────────────────────────────

function PeriodCard({ period, stat }: { period: string; stat: PeriodStat }) {
  const theme   = useTheme();
  const hasData = stat.checks > 0;
  const uc      = uptimeColor(hasData ? stat.uptime : null);

  return (
    <Box sx={{
      p: 2,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      backgroundColor: theme.palette.background.paper,
    }}>
      <Typography variant="overline" color="text.disabled" sx={{ fontSize: "0.6rem" }}>
        Last {period}
      </Typography>

      <Typography variant="h3" fontWeight={700}
        sx={{ color: uc, lineHeight: 1.15, mt: 0.5, mb: hasData ? 0.75 : 0 }}>
        {hasData && stat.uptime !== null ? `${stat.uptime.toFixed(2)}%` : "—"}
      </Typography>

      {hasData && stat.uptime !== null && (
        <LinearProgress variant="determinate" value={Math.min(stat.uptime, 100)}
          sx={{ height: 2, mb: 1.75,
            "& .MuiLinearProgress-bar": { backgroundColor: uc } }} />
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Box>
          <Typography variant="overline" color="text.disabled" sx={{ fontSize: "0.6rem" }}>
            Incidents
          </Typography>
          <Typography variant="subtitle2" fontWeight={700}
            sx={{ color: !hasData ? "text.disabled" : stat.incidents > 0 ? T.down : T.up }}>
            {hasData ? stat.incidents : "—"}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="overline" color="text.disabled" sx={{ fontSize: "0.6rem" }}>
            Downtime
          </Typography>
          <Typography variant="subtitle2" fontWeight={700}
            sx={{ color: !hasData ? "text.disabled" : stat.downtimeMins > 0 ? T.warn : T.up }}>
            {hasData ? fmtDuration(stat.downtimeMins) : "—"}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="overline" color="text.disabled" sx={{ fontSize: "0.6rem" }}>MTBF</Typography>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {hasData && stat.mtbf !== null
            ? stat.mtbf >= 24 ? `${Math.round(stat.mtbf / 24)}d` : `${stat.mtbf}h`
            : "—"}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Date field ────────────────────────────────────────────────────────────────

function DateField({ label, value, onChange, min, max }:
  { label: string; value: string; onChange: (v: string) => void; min?: string; max?: string }) {
  const theme = useTheme();
  return (
    <Box>
      <Typography variant="overline" color="text.disabled" display="block" mb={0.75}
        sx={{ fontSize: "0.6rem" }}>
        {label}
      </Typography>
      <TextField type="datetime-local" size="small" value={value}
        inputProps={{ min, max }}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": { fontSize: "0.8125rem" },
          "& input::-webkit-calendar-picker-indicator": {
            filter: theme.palette.mode === "dark" ? "invert(0.6)" : "none",
            opacity: 0.55, cursor: "pointer",
          },
        }}
      />
    </Box>
  );
}

// ── Service Settings Dialog ───────────────────────────────────────────────────

interface AlertCh { _id: string; name: string; type: string; enabled: boolean; }

function ServiceSettingsDialog({
  data, onSaved,
}: {
  data: ServiceData;
  onSaved: () => void;
}) {
  const theme   = useTheme();
  const L       = theme.palette.mode === "light";
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [channels, setChannels] = useState<AlertCh[]>([]);

  // form state — pre-filled from service
  const [interval,   setInterval]   = useState(data.checkIntervalMins);
  const [failThr,    setFailThr]    = useState(data.failThreshold);
  const [recovThr,   setRecovThr]   = useState(data.recoveryThreshold);
  const [alertsOn,   setAlertsOn]   = useState(data.alertsEnabled);
  const [selChannels, setSelChannels] = useState<string[]>(data.alertChannels ?? []);

  const handleOpen = async () => {
    // re-sync with latest data
    setInterval(data.checkIntervalMins);
    setFailThr(data.failThreshold);
    setRecovThr(data.recoveryThreshold);
    setAlertsOn(data.alertsEnabled);
    setSelChannels(data.alertChannels ?? []);
    setOpen(true);
    // load available channels
    const res = await getAlertChannels();
    if (res.status === 200 && res.data)
      setChannels((res.data as { channels: AlertCh[] }).channels ?? []);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await updateService(data._id, {
      checkIntervalMins: interval,
      failThreshold:     failThr,
      recoveryThreshold: recovThr,
      alertsEnabled:     alertsOn,
      alertChannels:     selChannels,
    });
    setSaving(false);
    if (res.status === 200) {
      toast.success("Service settings saved");
      setOpen(false);
      onSaved();
    } else {
      toast.error(res.error ?? "Failed to save settings");
    }
  };

  const toggleChannel = (id: string) =>
    setSelChannels((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const numField = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    min: number,
    max: number,
    hint: string
  ) => (
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.75}>
        {label}
      </Typography>
      <TextField
        fullWidth size="small" type="number"
        value={value}
        inputProps={{ min, max, step: 1 }}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
      />
      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem", mt: 0.25, display: "block" }}>
        {hint}
      </Typography>
    </Box>
  );

  return (
    <>
      <Tooltip title="Service settings" arrow>
        <IconButton onClick={handleOpen} size="small"
          sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <SettingsRounded sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0.5 }}>
          Service Settings
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontWeight: 400 }}>
            {data.serviceName} · {data.url}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 0 }}>

          {/* ── Schedule ── */}
          <Typography variant="overline" color="text.disabled" sx={{ mt: 1.5, mb: 0.75, fontSize: "0.65rem" }}>
            Schedule
          </Typography>
          {numField("Check every (minutes)", interval, setInterval, 1, 1440, "1 min → 1440 min (once/day)")}

          {/* ── Incident thresholds ── */}
          <Typography variant="overline" color="text.disabled" sx={{ mt: 2, mb: 0.75, fontSize: "0.65rem" }}>
            Incident thresholds
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            {numField("Mark DOWN after (fails)", failThr,  setFailThr,  1, 10, "Consecutive failures")}
            {numField("Mark UP after (successes)", recovThr, setRecovThr, 1, 10, "Consecutive successes")}
          </Box>

          {/* ── Alerts ── */}
          <Typography variant="overline" color="text.disabled" sx={{ mt: 2, mb: 0.75, fontSize: "0.65rem" }}>
            Alerts
          </Typography>
          <Box sx={{
            p: 2, borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: L ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.primary.main, 0.06),
          }}>
            <FormControlLabel
              control={<Switch checked={alertsOn} onChange={(e) => setAlertsOn(e.target.checked)} size="small" />}
              label={<Typography variant="body2" fontWeight={500}>Enable alerts for this service</Typography>}
            />

            {alertsOn && (
              <Box sx={{ mt: 1.5 }}>
                {channels.length === 0 ? (
                  <Typography variant="caption" color="text.disabled">
                    No channels yet — add them in Settings → Alert Channels.
                  </Typography>
                ) : (
                  <>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.75}>
                      Notify via
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {channels.filter((c) => c.enabled).map((ch) => {
                        const sel = selChannels.includes(ch._id);
                        return (
                          <Box key={ch._id} onClick={() => toggleChannel(ch._id)} sx={{
                            px: 1.5, py: 0.5, borderRadius: 1, cursor: "pointer",
                            fontSize: "0.8125rem", fontWeight: 600, userSelect: "none",
                            transition: "all 0.15s",
                            backgroundColor: sel ? theme.palette.primary.main : theme.palette.background.default,
                            color: sel ? "#fff" : "text.secondary",
                            border: `1px solid ${sel ? theme.palette.primary.main : theme.palette.divider}`,
                          }}>
                            {ch.name}
                            <Typography component="span" sx={{ ml: 0.5, opacity: 0.7, fontSize: "0.7rem" }}>
                              ({ch.type})
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="text" size="small"
            color="inherit" sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" size="small" disabled={saving}
            startIcon={saving ? <CircularProgress size={13} color="inherit" /> : undefined}>
            {saving ? "Saving…" : "Save Settings"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ── Loading skeleton — only content slots, not full page ─────────────────────

function ServicePageSkeleton() {
  return (
    <Box sx={{ pt: 3 }}>
      {/* Breadcrumb placeholder */}
      <Skeleton width={120} height={16} sx={{ mb: 3 }} />
      {/* Header card */}
      <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2, mb: 3 }} />
      {/* Period cards */}
      <Skeleton width={80} height={14} sx={{ mb: 1.5 }} />
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {[...Array(4)].map((_, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
      {/* Chart card */}
      <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} />
    </Box>
  );
}

export default ServicePage;

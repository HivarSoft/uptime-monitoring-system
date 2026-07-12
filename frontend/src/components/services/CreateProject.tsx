import * as React from "react";
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Button, Box, Typography, TextField,
  Switch, FormControlLabel,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { AddRounded, InfoOutlined } from "@mui/icons-material";
import { createProject, createServiceAdvanced, getAlertChannels } from "../../redux/apis/userApis";
import { toast } from "react-toastify";

// ── Create Project ────────────────────────────────────────────────────────────

export function CreateProjectDialog({ update, setUpdate }: { update: number; setUpdate: (n: number) => void }) {
  const [name, setName]       = React.useState("");
  const [open, setOpen]       = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const reset = () => { setOpen(false); setName(""); };

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Project name is required"); return; }
    setLoading(true);
    const res = await createProject(name.trim());
    setLoading(false);
    if (res.status === 200 || res.status === 201) { setUpdate(update + 1); reset(); toast.success("Project created"); }
    else toast.error(res.error ?? "Failed to create project");
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained" size="small"
        startIcon={<AddRounded sx={{ fontSize: 15 }} />}>
        New Project
      </Button>
      <FormDialog open={open} onClose={reset} title="New Project"
        description="Projects group related services together.">
        <LabeledField label="Project name" value={name} onChange={setName}
          placeholder="e.g. Production" autoFocus />
        <DialogActions>
          <GhostBtn label="Cancel" onClick={reset} />
          <Button variant="contained" size="small" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating…" : "Create Project"}
          </Button>
        </DialogActions>
      </FormDialog>
    </>
  );
}

// ── Create Service (advanced) ─────────────────────────────────────────────────

function isValidUrl(s: string) { try { new URL(s); return true; } catch { return false; } }

interface AlertChannel { _id: string; name: string; type: string; enabled: boolean; }

export function CreateServiceDialog({ update, setUpdate, projectId }: {
  update: number; setUpdate: (n: number) => void; projectId: string;
}) {
  const theme = useTheme();
  const L = theme.palette.mode === "light";
  const [open, setOpen]       = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [channels, setChannels] = React.useState<AlertChannel[]>([]);

  // Form fields
  const [name,              setName]              = React.useState("");
  const [url,               setUrl]               = React.useState("");
  const [interval,          setInterval]          = React.useState(10);
  const [failThreshold,     setFailThreshold]     = React.useState(1);
  const [recoveryThreshold, setRecoveryThreshold] = React.useState(1);
  const [alertsEnabled,     setAlertsEnabled]     = React.useState(false);
  const [selectedChannels,  setSelectedChannels]  = React.useState<string[]>([]);

  const reset = () => {
    setOpen(false); setName(""); setUrl("");
    setInterval(10); setFailThreshold(1); setRecoveryThreshold(1);
    setAlertsEnabled(false); setSelectedChannels([]);
  };

  const handleOpen = async () => {
    setOpen(true);
    const res = await getAlertChannels();
    if (res.status === 200 && res.data) {
      setChannels((res.data as { channels: AlertChannel[] }).channels ?? []);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Service name is required"); return; }
    if (!isValidUrl(url)) { toast.error("Enter a valid URL, e.g. https://api.example.com/health"); return; }
    setLoading(true);
    const res = await createServiceAdvanced({
      projectId, serviceName: name.trim(), url,
      checkIntervalMins: interval, failThreshold, recoveryThreshold,
      alertsEnabled, alertChannels: selectedChannels,
    });
    setLoading(false);
    if (res.status === 200 || res.status === 201) {
      setUpdate(update + 1); reset(); toast.success("Service added — first check queued");
    } else {
      toast.error(res.error ?? "Failed to add service");
    }
  };

  const sectionLabel = (text: string) => (
    <Typography variant="overline" color="text.disabled" display="block" sx={{ mt: 1.5, mb: 0.5, fontSize: "0.65rem" }}>
      {text}
    </Typography>
  );

  return (
    <>
      <Button onClick={handleOpen} variant="contained" size="small"
        startIcon={<AddRounded sx={{ fontSize: 15 }} />}>
        Add Service
      </Button>

      <Dialog open={open} onClose={reset} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0.5 }}>
          Add Service
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontWeight: 400 }}>
            Configure monitoring behaviour, failure thresholds, and alert channels.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 0, pt: "12px !important" }}>
          {/* ── Basic ── */}
          {sectionLabel("Basic")}
          <LabeledField label="Service name" value={name} onChange={setName} placeholder="e.g. Auth API" autoFocus />
          <Box sx={{ mt: 1.5 }}>
            <LabeledField label="URL to monitor" value={url} onChange={setUrl}
              placeholder="https://api.example.com/health" type="url" />
          </Box>

          {/* ── Check interval ── */}
          {sectionLabel("Schedule")}
          <Box sx={{ display: "flex", gap: 2 }}>
            <NumberField label="Check every (minutes)" value={interval} min={1} max={1440}
              onChange={setInterval} hint="1–1440 min" />
          </Box>

          {/* ── Thresholds ── */}
          {sectionLabel("Incident thresholds")}
          <Box sx={{ display: "flex", gap: 2 }}>
            <NumberField label="Fail after (consecutive)" value={failThreshold} min={1} max={10}
              onChange={setFailThreshold} hint="Checks before marking DOWN" />
            <NumberField label="Recover after (consecutive)" value={recoveryThreshold} min={1} max={10}
              onChange={setRecoveryThreshold} hint="Checks before marking UP" />
          </Box>

          {/* ── Alerts ── */}
          {sectionLabel("Alerts")}
          <Box sx={{
            p: 2, borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: L ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.primary.main, 0.06),
          }}>
            <FormControlLabel
              control={
                <Switch checked={alertsEnabled} onChange={(e) => setAlertsEnabled(e.target.checked)}
                  size="small" />
              }
              label={<Typography variant="body2" fontWeight={500}>Enable alerts for this service</Typography>}
            />

            {alertsEnabled && (
              <Box sx={{ mt: 1.5 }}>
                {channels.length === 0 ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <InfoOutlined sx={{ fontSize: 14, color: "text.disabled" }} />
                    <Typography variant="caption" color="text.disabled">
                      No alert channels configured. Add channels in Settings → Alert Channels.
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.75}>
                      Notify via
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {channels.filter(c => c.enabled).map((ch) => {
                        const selected = selectedChannels.includes(ch._id);
                        return (
                          <Box key={ch._id} onClick={() => setSelectedChannels(
                            selected ? selectedChannels.filter(id => id !== ch._id) : [...selectedChannels, ch._id]
                          )} sx={{
                            px: 1.5, py: 0.5, borderRadius: 1, cursor: "pointer", fontSize: "0.8125rem",
                            fontWeight: 500, userSelect: "none", transition: "all 0.15s",
                            backgroundColor: selected ? theme.palette.primary.main : theme.palette.background.default,
                            color: selected ? "#fff" : "text.secondary",
                            border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                          }}>
                            {ch.name}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <GhostBtn label="Cancel" onClick={reset} />
          <Button variant="contained" size="small" onClick={handleCreate} disabled={loading}>
            {loading ? "Adding…" : "Add Service"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ── Shared atoms ──────────────────────────────────────────────────────────────

function FormDialog({ open, onClose, title, description, children }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        {title}
        {description && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontWeight: 400 }}>
            {description}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function LabeledField({ label, value, onChange, placeholder, type = "text", autoFocus }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; autoFocus?: boolean;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      <TextField fullWidth size="small" type={type} value={value}
        placeholder={placeholder} autoFocus={autoFocus} autoComplete="off"
        onChange={(e) => onChange(e.target.value)} />
    </Box>
  );
}

function NumberField({ label, value, onChange, min, max, hint }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; hint?: string;
}) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      <TextField fullWidth size="small" type="number"
        value={value}
        inputProps={{ min, max, step: 1 }}
        onChange={(e) => {
          const v = Math.max(min, Math.min(max, Number(e.target.value)));
          onChange(v);
        }}
      />
      {hint && (
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem", mt: 0.25, display: "block" }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

function GhostBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button onClick={onClick} variant="text" size="small" color="inherit" sx={{ color: "text.secondary" }}>
      {label}
    </Button>
  );
}

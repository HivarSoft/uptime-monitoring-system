import {
  Box, Typography, Button, Grid, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, Switch,
  IconButton, Tooltip, CircularProgress,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import {
  getAlertChannels, createAlertChannel,
  updateAlertChannel, deleteAlertChannel, testAlertChannel,
} from "../../redux/apis/userApis";
import { toast } from "react-toastify";
import {
  AddRounded, DeleteOutlineRounded, PlayArrowRounded,
  EmailRounded, WebhookRounded, SmartToyRounded,
  CheckCircleRounded, ErrorRounded,
} from "@mui/icons-material";
import { T } from "../../theme/theme";

// ── Types ─────────────────────────────────────────────────────────────────────

type ChannelType = "email" | "webhook" | "slack" | "discord" | "telegram";

interface Channel {
  _id: string; name: string; type: ChannelType; enabled: boolean;
  lastTestedAt?: string; lastTestSuccess?: boolean; lastTestMessage?: string;
  config: Record<string, string | number | boolean>;
}

// ── Icon per type ─────────────────────────────────────────────────────────────

const TYPE_META: Record<ChannelType, { label: string; color: string; icon: React.ReactNode }> = {
  email:    { label: "Email (SMTP)",     color: "#7c3aed", icon: <EmailRounded sx={{ fontSize: 16 }} /> },
  slack:    { label: "Slack",            color: "#4a154b", icon: <SmartToyRounded sx={{ fontSize: 16 }} /> },
  discord:  { label: "Discord",         color: "#5865f2", icon: <SmartToyRounded sx={{ fontSize: 16 }} /> },
  webhook:  { label: "Webhook",         color: "#0891b2", icon: <WebhookRounded sx={{ fontSize: 16 }} /> },
  telegram: { label: "Telegram",        color: "#229ed9", icon: <SmartToyRounded sx={{ fontSize: 16 }} /> },
};

// ── Main component ────────────────────────────────────────────────────────────

export function AlertChannels() {
  const theme   = useTheme();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    setLoading(true);
    const res = await getAlertChannels();
    if (res.status === 200 && res.data)
      setChannels((res.data as { channels: Channel[] }).channels ?? []);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await deleteAlertChannel(id);
    if (res.status === 200) { toast.success("Channel deleted"); reload(); }
    else toast.error(res.error ?? "Delete failed");
  };

  const handleTest = async (id: string) => {
    toast.info("Sending test…");
    const res = await testAlertChannel(id);
    if (res.status === 200) toast.success((res.data as { message: string })?.message ?? "Test sent!");
    else toast.error((res.data as { message: string })?.message ?? res.error ?? "Test failed");
    reload();
  };

  const handleToggle = async (ch: Channel) => {
    await updateAlertChannel(ch._id, { enabled: !ch.enabled });
    reload();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" color="text.primary" gutterBottom>Alert Channels</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure where PulseWatch sends notifications when a service goes down or recovers.
          </Typography>
        </Box>
        <Button onClick={() => setCreating(true)} variant="contained" size="small"
          startIcon={<AddRounded sx={{ fontSize: 15 }} />}>
          Add Channel
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[...Array(3)].map((_, i) => <Grid item xs={12} sm={6} key={i}><Skeleton variant="rounded" height={110} sx={{ borderRadius: 2 }} /></Grid>)}
        </Grid>
      ) : channels.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center", border: `1.5px dashed ${theme.palette.divider}`, borderRadius: 2 }}>
          <EmailRounded sx={{ fontSize: 36, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="subtitle2" color="text.primary" gutterBottom>No alert channels yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add an email address, Slack webhook, or Discord channel to receive incident alerts.
          </Typography>
          <Button onClick={() => setCreating(true)} variant="contained" size="small"
            startIcon={<AddRounded sx={{ fontSize: 15 }} />}>
            Add your first channel
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {channels.map((ch) => (
            <Grid item xs={12} sm={6} key={ch._id}>
              <ChannelCard ch={ch}
                onDelete={() => handleDelete(ch._id, ch.name)}
                onTest={() => handleTest(ch._id)}
                onToggle={() => handleToggle(ch)} />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateChannelDialog open={creating} onClose={() => setCreating(false)} onCreated={reload} />
    </Box>
  );
}

// ── Channel card ──────────────────────────────────────────────────────────────

function ChannelCard({ ch, onDelete, onTest, onToggle }: {
  ch: Channel; onDelete: () => void; onTest: () => void; onToggle: () => void;
}) {
  const theme   = useTheme();
  const L       = theme.palette.mode === "light";
  const meta    = TYPE_META[ch.type] ?? TYPE_META.webhook;
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    await onTest();
    setTesting(false);
  };

  return (
    <Box sx={{
      p: 2.5, borderRadius: 2,
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      display: "flex", flexDirection: "column", gap: 1.5,
    }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: 1.5,
            backgroundColor: alpha(meta.color, L ? 0.1 : 0.18),
            display: "flex", alignItems: "center", justifyContent: "center",
            color: meta.color,
          }}>
            {meta.icon}
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.primary" fontWeight={600}>{ch.name}</Typography>
            <Typography variant="caption" color="text.secondary">{meta.label}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title={ch.enabled ? "Disable" : "Enable"}>
            <Switch checked={ch.enabled} onChange={onToggle} size="small" />
          </Tooltip>
          <Tooltip title="Send test">
            <IconButton onClick={handleTest} disabled={testing} size="small"
              sx={{ border: `1px solid ${theme.palette.divider}` }}>
              {testing ? <CircularProgress size={12} /> : <PlayArrowRounded sx={{ fontSize: 14 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={onDelete} size="small"
              sx={{ border: `1px solid ${theme.palette.divider}`,
                "&:hover": { color: T.down, borderColor: alpha(T.down, 0.4) } }}>
              <DeleteOutlineRounded sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {ch.lastTestedAt && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {ch.lastTestSuccess
            ? <CheckCircleRounded sx={{ fontSize: 13, color: T.up }} />
            : <ErrorRounded sx={{ fontSize: 13, color: T.down }} />
          }
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            Last test: {ch.lastTestSuccess ? "passed" : "failed"} · {new Date(ch.lastTestedAt).toLocaleString()}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ── Create channel dialog ─────────────────────────────────────────────────────

const CHANNEL_TYPES: ChannelType[] = ["email", "slack", "discord", "webhook", "telegram"];

function CreateChannelDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [name,    setName]    = useState("");
  const [type,    setType]    = useState<ChannelType>("email");
  const [cfg,     setCfg]     = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const reset = () => { onClose(); setName(""); setType("email"); setCfg({}); };
  const set = (k: string, v: string) => setCfg((c) => ({ ...c, [k]: v }));

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Channel name is required"); return; }
    setLoading(true);
    const res = await createAlertChannel({ name: name.trim(), type, config: cfg });
    setLoading(false);
    if (res.status === 200 || res.status === 201) {
      toast.success("Alert channel created"); onCreated(); reset();
    } else {
      toast.error(res.error ?? "Failed to create channel");
    }
  };

  return (
    <Dialog open={open} onClose={reset} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        Add Alert Channel
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontWeight: 400 }}>
          Credentials are stored in your account and never shared.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>

        <F label="Channel name" value={name} onChange={setName} placeholder="e.g. My Gmail" />

        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.75}>Channel type</Typography>
          <Select value={type} onChange={(e) => { setType(e.target.value as ChannelType); setCfg({}); }}
            fullWidth size="small">
            {CHANNEL_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{TYPE_META[t].label}</MenuItem>
            ))}
          </Select>
        </Box>

        {/* Email fields */}
        {type === "email" && <>
          <F label="Recipient email" value={cfg.toEmail ?? ""} onChange={(v) => set("toEmail", v)} placeholder="you@example.com" />
          <Box sx={{ display: "flex", gap: 2 }}>
            <F label="SMTP host" value={cfg.smtpHost ?? ""} onChange={(v) => set("smtpHost", v)} placeholder="smtp.gmail.com" />
            <F label="SMTP port" value={cfg.smtpPort ?? ""} onChange={(v) => set("smtpPort", v)} placeholder="587" />
          </Box>
          <F label="SMTP username" value={cfg.smtpUser ?? ""} onChange={(v) => set("smtpUser", v)} placeholder="you@gmail.com" />
          <F label="SMTP password / App password" value={cfg.smtpPass ?? ""} onChange={(v) => set("smtpPass", v)} type="password" placeholder="••••••••" />
          <Typography variant="caption" color="text.disabled" sx={{ mt: -1, fontSize: "0.7rem" }}>
            For Gmail: enable 2FA and use an App Password. <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">Generate one here</a>
          </Typography>
        </>}

        {/* Slack / Discord / Webhook */}
        {(type === "slack" || type === "discord" || type === "webhook") && (
          <F label="Webhook URL" value={cfg.webhookUrl ?? ""} onChange={(v) => set("webhookUrl", v)}
            placeholder={
              type === "slack"   ? "https://hooks.slack.com/services/…" :
              type === "discord" ? "https://discord.com/api/webhooks/…" :
              "https://your-server.com/webhook"
            }
          />
        )}

        {/* Telegram */}
        {type === "telegram" && <>
          <F label="Bot token" value={cfg.botToken ?? ""} onChange={(v) => set("botToken", v)} placeholder="123456:ABC-DEF…" type="password" />
          <F label="Chat ID" value={cfg.chatId ?? ""} onChange={(v) => set("chatId", v)} placeholder="-100123456789" />
          <Typography variant="caption" color="text.disabled" sx={{ mt: -1, fontSize: "0.7rem" }}>
            Create a bot via @BotFather, then get the chat ID by messaging @userinfobot.
          </Typography>
        </>}

      </DialogContent>
      <DialogActions>
        <Button onClick={reset} variant="text" size="small" color="inherit" sx={{ color: "text.secondary" }}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" size="small" disabled={loading}>
          {loading ? "Saving…" : "Create Channel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function F({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      <TextField fullWidth size="small" type={type} value={value}
        placeholder={placeholder} autoComplete="off"
        onChange={(e) => onChange(e.target.value)} />
    </Box>
  );
}

export default AlertChannels;

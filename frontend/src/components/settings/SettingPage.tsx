import {
  ArrowBackRounded, LockOutlined, PersonOutlined,
  SaveRounded, NotificationsRounded,
} from "@mui/icons-material";
import {
  Avatar, Box, Button, CircularProgress,
  Grid, Skeleton, Tab, Tabs, TextField, Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser, updateUser, changePassword } from "../../redux/apis/userApis";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../redux/hooks";
import { SET_USER_PROFILE } from "../../redux/reducers/userReducer";
import { T } from "../../theme/theme";
import { AlertChannels } from "../alerts/AlertChannels";

function Settings() {
  const theme    = useTheme();
  const L        = theme.palette.mode === "light";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState(0);

  const [profile, setProfile]   = useState({ firstName: "", lastName: "", email: "", imgUrl: "" });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [loadingInit,    setLoadingInit]    = useState(true);
  const [savingProfile,  setSavingProfile]  = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getUser().then((res) => {
      if (res.status === 200 && res.data) {
        const u = res.data.user;
        setProfile({ firstName: u.firstName ?? "", lastName: u.lastName ?? "", email: u.email ?? "", imgUrl: u.imgUrl ?? "" });
      }
      setLoadingInit(false);
    });
  }, []);

  const handleSaveProfile = async () => {
    if (!profile.firstName.trim()) { toast.error("First name is required"); return; }
    setSavingProfile(true);
    const res = await updateUser({ firstName: profile.firstName.trim(), lastName: profile.lastName.trim(), email: profile.email.trim(), imgUrl: profile.imgUrl });
    setSavingProfile(false);
    if (res.status === 200) {
      dispatch(SET_USER_PROFILE({ firstName: profile.firstName.trim(), lastName: profile.lastName.trim(), email: profile.email.trim(), imgUrl: profile.imgUrl }));
      toast.success("Profile updated");
    } else { toast.error(res.error ?? "Failed to update profile"); }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.next) { toast.error("Both passwords are required"); return; }
    if (passwords.next !== passwords.confirm)   { toast.error("Passwords do not match"); return; }
    if (passwords.next.length < 6)             { toast.error("Minimum 6 characters"); return; }
    setSavingPassword(true);
    const res = await changePassword(passwords.current, passwords.next);
    setSavingPassword(false);
    if (res.status === 200) { toast.success("Password changed"); setPasswords({ current: "", next: "", confirm: "" }); }
    else toast.error(res.error ?? "Failed to change password");
  };

  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase();

  const cardSx = {
    mt: 3, border: `1px solid ${theme.palette.divider}`,
    borderRadius: 2, backgroundColor: theme.palette.background.paper, overflow: "hidden",
  };
  const headerSx = {
    px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.25,
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: L ? T.n50 : alpha("#fff", 0.02),
  };

  return (
    <Box sx={{ pt: 3, maxWidth: 720 }}>
      {/* Back */}
      <Box onClick={() => navigate(-1)} sx={{
        display: "inline-flex", alignItems: "center", gap: 0.75, cursor: "pointer", mb: 3,
        color: "text.secondary", "&:hover": { color: "text.primary" }, transition: "color 0.15s",
      }}>
        <ArrowBackRounded sx={{ fontSize: 14 }} />
        <Typography variant="caption" fontWeight={500}>Back</Typography>
      </Box>

      <Typography variant="h3" color="text.primary" gutterBottom>Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your account, security, and alert notification channels.
      </Typography>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.875rem", minHeight: 44 },
        }}>
        <Tab icon={<PersonOutlined sx={{ fontSize: 16 }} />} iconPosition="start" label="Profile" />
        <Tab icon={<LockOutlined sx={{ fontSize: 16 }} />} iconPosition="start" label="Security" />
        <Tab icon={<NotificationsRounded sx={{ fontSize: 16 }} />} iconPosition="start" label="Alert Channels" />
      </Tabs>

      {/* ── Tab 0: Profile ────────────────────────────────────────────────── */}
      {tab === 0 && (
        loadingInit ? (
          <Box sx={{ mt: 3 }}>
            <Skeleton variant="rounded" height={290} sx={{ borderRadius: 2, mb: 2 }} />
          </Box>
        ) : (
          <Box sx={cardSx}>
            <Box sx={headerSx}>
              <Box sx={{ width: 28, height: 28, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: alpha(theme.palette.primary.main, L ? 0.1 : 0.18) }}>
                <PersonOutlined sx={{ fontSize: 15, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="subtitle2" color="text.primary">Profile</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {/* Avatar preview */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, p: 2, borderRadius: 1.5, backgroundColor: L ? T.n50 : alpha("#fff", 0.03), border: `1px solid ${theme.palette.divider}` }}>
                <Avatar src={profile.imgUrl || undefined} sx={{ width: 48, height: 48, fontSize: 16 }}>
                  {initials || "?"}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.primary">{profile.firstName} {profile.lastName}</Typography>
                  <Typography variant="caption" color="text.disabled">{profile.email}</Typography>
                </Box>
              </Box>
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6}><Field label="First Name" value={profile.firstName} onChange={(v) => setProfile((p) => ({ ...p, firstName: v }))} /></Grid>
                <Grid item xs={12} sm={6}><Field label="Last Name"  value={profile.lastName}  onChange={(v) => setProfile((p) => ({ ...p, lastName: v }))} /></Grid>
                <Grid item xs={12}><Field label="Email" type="email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} /></Grid>
                <Grid item xs={12}><Field label="Avatar URL (optional)" value={profile.imgUrl} placeholder="https://…" onChange={(v) => setProfile((p) => ({ ...p, imgUrl: v }))} /></Grid>
              </Grid>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <SaveBtn onClick={handleSaveProfile} loading={savingProfile} label="Save Profile" />
              </Box>
            </Box>
          </Box>
        )
      )}

      {/* ── Tab 1: Security ───────────────────────────────────────────────── */}
      {tab === 1 && (
        <Box sx={cardSx}>
          <Box sx={headerSx}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: alpha(theme.palette.secondary.main, L ? 0.1 : 0.18) }}>
              <LockOutlined sx={{ fontSize: 15, color: theme.palette.secondary.main }} />
            </Box>
            <Typography variant="subtitle2" color="text.primary">Change Password</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12}><Field label="Current Password"     type="password" value={passwords.current} onChange={(v) => setPasswords((p) => ({ ...p, current: v }))} /></Grid>
              <Grid item xs={12} sm={6}><Field label="New Password"  type="password" value={passwords.next}    onChange={(v) => setPasswords((p) => ({ ...p, next: v }))} /></Grid>
              <Grid item xs={12} sm={6}><Field label="Confirm"       type="password" value={passwords.confirm} onChange={(v) => setPasswords((p) => ({ ...p, confirm: v }))} /></Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <SaveBtn onClick={handleChangePassword} loading={savingPassword} label="Update Password" />
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Tab 2: Alert Channels ─────────────────────────────────────────── */}
      {tab === 2 && (
        <Box sx={{ mt: 3 }}>
          <AlertChannels />
        </Box>
      )}
    </Box>
  );
}

// ── Shared atoms ──────────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" sx={{ mb: 0.625 }}>
        {label}
      </Typography>
      <TextField fullWidth size="small" type={type} value={value}
        placeholder={placeholder} autoComplete="off" onChange={(e) => onChange(e.target.value)} />
    </Box>
  );
}

function SaveBtn({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <Button onClick={onClick} disabled={loading} variant="contained" size="small"
      startIcon={loading ? <CircularProgress size={13} color="inherit" /> : <SaveRounded sx={{ fontSize: 14 }} />}>
      {loading ? "Saving…" : label}
    </Button>
  );
}

export default Settings;

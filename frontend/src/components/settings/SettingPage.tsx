import {
  ArrowBackRounded, PersonOutlined,
  SaveRounded, NotificationsRounded,
} from "@mui/icons-material";
import {
  Avatar, Box, Button, Chip, CircularProgress,
  Grid, Skeleton, Tab, Tabs, TextField, Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { getUser, updateUser } from "../../redux/apis/userApis";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../redux/hooks";
import { SET_USER } from "../../redux/reducers/userReducer";
import { T } from "../../theme/theme";
import { AlertChannels } from "../alerts/AlertChannels";

function Settings() {
  const theme    = useTheme();
  const L        = theme.palette.mode === "light";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState(0);

  const [profile, setProfile]   = useState({ firstName: "", lastName: "", email: "", imgUrl: "", providers: [] as string[] });
  const [loadingInit,   setLoadingInit]   = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    getUser().then((res) => {
      if (res.status === 200 && res.data) {
        const u = (res.data as { user: { firstName: string; lastName: string; email: string; imgUrl: string; providers: string[] } }).user;
        setProfile({
          firstName: u.firstName ?? "",
          lastName:  u.lastName  ?? "",
          email:     u.email     ?? "",
          imgUrl:    u.imgUrl    ?? "",
          providers: u.providers ?? [],
        });
      }
      setLoadingInit(false);
    });
  }, []);

  const handleSaveProfile = async () => {
    if (!profile.firstName.trim()) { toast.error("First name is required"); return; }
    setSavingProfile(true);
    const res = await updateUser({
      firstName: profile.firstName.trim(),
      lastName:  profile.lastName.trim(),
      imgUrl:    profile.imgUrl,
    });
    setSavingProfile(false);
    if (res.status === 200) {
      dispatch(SET_USER({ firstName: profile.firstName.trim(), lastName: profile.lastName.trim(), imgUrl: profile.imgUrl }));
      toast.success("Profile updated");
    } else {
      toast.error(res.error ?? "Failed to update profile");
    }
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
        Manage your account and alert notification channels.
      </Typography>

      <Tabs
        value={tab} onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.875rem", minHeight: 44 },
        }}
      >
        <Tab icon={<PersonOutlined sx={{ fontSize: 16 }} />} iconPosition="start" label="Profile" />
        <Tab icon={<NotificationsRounded sx={{ fontSize: 16 }} />} iconPosition="start" label="Alert Channels" />
      </Tabs>

      {/* ── Tab 0: Profile ────────────────────────────────────────────────── */}
      {tab === 0 && (
        loadingInit ? (
          <Box sx={{ mt: 3 }}>
            <Skeleton variant="rounded" height={290} sx={{ borderRadius: 2, mb: 2 }} />
          </Box>
        ) : (
          <>
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
                  <Grid item xs={12}>
                    <Field label="Email (read-only)" value={profile.email} onChange={() => {}} />
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
                      Email is managed by your OAuth provider and cannot be changed here.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}><Field label="Avatar URL (optional)" value={profile.imgUrl} placeholder="https://…" onChange={(v) => setProfile((p) => ({ ...p, imgUrl: v }))} /></Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <SaveBtn onClick={handleSaveProfile} loading={savingProfile} label="Save Profile" />
                </Box>
              </Box>
            </Box>

            {/* Linked providers */}
            <Box sx={{ ...cardSx }}>
              <Box sx={headerSx}>
                <Typography variant="subtitle2" color="text.primary">Linked Accounts</Typography>
              </Box>
              <Box sx={{ p: 3, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {profile.providers.length === 0 && (
                  <Typography variant="body2" color="text.disabled">No providers linked.</Typography>
                )}
                {profile.providers.includes("google") && (
                  <Chip
                    icon={<FaGoogle size={13} />}
                    label="Google"
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: alpha("#4285F4", L ? 0.1 : 0.18), color: "#4285F4", border: "none" }}
                    variant="outlined"
                  />
                )}
                {profile.providers.includes("github") && (
                  <Chip
                    icon={<FaGithub size={13} />}
                    label="GitHub"
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: alpha(L ? "#333" : "#aaa", 0.1), color: L ? "#333" : "#ccc", border: "none" }}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </>
        )
      )}

      {/* ── Tab 1: Alert Channels ─────────────────────────────────────────── */}
      {tab === 1 && (
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
        placeholder={placeholder} autoComplete="off"
        onChange={(e) => onChange(e.target.value)} />
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

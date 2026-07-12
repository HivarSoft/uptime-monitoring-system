import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import {
  Avatar, Box, Button, Divider, IconButton,
  InputAdornment, InputLabel, TextField, Tooltip, Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import React, { useState } from "react";
import { MdLogout, MdSettings } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import Popover from "@mui/material/Popover";
import Dialog from "@mui/material/Dialog";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Close, DashboardRounded, LightMode, DarkMode, LoginRounded, MonitorHeart } from "@mui/icons-material";
import { Login, signUp } from "../redux/apis/userApis";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { LogoutUSER, USER, selectUser } from "../redux/reducers/userReducer";
import { useThemeMode } from "../theme/ThemeContext";
import { T } from "../theme/theme";

export interface LayoutProps { children?: React.ReactNode; }

// ── Layout shell ──────────────────────────────────────────────────────────────
function Layout({ children }: LayoutProps) {
  const theme      = useTheme();
  const { mode, toggle } = useThemeMode();
  const user       = useAppSelector(selectUser);
  const isLoggedIn = !!user.token;
  const navigate   = useNavigate();
  const L          = mode === "light";

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <ToastContainer
        position="top-right" autoClose={3000}
        hideProgressBar={false} newestOnTop closeOnClick
        pauseOnFocusLoss draggable pauseOnHover
        theme={L ? "light" : "dark"} limit={3}
        toastStyle={{ borderRadius: 8, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}
      />

      {/* ── Topbar ────────────────────────────────────────────────────── */}
      <Box component="nav" sx={{
        position: "sticky", top: 0, zIndex: 200,
        width: "100%",
        height: 56,
        backgroundColor: alpha(theme.palette.background.paper, L ? 0.92 : 0.88),
        backdropFilter: "blur(14px) saturate(1.5)",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Box sx={{ maxWidth: 1320, mx: "auto", height: "100%",
          px: { md: 4, xs: 2 },
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Brand */}
          <Box onClick={() => navigate("/")} sx={{ display: "flex", alignItems: "center", gap: 1.25, cursor: "pointer", userSelect: "none" }}>
            <Box sx={{
              width: 30, height: 30, borderRadius: 1.5,
              background: `linear-gradient(140deg, ${T.brand} 0%, #4f46e5 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 2px 8px ${alpha(T.brand, 0.35)}`,
            }}>
              <MonitorHeart sx={{ fontSize: 16, color: "#fff" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.02em", color: "text.primary", lineHeight: 1 }}>
              PulseWatch
            </Typography>
          </Box>

          {/* Right side */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* Theme toggle */}
            <Tooltip title={L ? "Dark mode" : "Light mode"}>
              <IconButton onClick={toggle} size="small" sx={{
                width: 32, height: 32, color: "text.secondary",
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": { color: "text.primary", borderColor: L ? T.n400 : "rgba(148,163,184,0.4)" },
              }}>
                {L ? <DarkMode sx={{ fontSize: 15 }} /> : <LightMode sx={{ fontSize: 15 }} />}
              </IconButton>
            </Tooltip>

            {isLoggedIn ? (
              <>
                <Tooltip title="Dashboard">
                  <IconButton onClick={() => navigate("/dashboard")} size="small" sx={{
                    width: 32, height: 32, color: "text.secondary", ml: 0.5,
                    "&:hover": { color: "text.primary" },
                  }}>
                    <DashboardRounded sx={{ fontSize: 17 }} />
                  </IconButton>
                </Tooltip>
                <Box sx={{ ml: 0.5 }}>
                  <UserMenu />
                </Box>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 1, ml: 0.5 }}>
                <LoginDialog />
                <SignUpDialog />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1320, width: "100%", mx: "auto", flex: 1, px: { md: 4, xs: 2 }, pt: 1, pb: 12 }}>
        {children}
      </Box>
    </Box>
  );
}

export default Layout;

// ── User avatar menu ──────────────────────────────────────────────────────────
const UserMenu = () => {
  const theme    = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const user      = useAppSelector(selectUser);
  const initials  = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <>
      <Box onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ display: "flex", alignItems: "center", gap: 0.75, cursor: "pointer",
          px: 1, py: 0.5, borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          "&:hover": { backgroundColor: theme.palette.action.hover },
          transition: "all 0.15s" }}>
        <Avatar src={user.imgUrl || undefined} sx={{ width: 22, height: 22, fontSize: 9 }}>
          {initials}
        </Avatar>
        <Typography variant="caption" color="text.primary" fontWeight={600} sx={{ maxWidth: 80 }} noWrap>
          {user.firstName}
        </Typography>
        <IoIosArrowDown size={10} style={{ opacity: 0.5, flexShrink: 0 }} />
      </Box>

      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 0.75 }}
        PaperProps={{ sx: { minWidth: 210 } }}>

        {/* User info */}
        <Box sx={{ px: 2, py: 1.75 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Avatar src={user.imgUrl || undefined} sx={{ width: 32, height: 32, fontSize: 12 }}>
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" fontWeight={600} color="text.primary" display="block" noWrap>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.disabled" display="block" noWrap sx={{ fontSize: "0.75rem" }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ p: 0.75 }}>
          <MenuRow icon={<MdSettings size={14} />} label="Settings"
            onClick={() => { setAnchorEl(null); navigate("/settings"); }} />
          <MenuRow icon={<MdLogout size={14} />} label="Sign out" danger
            onClick={() => { dispatch(LogoutUSER()); localStorage.removeItem("token"); navigate("/"); }} />
        </Box>
      </Popover>
    </>
  );
};

const MenuRow = ({ icon, label, danger, onClick }: {
  icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void;
}) => {
  const theme = useTheme();
  return (
    <Box onClick={onClick} sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      px: 1.5, py: 0.875, borderRadius: 1.5, cursor: "pointer",
      color: danger ? theme.palette.error.main : "text.secondary",
      fontSize: "0.875rem", fontWeight: 500,
      "&:hover": {
        backgroundColor: danger ? alpha(theme.palette.error.main, 0.06) : theme.palette.action.hover,
        color: danger ? theme.palette.error.main : "text.primary",
      },
      transition: "all 0.12s",
    }}>
      {icon}
      <Typography variant="body2" color="inherit" fontWeight={500}>{label}</Typography>
    </Box>
  );
};

// ── Login dialog ──────────────────────────────────────────────────────────────
export function LoginDialog() {
  const [open, setOpen]               = useState(false);
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();

  const handleSubmit = async () => {
    if (!email || !password) { toast.error("Please enter email and password"); return; }
    setLoading(true);
    const res = await Login(email, password);
    setLoading(false);
    if (res.status === 200 && res.data) {
      dispatch(USER({ data: res.data.data, token: res.data.token }));
      localStorage.setItem("token", res.data.token);
      setOpen(false); setEmail(""); setPassword("");
      navigate("/dashboard");
      toast.success("Welcome back!");
    } else {
      toast.error(res.error ?? "Invalid email or password");
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outlined" color="inherit" size="small"
        startIcon={<LoginRounded sx={{ fontSize: 14 }} />}
        sx={{ borderColor: "divider", color: "text.secondary",
          "&:hover": { borderColor: "text.secondary", color: "text.primary", backgroundColor: "action.hover" } }}>
        Sign In
      </Button>

      <AuthModal open={open} onClose={() => setOpen(false)} title="Sign in to PulseWatch">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          <AuthField label="Email" type="email" value={email} onChange={setEmail} autoFocus />
          <AuthField label="Password" type={showPwd ? "text" : "password"} value={password}
            onChange={setPassword}
            endAdornment={
              <InputAdornment position="end" onClick={() => setShowPwd(!showPwd)} sx={{ cursor: "pointer" }}>
                {showPwd
                  ? <Visibility sx={{ fontSize: 16, opacity: 0.4 }} />
                  : <VisibilityOff sx={{ fontSize: 16, opacity: 0.4 }} />}
              </InputAdornment>
            }
          />
          <PrimaryBtn onClick={handleSubmit} loading={loading} label="Sign In" />
        </Box>
      </AuthModal>
    </>
  );
}

// ── Sign-up dialog ────────────────────────────────────────────────────────────
export function SignUpDialog({ open: ctrlOpen, onClose: ctrlClose }: { open?: boolean; onClose?: () => void } = {}) {
  const isCtrl = ctrlOpen !== undefined;
  const [intOpen, setIntOpen] = useState(false);
  const open = isCtrl ? ctrlOpen! : intOpen;
  const handleClose = () => { if (isCtrl) ctrlClose?.(); else setIntOpen(false); };

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.password) { toast.error("Please fill required fields"); return; }
    setLoading(true);
    const res = await signUp(form.firstName, form.lastName, form.email, form.password);
    setLoading(false);
    if (res.status === 200 || res.status === 201) {
      toast.success("Account created — you can now sign in");
      handleClose();
      setForm({ firstName: "", lastName: "", email: "", password: "" });
    } else {
      toast.error(res.error ?? "Failed to create account");
    }
  };

  return (
    <>
      {!isCtrl && (
        <Button onClick={() => setIntOpen(true)} variant="contained" size="small">
          Get Started
        </Button>
      )}
      <AuthModal open={open} onClose={handleClose} title="Create your account">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <AuthField label="First name *" value={form.firstName} onChange={(v) => setForm((f) => ({ ...f, firstName: v }))} autoFocus />
            <AuthField label="Last name"    value={form.lastName}  onChange={(v) => setForm((f) => ({ ...f, lastName: v }))} />
          </Box>
          <AuthField label="Email *"    type="email"    value={form.email}    onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
          <AuthField label="Password *" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
          <PrimaryBtn onClick={handleSubmit} loading={loading} label="Create account" />
        </Box>
      </AuthModal>
    </>
  );
}

// ── Shared auth components ────────────────────────────────────────────────────
function AuthModal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ p: "28px 24px 24px", position: "relative" }}>
        <IconButton size="small" onClick={onClose}
          sx={{ position: "absolute", top: 12, right: 12, color: "text.disabled",
            "&:hover": { color: "text.primary" } }}>
          <Close sx={{ fontSize: 17 }} />
        </IconButton>

        {/* Branding */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box sx={{ width: 24, height: 24, borderRadius: 1,
            background: `linear-gradient(140deg, ${T.brand}, #4f46e5)`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MonitorHeart sx={{ fontSize: 13, color: "#fff" }} />
          </Box>
          <Typography variant="overline" color="text.disabled">PulseWatch</Typography>
        </Box>

        <Typography variant="h4" color="text.primary" sx={{ mb: 3 }}>{title}</Typography>
        {children}
      </Box>
    </Dialog>
  );
}

function AuthField({ label, type = "text", value, onChange, endAdornment, autoFocus }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; endAdornment?: React.ReactNode; autoFocus?: boolean;
}) {
  return (
    <Box sx={{ flex: 1 }}>
      <InputLabel sx={{ mb: 0.5, display: "block" }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
      </InputLabel>
      <TextField fullWidth size="small" type={type} value={value} autoComplete="off"
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{ endAdornment }}
      />
    </Box>
  );
}

function PrimaryBtn({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <Button fullWidth onClick={onClick} disabled={loading} variant="contained"
      sx={{ mt: 0.5, py: 1.125, fontSize: "0.9375rem" }}>
      {loading ? "Please wait…" : label}
    </Button>
  );
}

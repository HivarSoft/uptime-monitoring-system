import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import {
  Avatar, Box, Button, Divider, IconButton,
  Tooltip, Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import React, { useState } from "react";
import { MdLogout, MdSettings } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import Popover from "@mui/material/Popover";
import { DashboardRounded, LightMode, DarkMode, MonitorHeart } from "@mui/icons-material";
import { logout } from "../redux/apis/userApis";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { LOGOUT_USER, selectUser } from "../redux/reducers/userReducer";
import { useThemeMode } from "../theme/ThemeContext";
import { T } from "../theme/theme";

/** Nothing exported from here for OAuth — OAuth redirects are handled in LoginPage */

export interface LayoutProps { children?: React.ReactNode; }

// ── Layout shell ──────────────────────────────────────────────────────────────
function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const { mode, toggle } = useThemeMode();
  const user  = useAppSelector(selectUser);
  const isLoggedIn = user.authenticated;
  const navigate   = useNavigate();
  const L = mode === "light";

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
        width: "100%", height: 56,
        backgroundColor: alpha(theme.palette.background.paper, L ? 0.92 : 0.88),
        backdropFilter: "blur(14px) saturate(1.5)",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Box sx={{ maxWidth: 1320, mx: "auto", height: "100%", px: { md: 4, xs: 2 }, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

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
                  <IconButton onClick={() => navigate("/dashboard")} size="small" sx={{ width: 32, height: 32, color: "text.secondary", ml: 0.5, "&:hover": { color: "text.primary" } }}>
                    <DashboardRounded sx={{ fontSize: 17 }} />
                  </IconButton>
                </Tooltip>
                <Box sx={{ ml: 0.5 }}>
                  <UserMenu />
                </Box>
              </>
            ) : (
              <Box sx={{ ml: 0.5 }}>
                <SignInButton />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1320, width: "100%", mx: "auto", flex: 1, px: { md: 4, xs: 2 }, pt: 1, pb: 6 }}>
        {children}
      </Box>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Box component="footer" sx={{
        width: "100%",
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.background.paper, L ? 0.92 : 0.88),
        backdropFilter: "blur(14px) saturate(1.5)",
        py: 2.5,
      }}>
        <Box sx={{
          maxWidth: 1320, mx: "auto", px: { md: 4, xs: 2 },
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1,
        }}>
          <Typography variant="caption" color="text.disabled">
            © {new Date().getFullYear()} HivarSoft. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Box
              component="a"
              href="/privacy"
              sx={{ color: "text.disabled", textDecoration: "none", fontSize: "0.75rem", fontWeight: 500, transition: "color 0.15s", "&:hover": { color: T.brand } }}
            >
              Privacy Policy
            </Box>
            <Box
              component="a"
              href="/terms"
              sx={{ color: "text.disabled", textDecoration: "none", fontSize: "0.75rem", fontWeight: 500, transition: "color 0.15s", "&:hover": { color: T.brand } }}
            >
              Terms of Service
            </Box>
            <Box
              component="a"
              href="https://github.com/HivarSoft/uptime-monitoring-system"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "flex", alignItems: "center", gap: 0.75,
                color: "text.disabled", textDecoration: "none",
                fontSize: "0.75rem", fontWeight: 500, transition: "color 0.15s",
                "&:hover": { color: T.brand },
              }}
            >
              <Box component="svg" viewBox="0 0 24 24" sx={{ width: 15, height: 15, fill: "currentColor", flexShrink: 0 }}>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.547 1.376.203 2.393.1 2.646.64.698 1.028 1.591 1.028 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </Box>
              GitHub
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;

// ── Sign-in nav button ─────────────────────────────────────────────────────────
export function SignInButton() {
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => navigate("/login")}
      variant="contained"
      size="small"
      sx={{ fontWeight: 600 }}
    >
      Sign In
    </Button>
  );
}

// ── User avatar menu ──────────────────────────────────────────────────────────
const UserMenu = () => {
  const theme   = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user     = useAppSelector(selectUser);
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    dispatch(LOGOUT_USER());
    navigate("/");
    toast.success("Signed out");
  };

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "flex", alignItems: "center", gap: 0.75, cursor: "pointer",
          px: 1, py: 0.5, borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          "&:hover": { backgroundColor: theme.palette.action.hover },
          transition: "all 0.15s",
        }}
      >
        <Avatar src={user.imgUrl || undefined} sx={{ width: 22, height: 22, fontSize: 9 }}>
          {initials}
        </Avatar>
        <Typography variant="caption" color="text.primary" fontWeight={600} sx={{ maxWidth: 80 }} noWrap>
          {user.firstName}
        </Typography>
        <IoIosArrowDown size={10} style={{ opacity: 0.5, flexShrink: 0 }} />
      </Box>

      <Popover
        open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 0.75 }}
        PaperProps={{ sx: { minWidth: 210 } }}
      >
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
            onClick={handleLogout} />
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

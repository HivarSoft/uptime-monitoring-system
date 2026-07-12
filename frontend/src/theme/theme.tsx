import { createTheme, type PaletteMode, alpha } from "@mui/material";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// Inspired by: Linear, Vercel dashboard, Stripe
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  // Brand – vivid indigo-violet
  brand:    "#5b5bd6",
  brandHov: "#4747c2",
  brandSoft:"#ededfc",

  // Semantic
  up:        "#12a150",   // emerald
  upBg:      "#e8f7ee",
  upBorder:  "#a3d9b8",

  down:      "#d93036",   // red
  downBg:    "#fde8e8",
  downBorder:"#f4a4a6",

  warn:      "#c47800",   // amber
  warnBg:    "#fef5e0",
  warnBorder:"#f5d48a",

  pending:   "#6e7a8a",   // slate

  // Neutrals – slightly warm grey, not slate-cold
  n50:   "#f9fafb",
  n100:  "#f3f4f6",
  n200:  "#e5e7eb",
  n300:  "#d1d5db",
  n400:  "#9ca3af",
  n500:  "#6b7280",
  n600:  "#4b5563",
  n700:  "#374151",
  n800:  "#1f2937",
  n900:  "#111827",

  // Dark mode surfaces
  d50:  "#1c1c2e",
  d100: "#16213e",
  d200: "#0f3460",
  dPaper:"#1e1e30",
  dBase: "#141420",
} as const;

// ── Typography ────────────────────────────────────────────────────────────────
const typography = {
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  fontWeightLight:   300,
  fontWeightRegular: 400,
  fontWeightMedium:  500,
  fontWeightBold:    600,
  h1: { fontSize: "1.75rem",  fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.2 },
  h2: { fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.03em",  lineHeight: 1.25 },
  h3: { fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.02em",  lineHeight: 1.3 },
  h4: { fontSize: "1rem",     fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.4 },
  h5: { fontSize: "0.9375rem",fontWeight: 600, letterSpacing: "-0.01em",  lineHeight: 1.45 },
  h6: { fontSize: "0.875rem", fontWeight: 600, letterSpacing: "-0.01em",  lineHeight: 1.5 },
  subtitle1: { fontSize: "0.9375rem", fontWeight: 500, lineHeight: 1.5 },
  subtitle2: { fontSize: "0.875rem",  fontWeight: 500, lineHeight: 1.5 },
  body1:   { fontSize: "0.9375rem", fontWeight: 400, lineHeight: 1.65 },
  body2:   { fontSize: "0.875rem",  fontWeight: 400, lineHeight: 1.65 },
  caption: { fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.5 },
  overline:{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", lineHeight: 1.5, textTransform: "uppercase" as const },
  button:  { fontSize: "0.875rem",  fontWeight: 600, letterSpacing: "-0.005em", textTransform: "none" as const },
};

// ── Theme builder ─────────────────────────────────────────────────────────────
export function buildTheme(mode: PaletteMode) {
  const L = mode === "light";

  // Palette
  const palette = L ? {
    mode: "light" as PaletteMode,
    background: { default: T.n50, paper: "#ffffff" },
    primary:   { main: T.brand, light: "#7b7be8", dark: T.brandHov, contrastText: "#fff" },
    secondary: { main: "#0891b2", light: "#38bdf8", dark: "#0369a1", contrastText: "#fff" },
    success:   { main: T.up,   light: "#4ade80",  dark: "#15803d",  contrastText: "#fff" },
    warning:   { main: T.warn, light: "#fbbf24",  dark: "#b45309",  contrastText: "#fff" },
    error:     { main: T.down, light: "#f87171",  dark: "#b91c1c",  contrastText: "#fff" },
    text:      { primary: T.n900, secondary: T.n600, disabled: T.n400 },
    divider:   T.n200,
    action: {
      hover:           alpha(T.brand, 0.06),
      selected:        alpha(T.brand, 0.1),
      focus:           alpha(T.brand, 0.14),
      disabledBackground: T.n200,
      disabled:        T.n400,
    },
  } : {
    mode: "dark" as PaletteMode,
    background: { default: T.dBase, paper: T.dPaper },
    primary:   { main: "#818cf8", light: "#a5b4fc", dark: "#6366f1", contrastText: "#fff" },
    secondary: { main: "#38bdf8", light: "#7dd3fc", dark: "#0ea5e9", contrastText: T.n900 },
    success:   { main: "#34d399", light: "#6ee7b7", dark: "#059669", contrastText: T.n900 },
    warning:   { main: "#fbbf24", light: "#fcd34d", dark: "#d97706", contrastText: T.n900 },
    error:     { main: "#f87171", light: "#fca5a5", dark: "#dc2626", contrastText: "#fff" },
    text:      { primary: "#f1f5f9", secondary: "#94a3b8", disabled: "#475569" },
    divider:   "rgba(148,163,184,0.15)",
    action: {
      hover:           "rgba(129,140,248,0.08)",
      selected:        "rgba(129,140,248,0.14)",
      focus:           "rgba(129,140,248,0.18)",
      disabledBackground: "rgba(148,163,184,0.12)",
      disabled:        "#475569",
    },
  };

  return createTheme({
    palette,
    typography,
    shape: { borderRadius: 8 },

    components: {
      // ── Global baseline ────────────────────────────────────────────────
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            color: palette.text.primary,
            transition: "background-color 0.2s ease, color 0.2s ease",
            WebkitFontSmoothing: "antialiased",
          },
          "*": { boxSizing: "border-box" },
          "::selection": {
            backgroundColor: L ? alpha(T.brand, 0.15) : alpha("#818cf8", 0.25),
          },
        },
      },

      // ── Button ────────────────────────────────────────────────────────
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            letterSpacing: "-0.005em",
            borderRadius: 7,
            transition: "all 0.15s ease",
            lineHeight: 1.5,
          },
          sizeSmall:  { fontSize: "0.8125rem", padding: "5px 12px" },
          sizeMedium: { padding: "7px 16px" },
          sizeLarge:  { fontSize: "0.9375rem", padding: "10px 22px" },
          containedPrimary: {
            background: `linear-gradient(135deg, ${palette.primary.main}, ${L ? "#4f46e5" : "#6366f1"})`,
            boxShadow: L
              ? `0 1px 2px ${alpha(T.brand, 0.3)}, inset 0 1px 0 rgba(255,255,255,0.12)`
              : "none",
            "&:hover": {
              background: `linear-gradient(135deg, ${palette.primary.dark}, ${L ? "#4338ca" : "#4f46e5"})`,
              boxShadow: L ? `0 3px 8px ${alpha(T.brand, 0.35)}` : "none",
            },
            "&:active": { transform: "translateY(0.5px)" },
            "&:focus-visible": {
              outline: `2px solid ${palette.primary.main}`,
              outlineOffset: 2,
              boxShadow: `0 0 0 4px ${alpha(palette.primary.main, 0.2)}`,
            },
          },
          containedSecondary: {
            background: L ? "#0891b2" : "#0ea5e9",
            "&:hover": { background: L ? "#0369a1" : "#0891b2" },
          },
          outlinedPrimary: {
            borderColor: L ? alpha(T.brand, 0.4) : alpha("#818cf8", 0.4),
            color: palette.primary.main,
            "&:hover": {
              backgroundColor: palette.action.hover,
              borderColor: palette.primary.main,
            },
            "&:focus-visible": {
              outline: `2px solid ${palette.primary.main}`,
              outlineOffset: 2,
            },
          },
          outlinedInherit: {
            borderColor: palette.divider,
            "&:hover": { backgroundColor: palette.action.hover },
          },
          text: {
            "&:hover": { backgroundColor: palette.action.hover },
            "&:focus-visible": { outline: `2px solid ${palette.primary.main}`, outlineOffset: 2 },
          },
          textError: { color: palette.error.main, "&:hover": { backgroundColor: alpha(palette.error.main, 0.06) } },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 7,
            transition: "all 0.15s ease",
            "&:hover": { backgroundColor: palette.action.hover },
            "&:focus-visible": {
              outline: `2px solid ${palette.primary.main}`,
              outlineOffset: 2,
            },
            "&:active": { transform: "scale(0.95)" },
          },
          sizeSmall: { padding: 5 },
        },
      },

      // ── Paper / Card ───────────────────────────────────────────────────
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${palette.divider}`,
            borderRadius: 10,
            transition: "border-color 0.15s, box-shadow 0.15s",
          },
          elevation1: {
            boxShadow: L
              ? "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
              : "0 1px 3px rgba(0,0,0,0.3)",
            border: "none",
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${palette.divider}`,
            borderRadius: 10,
            boxShadow: "none",
          },
        },
      },

      // ── Inputs ────────────────────────────────────────────────────────
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
            borderRadius: 7,
            backgroundColor: L ? "#fff" : "rgba(255,255,255,0.04)",
            transition: "box-shadow 0.15s, border-color 0.15s",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: palette.divider,
              transition: "border-color 0.15s",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: L ? T.n400 : "rgba(148,163,184,0.4)",
            },
            "&.Mui-focused": {
              boxShadow: `0 0 0 3px ${alpha(palette.primary.main, 0.18)}`,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: palette.primary.main,
                borderWidth: "1.5px",
              },
            },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderColor: palette.error.main,
            },
            "&.Mui-error.Mui-focused": {
              boxShadow: `0 0 0 3px ${alpha(palette.error.main, 0.15)}`,
            },
          },
          input: {
            padding: "8px 12px",
            "&::placeholder": { opacity: 0.45 },
          },
          inputSizeSmall: { padding: "6px 10px" },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: palette.text.secondary,
            transform: "translate(12px, 9px) scale(1)",
            "&.MuiInputLabel-shrink": {
              transform: "translate(12px, -6px) scale(0.85)",
              color: palette.primary.main,
            },
          },
        },
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: { fontSize: "0.75rem", marginTop: 4 },
        },
      },

      MuiTextField: {
        defaultProps: { size: "small" },
      },

      MuiSelect: {
        styleOverrides: {
          root: { borderRadius: 7 },
          select: { fontSize: "0.875rem" },
        },
      },

      // ── Chip ──────────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            fontSize: "0.75rem",
            height: 24,
            borderRadius: 6,
            transition: "all 0.15s",
          },
          sizeSmall: { height: 20, fontSize: "0.6875rem", borderRadius: 5 },
          colorSuccess: {
            backgroundColor: L ? T.upBg : alpha("#34d399", 0.15),
            color: L ? T.up : "#34d399",
            border: `1px solid ${L ? T.upBorder : alpha("#34d399", 0.3)}`,
          },
          colorError: {
            backgroundColor: L ? T.downBg : alpha("#f87171", 0.15),
            color: L ? T.down : "#f87171",
            border: `1px solid ${L ? T.downBorder : alpha("#f87171", 0.3)}`,
          },
          colorWarning: {
            backgroundColor: L ? T.warnBg : alpha("#fbbf24", 0.15),
            color: L ? T.warn : "#fbbf24",
            border: `1px solid ${L ? T.warnBorder : alpha("#fbbf24", 0.3)}`,
          },
        },
      },

      // ── Dialog ────────────────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            border: `1px solid ${palette.divider}`,
            borderRadius: 12,
            boxShadow: L
              ? "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.07)"
              : "0 24px 48px rgba(0,0,0,0.5)",
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: { fontSize: "1rem", fontWeight: 600, paddingBottom: 8 },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: { paddingTop: "8px !important" },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: { padding: "12px 20px 16px", gap: 8 },
        },
      },

      // ── Divider ───────────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: palette.divider },
        },
      },

      // ── Popover ───────────────────────────────────────────────────────
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            border: `1px solid ${palette.divider}`,
            boxShadow: L
              ? "0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)"
              : "0 8px 24px rgba(0,0,0,0.4)",
          },
        },
      },

      // ── Tooltip ───────────────────────────────────────────────────────
      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: {
          tooltip: {
            fontSize: "0.75rem",
            fontWeight: 500,
            backgroundColor: L ? T.n800 : T.n700,
            color: "#fff",
            borderRadius: 5,
            padding: "5px 9px",
          },
          arrow: { color: L ? T.n800 : T.n700 },
        },
      },

      // ── Toggle buttons ────────────────────────────────────────────────
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontSize: "0.8125rem",
            fontWeight: 500,
            borderRadius: "7px !important",
            borderColor: palette.divider,
            color: palette.text.secondary,
            padding: "5px 14px",
            transition: "all 0.15s",
            "&.Mui-selected": {
              backgroundColor: palette.primary.main,
              color: "#fff",
              borderColor: palette.primary.main,
              "&:hover": { backgroundColor: palette.primary.dark },
            },
            "&:hover:not(.Mui-selected)": {
              backgroundColor: palette.action.hover,
              borderColor: L ? T.n300 : "rgba(148,163,184,0.3)",
            },
            "&:focus-visible": {
              outline: `2px solid ${palette.primary.main}`,
              outlineOffset: 2,
            },
          },
        },
      },

      MuiToggleButtonGroup: {
        styleOverrides: {
          root: { gap: 3, flexWrap: "wrap" },
          grouped: {
            "&:not(:first-of-type)": {
              borderLeft: `1px solid ${palette.divider}`,
              marginLeft: 0,
              borderRadius: "7px !important",
            },
            "&:first-of-type": { borderRadius: "7px !important" },
          },
        },
      },

      // ── Progress ──────────────────────────────────────────────────────
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 99,
            height: 4,
            backgroundColor: L ? T.n200 : "rgba(148,163,184,0.15)",
          },
          bar: { borderRadius: 99 },
        },
      },

      MuiCircularProgress: {
        defaultProps: { size: 24, thickness: 4 },
      },

      // ── Skeleton ──────────────────────────────────────────────────────
      MuiSkeleton: {
        defaultProps: { animation: "wave" },
        styleOverrides: {
          root: {
            backgroundColor: L ? T.n200 : "rgba(148,163,184,0.1)",
            borderRadius: 6,
            "&::after": {
              background: L
                ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"
                : "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
            },
          },
        },
      },

      // ── Avatar ────────────────────────────────────────────────────────
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: "0.8125rem",
            backgroundColor: L ? T.brandSoft : alpha("#818cf8", 0.2),
            color: L ? T.brand : "#818cf8",
          },
        },
      },

      // ── Badge ─────────────────────────────────────────────────────────
      MuiBadge: {
        styleOverrides: {
          badge: { fontWeight: 700, fontSize: "0.6875rem" },
        },
      },

      // ── Table ─────────────────────────────────────────────────────────
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottomColor: palette.divider,
            fontSize: "0.875rem",
            padding: "10px 16px",
          },
          head: {
            fontWeight: 600,
            fontSize: "0.8125rem",
            color: palette.text.secondary,
            backgroundColor: L ? T.n50 : "rgba(255,255,255,0.02)",
            letterSpacing: "0.03em",
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": { backgroundColor: L ? T.n50 : "rgba(255,255,255,0.02)" },
            "&:last-child td": { border: 0 },
          },
        },
      },

      // ── Alert ─────────────────────────────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8, fontSize: "0.875rem", fontWeight: 500 },
          standardSuccess: {
            backgroundColor: L ? T.upBg   : alpha("#34d399", 0.12),
            color: L ? T.up   : "#34d399",
            border: `1px solid ${L ? T.upBorder : alpha("#34d399", 0.25)}`,
          },
          standardError: {
            backgroundColor: L ? T.downBg : alpha("#f87171", 0.12),
            color: L ? T.down : "#f87171",
            border: `1px solid ${L ? T.downBorder : alpha("#f87171", 0.25)}`,
          },
          standardWarning: {
            backgroundColor: L ? T.warnBg : alpha("#fbbf24", 0.12),
            color: L ? T.warn : "#fbbf24",
            border: `1px solid ${L ? T.warnBorder : alpha("#fbbf24", 0.25)}`,
          },
        },
      },

      // ── Breadcrumbs ───────────────────────────────────────────────────
      MuiBreadcrumbs: {
        styleOverrides: {
          root: { fontSize: "0.8125rem" },
          separator: { color: palette.text.disabled },
        },
      },
    },
  });
}

export default buildTheme("light");

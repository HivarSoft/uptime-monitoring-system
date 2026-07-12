import React, { createContext, useContext, useState, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { buildTheme } from "./theme";
import type { PaletteMode } from "@mui/material";

interface ThemeCtx {
  mode: PaletteMode;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeCtx>({ mode: "light", toggle: () => {} });

export const useThemeMode = () => useContext(ThemeCtx);

const STORAGE_KEY = "pw-theme";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "dark" ? "dark" : "light";
  });

  const toggle = () =>
    setMode((m) => {
      const next = m === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeCtx.Provider value={{ mode, toggle }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeCtx.Provider>
  );
}

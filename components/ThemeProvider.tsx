"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ResolvedTheme } from "@/lib/themes";

const ThemeContext = createContext<ResolvedTheme | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

interface ThemeProviderProps {
  theme: ResolvedTheme;
  children: ReactNode;
}

export default function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const showPremiumBg = theme.mode === "dark";

  return (
    <ThemeContext.Provider value={theme}>
      <div
        data-theme={theme.style}
        data-mode={theme.mode}
        className="gradient-bg premium-bg min-h-screen"
        style={theme.cssVars as React.CSSProperties}
      >
        {showPremiumBg && (
          <>
            <div className="premium-bg__glow" aria-hidden="true">
              <div className="premium-bg__orb premium-bg__orb--primary" />
              <div className="premium-bg__orb premium-bg__orb--secondary" />
              <div className="premium-bg__orb premium-bg__orb--center" />
            </div>
            <div className="premium-bg__noise" aria-hidden="true" />
          </>
        )}
        <div className="premium-bg__content">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}

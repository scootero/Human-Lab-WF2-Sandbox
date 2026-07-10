import type { ThemeConfig } from "./appData";

export type ThemeStyle =
  | "liquid-glass"
  | "apple-light"
  | "apple-dark"
  | "midnight"
  | "aurora"
  | "black-titanium"
  | "minimal-white";

export interface ResolvedTheme {
  style: ThemeStyle;
  accentColor: string;
  mode: "light" | "dark";
  cssVars: Record<string, string>;
}

const ACCENT_PALETTE: Record<
  string,
  { accent: string; muted: string; glow: string; gradient: string }
> = {
  violet: {
    accent: "#7c3aed",
    muted: "#a78bfa",
    glow: "rgba(124, 58, 237, 0.35)",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
  },
  blue: {
    accent: "#2563eb",
    muted: "#60a5fa",
    glow: "rgba(37, 99, 235, 0.35)",
    gradient: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
  },
  emerald: {
    accent: "#059669",
    muted: "#34d399",
    glow: "rgba(5, 150, 105, 0.35)",
    gradient: "linear-gradient(135deg, #059669 0%, #14b8a6 100%)",
  },
  rose: {
    accent: "#e11d48",
    muted: "#fb7185",
    glow: "rgba(225, 29, 72, 0.35)",
    gradient: "linear-gradient(135deg, #e11d48 0%, #f97316 100%)",
  },
  amber: {
    accent: "#d97706",
    muted: "#fbbf24",
    glow: "rgba(217, 119, 6, 0.35)",
    gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
  },
  cyan: {
    accent: "#0891b2",
    muted: "#22d3ee",
    glow: "rgba(8, 145, 178, 0.35)",
    gradient: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
  },
};

const STYLE_BACKGROUNDS: Record<
  ThemeStyle,
  { bg: string; surface: string; elevated: string; foreground: string; muted: string; border: string }
> = {
  "liquid-glass": {
    bg: "linear-gradient(160deg, #f8f7ff 0%, #eef2ff 40%, #faf5ff 100%)",
    surface: "rgba(255, 255, 255, 0.55)",
    elevated: "rgba(255, 255, 255, 0.72)",
    foreground: "#0f172a",
    muted: "#64748b",
    border: "rgba(255, 255, 255, 0.6)",
  },
  "apple-light": {
    bg: "linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)",
    surface: "rgba(255, 255, 255, 0.9)",
    elevated: "#ffffff",
    foreground: "#1d1d1f",
    muted: "#86868b",
    border: "rgba(0, 0, 0, 0.08)",
  },
  "apple-dark": {
    bg: "linear-gradient(180deg, #1d1d1f 0%, #000000 100%)",
    surface: "rgba(44, 44, 46, 0.85)",
    elevated: "rgba(58, 58, 60, 0.95)",
    foreground: "#f5f5f7",
    muted: "#a1a1a6",
    border: "rgba(255, 255, 255, 0.12)",
  },
  midnight: {
    bg: "linear-gradient(165deg, #070b14 0%, #0f172a 28%, #131a2e 52%, #0c1220 78%, #070b14 100%)",
    surface: "rgba(22, 30, 48, 0.72)",
    elevated: "rgba(36, 48, 72, 0.88)",
    foreground: "#f1f5f9",
    muted: "#94a3b8",
    border: "rgba(148, 163, 184, 0.18)",
  },
  aurora: {
    bg: "linear-gradient(135deg, #0f172a 0%, #312e81 35%, #134e4a 70%, #0f172a 100%)",
    surface: "rgba(255, 255, 255, 0.08)",
    elevated: "rgba(255, 255, 255, 0.12)",
    foreground: "#f8fafc",
    muted: "#cbd5e1",
    border: "rgba(255, 255, 255, 0.15)",
  },
  "black-titanium": {
    bg: "linear-gradient(180deg, #0a0a0a 0%, #171717 50%, #0a0a0a 100%)",
    surface: "rgba(38, 38, 38, 0.85)",
    elevated: "rgba(64, 64, 64, 0.9)",
    foreground: "#fafafa",
    muted: "#a3a3a3",
    border: "rgba(255, 255, 255, 0.1)",
  },
  "minimal-white": {
    bg: "#ffffff",
    surface: "#fafafa",
    elevated: "#ffffff",
    foreground: "#171717",
    muted: "#737373",
    border: "rgba(0, 0, 0, 0.06)",
  },
};

function normalizeStyle(style: string): ThemeStyle {
  const valid: ThemeStyle[] = [
    "liquid-glass",
    "apple-light",
    "apple-dark",
    "midnight",
    "aurora",
    "black-titanium",
    "minimal-white",
  ];
  return valid.includes(style as ThemeStyle)
    ? (style as ThemeStyle)
    : "liquid-glass";
}

export function resolveTheme(theme: ThemeConfig): ResolvedTheme {
  const style = normalizeStyle(theme.style);
  const accentKey = theme.accentColor?.toLowerCase() ?? "violet";
  const accent = ACCENT_PALETTE[accentKey] ?? ACCENT_PALETTE.violet;
  const palette = STYLE_BACKGROUNDS[style];

  const isDark =
    theme.mode === "dark" ||
    ["apple-dark", "midnight", "aurora", "black-titanium"].includes(style);

  const mode = isDark ? "dark" : "light";

  return {
    style,
    accentColor: accentKey,
    mode,
    cssVars: {
      "--page-bg": palette.bg,
      "--surface": palette.surface,
      "--surface-elevated": palette.elevated,
      "--foreground": palette.foreground,
      "--muted": palette.muted,
      "--border": palette.border,
      "--accent": accent.accent,
      "--accent-muted": accent.muted,
      "--accent-glow": accent.glow,
      "--accent-gradient": accent.gradient,
      "--glass-blur": style === "liquid-glass" ? "20px" : "12px",
      "--glass-border": palette.border,
      "--glow-1": accent.glow,
      "--glow-2": `color-mix(in srgb, ${accent.muted} 25%, transparent)`,
      "--noise-opacity": isDark ? "0.045" : "0.025",
    },
  };
}

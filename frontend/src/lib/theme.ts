export const theme = {
  colors: {
    // Accent (Emerald)
    accent: "#10B981", // Tailwind emerald-500
    // Background layers
    bgBase: "#0B0D10",
    bgElevated: "#111418",
    bgPanel: "#161A20",
    bgHover: "#1C2128",
    bgActive: "#232A33",
    // Borders
    borderSubtle: "rgba(255,255,255,0.06)",
    borderDefault: "rgba(255,255,255,0.09)",
    borderStrong: "rgba(255,255,255,0.14)",
    // Text
    textPrimary: "#F5F7FA",
    textSecondary: "#B5BDC8",
    textMuted: "#7D8794",
    textDisabled: "#5D6670",
    // Semantic
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
} as const;

export type Theme = typeof theme;

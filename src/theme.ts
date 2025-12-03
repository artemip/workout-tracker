export const Theme = {
  colors: {
    // Backgrounds
    background: "#FFFFFF",
    surface: "#F9FAFB",

    // Borders
    border: "#E5E7EB",

    // Text
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",

    // Accent colors
    primary: "#3B82F6",
    success: "#059669",
    danger: "#DC2626",

    // Legacy (for backwards compatibility during migration)
    secondary: "#FFC107",
    accent: "#FF5722",
    error: "#DC2626",
    text: "#111827",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    // Legacy
    tiny: 4,
    small: 8,
    medium: 16,
    large: 24,
    huge: 32,
  },
  typography: {
    screenTitle: {
      fontSize: 24,
      fontWeight: "600" as const,
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: "600" as const,
      textTransform: "uppercase" as const,
    },
    body: {
      fontSize: 16,
      fontWeight: "400" as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: "400" as const,
    },
    largeDisplay: {
      fontSize: 48,
      fontWeight: "700" as const,
    },
  },
};

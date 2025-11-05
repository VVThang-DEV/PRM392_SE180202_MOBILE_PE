// CSFloat-inspired dark theme
export const COLORS = {
  // Primary dark background (CSFloat style)
  background: "#0f1923",
  surface: "#1a2332",
  card: "#1e2a3a",
  cardHover: "#243447",

  // Accent colors
  primary: "#3b82f6",
  primaryDark: "#2563eb",
  secondary: "#8b5cf6",
  accent: "#06b6d4",

  // Text colors
  text: "#e5e7eb",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",

  // Semantic colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",

  // Borders and dividers
  border: "#374151",
  divider: "#2d3748",

  // Special
  favorite: "#fbbf24",
  favoriteActive: "#f59e0b",

  // Overlay
  overlay: "rgba(15, 25, 35, 0.9)",
  modalBackground: "rgba(0, 0, 0, 0.8)",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    color: COLORS.text,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400",
    color: COLORS.textMuted,
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

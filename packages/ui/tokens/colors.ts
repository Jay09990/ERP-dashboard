export const blue = {
  25: "#F5F7FA",
  50: "#EBEEF5",
  100: "#D6DEEB",
  200: "#B3C2DB",
  300: "#8CA3CA",
  400: "#6483B9",
  500: "#4869A3",
  600: "#3A5788",
  700: "#2E446B",
  800: "#243552",
  900: "#1A2538",
  950: "#111722",
} as const;

export const warmWhite = {
  canvas: "#FFFBF4",
  subtle: "#FFF9F0",
  surface: "#FFFDF9",
  raised: "#FFFEFC",
} as const;

// Provisional until the original/Figma primitive export is available.
export const ink = {
  25: "#F5F5F4",
  50: "#EBEBE9",
  100: "#E0E0DD",
  200: "#C9C9C5",
  300: "#AFAFAB",
  400: "#92928E",
  500: "#757571",
  600: "#5E5E5A",
  700: "#454541",
  800: "#30302D",
  900: "#1C1C1B",
  950: "#121211",
} as const;

// Provisional status colors pending the original/Figma primitive export.
export const status = {
  success: { background: "#E5F0E8", foreground: "#285C3C" },
  warning: { background: "#F4EEDB", foreground: "#6A5315" },
  danger: { background: "#F3E4E2", foreground: "#7A3028" },
  info: { background: "#E4EDF2", foreground: "#2A5368" },
} as const;

export const semanticColors = {
  actionPrimary: blue[600],
  actionPrimaryHover: blue[700],
  actionPrimaryActive: blue[800],
  actionLink: blue[500],
  actionLinkHover: blue[600],
  focusRing: blue[600],
  selectedBackground: blue[25],
  selectedBorder: blue[200],
  navActiveBackground: blue[100],
  navActiveText: blue[700],
  checkboxChecked: blue[600],
} as const;

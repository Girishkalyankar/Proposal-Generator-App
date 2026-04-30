export interface PdfDesign {
  id: string
  name: string
  description: string
  preview: string // emoji or icon indicator
  colors: {
    primary: string
    primaryLight: string
    accent: string
    accentLight: string
    text: string
    textSecondary: string
    border: string
    bgSubtle: string
    success: string
    white: string
    coverBg: string
    coverText: string
  }
  style: "modern" | "classic" | "minimal" | "bold" | "elegant"
}

export const pdfDesigns: PdfDesign[] = [
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    description: "Professional navy blue design",
    preview: "🔵",
    colors: {
      primary: "#1e3a5f", primaryLight: "#2a5a8f", accent: "#0ea5e9", accentLight: "#e0f2fe",
      text: "#1a1a2e", textSecondary: "#64748b", border: "#e2e8f0", bgSubtle: "#f8fafc",
      success: "#10b981", white: "#ffffff", coverBg: "#1e3a5f", coverText: "#ffffff",
    },
    style: "modern",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    description: "Warm orange gradient feel",
    preview: "🟠",
    colors: {
      primary: "#c2410c", primaryLight: "#ea580c", accent: "#f97316", accentLight: "#fff7ed",
      text: "#1c1917", textSecondary: "#78716c", border: "#e7e5e4", bgSubtle: "#fafaf9",
      success: "#16a34a", white: "#ffffff", coverBg: "#c2410c", coverText: "#ffffff",
    },
    style: "bold",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    description: "Elegant purple theme",
    preview: "🟣",
    colors: {
      primary: "#581c87", primaryLight: "#7c3aed", accent: "#a855f7", accentLight: "#faf5ff",
      text: "#1e1b2e", textSecondary: "#6b7280", border: "#e5e7eb", bgSubtle: "#faf5ff",
      success: "#10b981", white: "#ffffff", coverBg: "#581c87", coverText: "#ffffff",
    },
    style: "elegant",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "Natural green tones",
    preview: "🟢",
    colors: {
      primary: "#14532d", primaryLight: "#166534", accent: "#22c55e", accentLight: "#f0fdf4",
      text: "#1a2e1a", textSecondary: "#6b7280", border: "#e2e8e0", bgSubtle: "#f7fdf7",
      success: "#22c55e", white: "#ffffff", coverBg: "#14532d", coverText: "#ffffff",
    },
    style: "classic",
  },
  {
    id: "minimal-black",
    name: "Minimal Black",
    description: "Clean black and white",
    preview: "⚫",
    colors: {
      primary: "#171717", primaryLight: "#404040", accent: "#525252", accentLight: "#f5f5f5",
      text: "#171717", textSecondary: "#737373", border: "#e5e5e5", bgSubtle: "#fafafa",
      success: "#22c55e", white: "#ffffff", coverBg: "#171717", coverText: "#ffffff",
    },
    style: "minimal",
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    description: "Calming teal palette",
    preview: "🩵",
    colors: {
      primary: "#0f766e", primaryLight: "#0d9488", accent: "#14b8a6", accentLight: "#f0fdfa",
      text: "#1a2e2e", textSecondary: "#64748b", border: "#e2e8f0", bgSubtle: "#f0fdfa",
      success: "#14b8a6", white: "#ffffff", coverBg: "#0f766e", coverText: "#ffffff",
    },
    style: "modern",
  },
  {
    id: "ruby-red",
    name: "Ruby Red",
    description: "Bold red design",
    preview: "🔴",
    colors: {
      primary: "#991b1b", primaryLight: "#dc2626", accent: "#ef4444", accentLight: "#fef2f2",
      text: "#1f1315", textSecondary: "#6b7280", border: "#e5e7eb", bgSubtle: "#fef2f2",
      success: "#22c55e", white: "#ffffff", coverBg: "#991b1b", coverText: "#ffffff",
    },
    style: "bold",
  },
  {
    id: "rose-pink",
    name: "Rose Pink",
    description: "Soft pink elegance",
    preview: "🩷",
    colors: {
      primary: "#9d174d", primaryLight: "#be185d", accent: "#ec4899", accentLight: "#fdf2f8",
      text: "#1a1a2e", textSecondary: "#6b7280", border: "#e5e7eb", bgSubtle: "#fdf2f8",
      success: "#10b981", white: "#ffffff", coverBg: "#9d174d", coverText: "#ffffff",
    },
    style: "elegant",
  },
  {
    id: "golden-luxury",
    name: "Golden Luxury",
    description: "Premium gold and dark theme",
    preview: "🟡",
    colors: {
      primary: "#1c1917", primaryLight: "#292524", accent: "#ca8a04", accentLight: "#fefce8",
      text: "#1c1917", textSecondary: "#78716c", border: "#d6d3d1", bgSubtle: "#fafaf9",
      success: "#ca8a04", white: "#ffffff", coverBg: "#1c1917", coverText: "#fbbf24",
    },
    style: "elegant",
  },
  {
    id: "sky-gradient",
    name: "Sky Gradient",
    description: "Light blue airy design",
    preview: "💙",
    colors: {
      primary: "#0369a1", primaryLight: "#0284c7", accent: "#38bdf8", accentLight: "#f0f9ff",
      text: "#0c4a6e", textSecondary: "#64748b", border: "#e0f2fe", bgSubtle: "#f0f9ff",
      success: "#10b981", white: "#ffffff", coverBg: "#0369a1", coverText: "#ffffff",
    },
    style: "modern",
  },
]

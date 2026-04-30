"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

function ColorThemeInit() {
  React.useEffect(() => {
    try {
      const t = localStorage.getItem("propify-color-theme")
      if (t && t !== "blue") {
        document.documentElement.classList.add(`theme-${t}`)
      }
    } catch {}
  }, [])
  return null
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ColorThemeInit />
      {children}
    </NextThemesProvider>
  )
}

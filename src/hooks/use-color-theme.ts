"use client"

import { useCallback, useSyncExternalStore } from "react"

export type ColorTheme = "blue" | "purple" | "orange" | "pink"

const STORAGE_KEY = "propify-color-theme"

function getSnapshot(): ColorTheme {
  if (typeof window === "undefined") return "blue"
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && ["blue", "purple", "orange", "pink"].includes(saved)) return saved as ColorTheme
  return "blue"
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

export function useColorTheme() {
  const colorTheme = useSyncExternalStore(subscribe, getSnapshot, () => "blue" as ColorTheme)

  const setColorTheme = useCallback((theme: ColorTheme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
    window.dispatchEvent(new Event("storage"))
  }, [])

  return { colorTheme, setColorTheme }
}

function applyTheme(theme: ColorTheme) {
  const root = document.documentElement
  root.classList.remove("theme-purple", "theme-orange", "theme-pink")
  if (theme !== "blue") {
    root.classList.add(`theme-${theme}`)
  }
}

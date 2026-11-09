"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { DEFAULT_SKIN, type SkinTheme, skinToStyle } from "@/lib/skin-system"

const STORAGE_KEY = "shadcn-skin"

export function SkinProvider({
  children,
  theme,
}: {
  children: React.ReactNode
  theme?: SkinTheme
}) {
  const { resolvedTheme } = useTheme()
  const [storedTheme, setStoredTheme] = React.useState<SkinTheme>(theme ?? DEFAULT_SKIN)

  React.useEffect(() => {
    if (theme) {
      setStoredTheme(theme)
      return
    }
    try {
      const value = localStorage.getItem(STORAGE_KEY)
      if (value) {
        const parsed = JSON.parse(value) as SkinTheme
        if (parsed.light && parsed.dark && parsed.name) setStoredTheme(parsed)
      }
    } catch {
      // Ignore invalid local themes and keep the default preset.
    }
  }, [theme])

  const mode = resolvedTheme === "dark" ? "dark" : "light"
  return (
    <div data-skin={storedTheme.name} style={skinToStyle(storedTheme, mode)}>
      {children}
    </div>
  )
}

export function useSkin() {
  const [skin, setSkin] = React.useState<SkinTheme>(DEFAULT_SKIN)
  React.useEffect(() => {
    try {
      const value = localStorage.getItem(STORAGE_KEY)
      if (value) setSkin(JSON.parse(value) as SkinTheme)
    } catch {
      setSkin(DEFAULT_SKIN)
    }
  }, [])
  const saveSkin = React.useCallback((next: SkinTheme) => {
    setSkin(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])
  return { skin, setSkin: saveSkin }
}

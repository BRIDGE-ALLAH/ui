"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  DEFAULT_SKIN,
  SKIN_STORAGE_KEY,
  normalizeSkin,
  skinToStyle,
  type SkinTheme,
} from "@/lib/skin-system"

type SkinContextValue = {
  skin: SkinTheme
  setSkin: (skin: SkinTheme) => void
}
const SkinContext = React.createContext<SkinContextValue | null>(null)

function notifySkinChange(skin: SkinTheme) {
  window.dispatchEvent(new CustomEvent("shadcn-skin-change", { detail: skin }))
}

export function SkinProvider({
  children,
  theme,
}: {
  children: React.ReactNode
  theme?: SkinTheme
}) {
  const { resolvedTheme } = useTheme()
  const [skin, setSkinState] = React.useState<SkinTheme>(() => normalizeSkin(theme ?? DEFAULT_SKIN))

  React.useEffect(() => {
    if (theme) {
      setSkinState(normalizeSkin(theme))
      return
    }
    const load = () => {
      try {
        const value = localStorage.getItem(SKIN_STORAGE_KEY)
        if (value) setSkinState(normalizeSkin(JSON.parse(value) as SkinTheme))
      } catch {
        setSkinState(DEFAULT_SKIN)
      }
    }
    const onCustom = (event: Event) => {
      const next = (event as CustomEvent<SkinTheme>).detail
      if (next?.light && next?.dark) setSkinState(normalizeSkin(next))
    }
    load()
    window.addEventListener("storage", load)
    window.addEventListener("shadcn-skin-change", onCustom)
    return () => {
      window.removeEventListener("storage", load)
      window.removeEventListener("shadcn-skin-change", onCustom)
    }
  }, [theme])

  const setSkin = React.useCallback((next: SkinTheme) => {
    const normalized = normalizeSkin(next)
    setSkinState(normalized)
    try {
      localStorage.setItem(SKIN_STORAGE_KEY, JSON.stringify(normalized))
      notifySkinChange(normalized)
    } catch {
      // The provider still updates for this session when storage is blocked.
    }
  }, [])

  const mode = resolvedTheme === "dark" ? "dark" : "light"
  const value = React.useMemo(() => ({ skin, setSkin }), [skin, setSkin])
  const direction = skin.artDirection ?? DEFAULT_SKIN.artDirection!
  return (
    <SkinContext.Provider value={value}>
      <div
        className="skin-root"
        data-skin={skin.name}
        data-skin-artwork={direction.artwork}
        data-skin-composition={direction.composition}
        data-skin-texture={direction.texture}
        data-skin-shape={direction.shape}
        data-skin-surface={direction.surface}
        style={skinToStyle(skin, mode)}
      >
        {children}
      </div>
    </SkinContext.Provider>
  )
}

export function useSkin() {
  const context = React.useContext(SkinContext)
  const [fallbackSkin, setFallbackSkin] = React.useState<SkinTheme>(DEFAULT_SKIN)

  React.useEffect(() => {
    try {
      const value = localStorage.getItem(SKIN_STORAGE_KEY)
      if (value) setFallbackSkin(normalizeSkin(JSON.parse(value) as SkinTheme))
    } catch {
      setFallbackSkin(DEFAULT_SKIN)
    }
    const onCustom = (event: Event) => {
      const next = (event as CustomEvent<SkinTheme>).detail
      if (next?.light && next?.dark) setFallbackSkin(normalizeSkin(next))
    }
    const onStorage = () => {
      try {
        const value = localStorage.getItem(SKIN_STORAGE_KEY)
        if (value) setFallbackSkin(normalizeSkin(JSON.parse(value) as SkinTheme))
      } catch {
        setFallbackSkin(DEFAULT_SKIN)
      }
    }
    window.addEventListener("shadcn-skin-change", onCustom)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("shadcn-skin-change", onCustom)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const setFallback = React.useCallback((next: SkinTheme) => {
    const normalized = normalizeSkin(next)
    setFallbackSkin(normalized)
    try {
      localStorage.setItem(SKIN_STORAGE_KEY, JSON.stringify(normalized))
      notifySkinChange(normalized)
    } catch {
      // Ignore storage failures; local state remains available.
    }
  }, [])

  return context ?? { skin: fallbackSkin, setSkin: setFallback }
}

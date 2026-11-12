"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  DEFAULT_SKIN,
  SKIN_STORAGE_KEY,
  normalizeSkin,
  skinToStyle,
  validateSkinTheme,
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

function readStoredSkin(): SkinTheme {
  try {
    const value = window.localStorage.getItem(SKIN_STORAGE_KEY)
    if (!value) return DEFAULT_SKIN
    const result = validateSkinTheme(JSON.parse(value) as unknown)
    return result.success ? result.data : DEFAULT_SKIN
  } catch {
    return DEFAULT_SKIN
  }
}

function getEventSkin(event: Event): SkinTheme | null {
  const result = validateSkinTheme((event as CustomEvent<unknown>).detail)
  return result.success ? result.data : null
}

export function SkinProvider({
  children,
  theme,
}: {
  children: React.ReactNode
  theme?: SkinTheme
}) {
  const { resolvedTheme } = useTheme()
  const [skin, setSkinState] = React.useState<SkinTheme>(() =>
    normalizeSkin(theme ?? DEFAULT_SKIN)
  )

  React.useEffect(() => {
    if (theme) {
      setSkinState(normalizeSkin(theme))
      return
    }

    const load = () => setSkinState(readStoredSkin())
    const onStorage = (event: StorageEvent) => {
      if (event.key === SKIN_STORAGE_KEY || event.key === null) load()
    }
    const onCustom = (event: Event) => {
      const next = getEventSkin(event)
      if (next) setSkinState(next)
    }

    load()
    window.addEventListener("storage", onStorage)
    window.addEventListener("shadcn-skin-change", onCustom)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("shadcn-skin-change", onCustom)
    }
  }, [theme])

  const setSkin = React.useCallback((next: SkinTheme) => {
    const result = validateSkinTheme(next)
    if (!result.success) return
    setSkinState(result.data)
    try {
      window.localStorage.setItem(SKIN_STORAGE_KEY, JSON.stringify(result.data))
    } catch {
      // In-memory updates remain available when browser storage is blocked.
    }
    notifySkinChange(result.data)
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
    const load = () => setFallbackSkin(readStoredSkin())
    const onStorage = (event: StorageEvent) => {
      if (event.key === SKIN_STORAGE_KEY || event.key === null) load()
    }
    const onCustom = (event: Event) => {
      const next = getEventSkin(event)
      if (next) setFallbackSkin(next)
    }

    load()
    window.addEventListener("shadcn-skin-change", onCustom)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("shadcn-skin-change", onCustom)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const setFallback = React.useCallback((next: SkinTheme) => {
    const result = validateSkinTheme(next)
    if (!result.success) return
    setFallbackSkin(result.data)
    try {
      window.localStorage.setItem(SKIN_STORAGE_KEY, JSON.stringify(result.data))
    } catch {
      // In-memory updates remain available when browser storage is blocked.
    }
    notifySkinChange(result.data)
  }, [])

  return context ?? { skin: fallbackSkin, setSkin: setFallback }
}

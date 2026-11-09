import * as React from "react"

import { SkinArtwork } from "@/components/skin-artwork"
import type { SkinArtworkKind } from "@/lib/skin-system"

type SkinSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  surface?: "canvas" | "card" | "panel" | "hero"
  artwork?: SkinArtworkKind
  artworkClassName?: string
}

export function SkinSurface({
  surface = "card",
  artwork,
  artworkClassName,
  className,
  children,
  ...props
}: SkinSurfaceProps) {
  return (
    <div
      data-skin-surface={surface}
      className={["skin-surface", `skin-surface--${surface}`, className].filter(Boolean).join(" ")}
      {...props}
    >
      {artwork && (
        <div aria-hidden="true" className={["skin-surface__artwork", artworkClassName].filter(Boolean).join(" ")}>
          <SkinArtwork variant={artwork} className="h-full w-full" />
        </div>
      )}
      <div className="skin-surface__content">{children}</div>
    </div>
  )
}

export function SkinHero({
  eyebrow,
  title,
  description,
  artwork,
  children,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  artwork?: SkinArtworkKind
  children?: React.ReactNode
  className?: string
}) {
  return (
    <SkinSurface surface="hero" artwork={artwork} className={className}>
      <div className="skin-hero__copy">
        {eyebrow && <p className="skin-hero__eyebrow">{eyebrow}</p>}
        <h1 className="skin-hero__title">{title}</h1>
        {description && <p className="skin-hero__description">{description}</p>}
        {children}
      </div>
    </SkinSurface>
  )
}

import * as React from "react"

import type { SkinArtworkKind } from "@/lib/skin-system"

export function SkinArtwork({
  variant = "topographic",
  className,
  title,
  description,
}: {
  variant?: SkinArtworkKind
  className?: string
  title?: string
  description?: string
}) {
  const id = React.useId()
  if (variant === "none") return null
  const titleId = `skin-artwork-title-${id}`
  const descriptionId = `skin-artwork-description-${id}`
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.15,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={title && description ? descriptionId : undefined}
      role={title ? "img" : undefined}
      viewBox="0 0 720 420"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title id={titleId}>{title}</title>}
      {title && description && <desc id={descriptionId}>{description}</desc>}
      {variant === "botanical" && (
        <g {...common}>
          <path d="M92 414C144 322 176 232 191 42M191 42C112 68 83 126 102 185C157 179 190 127 191 42ZM193 152C271 105 326 115 342 175C290 218 235 207 193 152ZM164 257C87 219 38 237 28 296C82 340 132 320 164 257ZM193 316C264 266 318 280 330 339C279 378 231 368 193 316Z" />
          <path d="M470 428C461 315 489 211 566 85M566 85C493 98 453 145 460 202C514 213 552 167 566 85ZM521 216C585 169 639 181 655 234C609 272 559 265 521 216Z" />
          <circle cx="566" cy="85" r="9" fill="currentColor" opacity=".12" />
        </g>
      )}
      {variant === "orbit" && (
        <g {...common}>
          <ellipse cx="376" cy="214" rx="260" ry="94" transform="rotate(-24 376 214)" />
          <ellipse cx="376" cy="214" rx="260" ry="94" transform="rotate(32 376 214)" />
          <ellipse cx="376" cy="214" rx="260" ry="94" transform="rotate(82 376 214)" />
          <circle cx="376" cy="214" r="58" fill="currentColor" opacity=".08" />
          <circle cx="376" cy="214" r="23" fill="currentColor" opacity=".18" />
          <circle cx="576" cy="98" r="8" fill="currentColor" />
          <circle cx="151" cy="310" r="5" fill="currentColor" />
        </g>
      )}
      {variant === "topographic" && (
        <g {...common}>
          {Array.from({ length: 10 }, (_, index) => (
            <path key={index} d="M-40 330C70 250 92 90 236 81C375 72 390 203 525 170C625 146 660 58 770 32" transform={`translate(0 ${index * 13 - 50})`} opacity={1 - index * .055} />
          ))}
          <path d="M412 0C346 69 348 129 424 169C501 209 512 280 451 420" strokeDasharray="3 9" opacity=".55" />
        </g>
      )}
      {variant === "geometry" && (
        <g {...common}>
          <path d="M90 330 230 70 370 330Z" fill="currentColor" opacity=".07" />
          <path d="M230 70 370 330 510 70Z" fill="currentColor" opacity=".12" />
          <path d="M370 330 510 70 650 330Z" fill="currentColor" opacity=".06" />
          <circle cx="510" cy="190" r="92" />
          <circle cx="510" cy="190" r="58" strokeDasharray="4 8" />
          <path d="M44 370H675M44 50H675" strokeDasharray="2 10" opacity=".5" />
        </g>
      )}
      {variant === "collage" && (
        <g {...common}>
          <circle cx="180" cy="172" r="112" fill="currentColor" opacity=".1" />
          <path d="M180 60C242 87 292 146 292 220C292 276 248 321 193 321C128 321 70 263 70 196C70 125 118 82 180 60Z" />
          <path d="M366 48 675 120 554 372 316 275Z" fill="currentColor" opacity=".08" />
          <path d="M403 79 616 133 530 316 362 249Z" />
          <path d="M75 364 245 274 337 415H75Z" fill="currentColor" opacity=".16" />
          <circle cx="590" cy="74" r="20" fill="currentColor" />
        </g>
      )}
      {variant === "stained-glass" && (
        <g {...common}>
          <path d="M360 18 520 85 650 220 552 368 360 402 168 368 70 220 200 85Z" />
          <path d="M360 18V402M70 220H650M200 85 552 368M520 85 168 368" />
          <path d="M360 18 200 85 70 220 168 368 360 402 552 368 650 220 520 85Z" fill="currentColor" opacity=".08" />
          <circle cx="360" cy="220" r="76" fill="currentColor" opacity=".14" />
          <circle cx="360" cy="220" r="120" />
        </g>
      )}
    </svg>
  )
}

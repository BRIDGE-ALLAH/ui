import {
  SKIN_PRESETS,
  type SkinTokens,
} from "../lib/skin-system"

type Pair = {
  foreground: keyof SkinTokens
  background: keyof SkinTokens
  minimum: number
  category: "text" | "non-text"
}

const pairs: Pair[] = [
  { foreground: "foreground", background: "background", minimum: 4.5, category: "text" },
  { foreground: "cardForeground", background: "card", minimum: 4.5, category: "text" },
  { foreground: "popoverForeground", background: "popover", minimum: 4.5, category: "text" },
  { foreground: "primaryForeground", background: "primary", minimum: 4.5, category: "text" },
  { foreground: "secondaryForeground", background: "secondary", minimum: 4.5, category: "text" },
  { foreground: "mutedForeground", background: "muted", minimum: 4.5, category: "text" },
  { foreground: "accentForeground", background: "accent", minimum: 4.5, category: "text" },
  { foreground: "destructiveForeground", background: "destructive", minimum: 4.5, category: "text" },
  { foreground: "sidebarForeground", background: "sidebar", minimum: 4.5, category: "text" },
  { foreground: "sidebarPrimaryForeground", background: "sidebarPrimary", minimum: 4.5, category: "text" },
  { foreground: "sidebarAccentForeground", background: "sidebarAccent", minimum: 4.5, category: "text" },
  { foreground: "surfaceForeground", background: "surface", minimum: 4.5, category: "text" },
  { foreground: "codeForeground", background: "code", minimum: 4.5, category: "text" },
  { foreground: "codeNumber", background: "code", minimum: 4.5, category: "text" },
  { foreground: "selectionForeground", background: "selection", minimum: 4.5, category: "text" },
  { foreground: "input", background: "background", minimum: 3, category: "non-text" },
  { foreground: "ring", background: "background", minimum: 3, category: "non-text" },
  { foreground: "sidebarRing", background: "sidebar", minimum: 3, category: "non-text" },
  { foreground: "chart1", background: "background", minimum: 3, category: "non-text" },
  { foreground: "chart2", background: "background", minimum: 3, category: "non-text" },
  { foreground: "chart3", background: "background", minimum: 3, category: "non-text" },
  { foreground: "chart4", background: "background", minimum: 3, category: "non-text" },
  { foreground: "chart5", background: "background", minimum: 3, category: "non-text" },
]

function luminance(hex: string) {
  const value = hex.replace("#", "")
  const normalized =
    value.length === 3
      ? value.split("").map((part) => part + part).join("")
      : value
  const channels = [0, 2, 4].map(
    (offset) => parseInt(normalized.slice(offset, offset + 2), 16) / 255
  )
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  )
  return (
    linear[0] * 0.2126 +
    linear[1] * 0.7152 +
    linear[2] * 0.0722
  )
}

function contrastRatio(foreground: string, background: string) {
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

const results = SKIN_PRESETS.flatMap((skin) =>
  (["light", "dark"] as const).map((mode) => {
    const tokens = skin[mode]
    const checks = pairs.map((pair) => ({
      ...pair,
      ratio: contrastRatio(tokens[pair.foreground], tokens[pair.background]),
    }))
    const failures = checks.filter((check) => check.ratio < check.minimum)
    const textChecks = checks.filter((check) => check.category === "text")
    const nonTextChecks = checks.filter((check) => check.category === "non-text")
    const weakestText = textChecks.reduce((a, b) => (a.ratio < b.ratio ? a : b))
    const weakestNonText = nonTextChecks.reduce((a, b) => (a.ratio < b.ratio ? a : b))
    return {
      skin: skin.label,
      mode,
      text: weakestText,
      nonText: weakestNonText,
      failures,
    }
  })
)

console.log("| Skin | Mode | Minimum text ratio | Weakest text pair | Minimum non-text ratio | Weakest non-text pair | Result |")
console.log("| --- | --- | ---: | --- | ---: | --- | --- |")
for (const result of results) {
  console.log(
    `| ${result.skin} | ${result.mode} | ${result.text.ratio.toFixed(2)}:1 | ${result.text.foreground}/${result.text.background} | ${result.nonText.ratio.toFixed(2)}:1 | ${result.nonText.foreground}/${result.nonText.background} | ${result.failures.length ? "FAIL" : "PASS"} |`
  )
}
const failureCount = results.reduce((count, result) => count + result.failures.length, 0)
if (failureCount > 0) {
  console.error(`Contrast audit failed: ${failureCount} token pairs are below their required thresholds.`)
  process.exitCode = 1
} else {
  console.log(`All ${results.length} preset/mode combinations passed the configured token contrast checks.`)
}

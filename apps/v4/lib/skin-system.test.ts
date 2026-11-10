import postcss from "postcss"
import { describe, expect, it } from "vitest"

import {
  DEFAULT_ART_DIRECTION,
  DEFAULT_SKIN,
  SKIN_PRESETS,
  normalizeSkin,
  skinToCss,
  skinToRegistryItem,
  skinToStyle,
  type SkinTheme,
} from "./skin-system"

describe("Skin System pure utilities", () => {
  it("normalizes all authored presets without losing their narratives", () => {
    expect(SKIN_PRESETS).toHaveLength(9)

    for (const preset of SKIN_PRESETS) {
      const normalized = normalizeSkin(preset)

      expect(normalized.name).toBe(preset.name)
      expect(normalized.label).toBe(preset.label)
      expect(normalized.artDirection?.name).toBe(preset.artDirection?.name)
      expect(normalized.artDirection?.narrative).toEqual(
        preset.artDirection?.narrative
      )
      expect(normalized.light).toEqual(preset.light)
      expect(normalized.dark).toEqual(preset.dark)
    }
  })

  it("fills missing art direction and narrative fields with safe defaults", () => {
    const partial = normalizeSkin({
      ...DEFAULT_SKIN,
      artDirection: {
        ...DEFAULT_ART_DIRECTION,
        narrative: {
          ...DEFAULT_ART_DIRECTION.narrative,
          title: "A custom title",
        },
      },
    })

    expect(partial.artDirection?.narrative.title).toBe("A custom title")
    expect(partial.artDirection?.narrative.thesis).toBe(
      DEFAULT_ART_DIRECTION.narrative.thesis
    )
    expect(partial.artDirection?.artwork).toBe(DEFAULT_ART_DIRECTION.artwork)
  })

  it("keeps light and dark semantic tokens independent", () => {
    const theme = normalizeSkin({
      ...DEFAULT_SKIN,
      light: { ...DEFAULT_SKIN.light, background: "#ffffff" },
      dark: { ...DEFAULT_SKIN.dark, background: "#000000" },
    })

    expect(theme.light.background).toBe("#ffffff")
    expect(theme.dark.background).toBe("#000000")
  })

  it("maps the selected mode and craft settings to CSS custom properties", () => {
    const theme: SkinTheme = {
      ...DEFAULT_SKIN,
      density: "compact",
      shadow: "none",
      radius: 12,
    }
    const style = skinToStyle(theme, "light")

    expect(style["--background"]).toBe(theme.light.background)
    expect(style["--skin-density-factor"]).toBe("0.82")
    expect(style["--skin-card-shadow"]).toBe("none")
    expect(style["--radius"]).toBe("12px")
  })

  it("emits parseable CSS text with real line breaks for every preset", () => {
    for (const preset of SKIN_PRESETS) {
      const css = skinToCss(preset)

      expect(css).toContain("\n")
      expect(css).not.toContain("\\n")
      expect(css).toContain(":root {\n")
      expect(css).toContain("\n.dark {\n")
      expect(css).toContain("\n[data-skin] {\n")
      expect(css).toContain("--skin-heading-font:")
      expect(css).toContain("--skin-motion-duration:")
      expect(() => postcss.parse(css)).not.toThrow()
    }
  })

  it("exports registry token maps and art-direction metadata", () => {
    const item = skinToRegistryItem(DEFAULT_SKIN)

    expect(item.type).toBe("registry:theme")
    expect(item.cssVars.light.background).toBe(DEFAULT_SKIN.light.background)
    expect(item.cssVars.dark.background).toBe(DEFAULT_SKIN.dark.background)
    expect(item.meta["skin-art-direction"]).toContain(
      DEFAULT_SKIN.artDirection?.name
    )
    expect(item.meta["skin-craft"]).toContain(DEFAULT_SKIN.density)
  })
})

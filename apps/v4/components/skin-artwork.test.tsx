import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { SkinArtwork } from "./skin-artwork"

describe("SkinArtwork accessibility", () => {
  it("hides decorative artwork from assistive technology by default", () => {
    const markup = renderToStaticMarkup(<SkinArtwork variant="botanical" />)

    expect(markup).toContain('aria-hidden="true"')
    expect(markup).not.toContain('role="img"')
  })

  it("exposes a meaningful title and description when provided", () => {
    const markup = renderToStaticMarkup(
      <SkinArtwork
        variant="orbit"
        title="Orbital artwork"
        description="Concentric paths express a connected system."
      />
    )

    expect(markup).toContain('role="img"')
    expect(markup).toContain("<title")
    expect(markup).toContain("Orbital artwork")
    expect(markup).toContain("<desc")
    expect(markup).toContain("Concentric paths express a connected system.")
    expect(markup).toContain("aria-labelledby=")
    expect(markup).toContain("aria-describedby=")
  })

  it("renders nothing for the no-artwork direction", () => {
    expect(renderToStaticMarkup(<SkinArtwork variant="none" />)).toBe("")
  })
})

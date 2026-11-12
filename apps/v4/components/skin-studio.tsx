"use client"

import * as React from "react"
import { IconCheck, IconCopy, IconDownload, IconMoon, IconSun, IconUpload } from "@tabler/icons-react"

import { SkinArtwork } from "@/components/skin-artwork"
import { useSkin } from "@/components/skin-provider"
import {
  DEFAULT_SKIN,
  SKIN_PRESETS,
  SKIN_TOKEN_LABELS,
  SKIN_STORAGE_KEY,
  SKIN_CUSTOM_STORAGE_KEY,
  buildCustomSkin,
  parseCustomSkinLibrary,
  serializeCustomSkinLibrary,
  normalizeSkin,
  parseSkinImport,
  validateSkinTheme,
  skinToCss,
  skinToRegistryItem,
  skinToStyle,
  type SkinArtDirection,
  type SkinMode,
  type SkinTheme,
  type SkinTokens,
} from "@/lib/skin-system"

type StudioTab = "identity" | "palette" | "craft" | "export"
type ExportFormat = "css" | "json"

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="block min-w-0 space-y-2">
      <legend className="block text-sm font-medium">{label}</legend>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </fieldset>
  )
}

function Choice<T extends string>({
  value, options, onChange,
}: {
  value: T
  options: { value: T; label: string; description?: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`rounded-lg border px-3 py-2 text-left transition ${value === option.value ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:border-foreground/30"}`}
        >
          <span className="block text-sm font-medium">{option.label}</span>
          {option.description && <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>}
        </button>
      ))}
    </div>
  )
}

export function SkinStudio() {
  const { skin: appliedSkin, setSkin: applySkin } = useSkin()
  const [theme, setTheme] = React.useState<SkinTheme>(DEFAULT_SKIN)
  const [savedTheme, setSavedTheme] = React.useState<SkinTheme>(DEFAULT_SKIN)
  const [customSkins, setCustomSkins] = React.useState<SkinTheme[]>([])
  const [mode, setMode] = React.useState<SkinMode>("light")
  const [tab, setTab] = React.useState<StudioTab>("identity")
  const [format, setFormat] = React.useState<ExportFormat>("css")
  const [copied, setCopied] = React.useState(false)
  const [importValue, setImportValue] = React.useState("")
  const [notice, setNotice] = React.useState("")

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(SKIN_STORAGE_KEY)
      if (saved) {
        const result = validateSkinTheme(JSON.parse(saved) as unknown)
        const initial = result.success ? result.data : DEFAULT_SKIN
        setTheme(initial)
        setSavedTheme(initial)
      }
      const savedCustom = localStorage.getItem(SKIN_CUSTOM_STORAGE_KEY)
      if (savedCustom) {
        const result = parseCustomSkinLibrary(savedCustom)
        if (result.success) setCustomSkins(result.data)
        else setNotice(result.error)
      }
    } catch {
      setTheme(DEFAULT_SKIN)
    }
  }, [])

  const normalized = React.useMemo(() => normalizeSkin(theme), [theme])
  const isDirty = React.useMemo(
    () => JSON.stringify(normalizeSkin(theme)) !== JSON.stringify(normalizeSkin(savedTheme)),
    [theme, savedTheme]
  )
  const isApplied = React.useMemo(
    () => JSON.stringify(normalizeSkin(theme)) === JSON.stringify(normalizeSkin(appliedSkin)),
    [theme, appliedSkin]
  )
  const isCustomSaved = customSkins.some(
    (skin) => skin.name === theme.name && JSON.stringify(normalizeSkin(skin)) === JSON.stringify(normalized)
  )
  const direction = normalized.artDirection!
  React.useEffect(() => {
    if (!isDirty) return
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warnBeforeUnload)
    return () => window.removeEventListener("beforeunload", warnBeforeUnload)
  }, [isDirty])

  const output = React.useMemo(
    () => format === "css" ? skinToCss(normalized) : JSON.stringify(skinToRegistryItem(normalized), null, 2),
    [format, normalized]
  )

  function update<K extends keyof SkinTheme>(key: K, value: SkinTheme[K]) {
    setTheme((current) => ({ ...current, [key]: value }))
  }
  function updateToken(token: keyof SkinTokens, value: string) {
    setTheme((current) => {
      const next = normalizeSkin(current)
      return { ...next, [mode]: { ...next[mode], [token]: value } }
    })
  }
  function updateDirection<K extends keyof SkinArtDirection>(key: K, value: SkinArtDirection[K]) {
    setTheme((current) => {
      const next = normalizeSkin(current)
      return { ...next, artDirection: { ...next.artDirection!, [key]: value } }
    })
  }
  function updateKeywords(value: string) {
    setTheme((current) => {
      const next = normalizeSkin(current)
      return {
        ...next,
        artDirection: {
          ...next.artDirection!,
          narrative: {
            ...next.artDirection!.narrative,
            keywords: value.split(",").map((word) => word.trim()).filter(Boolean),
          },
        },
      }
    })
  }

  function updateNarrative(key: Exclude<keyof SkinArtDirection["narrative"], "keywords">, value: string) {
    setTheme((current) => {
      const next = normalizeSkin(current)
      return { ...next, artDirection: { ...next.artDirection!, narrative: { ...next.artDirection!.narrative, [key]: value } } }
    })
  }

  function downloadArtwork() {
    const source = document.querySelector<SVGSVGElement>("[data-skin-preview-artwork] svg")
    if (!source) {
      setNotice("This art direction has no vector artwork to export.")
      return
    }

    const artwork = source.cloneNode(true) as SVGSVGElement
    const namespace = "http://www.w3.org/2000/svg"
    const titleId = "skin-artwork-export-title"
    const descriptionId = "skin-artwork-export-description"

    artwork.setAttribute("xmlns", namespace)
    artwork.setAttribute("width", "1440")
    artwork.setAttribute("height", "840")
    artwork.setAttribute("viewBox", source.getAttribute("viewBox") || "0 0 720 420")
    artwork.setAttribute("preserveAspectRatio", source.getAttribute("preserveAspectRatio") || "xMidYMid meet")
    artwork.setAttribute("role", "img")
    artwork.setAttribute("aria-labelledby", titleId)
    artwork.setAttribute("aria-describedby", descriptionId)
    artwork.removeAttribute("aria-hidden")
    artwork.removeAttribute("aria-label")
    artwork.removeAttribute("class")
    artwork.setAttribute("style", `color: ${normalized[mode].primary};`)

    artwork.querySelectorAll(":scope > title, :scope > desc").forEach((node) => node.remove())
    const title = document.createElementNS(namespace, "title")
    title.setAttribute("id", titleId)
    title.textContent = `${normalized.label} — ${direction.name}`
    const description = document.createElementNS(namespace, "desc")
    description.setAttribute("id", descriptionId)
    description.textContent = direction.narrative.thesis
    artwork.insertBefore(description, artwork.firstChild)
    artwork.insertBefore(title, description)

    const markup = new XMLSerializer().serializeToString(artwork)
    downloadFile(`${theme.name}-artwork.svg`, markup, "image/svg+xml;charset=utf-8")
    setNotice("Accessible, self-contained SVG artwork downloaded for the selected color mode.")
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
      setNotice(`Copied the ${isDirty ? "unsaved draft" : isApplied ? "applied visual identity" : "saved visual identity"} export to the clipboard.`)
    } catch {
      setNotice("Clipboard access is unavailable. Select and copy the export below.")
    }
  }

  function persistCustomSkins(next: SkinTheme[]) {
    if (next.length > 100) {
      setNotice("The custom skin library is limited to 100 skins. Delete one before adding another.")
      return false
    }

    const serialized = serializeCustomSkinLibrary(next)
    if (new Blob([serialized]).size > 512_000) {
      setNotice("The custom skin library exceeds the 512 KB storage limit. Remove or simplify a skin.")
      return false
    }

    try {
      localStorage.setItem(SKIN_CUSTOM_STORAGE_KEY, serialized)
      setCustomSkins(next)
      return true
    } catch {
      setNotice("Browser storage is unavailable. Custom skin library changes were not saved.")
      return false
    }
  }

  function uniqueSkinName(base: string) {
    const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "custom-skin"
    const existing = new Set([...SKIN_PRESETS, ...customSkins].map((skin) => skin.name))
    let candidate = slug
    let suffix = 2
    while (existing.has(candidate)) {
      candidate = `${slug}-${suffix}`
      suffix += 1
    }
    return candidate
  }

  function replaceDraft(next: SkinTheme, action: string) {
    if (isDirty && !window.confirm("Discard your unsaved Skin Studio changes and " + action + "?")) return false
    setTheme(normalizeSkin(next))
    return true
  }

  function createCustomFrom(source: SkinTheme, kind: "custom" | "copy") {
    const name = uniqueSkinName(`${source.name}-${kind}`)
    const label = (kind === "copy" ? `${source.label} Copy` : `${source.label} Custom`).slice(0, 80)
    const result = buildCustomSkin(source, name, label)
    if (!result.success) {
      setNotice(result.error)
      return
    }
    const next = [...customSkins, result.data]
    if (!persistCustomSkins(next)) return
    setTheme(result.data)
    setNotice(`${label} created and saved to your browser library. Save it to apply it to the app.`)
  }

  function renameCustom(source: SkinTheme) {
    const label = window.prompt("Rename custom visual identity", source.label)
    if (label === null) return
    const nextLabel = label.trim()
    const name = nextLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64)
    if (!nextLabel || !name) {
      setNotice("A custom skin name must contain letters or numbers.")
      return
    }
    const collision = [...SKIN_PRESETS, ...customSkins].some(
      (skin) => skin.name === name && skin.name !== source.name
    )
    if (collision) {
      setNotice("That custom skin name is already in use. Choose a different name.")
      return
    }
    const result = buildCustomSkin(source, name, nextLabel)
    if (!result.success) {
      setNotice(result.error)
      return
    }
    if (theme.name === source.name && isDirty && !window.confirm("Replace the unsaved draft with the renamed custom skin?")) return
    const next = customSkins.map((skin) => skin.name === source.name ? result.data : skin)
    if (!persistCustomSkins(next)) return
    if (theme.name === source.name) setTheme(result.data)
    if (savedTheme.name === source.name) setSavedTheme(result.data)
    if (savedTheme.name === source.name || appliedSkin.name === source.name) applySkin(result.data)
    setNotice("Custom skin renamed.")
  }

  function deleteCustom(source: SkinTheme) {
    if (!window.confirm(`Delete "${source.label}" from your custom skin library?${theme.name === source.name && isDirty ? " Unsaved changes to this skin will also be discarded." : ""}`)) return
    const next = customSkins.filter((skin) => skin.name !== source.name)
    if (!persistCustomSkins(next)) return
    if (theme.name === source.name) setTheme(DEFAULT_SKIN)
    if (savedTheme.name === source.name) setSavedTheme(DEFAULT_SKIN)
    if (appliedSkin.name === source.name || savedTheme.name === source.name) applySkin(DEFAULT_SKIN)
    setNotice("Custom skin deleted from this browser.")
  }

  function saveTheme() {
    const result = validateSkinTheme(theme)
    if (!result.success) {
      setNotice(result.error)
      return
    }
    const next = result.data
    const isBuiltIn = SKIN_PRESETS.some((preset) => preset.name === next.name)
    let nextCustom = customSkins
    if (!isBuiltIn) {
      nextCustom = customSkins.some((skin) => skin.name === next.name)
        ? customSkins.map((skin) => skin.name === next.name ? next : skin)
        : [...customSkins, next]
      if (!persistCustomSkins(nextCustom)) return
    }
    applySkin(next)
    setTheme(next)
    setSavedTheme(next)
    setNotice("Visual identity applied. Browser persistence is available when local storage is permitted.")
  }

  function resetTheme() {
    if (!window.confirm("Reset the current draft to the canonical default skin?")) return
    setTheme(DEFAULT_SKIN)
    setNotice("Draft reset to the canonical default. Save to apply it.")
  }

  function importTheme() {
    const result = parseSkinImport(importValue)
    if (!result.success) {
      setNotice(`Import rejected: ${result.error}`)
      return
    }
    if (!replaceDraft(result.data, "import this theme")) return
    setNotice("Theme imported and validated. Review the draft, then save it to apply.")
  }

  const spacing = normalized.density === "compact" ? "p-3" : "p-5"
  const tabs: { value: StudioTab; label: string; detail: string }[] = [
    { value: "identity", label: "Art direction", detail: "Narrative, composition & artwork" },
    { value: "palette", label: "Color language", detail: "Semantic light/dark tokens" },
    { value: "craft", label: "Design craft", detail: "Type, shape, density & motion" },
    { value: "export", label: "Ship it", detail: "CSS, registry JSON & import" },
  ]

  return (
    <div className="space-y-7">
      <header className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 text-primary opacity-25">
          <SkinArtwork variant={direction.artwork} className="h-full w-full" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Visual identity engine / v2</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">A skin is a world, not a color.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Shape the atmosphere, visual grammar, artwork, and component behavior of an interface.
            Build a point of view, then carry it consistently from the hero canvas to the smallest control.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={saveTheme} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">Save visual identity</button>
            <span className="text-xs text-muted-foreground">{normalized.label} · {direction.name}</span>
            <span role="status" aria-live="polite" className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {isDirty ? (isCustomSaved ? "Saved in library · not applied" : "Unsaved draft") : isApplied ? "Saved and applied" : "Saved · not applied"}
            </span>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
        <section className="min-w-0 space-y-5">
          <nav aria-label="Skin studio sections" className="grid grid-cols-2 gap-2 rounded-2xl border bg-muted/40 p-2 lg:grid-cols-4">
            {tabs.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-current={tab === item.value ? "step" : undefined}
                aria-pressed={tab === item.value}
                onClick={() => setTab(item.value)}
                className={`rounded-xl px-3 py-3 text-left transition ${tab === item.value ? "bg-background shadow-sm ring-1 ring-border" : "hover:bg-background/70"}`}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 hidden text-[11px] leading-4 text-muted-foreground md:block">{item.detail}</span>
              </button>
            ))}
          </nav>

          {tab === "identity" && (
            <div className="space-y-6">
              <section className="space-y-3">
                <div><h2 className="text-lg font-semibold">Choose an art direction</h2><p className="text-sm text-muted-foreground">Each preset is a visual thesis: it changes the language, not just the palette.</p></div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => createCustomFrom(DEFAULT_SKIN, "custom")} className="rounded-lg border px-3 py-2 text-sm">Create from default</button>
                  <button type="button" onClick={() => createCustomFrom(theme, "copy")} className="rounded-lg border px-3 py-2 text-sm">Duplicate current draft</button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SKIN_PRESETS.map((preset) => {
                    const presetArt = normalizeSkin(preset).artDirection!
                    return (
                      <button type="button" key={preset.name} aria-pressed={theme.name === preset.name} onClick={() => replaceDraft(preset, "switch to this preset")} className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary ${theme.name === preset.name ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                        <div className="absolute -right-6 -top-7 size-32 text-primary opacity-20 transition group-hover:scale-110">
                          <SkinArtwork variant={presetArt.artwork} className="h-full w-full" />
                        </div>
                        <span className="relative block text-sm font-semibold">{preset.label}</span>
                        <span className="relative mt-1 block pr-10 text-xs leading-5 text-muted-foreground">{presetArt.narrative.thesis}</span>
                        <span className="relative mt-3 inline-flex rounded-full bg-muted px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">{presetArt.name}</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-3 rounded-2xl border p-4 md:p-5">
                <div>
                  <h2 className="font-semibold">Custom skin library</h2>
                  <p className="text-sm text-muted-foreground">Custom skins are stored locally in this browser. Built-in presets remain unchanged.</p>
                </div>
                {customSkins.length === 0 ? (
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">No custom skins yet. Create one from the default or duplicate the current draft.</p>
                ) : (
                  <div className="space-y-2">
                    {customSkins.map((custom) => (
                      <div key={custom.name} className="flex flex-wrap items-center gap-2 rounded-xl border p-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{custom.label}</p>
                          <p className="text-xs text-muted-foreground">{custom.name}</p>
                        </div>
                        <button type="button" onClick={() => replaceDraft(custom, "open this custom skin")} className="rounded-md border px-2.5 py-1.5 text-xs">Open</button>
                        <button type="button" onClick={() => createCustomFrom(custom, "copy")} className="rounded-md border px-2.5 py-1.5 text-xs">Duplicate</button>
                        <button type="button" onClick={() => renameCustom(custom)} className="rounded-md border px-2.5 py-1.5 text-xs">Rename</button>
                        <button type="button" onClick={() => deleteCustom(custom)} className="rounded-md border px-2.5 py-1.5 text-xs text-destructive">Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section className="space-y-4 rounded-2xl border p-4 md:p-5">
                <div><h2 className="font-semibold">Write the visual narrative</h2><p className="text-sm text-muted-foreground">Give the system its own premise, mood, and voice. These become reusable design metadata.</p></div>
                <Field label="Skin name"><input aria-label="Skin name" value={theme.label} onChange={(event) => update("label", event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
                <Field label="Narrative title"><input aria-label="Narrative title" value={direction.narrative.title} onChange={(event) => updateNarrative("title", event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
                <Field label="Design thesis" hint="The one-sentence idea behind the visual identity."><textarea aria-label="Design thesis" rows={2} value={direction.narrative.thesis} onChange={(event) => updateNarrative("thesis", event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Atmosphere"><textarea aria-label="Atmosphere" rows={2} value={direction.narrative.atmosphere} onChange={(event) => updateNarrative("atmosphere", event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
                  <Field label="Voice"><textarea aria-label="Voice" rows={2} value={direction.narrative.voice} onChange={(event) => updateNarrative("voice", event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" /></Field>
                </div>
              </section>
              <section className="space-y-3 rounded-2xl border p-4 md:p-5">
                <div><h2 className="font-semibold">Visual composition</h2><p className="text-sm text-muted-foreground">Choose how the system organizes emphasis and depth.</p></div>
                <Choice value={direction.composition} onChange={(value) => updateDirection("composition", value)} options={[
                  {value:"editorial",label:"Editorial",description:"Typography leads; clear hierarchy."},
                  {value:"cinematic",label:"Cinematic",description:"Large gestures, depth, atmosphere."},
                  {value:"instrument",label:"Instrument",description:"Dense, precise, information-first."},
                  {value:"gallery",label:"Gallery",description:"Expressive spaces and visual objects."},
                ]} />
                <Field label="Vector artwork" hint="Swap the visual motif without changing the rest of the skin.">
                  <Choice value={direction.artwork} onChange={(value) => updateDirection("artwork", value)} options={[
                    {value:"botanical",label:"Botanical"},{value:"orbit",label:"Orbit"},
                    {value:"topographic",label:"Topographic"},{value:"geometry",label:"Geometry"},
                    {value:"collage",label:"Collage"},{value:"stained-glass",label:"Stained glass"},
                    {value:"none",label:"No artwork"},
                  ]} />
                </Field>
                <Field label="Narrative keywords" hint="Comma-separated words that define the identity.">
                  <input aria-label="Narrative keywords" value={direction.narrative.keywords.join(", ")} onChange={(event) => updateKeywords(event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </Field>
              </section>
            </div>
          )}

          {tab === "palette" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="text-lg font-semibold">Semantic color language</h2><p className="text-sm text-muted-foreground">Color roles are mapped to shadcn's CSS variable contract.</p></div>
                <div className="flex rounded-lg bg-muted p-1">
                  <button type="button" aria-pressed={mode === "light"} onClick={() => setMode("light")} className={`rounded-md px-3 py-1.5 text-sm ${mode === "light" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Light</button>
                  <button type="button" aria-pressed={mode === "dark"} onClick={() => setMode("dark")} className={`rounded-md px-3 py-1.5 text-sm ${mode === "dark" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Dark</button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {SKIN_TOKEN_LABELS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 rounded-xl border p-3">
                    <input aria-label={`${label} color`} type="color" value={normalized[mode][key]} onChange={(event) => updateToken(key, event.target.value)} className="size-10 cursor-pointer rounded-md border-0 bg-transparent p-0" />
                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{label}</span><span className="block text-xs text-muted-foreground">{normalized[mode][key]}</span></span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {tab === "craft" && (
            <div className="space-y-5 rounded-2xl border p-4 md:p-5">
              <div><h2 className="text-lg font-semibold">Design craft</h2><p className="text-sm text-muted-foreground">The small decisions that make a system feel unmistakably itself.</p></div>
              <Field label="Body typography">
                <select aria-label="Body typography" value={theme.font} onChange={(event) => update("font", event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="Inter, ui-sans-serif, system-ui, sans-serif">Inter / System</option>
                  <option value="Geist, ui-sans-serif, system-ui, sans-serif">Geist</option>
                  <option value="Arial, Helvetica, sans-serif">Arial</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="ui-monospace, SFMono-Regular, monospace">Monospace</option>
                </select>
              </Field>
              <Field label="Display typography" hint="Used for expressive headings and hero statements.">
                <select aria-label="Display typography" value={direction.headingFont} onChange={(event) => updateDirection("headingFont", event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="Georgia, 'Times New Roman', serif">Editorial serif</option>
                  <option value="Inter, ui-sans-serif, system-ui, sans-serif">Modern sans</option>
                  <option value="Arial, Helvetica, sans-serif">Grotesk sans</option>
                  <option value="ui-monospace, SFMono-Regular, monospace">Technical mono</option>
                  <option value="'Trebuchet MS', sans-serif">Humanist sans</option>
                </select>
              </Field>
              <Field label="Corner radius" hint={`Current base radius: ${theme.radius}px`}>
                <input aria-label="Corner radius" type="range" min="0" max="28" value={theme.radius} onChange={(event) => update("radius", Number(event.target.value))} className="w-full accent-primary" />
              </Field>
              <Field label="Density">
                <Choice value={theme.density} onChange={(value) => update("density", value)} options={[
                  {value:"comfortable",label:"Comfortable",description:"More space and calm."},
                  {value:"compact",label:"Compact",description:"Tighter, denser rhythm."},
                ]} />
              </Field>
              <Field label="Shape language">
                <Choice value={direction.shape} onChange={(value) => updateDirection("shape", value)} options={[
                  {value:"soft",label:"Soft",description:"Friendly curves."},
                  {value:"sharp",label:"Sharp",description:"Precise corners."},
                  {value:"pill",label:"Pill",description:"Fluid and rounded."},
                  {value:"cut",label:"Cut",description:"Angular, engineered edges."},
                ]} />
              </Field>
              <Field label="Surface treatment">
                <Choice value={direction.surface} onChange={(value) => updateDirection("surface", value)} options={[
                  {value:"paper",label:"Paper",description:"Tactile, matte planes."},
                  {value:"glass",label:"Glass",description:"Translucent layered surfaces."},
                  {value:"matte",label:"Matte",description:"Quiet, solid surfaces."},
                  {value:"outline",label:"Outline",description:"Structure through line."},
                ]} />
              </Field>
              <Field label="Texture">
                <Choice value={direction.texture} onChange={(value) => updateDirection("texture", value)} options={[
                  {value:"paper",label:"Paper",description:"Fine print-like texture."},
                  {value:"grain",label:"Grain",description:"Analog film grain."},
                  {value:"mesh",label:"Mesh",description:"Soft technical gradients."},
                  {value:"none",label:"None",description:"Pure, untextured surfaces."},
                ]} />
              </Field>
              <Field label="Motion language">
                <Choice value={direction.motion} onChange={(value) => updateDirection("motion", value)} options={[
                  {value:"still",label:"Still",description:"No decorative movement."},
                  {value:"slow",label:"Slow",description:"Quiet, cinematic transitions."},
                  {value:"kinetic",label:"Kinetic",description:"Sharper, energetic response."},
                ]} />
              </Field>
              <Field label="Shadow">
                <Choice value={theme.shadow} onChange={(value) => update("shadow", value)} options={[
                  {value:"soft",label:"Soft"},{value:"medium",label:"Medium"},
                  {value:"sharp",label:"Sharp"},{value:"none",label:"None"},
                ]} />
              </Field>
            </div>
          )}

          {tab === "export" && (
            <div className="space-y-4">
              <div><h2 className="text-lg font-semibold">Package the visual identity</h2><p className="text-sm text-muted-foreground">Export design tokens, narrative metadata, and shadcn-compatible theme variables. This export reflects the current {isDirty ? "unsaved draft" : isApplied ? "applied skin" : "saved skin"}.</p></div>
              <div className="flex gap-2 rounded-xl bg-muted p-1">
                <button type="button" aria-pressed={format === "css"} onClick={() => setFormat("css")} className={`flex-1 rounded-lg px-3 py-2 text-sm ${format === "css" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>CSS variables</button>
                <button type="button" aria-pressed={format === "json"} onClick={() => setFormat("json")} className={`flex-1 rounded-lg px-3 py-2 text-sm ${format === "json" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Registry JSON</button>
              </div>
              <pre className="max-h-[420px] overflow-auto rounded-xl bg-muted p-4 text-xs leading-relaxed"><code>{output}</code></pre>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{copied ? <IconCheck size={16} /> : <IconCopy size={16} />} Copy</button>
                <button type="button" onClick={() => downloadFile(`${theme.name}.${format === "css" ? "css" : "json"}`, output, format === "css" ? "text/css" : "application/json")} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><IconDownload size={16} /> Download</button>
                <button type="button" onClick={downloadArtwork} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><IconDownload size={16} /> Vector SVG</button>
                <button type="button" onClick={resetTheme} className="rounded-lg border px-3 py-2 text-sm">Reset</button>
              </div>
              <Field label="Import an existing SkinTheme or shadcn registry theme">
                <textarea aria-label="Import SkinTheme JSON" value={importValue} onChange={(event) => setImportValue(event.target.value)} rows={6} placeholder="Paste JSON here…" className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-xs" />
                <button type="button" onClick={importTheme} className="mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><IconUpload size={16} /> Import JSON</button>
              </Field>
              {notice && <p role="status" aria-live="polite" className="text-xs text-muted-foreground">{notice}</p>}
            </div>
          )}
          {notice && tab !== "export" && <p role="status" aria-live="polite" className="text-xs text-muted-foreground">{notice}</p>}
        </section>

        <aside className="min-w-0 space-y-3 xl:sticky xl:top-24 xl:self-start">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-semibold">Live art direction preview</h2><p className="text-xs text-muted-foreground">{direction.name} · {mode} mode</p></div>
            <div className="flex rounded-lg border p-1">
              <button type="button" aria-label="Light preview" aria-pressed={mode === "light"} onClick={() => setMode("light")} className={`rounded-md p-2 ${mode === "light" ? "bg-muted" : ""}`}><IconSun size={16} /></button>
              <button type="button" aria-label="Dark preview" aria-pressed={mode === "dark"} onClick={() => setMode("dark")} className={`rounded-md p-2 ${mode === "dark" ? "bg-muted" : ""}`}><IconMoon size={16} /></button>
            </div>
          </div>
          <div
            data-skin={normalized.name}
            data-skin-artwork={direction.artwork}
            data-skin-composition={direction.composition}
            data-skin-texture={direction.texture}
            data-skin-shape={direction.shape}
            data-skin-surface={direction.surface}
            style={skinToStyle(normalized, mode)}
            className="skin-root overflow-hidden rounded-3xl border"
          >
            <div className={`skin-surface skin-surface--hero relative min-h-[300px] overflow-hidden border-b ${spacing}`}>
              <div aria-hidden="true" data-skin-preview-artwork className="skin-surface__artwork absolute inset-0 text-[var(--primary)]">
                <SkinArtwork variant={direction.artwork} className="h-full w-full" />
              </div>
              <div className="skin-surface__content relative z-10 max-w-[80%]">
                <p className="skin-hero__eyebrow">{direction.name} / VISUAL STUDY</p>
                <h3 className="skin-hero__title mt-4 text-3xl leading-[1.02]">{direction.narrative.title}</h3>
                <p className="skin-hero__description mt-4 max-w-sm text-sm leading-6">{direction.narrative.thesis}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span aria-hidden="true" className="skin-control inline-flex bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]">Explore system</span>
                  <span aria-hidden="true" className="skin-control inline-flex border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm">Read the story</span>
                </div>
              </div>
            </div>
            <div className={`space-y-4 ${spacing}`}>
              <div className="flex items-end justify-between gap-3">
                <div><p className="text-[10px] uppercase tracking-[0.18em] opacity-60">The system, applied</p><p className="mt-1 text-lg font-semibold">A coherent visual grammar</p></div>
                <span className="rounded-full border px-2.5 py-1 text-[10px]">Live</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="skin-surface skin-surface--card p-3"><p className="text-xs opacity-65">Signal strength</p><p className="mt-2 text-2xl font-semibold">92.8%</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"><span className="block h-full w-[78%] bg-[var(--primary)]" /></div></div>
                <div className="skin-surface skin-surface--card p-3"><p className="text-xs opacity-65">Active narratives</p><p className="mt-2 text-2xl font-semibold">08</p><p className="mt-3 text-xs" style={{color:"var(--chart-2)"}}>+12% this cycle</p></div>
              </div>
              <div className="skin-surface skin-surface--panel p-4">
                <div className="flex items-center justify-between"><p className="text-sm font-semibold">Components in context</p><span className="text-[10px] opacity-60">PREVIEW</span></div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span aria-hidden="true" className="skin-control inline-flex bg-[var(--primary)] px-3 py-2 text-xs text-[var(--primary-foreground)]">Primary action</span>
                  <span aria-hidden="true" className="skin-control inline-flex border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-xs">Secondary</span>
                  <span className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs">Badge / signal</span>
                </div>
                <input aria-label="Preview search field (disabled preview)" disabled placeholder="A field, in the same language…" className="skin-control mt-3 w-full border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--ring)]" />
              </div>
              <div className="skin-surface skin-surface--panel p-4">
                <p className="text-xs uppercase tracking-widest opacity-60">Atmosphere</p>
                <p className="mt-2 text-sm leading-6">{direction.narrative.atmosphere}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{direction.narrative.keywords.map((keyword) => <span key={keyword} className="rounded-full border px-2 py-1 text-[10px]">{keyword}</span>)}</div>
              </div>
            </div>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">The preview renders the actual art-direction vector and token contract in an isolated frame. Saving broadcasts the skin to mounted <code>SkinProvider</code> instances.</p>
        </aside>
      </div>
    </div>
  )
}

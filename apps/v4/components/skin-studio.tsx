"use client"

import * as React from "react"
import { IconCheck, IconCopy, IconDownload, IconMoon, IconSun, IconUpload } from "@tabler/icons-react"

import {
  DEFAULT_SKIN,
  SKIN_PRESETS,
  SKIN_TOKEN_LABELS,
  skinToCss,
  skinToRegistryItem,
  skinToStyle,
  type SkinMode,
  type SkinTheme,
  type SkinTokens,
} from "@/lib/skin-system"

const STORAGE_KEY = "shadcn-skin"
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

export function SkinStudio() {
  const [theme, setTheme] = React.useState<SkinTheme>(DEFAULT_SKIN)
  const [mode, setMode] = React.useState<SkinMode>("light")
  const [tab, setTab] = React.useState<"presets" | "tokens" | "system">("presets")
  const [format, setFormat] = React.useState<ExportFormat>("css")
  const [copied, setCopied] = React.useState(false)
  const [importValue, setImportValue] = React.useState("")
  const [notice, setNotice] = React.useState("")

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as SkinTheme
        if (parsed.light && parsed.dark && parsed.name) setTheme(parsed)
      }
    } catch {
      // Keep the default theme if storage is unavailable.
    }
  }, [])

  const output = React.useMemo(
    () => format === "css" ? skinToCss(theme) : JSON.stringify(skinToRegistryItem(theme), null, 2),
    [format, theme]
  )
  const update = <K extends keyof SkinTheme,>(key: K, value: SkinTheme[K]) =>
    setTheme((current) => ({ ...current, [key]: value }))
  const updateToken = (token: keyof SkinTokens, value: string) =>
    setTheme((current) => ({
      ...current,
      [mode]: { ...current[mode], [token]: value },
    }))

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
      setNotice("Export copied to clipboard.")
    } catch {
      setNotice("Clipboard access is unavailable. Select and copy the export below.")
    }
  }

  function saveTheme() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
    setNotice("Skin saved in this browser. Wrap an app section with SkinProvider to apply it.")
  }

  function importTheme() {
    try {
      const parsed = JSON.parse(importValue) as Partial<SkinTheme> & { title?: string; cssVars?: { light?: Record<string, string>; dark?: Record<string, string> } }
      const fromRegistry = (tokens?: Record<string, string>) => Object.fromEntries(
        Object.entries(tokens ?? {}).map(([key, value]) => [key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()), value])
      )
      const candidate = (parsed.cssVars ? {
        ...DEFAULT_SKIN,
        name: String(parsed.name ?? "imported-skin"),
        label: String(parsed.title ?? parsed.name ?? "Imported skin"),
        light: { ...DEFAULT_SKIN.light, ...fromRegistry(parsed.cssVars.light) },
        dark: { ...DEFAULT_SKIN.dark, ...fromRegistry(parsed.cssVars.dark) },
      } : parsed) as SkinTheme
      if (!candidate.light || !candidate.dark) throw new Error("Missing light/dark tokens")
      setTheme({ ...DEFAULT_SKIN, ...candidate })
      setNotice("Theme imported. Review the preview, then save it.")
    } catch {
      setNotice("Could not import that JSON. Use a SkinTheme object or shadcn registry theme.")
    }
  }

  const previewStyle = skinToStyle(theme, mode)
  const compact = theme.density === "compact"
  const spacing = compact ? "p-3" : "p-5"

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
      <section className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">SKIN STUDIO / PRO</p>
            <h1 className="text-3xl font-semibold tracking-tight">Build your visual system</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Tune semantic tokens, shape, type and density. Preview the same token contract used by shadcn components.</p>
          </div>
          <button onClick={saveTheme} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save skin</button>
        </div>

        <div className="flex flex-wrap gap-2 border-b pb-3">
          {(["presets", "tokens", "system"] as const).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm capitalize ${tab === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{item === "system" ? "Design system" : item}</button>
          ))}
        </div>

        {tab === "presets" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SKIN_PRESETS.map((preset) => (
              <button key={preset.name} onClick={() => setTheme(preset)} className={`rounded-xl border p-3 text-left transition hover:border-primary ${theme.name === preset.name ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                <span className="mb-3 flex h-8 overflow-hidden rounded-md border">
                  {[preset.light.background, preset.light.primary, preset.light.secondary, preset.light.accent].map((color, index) => <span key={index} className="flex-1" style={{ backgroundColor: color }} />)}
                </span>
                <span className="block text-sm font-medium">{preset.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{preset.name === "neutral" ? "Balanced foundation" : "Curated color palette"}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "tokens" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Semantic color tokens</h2>
              <div className="flex rounded-lg bg-muted p-1">
                <button onClick={() => setMode("light")} className={`rounded-md px-3 py-1.5 text-sm ${mode === "light" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Light</button>
                <button onClick={() => setMode("dark")} className={`rounded-md px-3 py-1.5 text-sm ${mode === "dark" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Dark</button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SKIN_TOKEN_LABELS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 rounded-lg border p-3">
                  <input aria-label={`${label} color`} type="color" value={theme[mode][key]} onChange={(event) => updateToken(key, event.target.value)} className="size-9 cursor-pointer rounded-md border-0 bg-transparent p-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">{theme[mode][key]}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {tab === "system" && (
          <div className="space-y-5 rounded-xl border p-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Skin name</span>
              <input value={theme.label} onChange={(event) => update("label", event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block space-y-2">
              <span className="flex justify-between text-sm font-medium">Corner radius <output>{theme.radius}px</output></span>
              <input type="range" min="0" max="24" value={theme.radius} onChange={(event) => update("radius", Number(event.target.value))} className="w-full accent-primary" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Typography</span>
              <select value={theme.font} onChange={(event) => update("font", event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="Inter, ui-sans-serif, system-ui, sans-serif">Inter / System</option>
                <option value="Geist, ui-sans-serif, system-ui, sans-serif">Geist</option>
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="ui-monospace, SFMono-Regular, monospace">Monospace</option>
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">Density
                <select value={theme.density} onChange={(event) => update("density", event.target.value as SkinTheme["density"])} className="w-full rounded-lg border bg-background px-3 py-2 font-normal">
                  <option value="comfortable">Comfortable</option><option value="compact">Compact</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">Shadow
                <select value={theme.shadow} onChange={(event) => update("shadow", event.target.value as SkinTheme["shadow"])} className="w-full rounded-lg border bg-background px-3 py-2 font-normal">
                  <option value="soft">Soft</option><option value="medium">Medium</option><option value="sharp">Sharp</option><option value="none">None</option>
                </select>
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Import theme JSON</span>
              <textarea value={importValue} onChange={(event) => setImportValue(event.target.value)} rows={5} placeholder="Paste a SkinTheme or shadcn registry theme JSON…" className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-xs" />
              <button onClick={importTheme} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><IconUpload size={16} /> Import JSON</button>
            </label>
          </div>
        )}

        <div className="space-y-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Export theme</h2>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              <button onClick={() => setFormat("css")} className={`rounded-md px-3 py-1.5 text-xs ${format === "css" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>CSS</button>
              <button onClick={() => setFormat("json")} className={`rounded-md px-3 py-1.5 text-xs ${format === "json" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Registry JSON</button>
            </div>
          </div>
          <pre className="max-h-72 overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed"><code>{output}</code></pre>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyOutput} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{copied ? <IconCheck size={16} /> : <IconCopy size={16} />} Copy</button>
            <button onClick={() => downloadFile(format === "css" ? `${theme.name}.css` : `${theme.name}.json`, output, format === "css" ? "text/css" : "application/json")} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><IconDownload size={16} /> Download</button>
            <button onClick={() => { setTheme(DEFAULT_SKIN); setMode("light"); setNotice("Skin reset to Neutral.") }} className="rounded-lg border px-3 py-2 text-sm">Reset</button>
          </div>
          {notice && <p role="status" className="text-xs text-muted-foreground">{notice}</p>}
        </div>
      </section>

      <aside className="min-w-0 space-y-3 xl:sticky xl:top-24 xl:self-start">
        <div className="flex items-center justify-between">
          <div><h2 className="font-semibold">Live component preview</h2><p className="text-xs text-muted-foreground">Preview only · {theme.label}</p></div>
          <div className="flex rounded-lg border p-1">
            <button aria-label="Light preview" onClick={() => setMode("light")} className={`rounded-md p-2 ${mode === "light" ? "bg-muted" : ""}`}><IconSun size={16} /></button>
            <button aria-label="Dark preview" onClick={() => setMode("dark")} className={`rounded-md p-2 ${mode === "dark" ? "bg-muted" : ""}`}><IconMoon size={16} /></button>
          </div>
        </div>
        <div style={previewStyle} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] [font-family:var(--font-sans)]">
          <div className={`flex items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] ${spacing}`}>
            <div className="flex items-center gap-2"><span className="size-7 rounded-lg bg-[var(--primary)]" /><span className="text-sm font-semibold">Acme Workspace</span></div>
            <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs text-[var(--accent-foreground)]">Pro plan</span>
          </div>
          <div className={`space-y-4 ${spacing}`}>
            <div><p className="text-xs text-[var(--muted-foreground)]">OVERVIEW</p><h3 className="mt-1 text-xl font-semibold">Welcome back</h3><p className="mt-1 text-sm text-[var(--muted-foreground)]">Here is what is happening today.</p></div>
            <div className="grid grid-cols-2 gap-3">
              {[["Revenue", "$24,680", "+12.8%"], ["Active users", "8,549", "+4.2%"]].map(([label, value, delta]) => <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3" style={{ boxShadow: "var(--skin-shadow)" }}><p className="text-xs text-[var(--muted-foreground)]">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p><p className="mt-1 text-xs" style={{ color: "var(--chart-2)" }}>{delta}</p></div>)}
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4" style={{ boxShadow: "var(--skin-shadow)" }}>
              <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold">Quick actions</p><span className="text-xs text-[var(--muted-foreground)]">Today</span></div>
              <div className="flex flex-wrap gap-2"><button className="rounded-[var(--radius)] bg-[var(--primary)] px-3 py-2 text-sm font-medium text-[var(--primary-foreground)]">Primary</button><button className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm text-[var(--secondary-foreground)]">Secondary</button><button className="rounded-[var(--radius)] bg-[var(--destructive)] px-3 py-2 text-sm text-[var(--destructive-foreground)]">Delete</button></div>
              <input placeholder="Search anything…" className="mt-3 w-full rounded-[var(--radius)] border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--ring)]" />
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold">Performance</p><span className="text-xs text-[var(--muted-foreground)]">Last 7 days</span></div>
              <div className="flex h-20 items-end gap-2">{[38, 65, 48, 80, 55, 92, 70].map((height, index) => <span key={index} className="flex-1 rounded-t-sm" style={{ height: `${height}%`, backgroundColor: [theme[mode].chart1, theme[mode].chart2, theme[mode].chart3][index % 3] }} />)}</div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 text-xs"><span>All systems operational</span><span className="font-medium" style={{ color: "var(--chart-2)" }}>● Healthy</span></div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">This studio preview uses CSS variables locally. Your global app theme is not changed until you apply the exported tokens.</p>
      </aside>
    </div>
  )
}

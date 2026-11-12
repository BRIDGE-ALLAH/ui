import type { CSSProperties } from "react"

export type SkinMode = "light" | "dark"
export type SkinArtworkKind = "botanical" | "orbit" | "topographic" | "geometry" | "collage" | "stained-glass" | "none"
export type SkinNarrative = {
  title: string
  thesis: string
  atmosphere: string
  voice: string
  keywords: string[]
}
export type SkinArtDirection = {
  name: string
  narrative: SkinNarrative
  artwork: SkinArtworkKind
  composition: "editorial" | "cinematic" | "instrument" | "gallery"
  texture: "paper" | "grain" | "mesh" | "none"
  shape: "soft" | "sharp" | "pill" | "cut"
  surface: "paper" | "glass" | "matte" | "outline"
  motion: "still" | "slow" | "kinetic"
  headingFont: string
  tracking: "tight" | "normal" | "wide"
}
export type SkinTokens = {
  background: string; foreground: string; card: string; cardForeground: string
  popover: string; popoverForeground: string; primary: string; primaryForeground: string
  secondary: string; secondaryForeground: string; muted: string; mutedForeground: string
  accent: string; accentForeground: string; destructive: string; destructiveForeground: string
  border: string; input: string; ring: string; sidebar: string; sidebarForeground: string
  chart1: string; chart2: string; chart3: string; chart4: string; chart5: string
  sidebarPrimary: string; sidebarPrimaryForeground: string; sidebarAccent: string
  sidebarAccentForeground: string; sidebarBorder: string; sidebarRing: string
  surface: string; surfaceForeground: string; code: string; codeForeground: string
  codeHighlight: string; codeNumber: string; selection: string; selectionForeground: string; overlay: string
}
export type SkinTheme = {
  name: string; label: string; description?: string; radius: number; font: string
  density: "comfortable" | "compact"; shadow: "soft" | "medium" | "sharp" | "none"
  light: SkinTokens; dark: SkinTokens; artDirection?: SkinArtDirection
}
export const SKIN_STORAGE_KEY = "shadcn-skin"
export const SKIN_CUSTOM_STORAGE_KEY = "shadcn-custom-skins"

const neutralLight: SkinTokens = {
  background:"#ffffff",foreground:"#171717",card:"#ffffff",cardForeground:"#171717",
  popover:"#ffffff",popoverForeground:"#171717",primary:"#171717",primaryForeground:"#fafafa",
  secondary:"#f5f5f5",secondaryForeground:"#262626",muted:"#f5f5f5",mutedForeground:"#6b6b6b",
  accent:"#f5f5f5",accentForeground:"#262626",destructive:"#dc2626",destructiveForeground:"#ffffff",
  border:"#e5e5e5",input:"#808080",ring:"#767676",sidebar:"#fafafa",sidebarForeground:"#171717",
  chart1:"#2563eb",chart2:"#15803d",chart3:"#b45309",chart4:"#1d4ed8",chart5:"#1e40af",
  sidebarPrimary:"#171717",sidebarPrimaryForeground:"#fafafa",sidebarAccent:"#f5f5f5",
  sidebarAccentForeground:"#262626",sidebarBorder:"#e5e5e5",sidebarRing:"#767676",
  surface:"#fafafa",surfaceForeground:"#171717",code:"#fafafa",codeForeground:"#262626",
  codeHighlight:"#f5f5f5",codeNumber:"#6b6b6b",selection:"#171717",selectionForeground:"#ffffff",overlay:"rgb(0 0 0 / 0.5)",
}
const neutralDark: SkinTokens = {
  background:"#171717",foreground:"#fafafa",card:"#262626",cardForeground:"#fafafa",
  popover:"#262626",popoverForeground:"#fafafa",primary:"#fafafa",primaryForeground:"#262626",
  secondary:"#404040",secondaryForeground:"#fafafa",muted:"#404040",mutedForeground:"#b3b3b3",
  accent:"#404040",accentForeground:"#fafafa",destructive:"#dc2626",destructiveForeground:"#ffffff",
  border:"#404040",input:"#8a8a8a",ring:"#8a8a8a",sidebar:"#202020",sidebarForeground:"#fafafa",
  chart1:"#60a5fa",chart2:"#4ade80",chart3:"#fbbf24",chart4:"#93c5fd",chart5:"#bfdbfe",
  sidebarPrimary:"#fafafa",sidebarPrimaryForeground:"#262626",sidebarAccent:"#404040",
  sidebarAccentForeground:"#fafafa",sidebarBorder:"#404040",sidebarRing:"#8a8a8a",
  surface:"#262626",surfaceForeground:"#fafafa",code:"#262626",codeForeground:"#fafafa",
  codeHighlight:"#404040",codeNumber:"#b3b3b3",selection:"#fafafa",selectionForeground:"#262626",overlay:"rgb(0 0 0 / 0.5)",
}
export const DEFAULT_ART_DIRECTION: SkinArtDirection = {
  name:"Quiet editorial",
  narrative:{
    title:"Clarity with a human pulse",
    thesis:"A calm canvas where the content is the protagonist.",
    atmosphere:"Considered, tactile, quietly confident.",
    voice:"Precise, warm, and unhurried.",
    keywords:["clarity","craft","editorial"],
  },
  artwork:"topographic",composition:"editorial",texture:"paper",shape:"soft",
  surface:"paper",motion:"still",
  headingFont:"Georgia, 'Times New Roman', serif",tracking:"tight",
}
function art(
  name:string,title:string,thesis:string,atmosphere:string,voice:string,
  keywords:string[],artwork:SkinArtworkKind,composition:SkinArtDirection["composition"],
  texture:SkinArtDirection["texture"],shape:SkinArtDirection["shape"],
  surface:SkinArtDirection["surface"],motion:SkinArtDirection["motion"],
  headingFont:string,tracking:SkinArtDirection["tracking"]
):SkinArtDirection {
  return {name,narrative:{title,thesis,atmosphere,voice,keywords},artwork,composition,texture,shape,surface,motion,headingFont,tracking}
}
function palette(
  label:string,primary:string,primaryForeground:string,darkPrimary:string,darkPrimaryForeground:string,
  background="#ffffff",darkBackground="#171717",foreground="#171717",darkForeground="#fafafa",
  artDirection:SkinArtDirection=DEFAULT_ART_DIRECTION
):SkinTheme {
  return {
    name:label.toLowerCase().replace(/[^a-z0-9]+/g,"-"),label,
    radius:10,font:"Inter, ui-sans-serif, system-ui, sans-serif",
    density:"comfortable",shadow:"soft",artDirection,
    light:{...neutralLight,background,foreground,primary,primaryForeground,ring:neutralLight.ring},
    dark:{...neutralDark,background:darkBackground,foreground:darkForeground,primary:darkPrimary,primaryForeground:darkPrimaryForeground,ring:neutralDark.ring},
  }
}
export const SKIN_PRESETS:SkinTheme[]=[
  {...palette("Neutral","#171717","#ffffff","#fafafa","#262626", "#ffffff","#171717","#171717","#fafafa",
    art("Quiet editorial","Clarity with a human pulse","A calm canvas where the content is the protagonist.","Considered, tactile, quietly confident.","Precise, warm, and unhurried.",["clarity","craft","editorial"],"topographic","editorial","paper","soft","paper","still","Georgia, 'Times New Roman', serif","tight")),name:"neutral"},
  palette("Ocean","#0369a1","#ffffff","#38bdf8","#082f49","#f8fcff","#071923","#102a3a","#e6f7ff",
    art("Blue hour cinema","A horizon after the noise","Deep space, measured light, and a clear focal point.","Atmospheric, expansive, quietly luminous.","Evocative, spacious, and deliberate.",["horizon","depth","light"],"orbit","cinematic","mesh","soft","glass","slow","'Arial', sans-serif","tight")),
  palette("Emerald","#047857","#ffffff","#34d399","#052e24","#f7fdf9","#071b15","#12372b","#e8fff4",
    art("Living archive","A system that grows with its ideas","Organic forms bring a sense of life without sacrificing structure.","Botanical, patient, grounded.","Observant, nurturing, and clear.",["growth","nature","continuity"],"botanical","gallery","paper","soft","paper","slow","Georgia, serif","normal")),
  palette("Rose","#e11d48","#ffffff","#fb7185","#4c0519","#fffafb","#211016","#3b1722","#fff1f4",
    art("Soft surrealism","Make room for a little wonder","Unexpected shapes soften a rigorous interface.","Dreamlike, intimate, playful.","Poetic, optimistic, and personal.",["wonder","gesture","warmth"],"collage","gallery","grain","pill","glass","slow","'Trebuchet MS', sans-serif","normal")),
  palette("Violet","#7c3aed","#ffffff","#a78bfa","#2e1065","#fcfaff","#171126","#271b3c","#f4edff",
    art("Prismatic field","Many perspectives, one coherent story","Layered translucent planes create depth and dimensionality.","Iridescent, layered, contemplative.","Curious, imaginative, and articulate.",["prism","depth","possibility"],"stained-glass","cinematic","mesh","soft","glass","slow","Georgia, serif","tight")),
  palette("Amber","#b45309","#ffffff","#fbbf24","#451a03","#fffdf7","#21190b","#3d2b13","#fff6df",
    art("Printed matter","Every detail earns its place","A warm editorial system inspired by ink, paper, and print.","Analog, warm, archival.","Direct, crafted, and timeless.",["paper","ink","archive"],"geometry","editorial","paper","cut","paper","still","Georgia, serif","wide")),
  palette("Nord","#54769f","#ffffff","#88c0d0","#2e3440","#eceff4","#2e3440","#2e3440","#eceff4",
    art("Quiet instrument","Precision without the noise","A measured grid makes complex information feel navigable.","Cool, technical, balanced.","Exact, composed, and helpful.",["grid","signal","precision"],"geometry","instrument","none","sharp","matte","still","ui-monospace, monospace","normal")),
  palette("Dracula","#bd93f9","#282a36","#ff79c6","#282a36","#f8f7fc","#282a36","#282a36","#f8f8f2",
    art("Night theatre","A little drama, perfectly controlled","High contrast and focused highlights turn the interface into a stage.","Nocturnal, theatrical, electric.","Bold, witty, and incisive.",["noir","contrast","stage"],"orbit","cinematic","grain","sharp","glass","kinetic","Georgia, serif","tight")),
  palette("Cyberpunk","#db2777","#ffffff","#22d3ee","#083344","#fff7fc","#100b1c","#2a1530","#fce7f3",
    art("Signal / noise","Design for the edge of tomorrow","Hard geometry, vivid accents, and deliberate disruption.","Hyper-modern, raw, high-energy.","Provocative, concise, and fearless.",["signal","future","energy"],"collage","instrument","grain","cut","matte","kinetic","ui-monospace, monospace","wide")),
]
export const DEFAULT_SKIN=SKIN_PRESETS[0]
export const SKIN_ART_DIRECTIONS=SKIN_PRESETS.map(({artDirection})=>artDirection!).filter(Boolean)
export const SKIN_TOKEN_LABELS:{key:keyof SkinTokens;label:string}[]=[
  {key:"background",label:"Background"},{key:"foreground",label:"Foreground"},{key:"card",label:"Card"},
  {key:"cardForeground",label:"Card foreground"},{key:"popover",label:"Popover"},{key:"popoverForeground",label:"Popover foreground"},
  {key:"primary",label:"Primary"},{key:"primaryForeground",label:"Primary foreground"},{key:"secondary",label:"Secondary"},
  {key:"secondaryForeground",label:"Secondary foreground"},{key:"muted",label:"Muted"},{key:"mutedForeground",label:"Muted foreground"},
  {key:"accent",label:"Accent"},{key:"accentForeground",label:"Accent foreground"},{key:"destructive",label:"Destructive"},
  {key:"destructiveForeground",label:"Destructive foreground"},{key:"border",label:"Border"},{key:"input",label:"Input"},
  {key:"ring",label:"Focus ring"},{key:"sidebar",label:"Sidebar"},{key:"sidebarForeground",label:"Sidebar foreground"},
  {key:"chart1",label:"Chart 1"},{key:"chart2",label:"Chart 2"},{key:"chart3",label:"Chart 3"},
  {key:"chart4",label:"Chart 4"},{key:"chart5",label:"Chart 5"},
  {key:"sidebarPrimary",label:"Sidebar primary"},{key:"sidebarPrimaryForeground",label:"Sidebar primary foreground"},
  {key:"sidebarAccent",label:"Sidebar accent"},{key:"sidebarAccentForeground",label:"Sidebar accent foreground"},
  {key:"sidebarBorder",label:"Sidebar border"},{key:"sidebarRing",label:"Sidebar ring"},
  {key:"surface",label:"Surface"},{key:"surfaceForeground",label:"Surface foreground"},
  {key:"code",label:"Code surface"},{key:"codeForeground",label:"Code foreground"},
  {key:"codeHighlight",label:"Code highlight"},{key:"codeNumber",label:"Code number"},
  {key:"selection",label:"Selection"},{key:"selectionForeground",label:"Selection foreground"},
  {key:"overlay",label:"Overlay scrim"},
]
const TOKEN_NAMES:Record<keyof SkinTokens,string>={
  background:"background",foreground:"foreground",card:"card",cardForeground:"card-foreground",
  popover:"popover",popoverForeground:"popover-foreground",primary:"primary",primaryForeground:"primary-foreground",
  secondary:"secondary",secondaryForeground:"secondary-foreground",muted:"muted",mutedForeground:"muted-foreground",
  accent:"accent",accentForeground:"accent-foreground",destructive:"destructive",destructiveForeground:"destructive-foreground",
  border:"border",input:"input",ring:"ring",sidebar:"sidebar",sidebarForeground:"sidebar-foreground",
  chart1:"chart-1",chart2:"chart-2",chart3:"chart-3",chart4:"chart-4",chart5:"chart-5",
  sidebarPrimary:"sidebar-primary",sidebarPrimaryForeground:"sidebar-primary-foreground",
  sidebarAccent:"sidebar-accent",sidebarAccentForeground:"sidebar-accent-foreground",
  sidebarBorder:"sidebar-border",sidebarRing:"sidebar-ring",
  surface:"surface",surfaceForeground:"surface-foreground",code:"code",codeForeground:"code-foreground",
  codeHighlight:"code-highlight",codeNumber:"code-number",selection:"selection",selectionForeground:"selection-foreground",overlay:"overlay",
}
export type SkinValidationResult =
  | { success: true; data: SkinTheme }
  | { success: false; error: string }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isSafeCssValue = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= 256 &&
  !/[;{}<>\\\u0000-\u001f]/.test(value) &&
  !/(?:url|expression|var)\s*\(/i.test(value)

const isOneOf = <T extends string>(value: unknown, values: readonly T[]): value is T =>
  typeof value === "string" && values.includes(value as T)

export function validateSkinTheme(input: unknown): SkinValidationResult {
  if (!isRecord(input)) return { success: false, error: "Skin data must be a JSON object." }
  if (input.schemaVersion !== undefined && input.schemaVersion !== 1) {
    return { success: false, error: "Unsupported SkinTheme schema version." }
  }
  if (typeof input.name !== "string" || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(input.name)) {
    return { success: false, error: "Skin name must be a lowercase slug (1–64 characters)." }
  }
  if (typeof input.label !== "string" || input.label.trim().length < 1 || input.label.length > 80) {
    return { success: false, error: "Skin label must contain 1–80 characters." }
  }
  if (input.radius !== undefined && (typeof input.radius !== "number" || !Number.isFinite(input.radius) || input.radius < 0 || input.radius > 64)) {
    return { success: false, error: "Skin radius must be a number between 0 and 64." }
  }
  if (input.font !== undefined && !isSafeCssValue(input.font)) {
    return { success: false, error: "Font value contains unsupported characters." }
  }
  if (input.density !== undefined && !isOneOf(input.density, ["comfortable", "compact"] as const)) {
    return { success: false, error: "Unknown density value." }
  }
  if (input.shadow !== undefined && !isOneOf(input.shadow, ["soft", "medium", "sharp", "none"] as const)) {
    return { success: false, error: "Unknown shadow value." }
  }
  for (const mode of ["light", "dark"] as const) {
    if (input[mode] !== undefined && !isRecord(input[mode])) {
      return { success: false, error: `${mode} tokens must be an object.` }
    }
    if (isRecord(input[mode])) {
      for (const [key, value] of Object.entries(input[mode])) {
        if (!(key in neutralLight) || !isSafeCssValue(value)) {
          return { success: false, error: `Invalid ${mode} token: ${key}.` }
        }
      }
    }
  }
  if (input.artDirection !== undefined && !isRecord(input.artDirection)) {
    return { success: false, error: "Art direction must be an object." }
  }
  if (isRecord(input.artDirection)) {
    const direction = input.artDirection
    const enums: [string, readonly string[]][] = [
      ["artwork", ["botanical", "orbit", "topographic", "geometry", "collage", "stained-glass", "none"]],
      ["composition", ["editorial", "cinematic", "instrument", "gallery"]],
      ["texture", ["paper", "grain", "mesh", "none"]],
      ["shape", ["soft", "sharp", "pill", "cut"]],
      ["surface", ["paper", "glass", "matte", "outline"]],
      ["motion", ["still", "slow", "kinetic"]],
      ["tracking", ["tight", "normal", "wide"]],
    ]
    for (const [key, values] of enums) {
      if (direction[key] !== undefined && !isOneOf(direction[key], values)) {
        return { success: false, error: `Invalid art direction field: ${key}.` }
      }
    }
    for (const key of ["name", "headingFont"] as const) {
      if (direction[key] !== undefined && !isSafeCssValue(direction[key])) {
        return { success: false, error: `Invalid art direction field: ${key}.` }
      }
    }
    if (direction.narrative !== undefined) {
      if (!isRecord(direction.narrative)) return { success: false, error: "Narrative must be an object." }
      for (const key of ["title", "thesis", "atmosphere", "voice"] as const) {
        const value = direction.narrative[key]
        if (value !== undefined && (typeof value !== "string" || value.length > 500)) {
          return { success: false, error: `Invalid narrative field: ${key}.` }
        }
      }
      const keywords = direction.narrative.keywords
      if (keywords !== undefined && (!Array.isArray(keywords) || keywords.length > 20 || !keywords.every((word) => typeof word === "string" && word.length <= 40))) {
        return { success: false, error: "Narrative keywords must be an array of at most 20 short strings." }
      }
    }
  }
  return { success: true, data: normalizeSkin(input as SkinTheme) }
}

export function parseSkinImport(json: string): SkinValidationResult {
  if (json.length > 256_000) return { success: false, error: "Import file exceeds the 256 KB limit." }
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { success: false, error: "Invalid JSON syntax." }
  }
  if (!isRecord(parsed)) return { success: false, error: "Import must be a JSON object." }

  if (parsed.cssVars !== undefined) {
    if (!isRecord(parsed.cssVars)) return { success: false, error: "Registry cssVars must be an object." }
    const cssVars = parsed.cssVars
    const toCamel = (tokens: unknown) => {
      if (tokens === undefined) return {}
      if (!isRecord(tokens)) throw new Error("Registry token map must be an object.")
      return Object.fromEntries(Object.entries(tokens).map(([key, value]) => [
        key.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase()),
        value,
      ]))
    }
    try {
      const meta = isRecord(parsed.meta) ? parsed.meta : {}
      const schemaVersion = meta["skin-schema-version"]
      if (schemaVersion !== undefined && schemaVersion !== "1") {
        return { success: false, error: "Unsupported registry skin schema version." }
      }
      const artDirection = typeof meta["skin-art-direction"] === "string"
        ? JSON.parse(meta["skin-art-direction"])
        : DEFAULT_SKIN.artDirection
      const craft = typeof meta["skin-craft"] === "string" ? JSON.parse(meta["skin-craft"]) : {}
      if (!isRecord(craft)) return { success: false, error: "Registry craft metadata must be an object." }
      const theme = isRecord(cssVars.theme) ? cssVars.theme : {}
      const candidate = {
        ...DEFAULT_SKIN,
        name: parsed.name,
        label: parsed.title ?? parsed.name,
        font: theme["font-sans"] ?? DEFAULT_SKIN.font,
        radius: typeof theme.radius === "string" && theme.radius.endsWith("rem")
          ? Number.parseFloat(theme.radius) * 16
          : DEFAULT_SKIN.radius,
        artDirection,
        density: craft.density ?? DEFAULT_SKIN.density,
        shadow: craft.shadow ?? DEFAULT_SKIN.shadow,
        light: { ...DEFAULT_SKIN.light, ...toCamel(cssVars.light) },
        dark: { ...DEFAULT_SKIN.dark, ...toCamel(cssVars.dark) },
      }
      return validateSkinTheme(candidate)
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Invalid registry metadata." }
    }
  }
  return validateSkinTheme(parsed)
}


export type SkinLibraryValidationResult =
  | { success: true; data: SkinTheme[] }
  | { success: false; error: string }

export function buildCustomSkin(
  source: SkinTheme,
  name: string,
  label: string
): SkinValidationResult {
  const sourceResult = validateSkinTheme(source)
  if (!sourceResult.success) return sourceResult
  return validateSkinTheme({
    ...normalizeSkin(sourceResult.data),
    name,
    label,
    description: sourceResult.data.description ?? `Custom visual identity: ${label}`,
  })
}

export function parseCustomSkinLibrary(json: string): SkinLibraryValidationResult {
  if (json.length > 512_000) {
    return { success: false, error: "Custom skin library exceeds the 512 KB limit." }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { success: false, error: "Custom skin library contains invalid JSON." }
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== 1 || !Array.isArray(parsed.skins)) {
    return { success: false, error: "Custom skin library must use schema version 1 and contain a skins array." }
  }
  if (parsed.skins.length > 100) {
    return { success: false, error: "Custom skin library cannot contain more than 100 skins." }
  }
  const names = new Set<string>()
  const builtInNames = new Set(SKIN_PRESETS.map((preset) => preset.name))
  const skins: SkinTheme[] = []
  for (const entry of parsed.skins) {
    const result = validateSkinTheme(entry)
    if (!result.success) return { success: false, error: result.error }
    if (builtInNames.has(result.data.name)) {
      return { success: false, error: `Built-in skin "${result.data.name}" cannot be stored as a custom skin.` }
    }
    if (names.has(result.data.name)) {
      return { success: false, error: `Duplicate custom skin name: ${result.data.name}.` }
    }
    names.add(result.data.name)
    skins.push(result.data)
  }
  return { success: true, data: skins }
}

export function serializeCustomSkinLibrary(skins: SkinTheme[]) {
  return JSON.stringify(
    { schemaVersion: 1, skins: skins.map((skin) => normalizeSkin(skin)) },
    null,
    2
  )
}

export function normalizeSkin(theme:SkinTheme):SkinTheme {
  return {...DEFAULT_SKIN,...theme,light:{...DEFAULT_SKIN.light,...theme.light},dark:{...DEFAULT_SKIN.dark,...theme.dark},artDirection:{...DEFAULT_ART_DIRECTION,...theme.artDirection,narrative:{...DEFAULT_ART_DIRECTION.narrative,...theme.artDirection?.narrative}}}
}
export function skinTokensToCss(tokens:SkinTokens){return (Object.keys(TOKEN_NAMES) as (keyof SkinTokens)[]).map(key=>`  --${TOKEN_NAMES[key]}: ${tokens[key]};`).join("\n")}
export function skinToCss(themeInput:SkinTheme){
  const theme=normalizeSkin(themeInput)
  const direction=theme.artDirection!
  const cardRadius=direction.shape==="pill"?Math.max(18,theme.radius*2):direction.shape==="sharp"||direction.shape==="cut"?2:theme.radius
  const controlRadius=direction.shape==="pill"?"999px":direction.shape==="sharp"||direction.shape==="cut"?"3px":Math.max(4,theme.radius*.7)+"px"
  const headingTracking=direction.tracking==="tight"?"-0.04em":direction.tracking==="wide"?"0.08em":"0"
  const artOpacity=direction.artwork==="none"?0:direction.composition==="cinematic"?.68:.42
  const textureOpacity=direction.texture==="none"?0:direction.texture==="grain"?.13:direction.texture==="mesh"?.1:.22
  const motionDuration=direction.motion==="kinetic"?"180ms":direction.motion==="slow"?"650ms":"0ms"
  return `:root {\n  --radius: ${theme.radius/16}rem;\n  --font-sans: ${theme.font};\n  --skin-body-font: ${theme.font};\n  --skin-heading-font: ${direction.headingFont};\n${skinTokensToCss(theme.light)}\n}\n\n.dark {\n${skinTokensToCss(theme.dark)}\n}\n\n[data-skin] {\n  --skin-card-radius: ${cardRadius}px;\n  --skin-control-radius: ${controlRadius};\n  --skin-heading-tracking: ${headingTracking};\n  --skin-art-opacity: ${artOpacity};\n  --skin-texture-opacity: ${textureOpacity};\n  --skin-motion-duration: ${motionDuration};\n  --skin-composition: ${direction.composition};\n  --skin-artwork-kind: ${direction.artwork};\n  --skin-texture-kind: ${direction.texture};\n}\n`
}
export function skinToRegistryItem(themeInput:SkinTheme){
  const theme=normalizeSkin(themeInput)
  const map=(tokens:SkinTokens)=>Object.fromEntries((Object.keys(TOKEN_NAMES) as (keyof SkinTokens)[]).map(key=>[TOKEN_NAMES[key],tokens[key]]))
  return {
    $schema:"https://ui.shadcn.com/schema/registry-item.json",
    name:theme.name,
    type:"registry:theme",
    title:theme.label,
    description:theme.description??theme.artDirection?.narrative.thesis??`Custom ${theme.label} visual system`,
    meta:{"skin-schema-version":"1","skin-art-direction":JSON.stringify(theme.artDirection),"skin-craft":JSON.stringify({density:theme.density,shadow:theme.shadow})},
    cssVars:{
      light:map(theme.light),
      dark:map(theme.dark),
      theme:{
        radius:`${theme.radius/16}rem`,
        "font-sans":theme.font,
        "skin-heading-font":theme.artDirection?.headingFont ?? DEFAULT_ART_DIRECTION.headingFont,
        "skin-card-radius":`${theme.radius}px`,
        "skin-artwork-kind":theme.artDirection?.artwork ?? "none",
        "skin-composition":theme.artDirection?.composition ?? "editorial",
        "skin-texture-kind":theme.artDirection?.texture ?? "none",
      },
    },
  }
}
export function skinToStyle(themeInput:SkinTheme,mode:SkinMode){
  const theme=normalizeSkin(themeInput)
  const t=theme[mode]
  const direction=theme.artDirection!
  const radius=theme.radius
  const css:Record<string,string>={
    "--radius":`${radius}px`,"--font-sans":theme.font,"--skin-body-font":theme.font,
    "--skin-heading-font":direction.headingFont,
    "--skin-heading-tracking":direction.tracking==="tight"?"-0.04em":direction.tracking==="wide"?"0.08em":"0",
    "--skin-card-radius":direction.shape==="pill"?`${Math.max(18,radius*2)}px`:direction.shape==="sharp"?"2px":direction.shape==="cut"?"2px":`${radius}px`,
    "--skin-control-radius":direction.shape==="pill"?"999px":direction.shape==="sharp"||direction.shape==="cut"?"3px":`${Math.max(4,radius*.7)}px`,
    "--skin-card-shadow":theme.shadow==="none"?"none":theme.shadow==="sharp"?"0 1px 2px rgb(0 0 0 / .16)":theme.shadow==="medium"?"0 12px 36px rgb(0 0 0 / .14)":"0 5px 24px rgb(0 0 0 / .07)",
    "--skin-art-opacity":direction.artwork==="none"?"0":direction.composition==="cinematic"?"0.68":"0.42",
    "--skin-texture-opacity":direction.texture==="none"?"0":direction.texture==="grain"?"0.13":direction.texture==="mesh"?"0.1":"0.22",
    "--skin-surface-blur":direction.surface==="glass"?"18px":"0px",
    "--skin-border-style":direction.shape==="cut"?"solid":"solid",
    "--skin-density-factor":theme.density==="compact"?"0.82":"1",
    "--skin-motion-duration":direction.motion==="kinetic"?"180ms":direction.motion==="slow"?"650ms":"0ms",
    "--skin-background":t.background,"--background":t.background,"--foreground":t.foreground,
    "--card":t.card,"--card-foreground":t.cardForeground,"--popover":t.popover,"--popover-foreground":t.popoverForeground,
    "--primary":t.primary,"--primary-foreground":t.primaryForeground,"--secondary":t.secondary,"--secondary-foreground":t.secondaryForeground,
    "--muted":t.muted,"--muted-foreground":t.mutedForeground,"--accent":t.accent,"--accent-foreground":t.accentForeground,
    "--destructive":t.destructive,"--destructive-foreground":t.destructiveForeground,"--border":t.border,"--input":t.input,"--ring":t.ring,
    "--sidebar":t.sidebar,"--sidebar-foreground":t.sidebarForeground,
    "--sidebar-primary":t.sidebarPrimary,"--sidebar-primary-foreground":t.sidebarPrimaryForeground,
    "--sidebar-accent":t.sidebarAccent,"--sidebar-accent-foreground":t.sidebarAccentForeground,
    "--sidebar-border":t.sidebarBorder,"--sidebar-ring":t.sidebarRing,
    "--chart-1":t.chart1,"--chart-2":t.chart2,"--chart-3":t.chart3,"--chart-4":t.chart4,"--chart-5":t.chart5,
    "--surface":t.surface,"--surface-foreground":t.surfaceForeground,"--code":t.code,
    "--code-foreground":t.codeForeground,"--code-highlight":t.codeHighlight,"--code-number":t.codeNumber,
    "--selection":t.selection,"--selection-foreground":t.selectionForeground,"--overlay":t.overlay,
    "--skin-shadow":theme.shadow==="none"?"none":theme.shadow==="sharp"?"0 1px 2px rgb(0 0 0 / .16)":theme.shadow==="medium"?"0 8px 24px rgb(0 0 0 / .12)":"0 4px 16px rgb(0 0 0 / .07)",
  }
  return css as CSSProperties
}

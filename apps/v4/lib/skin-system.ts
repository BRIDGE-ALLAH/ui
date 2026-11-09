import type { CSSProperties } from "react"

export type SkinMode = "light" | "dark"
export type SkinTokens = {
  background: string; foreground: string; card: string; cardForeground: string
  popover: string; popoverForeground: string; primary: string; primaryForeground: string
  secondary: string; secondaryForeground: string; muted: string; mutedForeground: string
  accent: string; accentForeground: string; destructive: string; destructiveForeground: string
  border: string; input: string; ring: string; sidebar: string; sidebarForeground: string
  chart1: string; chart2: string; chart3: string
}
export type SkinTheme = {
  name: string; label: string; description?: string; radius: number; font: string
  density: "comfortable" | "compact"; shadow: "soft" | "medium" | "sharp" | "none"
  light: SkinTokens; dark: SkinTokens
}
const neutralLight: SkinTokens = {
  background:"#ffffff",foreground:"#171717",card:"#ffffff",cardForeground:"#171717",
  popover:"#ffffff",popoverForeground:"#171717",primary:"#171717",primaryForeground:"#fafafa",
  secondary:"#f5f5f5",secondaryForeground:"#262626",muted:"#f5f5f5",mutedForeground:"#737373",
  accent:"#f5f5f5",accentForeground:"#262626",destructive:"#dc2626",destructiveForeground:"#ffffff",
  border:"#e5e5e5",input:"#e5e5e5",ring:"#a3a3a3",sidebar:"#fafafa",sidebarForeground:"#171717",
  chart1:"#2563eb",chart2:"#16a34a",chart3:"#d97706",
}
const neutralDark: SkinTokens = {
  background:"#171717",foreground:"#fafafa",card:"#262626",cardForeground:"#fafafa",
  popover:"#262626",popoverForeground:"#fafafa",primary:"#fafafa",primaryForeground:"#262626",
  secondary:"#404040",secondaryForeground:"#fafafa",muted:"#404040",mutedForeground:"#a3a3a3",
  accent:"#404040",accentForeground:"#fafafa",destructive:"#ef4444",destructiveForeground:"#ffffff",
  border:"#404040",input:"#525252",ring:"#737373",sidebar:"#202020",sidebarForeground:"#fafafa",
  chart1:"#60a5fa",chart2:"#4ade80",chart3:"#fbbf24",
}
function palette(label:string,primary:string,primaryForeground:string,darkPrimary:string,darkPrimaryForeground:string,background="#ffffff",darkBackground="#171717",foreground="#171717",darkForeground="#fafafa"):SkinTheme {
  return {name:label.toLowerCase().replace(/[^a-z0-9]+/g,"-"),label,radius:10,font:"Inter, ui-sans-serif, system-ui, sans-serif",density:"comfortable",shadow:"soft",
    light:{...neutralLight,background,foreground,primary,primaryForeground,ring:primary},
    dark:{...neutralDark,background:darkBackground,foreground:darkForeground,primary:darkPrimary,primaryForeground:darkPrimaryForeground,ring:darkPrimary}}
}
export const SKIN_PRESETS:SkinTheme[]=[
  {...palette("Neutral","#171717","#ffffff","#fafafa","#262626"),name:"neutral"},
  palette("Ocean","#0369a1","#ffffff","#38bdf8","#082f49","#f8fcff","#071923","#102a3a","#e6f7ff"),
  palette("Emerald","#047857","#ffffff","#34d399","#052e24","#f7fdf9","#071b15","#12372b","#e8fff4"),
  palette("Rose","#e11d48","#ffffff","#fb7185","#4c0519","#fffafb","#211016","#3b1722","#fff1f4"),
  palette("Violet","#7c3aed","#ffffff","#a78bfa","#2e1065","#fcfaff","#171126","#271b3c","#f4edff"),
  palette("Amber","#b45309","#ffffff","#fbbf24","#451a03","#fffdf7","#21190b","#3d2b13","#fff6df"),
  palette("Nord","#5e81ac","#ffffff","#88c0d0","#2e3440","#eceff4","#2e3440","#2e3440","#eceff4"),
  palette("Dracula","#bd93f9","#282a36","#ff79c6","#282a36","#f8f7fc","#282a36","#282a36","#f8f8f2"),
  palette("Cyberpunk","#db2777","#ffffff","#22d3ee","#083344","#fff7fc","#100b1c","#2a1530","#fce7f3"),
]
export const DEFAULT_SKIN=SKIN_PRESETS[0]
export const SKIN_TOKEN_LABELS:{key:keyof SkinTokens;label:string}[]=[
  {key:"background",label:"Background"},{key:"foreground",label:"Foreground"},{key:"card",label:"Card"},
  {key:"cardForeground",label:"Card foreground"},{key:"popover",label:"Popover"},{key:"popoverForeground",label:"Popover foreground"},
  {key:"primary",label:"Primary"},{key:"primaryForeground",label:"Primary foreground"},{key:"secondary",label:"Secondary"},
  {key:"secondaryForeground",label:"Secondary foreground"},{key:"muted",label:"Muted"},{key:"mutedForeground",label:"Muted foreground"},
  {key:"accent",label:"Accent"},{key:"accentForeground",label:"Accent foreground"},{key:"destructive",label:"Destructive"},
  {key:"destructiveForeground",label:"Destructive foreground"},{key:"border",label:"Border"},{key:"input",label:"Input"},
  {key:"ring",label:"Focus ring"},{key:"sidebar",label:"Sidebar"},{key:"sidebarForeground",label:"Sidebar foreground"},
  {key:"chart1",label:"Chart 1"},{key:"chart2",label:"Chart 2"},{key:"chart3",label:"Chart 3"},
]
const TOKEN_NAMES:Record<keyof SkinTokens,string>={
  background:"background",foreground:"foreground",card:"card",cardForeground:"card-foreground",
  popover:"popover",popoverForeground:"popover-foreground",primary:"primary",primaryForeground:"primary-foreground",
  secondary:"secondary",secondaryForeground:"secondary-foreground",muted:"muted",mutedForeground:"muted-foreground",
  accent:"accent",accentForeground:"accent-foreground",destructive:"destructive",destructiveForeground:"destructive-foreground",
  border:"border",input:"input",ring:"ring",sidebar:"sidebar",sidebarForeground:"sidebar-foreground",
  chart1:"chart-1",chart2:"chart-2",chart3:"chart-3",
}
export function skinTokensToCss(tokens:SkinTokens){return (Object.keys(TOKEN_NAMES) as (keyof SkinTokens)[]).map(key=>`  --${TOKEN_NAMES[key]}: ${tokens[key]};`).join("\n")}
export function skinToCss(theme:SkinTheme){return `:root {\n  --radius: ${theme.radius/16}rem;\n  --font-sans: ${theme.font};\n${skinTokensToCss(theme.light)}\n}\n\n.dark {\n${skinTokensToCss(theme.dark)}\n}\n`}
export function skinToRegistryItem(theme:SkinTheme){
  const map=(tokens:SkinTokens)=>Object.fromEntries((Object.keys(TOKEN_NAMES) as (keyof SkinTokens)[]).map(key=>[TOKEN_NAMES[key],tokens[key]]))
  return {$schema:"https://ui.shadcn.com/schema/registry-item.json",name:theme.name,type:"registry:theme",title:theme.label,description:theme.description??`Custom ${theme.label} theme`,cssVars:{light:map(theme.light),dark:map(theme.dark),theme:{radius:`${theme.radius/16}rem`,"font-sans":theme.font}}}
}
export function skinToStyle(theme:SkinTheme,mode:SkinMode){
  const t=theme[mode]
  const css:Record<string,string>={
    "--radius":`${theme.radius}px`,"--font-sans":theme.font,
    "--background":t.background,"--foreground":t.foreground,"--card":t.card,"--card-foreground":t.cardForeground,
    "--popover":t.popover,"--popover-foreground":t.popoverForeground,"--primary":t.primary,"--primary-foreground":t.primaryForeground,
    "--secondary":t.secondary,"--secondary-foreground":t.secondaryForeground,"--muted":t.muted,"--muted-foreground":t.mutedForeground,
    "--accent":t.accent,"--accent-foreground":t.accentForeground,"--destructive":t.destructive,"--destructive-foreground":t.destructiveForeground,
    "--border":t.border,"--input":t.input,"--ring":t.ring,"--sidebar":t.sidebar,"--sidebar-foreground":t.sidebarForeground,
    "--chart-1":t.chart1,"--chart-2":t.chart2,"--chart-3":t.chart3,
    "--skin-shadow":theme.shadow==="none"?"none":theme.shadow==="sharp"?"0 1px 2px rgb(0 0 0 / .16)":theme.shadow==="medium"?"0 8px 24px rgb(0 0 0 / .12)":"0 4px 16px rgb(0 0 0 / .07)",
  }
  return css as CSSProperties
}

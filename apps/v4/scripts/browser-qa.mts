import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import puppeteer from "puppeteer"

const BASE_URL = process.env.SKIN_VISUAL_BASE_URL ?? "http://localhost:4000"
const OUT_DIR = path.join(process.cwd(), ".artifacts", "browser-qa")
mkdirSync(OUT_DIR, { recursive: true })

const VIEWPORTS = [
  { name: "320", width: 320, height: 812 },
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
]

const ROUTES = ["/skin-preview", "/skin-studio"]

interface QAResult {
  route: string
  viewport: string
  mode: "light" | "dark"
  issues: string[]
  passed: boolean
}

async function runQA(
  browser: Awaited<ReturnType<typeof puppeteer.launch>>,
  route: "/skin-preview" | "/skin-studio",
  viewport: (typeof VIEWPORTS)[number],
  mode: "light" | "dark"
): Promise<QAResult> {
  const issues: string[] = []
  const page = await browser.newPage()
  await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
    { name: "prefers-color-scheme", value: mode },
  ])

  await page.goto(BASE_URL + route, { waitUntil: "networkidle2" })
  await page.evaluate((activeMode) => {
    localStorage.setItem("theme", activeMode)
  }, mode)
  await page.reload({ waitUntil: "networkidle2" })

  // 1. Check scroll overflow at this viewport
  const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
  if (hasHorizontalScroll) issues.push("HORIZONTAL_SCROLL")

  // 2. Keyboard navigation: tab through interactive elements
  const interactiveCount = await page.evaluate(() => {
    const els = document.querySelectorAll("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
    return els.length
  })
  if (interactiveCount === 0) issues.push("NO_INTERACTIVE_ELEMENTS")

  // 3. Focus states: click body, tab, check visible focus ring
  await page.click("body", { offset: { x: 10, y: 10 } })
  await page.keyboard.press("Tab")
  const hasFocusRing = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return false
    const style = window.getComputedStyle(el)
    const outline = style.outlineWidth
    const boxShadow = style.boxShadow
    return parseFloat(outline) > 0 || (boxShadow !== "none" && boxShadow !== "")
  })
  if (!hasFocusRing) issues.push("NO_FOCUS_RING_ON_TAB")

  // 4. Screen reader semantics: check for landmarks
  const landmarks = await page.evaluate(() => ({
    main: !!document.querySelector("main, [role=main]"),
    nav: !!document.querySelector("nav, [role=navigation]"),
    header: !!document.querySelector("header, [role=banner]"),
    button_labels: (() => {
      const unlabeled = Array.from(document.querySelectorAll("button")).filter(
        (b) => !b.textContent?.trim() && !b.getAttribute("aria-label") && !b.getAttribute("aria-labelledby")
      )
      return unlabeled.length
    })(),
    img_alts: (() => {
      const imgs = Array.from(document.querySelectorAll("img"))
      return imgs.filter((img) => img.getAttribute("alt") === null).length
    })(),
  }))
  if (!landmarks.main) issues.push("MISSING_MAIN_LANDMARK")
  if (landmarks.button_labels > 0) issues.push(`${landmarks.button_labels}_BUTTONS_MISSING_LABEL`)
  if (landmarks.img_alts > 0) issues.push(`${landmarks.img_alts}_IMGS_MISSING_ALT`)

  // 5. Reduced motion: check no infinite animations
  const hasInfiniteAnimation = await page.evaluate(() => {
    const animated = Array.from(document.querySelectorAll("*")).filter((el) => {
      const s = window.getComputedStyle(el)
      return s.animationDuration !== "0s" && s.animationIterationCount === "infinite"
    })
    return animated.length
  })
  if (hasInfiniteAnimation > 0) issues.push(`${hasInfiniteAnimation}_INFINITE_ANIMATIONS_WITH_REDUCED_MOTION`)

  // 6. Light/dark mode: verify data-theme or class
  const themeApplied = await page.evaluate((m) => {
    const root = document.documentElement
    return (
      root.classList.contains(m) ||
      root.getAttribute("data-theme") === m ||
      root.getAttribute("class")?.includes(m) ||
      (m === "dark" && root.classList.contains("dark")) ||
      (m === "light" && !root.classList.contains("dark"))
    )
  }, mode)
  if (!themeApplied) issues.push(`THEME_NOT_APPLIED_${mode.toUpperCase()}`)

  // Screenshot for evidence
  const screenshotName = `${route.slice(1)}-${mode}-${viewport.name}.png`
  await page.screenshot({ path: path.join(OUT_DIR, screenshotName), fullPage: false })

  await page.close()
  return { route, viewport: viewport.name, mode, issues, passed: issues.length === 0 }
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const results: QAResult[] = []

  try {
    for (const route of ROUTES) {
      for (const viewport of VIEWPORTS) {
        for (const mode of ["light", "dark"] as const) {
          const result = await runQA(browser, route as "/skin-preview" | "/skin-studio", viewport, mode)
          results.push(result)
          const icon = result.passed ? "✓" : "✗"
          const issueStr = result.issues.length > 0 ? ` ISSUES: ${result.issues.join(", ")}` : ""
          console.log(`${icon}  ${route} @${viewport.name}px ${mode}${issueStr}`)
        }
      }
    }
  } finally {
    await browser.close()
  }

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const total = results.length
  console.log(`\nBrowser QA: ${passed} passed, ${failed} failed out of ${total}`)

  writeFileSync(
    path.join(OUT_DIR, "report.json"),
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
  )
  console.log(`Report: ${path.join(OUT_DIR, "report.json")}`)

  if (failed > 0) {
    console.error("\nFailed:")
    for (const r of results.filter((r) => !r.passed)) {
      console.error(`  ${r.route} @${r.viewport}px ${r.mode}: ${r.issues.join(", ")}`)
    }
    process.exit(1)
  }
}

main().catch((err) => { console.error(err); process.exit(1) })

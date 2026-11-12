import { mkdirSync } from "node:fs"
import path from "node:path"
import puppeteer from "puppeteer"

import { SKIN_PRESETS } from "../lib/skin-system"

const baseUrl = process.env.SKIN_VISUAL_BASE_URL ?? "http://localhost:4000"
const updateBaselines = process.argv.includes("--update-baselines")
const outputDirectory = updateBaselines
  ? path.join(process.cwd(), "visual/skin-system/baselines")
  : path.join(process.cwd(), ".artifacts/skin-system")

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "desktop", width: 1440, height: 1000 },
]

const studioPresetIndexes = [0, 1, 8]
const studioPresets = studioPresetIndexes.map((index) => SKIN_PRESETS[index])

async function captureRoute(
  browser: Awaited<ReturnType<typeof puppeteer.launch>>,
  route: "/skin-preview" | "/skin-studio",
  skin: (typeof SKIN_PRESETS)[number],
  mode: "light" | "dark",
  viewport: (typeof viewports)[number]
) {
  const page = await browser.newPage({
    viewport: {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
    },
  })

  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ])

  await page.goto(baseUrl + route, { waitUntil: "networkidle2" })
  await page.evaluate(
    ({ activeSkin, activeMode }) => {
      localStorage.setItem("shadcn-skin", JSON.stringify(activeSkin))
      localStorage.setItem("theme", activeMode)
    },
    { activeSkin: skin, activeMode: mode }
  )
  await page.reload({ waitUntil: "networkidle2" })
  await page.waitForFunction(
    (skinName) => document.querySelector(".skin-root")?.getAttribute("data-skin") === skinName,
    {},
    skin.name
  )
  await page.evaluate(async () => {
    await document.fonts.ready
    const style = document.createElement("style")
    style.dataset.visualCapture = "true"
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
      }
    `
    document.head.appendChild(style)
  })

  const fileName = [
    route.slice(1),
    skin.name,
    mode,
    viewport.name,
  ].join("-") + ".png"
  const outputPath = path.join(outputDirectory, fileName)
  await page.screenshot({ path: outputPath, fullPage: true })
  await page.close()
  console.log(`Captured ${route} / ${skin.name} / ${mode} / ${viewport.name}`)
}

async function main() {
  mkdirSync(outputDirectory, { recursive: true })
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    for (const skin of SKIN_PRESETS) {
      for (const mode of ["light", "dark"] as const) {
        for (const viewport of viewports) {
          await captureRoute(browser, "/skin-preview", skin, mode, viewport)
        }
      }
    }

    for (const skin of studioPresets) {
      for (const mode of ["light", "dark"] as const) {
        for (const viewport of viewports) {
          await captureRoute(browser, "/skin-studio", skin, mode, viewport)
        }
      }
    }
  } finally {
    await browser.close()
  }

  console.log(`Visual snapshots written to ${outputDirectory}`)
  if (updateBaselines) {
    console.log("Review the generated images before committing baseline updates.")
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

import { createReadStream } from "node:fs"
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PNG } from "pngjs"
import pixelmatch from "pixelmatch"

const artifactsDir = path.join(process.cwd(), ".artifacts", "skin-system")
const baselinesDir = path.join(process.cwd(), "visual", "skin-system", "baselines")
const diffDir = path.join(process.cwd(), ".artifacts", "skin-system-diff")

const THRESHOLD = 0.1
const MAX_DIFF_PERCENT = 0.005

function readPng(filePath: string): PNG {
  const data = readFileSync(filePath)
  return PNG.sync.read(data)
}

interface DiffResult {
  file: string
  diffPixels: number
  totalPixels: number
  diffPercent: number
  passed: boolean
  error?: string
}

function diffImages(snapshotPath: string, baselinePath: string, outputPath: string): DiffResult {
  let snapshot: PNG
  let baseline: PNG
  try {
    snapshot = readPng(snapshotPath)
    baseline = readPng(baselinePath)
  } catch (err) {
    return {
      file: path.basename(snapshotPath),
      diffPixels: 0,
      totalPixels: 0,
      diffPercent: 0,
      passed: false,
      error: `Failed to read PNG: ${(err as Error).message}`,
    }
  }

  if (snapshot.width !== baseline.width || snapshot.height !== baseline.height) {
    return {
      file: path.basename(snapshotPath),
      diffPixels: snapshot.width * snapshot.height,
      totalPixels: snapshot.width * snapshot.height,
      diffPercent: 1,
      passed: false,
      error: `Dimension mismatch: snapshot ${snapshot.width}x${snapshot.height} vs baseline ${baseline.width}x${baseline.height}`,
    }
  }

  const { width, height } = snapshot
  const diffPng = new PNG({ width, height })

  const diffPixels = pixelmatch(
    snapshot.data,
    baseline.data,
    diffPng.data,
    width,
    height,
    { threshold: THRESHOLD, includeAA: false }
  )

  const totalPixels = width * height
  const diffPercent = diffPixels / totalPixels

  writeFileSync(outputPath, PNG.sync.write(diffPng))

  return {
    file: path.basename(snapshotPath),
    diffPixels,
    totalPixels,
    diffPercent,
    passed: diffPercent <= MAX_DIFF_PERCENT,
  }
}

function main() {
  mkdirSync(diffDir, { recursive: true })

  let baselineFiles: string[]
  try {
    baselineFiles = readdirSync(baselinesDir).filter((f) => f.endsWith(".png"))
  } catch {
    console.error(`No baselines found at ${baselinesDir}`)
    console.error("Run: pnpm --filter=v4 visual:capture -- --update-baselines")
    console.error("Then review and commit the generated PNGs under apps/v4/visual/skin-system/baselines/")
    process.exit(1)
  }

  if (baselineFiles.length === 0) {
    console.error("Baseline directory exists but contains no PNG files.")
    console.error("Run: pnpm --filter=v4 visual:capture -- --update-baselines")
    process.exit(1)
  }

  let snapshotFiles: string[]
  try {
    snapshotFiles = readdirSync(artifactsDir).filter((f) => f.endsWith(".png"))
  } catch {
    console.error(`No snapshots found at ${artifactsDir}`)
    console.error("Run: pnpm --filter=v4 visual:capture  (then re-run this diff)")
    process.exit(1)
  }

  const snapshotSet = new Set(snapshotFiles)
  const results: DiffResult[] = []
  const missing: string[] = []

  for (const baselineFile of baselineFiles) {
    if (!snapshotSet.has(baselineFile)) {
      missing.push(baselineFile)
      results.push({
        file: baselineFile,
        diffPixels: 0,
        totalPixels: 0,
        diffPercent: 1,
        passed: false,
        error: "Snapshot missing — run visual:capture before visual:diff",
      })
      continue
    }

    const snapshotPath = path.join(artifactsDir, baselineFile)
    const baselinePath = path.join(baselinesDir, baselineFile)
    const diffName = baselineFile.replace(".png", ".diff.png")
    const diffOutputPath = path.join(diffDir, diffName)

    const result = diffImages(snapshotPath, baselinePath, diffOutputPath)
    results.push(result)

    const pct = (result.diffPercent * 100).toFixed(3)
    const icon = result.passed ? "✓" : "✗"
    if (result.error) {
      console.log(`${icon}  ${result.file}: ${result.error}`)
    } else {
      console.log(`${icon}  ${result.file}: ${result.diffPixels} px diff (${pct}%)`)
    }
  }

  const passed = results.filter((r) => r.passed)
  const failed = results.filter((r) => !r.passed)

  console.log("")
  console.log(`Results: ${passed.length} passed, ${failed.length} failed out of ${results.length} baselines`)
  console.log(`Diff images written to ${diffDir}`)

  const reportPath = path.join(diffDir, "report.json")
  writeFileSync(reportPath, JSON.stringify({ threshold: THRESHOLD, maxDiffPercent: MAX_DIFF_PERCENT, results }, null, 2))
  console.log(`Report written to ${reportPath}`)

  if (failed.length > 0) {
    console.error("")
    console.error("Failed comparisons:")
    for (const r of failed) {
      if (r.error) {
        console.error(`  - ${r.file}: ${r.error}`)
      } else {
        const pct = (r.diffPercent * 100).toFixed(3)
        console.error(`  - ${r.file}: ${r.diffPixels} px (${pct}%) exceeds limit of ${(MAX_DIFF_PERCENT * 100).toFixed(2)}%`)
      }
    }
    process.exit(1)
  }
}

main()

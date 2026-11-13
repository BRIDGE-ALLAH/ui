# Skin System visual regression workflow

## Snapshot matrix

The capture script creates deterministic browser screenshots for:

- Dashboard preview: all nine presets x light/dark x mobile (375x812) and desktop (1440x1000).
- Skin Studio: representative Quiet Editorial, Blue Hour Cinema, and Signal / Noise presets x light/dark x mobile and desktop.
- Reduced motion is emulated and CSS animation/transition/caret effects are disabled before capture.
- Dashboard demo data is fixture-based and the capture script does not click demo actions.

Run from the repository root with the v4 development server already listening on port 4000:

```bash
pnpm --filter=v4 visual:capture
```

Screenshots are written to `apps/v4/.artifacts/skin-system`. Set `SKIN_VISUAL_BASE_URL` to capture a different local preview URL.

## Pixel-diff comparison

After capturing, compare every snapshot against the committed baselines:

```bash
pnpm --filter=v4 visual:diff
```

The diff script (`apps/v4/scripts/diff-skin-visuals.mts`) compares each captured PNG against
`apps/v4/visual/skin-system/baselines/`. It:

- Uses `pixelmatch` with a threshold of 0.1 (anti-aliasing tolerant).
- Fails if any snapshot differs by more than 0.5% of total pixels.
- Writes per-file diff PNGs to `apps/v4/.artifacts/skin-system-diff/`.
- Writes a machine-readable `report.json` in the same directory.
- Exits non-zero if any comparison fails, dimension mismatches, or baselines are missing.

Baselines must be committed before the diff step passes. If no baselines exist, the script prints
instructions and exits with a non-zero code.

## CI workflow

The `Skin visual snapshots and pixel-diff` workflow runs when skin system source or baseline files
change. It:

1. Builds the v4 registry.
2. Starts the v4 dev server.
3. Captures the full matrix.
4. Runs `visual:diff` against committed baselines (skips gracefully if none are committed yet).
5. Uploads diff PNGs as a 14-day artifact named `skin-system-visual-diff`.
6. Uploads snapshot PNGs as a 14-day artifact named `skin-system-visual-snapshots`.

## Baseline establishment procedure

1. Run `pnpm --filter=v4 visual:capture -- --update-baselines` on the branch you want to baseline.
2. Inspect every PNG under `apps/v4/visual/skin-system/baselines/`.
   - Check layout, typography, artwork, token application, responsive breakpoints, and light/dark accuracy.
   - Do not accept unexplained changes.
3. Commit only the reviewed PNGs. Record why the baseline was established or changed in the PR.
4. On subsequent CI runs, `visual:diff` automatically compares against those committed baselines.

## Baseline update procedure

1. Run the capture matrix against the target and change branches with identical Node, pnpm, Bun,
   Puppeteer/Chrome, and viewport settings.
2. Run `pnpm --filter=v4 visual:diff` on both; review the diff PNGs in the uploaded artifacts.
3. For an intentional visual change, run:
   ```bash
   pnpm --filter=v4 visual:capture -- --update-baselines
   ```
4. Review every regenerated PNG before committing it under `apps/v4/visual/skin-system/baselines`.
5. Record why the baseline changed in the PR. Keep the set limited to the documented matrix.
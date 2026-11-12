# Skin System visual regression workflow

## Snapshot matrix

The capture script creates deterministic browser screenshots for:

- Dashboard preview: all nine presets × light/dark × mobile (375×812) and desktop (1440×1000).
- Skin Studio: representative Quiet Editorial, Blue Hour Cinema, and Signal / Noise presets × light/dark × mobile and desktop.
- Reduced motion is emulated and CSS animation/transition/caret effects are disabled before capture.
- Dashboard demo data is fixture-based and the capture script does not click demo actions.

Run from the repository root with the v4 development server already listening on port 4000:

```bash
pnpm --filter=v4 visual:capture
```

Screenshots are written to `apps/v4/.artifacts/skin-system`. Set `SKIN_VISUAL_BASE_URL` to capture a different local preview URL.

## CI artifacts

The `Skin visual snapshots` workflow runs when Skin System runtime, CSS, or capture code changes. It builds the v4 registry, starts the v4 app, captures the matrix, and uploads the screenshots as a 14-day artifact for review.

## Baseline update procedure

1. Run the capture matrix against the target branch and the change branch with the same Node, pnpm, Bun, Puppeteer/Chrome, and viewport settings.
2. Compare the two artifact sets. Review layout, typography, artwork, token, responsive, and light/dark differences; do not accept unexplained changes.
3. For an intentional visual change, run:
   ```bash
   pnpm --filter=v4 visual:capture -- --update-baselines
   ```
4. Review every generated PNG before committing it under `apps/v4/visual/skin-system/baselines`.
5. Record why the baseline changed in the PR and keep the screenshot set limited to the documented matrix.

## Current limitation

This workflow currently **captures and uploads** snapshots; it does not yet perform pixel-diff comparison against committed baselines. Initial baseline capture and reviewer approval must happen in a browser-capable environment before #30 can be considered complete. Do not treat artifact generation alone as a visual regression pass.

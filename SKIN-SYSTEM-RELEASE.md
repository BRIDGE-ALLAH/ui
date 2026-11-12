# Skin System release gate

**Release blocked — validation evidence pending.**

This is a release-readiness checklist and draft changelog only. It does not authorize a release, tag, or version bump. The follow-up implementation PRs must be merged and all required evidence recorded before release.

## Draft changelog

### Added

- Nine authored narrative visual identities: Quiet Editorial, Blue Hour Cinema, Living Archive, Soft Surrealism, Prismatic Field, Printed Matter, Quiet Instrument, Night Theatre, and Signal / Noise.
- Narrative metadata, composition modes, selectable vector artwork, 41 semantic light/dark tokens, typography, shape, surface, texture, density, shadow, and motion controls.
- SkinProvider/useSkin runtime, browser-local active-skin persistence, same-tab and cross-tab synchronization.
- Skin Studio draft/save/apply workflow, JSON import, CSS and registry JSON export, accessible SVG artwork export, and browser-local custom skin library.
- Reusable SkinArtwork, SkinSurface, and SkinHero primitives.
- Dashboard preview with nine-skin switching and deterministic demo interactions.
- Runtime documentation, contributor contract, QA matrices, and contrast/snapshot tooling.

### Changed

- Dialog and Sheet backdrops use a semantic overlay token.
- Core destructive controls use semantic destructive foreground tokens.
- Studio and dashboard expose accessible selected/current states and clearer demo-only behavior.
- Focus/input/chart token values are adjusted to meet the configured contrast thresholds.

### Known limitations

- Active skin and custom skin library are browser-local; there is no account sync, server persistence, or cross-device library.
- Browser storage can be unavailable; in-memory updates do not imply durable persistence.
- The optional SkinProvider `theme` prop opts out of automatic storage/event hydration.
- The visual workflow currently captures and uploads screenshots but does not compare against committed baselines or run pixel-diff assertions.
- Browser viewport screenshots, screen-reader checks, and SVG reopen verification remain pending until a browser-capable run is recorded.
- No follow-up PR or CI result should be described as passing until it has actually run.

## Required implementation PRs

Merge and validate in dependency order:

- [ ] [#33 — CSS export fix and pure utility tests](https://github.com/BRIDGE-ALLAH/ui/pull/33)
- [ ] [#34 — Provider storage, schema validation, safe import](https://github.com/BRIDGE-ALLAH/ui/pull/34)
- [ ] [#35 — Semantic tokens, light/dark mapping, CSS scope](https://github.com/BRIDGE-ALLAH/ui/pull/35)
- [ ] [#36 — Typography, craft, motion, contrast](https://github.com/BRIDGE-ALLAH/ui/pull/36)
- [ ] [#37 — Core controls](https://github.com/BRIDGE-ALLAH/ui/pull/37)
- [ ] [#38 — Overlay and component token integration](https://github.com/BRIDGE-ALLAH/ui/pull/38)
- [ ] [#39 — Studio accessibility/responsive](https://github.com/BRIDGE-ALLAH/ui/pull/39)
- [ ] [#40 — Dashboard behavior/accessibility/responsive](https://github.com/BRIDGE-ALLAH/ui/pull/40)
- [ ] [#41 — Studio draft and custom skin library](https://github.com/BRIDGE-ALLAH/ui/pull/41)
- [ ] [#42 — Accessible SVG export](https://github.com/BRIDGE-ALLAH/ui/pull/42)
- [ ] [#43 — Runtime documentation](https://github.com/BRIDGE-ALLAH/ui/pull/43)
- [ ] [#44 — Contributor/agent contract](https://github.com/BRIDGE-ALLAH/ui/pull/44)
- [ ] [#45 — Visual snapshot capture groundwork](https://github.com/BRIDGE-ALLAH/ui/pull/45)

Do not merge stacked PRs out of order. Resolve conflicts and re-run checks after each merge.

## Automated validation evidence

- [ ] `pnpm --filter=v4 lint` — attach successful CI/local run.
- [ ] `pnpm --filter=v4 typecheck` — attach successful CI/local run.
- [ ] `pnpm --filter=v4 test` — attach unit and artwork test results.
- [ ] `pnpm --filter=v4 skin:contrast` — attach report for all nine presets in light/dark.
- [ ] `pnpm --filter=v4 build` — attach successful production build.
- [ ] Verify the PR workflow includes all required jobs and no skipped required job.

## Manual quality evidence

- [ ] Studio responsive screenshots at 320, 375, 768, 1024, 1280, and 1440 px.
- [ ] Dashboard responsive screenshots at 320, 375, 768, 1024, 1280, and 1440 px.
- [ ] Keyboard traversal and selected/current state verification for Studio and Dashboard.
- [ ] Screen-reader verification for labels, status announcements, artwork, and chart summaries.
- [ ] All nine presets checked in light and dark mode.
- [ ] Reduced-motion preference verified in browser.
- [ ] SVG export reopened in a browser/vector viewer and checked for title, description, dimensions, and rendering.
- [ ] Initial visual baselines reviewed and committed; CI pixel-diff comparison implemented and passing.
- [ ] No horizontal overflow, clipped controls, or unintended visual leakage outside SkinProvider.

## Documentation and release metadata

- [ ] Verify `/docs/skin-system`, `/docs/skin-system-contributing`, `/skin-studio`, and `/skin-preview` in a production build.
- [ ] Confirm user docs describe browser-local persistence and all known limitations.
- [ ] Confirm versioning/changelog follows repository policy. Do not add a package changeset for app-only changes unless a publishable package API changed.
- [ ] Release owner approves the final changelog and version/tag.
- [ ] No release is published while any required check or manual evidence remains pending.

## Current release decision

**BLOCKED.** The follow-up PRs are still open and this session has not executed lint, typecheck, unit tests, contrast report, production build, browser tests, screen-reader checks, SVG reopen verification, or visual baseline comparison. Revisit this checklist only after those results exist.

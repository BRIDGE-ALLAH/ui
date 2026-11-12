# Skin Studio accessibility and responsive QA matrix

This matrix is the repeatable manual verification contract for `/skin-studio`. It is not a claim that the checks have already been executed.

## Viewport matrix

| Viewport width | Expected layout | Required checks |
| ---: | --- | --- |
| 320 px | Single-column editor and preview; two-column section navigation | No page-level horizontal overflow; fields and actions fit; long narrative text wraps |
| 375 px | Single-column editor and preview | Preset cards and token controls remain readable; preview does not cover actions |
| 768 px | Single-column editor and preview | Editor controls remain reachable; no clipped tabs, import textarea, or export actions |
| 1024 px | Single-column editor and preview | Preview remains below the editor and uses available width |
| 1280 px | Two-column editor and preview where space permits | Both columns remain independently readable; sticky preview does not cover content |
| 1440 px | Two-column editor and preview | Balanced column widths; no stretched controls or clipped preview |

## Keyboard and assistive-technology checks

- [ ] Tab reaches section navigation, preset choices, every editor field, mode controls, export actions, import, and save.
- [ ] Enter/Space activates buttons and choice controls.
- [ ] Section navigation exposes the current section through pressed/current state.
- [ ] Preset choices and light/dark/export-format choices expose pressed/selected state.
- [ ] Every input, select, range, color input, and textarea has an accessible name.
- [ ] Save/import/export feedback is announced through a polite status region.
- [ ] Decorative artwork and non-interactive preview samples do not enter the tab order or accessibility tree.
- [ ] Focus remains visible and follows a logical order.

## Draft and custom-library checks

- [ ] Editing any field changes the Studio status to an unsaved draft.
- [ ] Switching Studio sections preserves the current draft.
- [ ] Save normalizes the theme, persists it as the active skin, and updates mounted SkinProvider consumers.
- [ ] Reset requires confirmation and restores the canonical default draft.
- [ ] Replacing an unsaved draft with a preset or import requires confirmation.
- [ ] Leaving the page with an unsaved draft triggers the browser's before-unload warning where supported.
- [ ] Create from default and duplicate current create uniquely named custom skins.
- [ ] Editing or renaming a custom skin does not mutate any built-in preset.
- [ ] Custom skins survive reload, can be selected, duplicated, renamed, and deleted.
- [ ] Deleting the currently applied custom skin returns the active skin to the default.
- [ ] Export copy status distinguishes unsaved draft, saved library item, and applied skin.

## Manual run instructions

1. Open `/skin-studio` at each viewport width above.
2. Check document-level horizontal overflow and verify all controls remain visible.
3. Complete the keyboard checklist without using a pointer.
4. Verify selected state and status announcements with a screen reader.
5. Repeat in light and dark preview modes and with all nine presets.
6. Record screenshots for 320, 768, 1024, and 1440 px in the PR that performs the actual browser run.

## Current status

The implementation adds accessible names, selected states, polite status announcements, removes inert preview buttons from the tab order, and includes saved/draft/applied state plus a versioned local custom-skin library. The manual viewport, keyboard, and screen-reader checks remain pending until a browser run is performed.

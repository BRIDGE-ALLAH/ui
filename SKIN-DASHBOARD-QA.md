# Skin Dashboard preview QA matrix

This is the manual verification contract for `/skin-preview`. It is not evidence that a browser run has already passed.

## Viewport matrix

| Width | Required layout checks |
| ---: | --- |
| 320 px | No page-level horizontal overflow; sidebar becomes mobile navigation; search/topbar fit; project table scrolls inside its own wrapper |
| 375 px | Skin choices remain reachable; metric cards use two columns; hero text and actions wrap |
| 768 px | Sidebar/content remain readable; lower panels do not collide; period controls remain visible |
| 1024 px | Main content has no clipped panels; search and top actions fit |
| 1280 px | Sidebar, content, lower grid, and project table align without overflow |
| 1440 px | Wide layout remains balanced; content does not stretch excessively |

## Interaction matrix

- [ ] Switch through all nine skins; tokens, art direction, hero copy, artwork, and chart styling update.
- [ ] Switching skins preserves selected period, search query, active navigation, and demo project state.
- [ ] 7D, 30D, and 90D controls update chart path and text summary; selected period exposes pressed state.
- [ ] Search filters project name, type, and status; clearing the query restores rows; unmatched queries show an empty state.
- [ ] Add demo project updates the local preview only and announces that it is not persisted.
- [ ] Dashboard navigation exposes the current item.
- [ ] Chart has an accessible name and a linked text summary.
- [ ] Decorative SVG artwork is hidden from assistive technology.
- [ ] Inert visual affordances do not enter the keyboard tab order.

## Manual run instructions

1. Open `/skin-preview` at each viewport width.
2. Check document-level horizontal overflow; the project table may scroll within its own wrapper.
3. Run the interaction matrix using keyboard and pointer.
4. Repeat skin switching and chart controls in light and dark modes.
5. Attach screenshots at 320, 375, 768, 1024, and 1440 px to the browser-verification PR.

## Current status

The source changes add active navigation/period states, chart summary association, demo-only labeling and announcements, and remove inert icon controls from the tab order. Browser viewport screenshots and interaction verification remain pending.

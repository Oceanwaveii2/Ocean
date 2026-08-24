# Tier 13 — UI Parity Dev Guide v1 (screenshot-by-screenshot)

**Written:** 2026-08-23 (session v2). **Companion to:**
`TIER13_CANVAS_UI_UPGRADE_SCOPE_v3.md` (the feature plan) and
`../HANDOFF_FOR_CLAUDE_2026-08-23_v2.md` (the session log).

Purpose: close the *visual/UX* gap to PureRef + Milanote + Miro/FigJam using
standard UX practices. Each entry names the exact reference file, what that
app does well, where Art Equation Studio stands TODAY (after session v2), and
one concrete, bounded change. Work top to bottom. Do not bundle item F
(dual-board split) with these — it is an architecture change, not polish.

The one-line design goal: **calm surface, progressive disclosure** — the canvas
is the hero; every control hides until it is relevant.

---

## 1. Milanote references

Files: `reference_screenshots/original_uploads/Milanote_A_board_view.png`,
`Milanote_B_columns.png`, `Milanote_C_color_panel.png`,
`Milanote_D_nested_boards.png`, `Milanote_E_column_detail.png`
(and lighter crops `Milanote_1..5.png`).

### A. Board view + columns (`Milanote_A/B/E`)
- **Reference behavior:** a board reads as a horizontal row of tall columns
  with consistent width, one accent color each, generous whitespace, tiny
  uppercase metadata ("12 CARDS, 3 FILES") under each column title.
- **Status: DONE (v3, live-verified).** Frame/group title bar now shows
  `<small class="board-group-count">N card(s)</small>`, derived from
  `board.items.filter(i => i.groupId === group.id).length` at render time.

### B. Color panel (`Milanote_C_color_panel.png`)
- **Reference:** fixed ~15 swatches + custom color + none, inline next to the
  selected element. Calm, no color-picker dialog.
- **Our state (NEW in v2):** exactly this pattern — `#board-color-menu`
  popover, 15 swatches + custom + none, wired to the board Color button and
  the group title-bar ● button.
- **Do:** nothing further, EXCEPT verify it live (it was code-reviewed, not
  browser-clicked in v2 — see handoff §2). If it works, mark done.

### C. Nesting + breadcrumbs (`Milanote_D`)
- **Reference:** boards inside boards; breadcrumb trail is the only
  navigation chrome; "0 Unsorted" global counter.
- **Status: DONE (v3, live-verified).** Board breadcrumb bar now shows
  "N unsorted" (cards with `groupId===''`), right-aligned, muted.

## 2. Miro / FigJam / Real Time Board references

Files: `original_uploads/Miro_A_frames_canvas.png`, `Miro_B_shape_palette.png`,
`Miro_C_text_toolbar.png`, `Miro_D_tools_overview.png`,
`FigJam_frame_creation_menu.png` (also `Miro_1..3.png`,
`Miro_text_toolbar.png`, `FigJam_frame_presets.png`).

### D. Frames canvas (`Miro_A`, FigJam menu)
- **Reference:** frames are named, sized on creation by preset, and their
  name floats ABOVE the frame box in small muted type.
- **Status: DONE (v3, live-verified).** Title bar is now transparent/
  borderless, positioned `absolute; top:-22px` so it floats above the
  frame's top edge; ●/✎/× buttons are `opacity:0` by default and revealed
  via `.board-group:hover` or `:focus-visible`. Confirmed live: hover
  reveal works correctly (verified via real `:hover` state, not assumed),
  computed opacity is 0 with mouse away and 1 on hover.

### E. Shape palette (`Miro_B`, `Miro_D`)
- **Reference:** shape tools are a compact vertical/segmented icon rail;
  drawing is drag-to-create on canvas.
- **Our state (NEW in v2):** 4 shape types via toolbar icon buttons,
  click-to-place at viewport center. Scope v3 explicitly cut the rest.
- **Do (small):** drag-to-create is the ONE gap users will feel: on toolbar
  shape-button `pointerdown`, enter a "draw mode" where the next canvas drag
  defines the shape's rect (reuse the marquee math in `startBoardPan`/
  `updateBoardMarquee`). If that grows, leave it — click-to-place is fine.

### F. Floating per-object text toolbar (`Miro_C`)
- **Reference:** selecting a text object floats a small format toolbar near
  it; the canvas otherwise shows zero chrome.
- **Our state:** the rich-text toolbar is a fixed second toolbar row — always
  visible, very wide, the single biggest "not like Miro" surface left.
- **Do (highest-impact visual change):** hide `#note-format-toolbar` entirely
  unless a note is being edited (state already exists:
  `noteFormatToolbarVisible()`), and relocate it to a floating panel anchored
  under the edited note (position: absolute within `#board-canvas-wrap`,
  computed from the note card's `offsetTop`). Keep the same controls.

## 3. PureRef references

Files: `reference_screenshots/` has no PureRef stills — use
`video_frame_analysis/VideoB_dense-chromeless-tiling.png`,
`VideoB_settings-dialog.png`, `VideoB_contact_sheet_1/2.png`.

### G. Dense chromeless tiling
- **Reference:** images pack edge-to-edge, ZERO chrome until hover.
- **Status: DONE (v3, live-verified).** `.board-canvas.board-minimal
  .board-card` now flattens `border-color:transparent; box-shadow:none`
  by default; `:hover`/`.selected` still restore the gold outline.
  Confirmed live: computed style with mouse away from any card showed
  `borderColor: rgba(0,0,0,0)`, `boxShadow: none`.

### H. Settings dialog
- **Reference:** one dialog, left category list, right settings.
- **Our state (NEW in v2):** built (`#settings-dialog`), PureRef-shaped.
- **Do:** verify live (handoff §2), nothing more.

## 4. Our own walkthrough (Video A frames)

Files: `video_frame_analysis/VideoA_empty-state-CTA.png`,
`VideoA_native-file-picker.png`, `VideoA_video-card-native-controls.png`,
`VideoA_contact_sheet_1/2.png`.

### I. Empty state CTA
- Ours is already close ("This board is ready for references" + button).
  Optional: add "+ Note" and "+ Frame" secondary buttons to the empty state.
### J. Video cards / native picker
- Native controls are correct and deliberately native. Leave alone.

## 5. InDesign typography reference (`indesign.png` / `InDesign_toolbar.png`)

Scope v3 explicitly ruled: our note toolbar already EXCEEDS Miro's text
formatting; InDesign depth (tracking, justification, hyphenation) is a
non-goal for a moodboard tool. **Nothing to do.** Listed only so the next AI
doesn't re-open it.

---

## Build order for this guide

1. F-note toolbar floating (biggest visible win)  — item F above, NOT YET DONE
2. ~~Minimal-mode true edge-to-edge (G)~~ — DONE v3
3. ~~Group card counts (A) + unsorted counter (C)~~ — DONE v3
4. ~~Frame title minimalization (D)~~ — DONE v3
5. Shape drag-to-create (E)                       — optional, small, NOT YET DONE
6. Empty-state secondary CTAs (I)                 — optional, trivial, NOT YET DONE

Every item here is UI-layer only: no data-model changes, no new item kinds,
no disk/filesystem work. If you find yourself touching `copyBoardAsset` or
`boardSnapshot`, you have left this guide's scope.

# Tier 13 — Canvas Feature-Parity Scope (v3)

**v3 change**: GPU Preview is a dead feature — never to be re-enabled or
rebuilt, per explicit standing instruction (filed in project memory). This
version (a) removes it from item D's re-homed toggle list, since deleting
it is the only correct move, not consolidating it, and (b) adds a new
item G with the exact audit of what's still in the file so a future
session can delete it cleanly instead of rediscovering the scope by
re-reading 1000+ lines.

Restructured after actually watching both screen recordings (frames
extracted with ffmpeg, sampled every 1.5–2s, ~67 frames reviewed) and
re-grepping the real code instead of assuming. **This version corrects two
wrong claims from the previous scope doc** — see "Corrections" below.
Everything else in this doc is stated only where I found direct evidence
(a grep hit or a specific video frame), not inferred.

## Reference inventory — what was actually in the uploads

| Source | What it is | What it demonstrates |
|---|---|---|
| `Milinotes_*.png` (5 screenshots) | **Milanote** | Column-based board layout, `X cards, Y files` counts, `0 Unsorted` global counter, breadcrumb nesting, minimal left rail (`Color` / `Rename` only) |
| `Recording_..._140442.mp4` (46s, "video B") | **PureRef** | Chromeless, borderless dense image tiling — no card footer/border/filename by default; images pack edge-to-edge; unified `Settings` dialog (Performance / Appearance / Saving and loading / Window / Images / Keyboard shortcuts / System); light+dark theme |
| `Real_Time_Board_Reference_UI_2..5.png` + `indesign.png` | **Miro** + **InDesign** | Frames (`Frame 3`), shape tool palette (Rectangle/Oval/Rhombus/Triangle/Line/Arrow/Elbow arrow/Block arrow/Divider), floating per-object text toolbar, InDesign's stacked character-row/paragraph-row typography controls |
| `Real_Time_Board_Reference_UI__1.png` | **FigJam** (frame-creation menu) | Named aspect-ratio frame presets: Custom/A4/Letter, 16:9/4:3/1:1, Mobile/Tablet/Desktop |
| `Recording_..._1407736.mp4` (73s, "video A") | **Your own app**, "Art Equation" | Full current-state walkthrough — see audit below |
| `Post_GPU_Art_Equation_Studio...zip` | Your app's actual source | Ground truth for what's really implemented |

## Corrections to the previous scope doc

The last scope doc proposed building rich-text formatting and frames as
if from zero. Both were wrong, caught by actually grepping instead of
skimming:

- **Rich text is already substantially built.** `runBoardNoteCommand()`
  wraps `execCommand` for bold/italic/underline/strikethrough/lists;
  `applyBoardNoteFont()`/`applyBoardNoteSize()` hand-roll span-wrapping
  for arbitrary font family and pixel size (because `execCommand` can't
  do those reliably — the code comment says so directly); there's a
  live Google Fonts loader (`injectGoogleFontLink`/`loadGoogleFontByName`)
  wired to a `#note-font-select` dropdown; `foreColor` and `hiliteColor`
  (text color + highlight) are bound to `#note-color`/`#note-highlight`;
  `syncBoardNoteToolbar()` keeps button active-states in sync with the
  live selection via `document.queryCommandState`. **This is closer to
  InDesign's character-panel depth than to Miro's simpler toolbar** — the
  gap here is smaller than previously stated (see 13.3 below for what's
  actually left).
- **Frames are already ~80% built via `board.groups`.** `.board-group` is
  a bordered, titled, resizable region with rename/delete buttons baked
  into the title bar (CSS confirms border + title bar + resize handle;
  JS confirms `addBoardGroup`/`groupSelectedItems`). What Miro/FigJam add
  that this doesn't have yet is narrower than "build frames from
  scratch" — see 13.2 below.

## Full current-state audit (confirmed, not assumed)

Everything below was seen live in video A or found by grep — treat this
as the "don't rebuild this" list:

- Board canvas: pan/zoom/marquee-select/drag/resize, snap toggle, zoom
  slider, Fit Board, minimap, **Fisheye** (cursor-proximity magnification
  — this is *ahead* of every reference app; none of Milanote/Miro/PureRef
  have it), GPU Preview toggle.
- Cards: images, videos (native HTML5 controls + editable filename),
  documents, board-links, notes.
- Organization: `board.groups` (frame-like regions), Compact Pack
  (auto-arrange), Bring to Front, Align Selected, Undo/Redo (board-scoped
  history stack), Connect mode with curved/straight connector toggle.
- Board management: Rename, Choose Cover (image), Duplicate, Delete,
  **Float Board** (view-only always-on-top popout window — none of the
  reference apps have this either).
- Rich text: see Corrections above.
- File system: real per-board asset folders on disk via File System
  Access API (`art-equation-projects/<project>/boards/<board>/assets/`),
  with permission handling and a backup-rotation write path.
- Navigation: breadcrumb-equivalent nav trail, project-level board
  switcher/filmstrip panel, empty-state CTA ("This board is ready for
  references" + Add Images button).
- Split view: exists, but is "project view + one board," not "board +
  board" (unchanged conclusion from last session).

## Genuine remaining gaps

### A. PureRef-style dense/minimal canvas mode
**Evidence**: video B shows images tiling edge-to-edge with zero visible
chrome — no border, no footer, no filename, no resize-handle icon — until
you interact with one. Your cards always render a footer (name + remove
button) and a resize icon (`board-card` template, ~line 1126), regardless
of state.
- Add a per-board or per-card "minimal" display mode: chrome (footer,
  resize icon, connector handle) hidden by default, shown only on
  hover/select — pure CSS opacity/visibility rule keyed off `:hover` and
  a `.selected` class, no data-model change needed.
- Optional stretch: per-item opacity control (PureRef lets you fade a
  reference image back so it doesn't dominate) — a slider bound to
  `item.opacity`, applied as inline `style.opacity`.

### B. Shape-drawing tool (Miro/FigJam)
**Evidence**: Miro's left rail has Rectangle/Oval/Rhombus/Triangle/
Line/Arrow/Elbow arrow/Block arrow/Divider as drawable primitives,
independent of cards. Your app's "Connect"/"Curve" only draws connector
lines *between two existing cards* — there's no freestanding shape object
(grep for `board-shape`/`shapeType` returned nothing).
- New item kind, `shape`, with a `shapeType` field (`rect`/`oval`/
  `line`/`arrow`) and its own minimal SVG/div rendering — much smaller
  than porting a full vector engine; four shape types covers the
  reference apps' actual usage in the videos, not their full palettes.
- Scope cut: no rotation handles v1, no arrowhead style options v1.

### C. Frame presets (FigJan-style aspect ratios)
**Evidence**: the FigJam frame-creation menu offers named presets
(A4, Letter, 16:9, 4:3, 1:1, Mobile, Tablet, Desktop) so a frame is sized
correctly on creation instead of dragged freehand.
- Extend `addBoardGroup()` with an optional preset argument that sets
  initial `w`/`h` to known values (e.g. Desktop 1920×1080, Mobile
  390×844) instead of always defaulting to the same starting size.
- This is a small, additive change to an existing function, not new
  architecture — good candidate to bundle with 13.2 below.

### D. Consolidated Settings panel
**Evidence**: PureRef has one `Settings` dialog with tabbed categories
(Performance, Appearance, Saving and loading, Window, Images, Keyboard
shortcuts, System). Your app's equivalent toggles (Light Mode, Snap,
Fisheye, GPU Preview) are scattered across different toolbars with no
single place to see or change them all — confirmed by grep: no
`Settings`/`Preferences` modal exists anywhere in the file.
- A single modal (reuse the existing `<dialog>` pattern already used for
  `prompt-dialog`) with a left-tab list and a right detail pane, initially
  just re-homing the toggles that already exist and are still wanted —
  **Light Mode, Snap, Fisheye** (all confirmed good as-is) — rather than
  adding new settings. This is a UI consolidation task, not new
  functionality. **GPU Preview is explicitly excluded — see item G, it
  gets deleted, not re-homed.**

### G. Delete dead GPU Preview code *(cleanup, not a feature — do this, don't skip it)*
**Standing instruction**: GPU Preview is dead and must never be
re-enabled or rebuilt. **Audit finding**: it's already unreachable from
the UI (the toggle button and its click-binding are gone from the
markup, and `toggleBoardGpuPreview()` is stubbed to unconditionally force
it off), but the code behind it was never actually removed. Confirmed
still present in `app/art-equation-studio.html`:
- **CSS** (~lines 371–392): `.board-gpu-canvas` rules, `body.board-gpu-preview` selector family (card/group opacity overrides), `#toggle-board-gpu-preview.active` (dead — button no longer exists to receive this class).
- **Two `<canvas>` DOM elements** still rendered on every board view whether or not anything ever draws to them: `#board-gpu-canvas-webgpu` and `#board-gpu-canvas` (in the `#board-canvas-wrap` markup, ~line 623).
- **The full rendering pipeline** (~lines 865–1060): `boardGpuPreviewOn`, `boardGpuBitmapCache`, `toggleBoardGpuPreview`, `resizeBoardGpuCanvas`, `boardGpuBitmapFor`, `boardGpuVideoBitmapCache`/`boardGpuVideoBitmapFor`, `boardGpuDrawWrappedText`, `boardWebGpu`/`boardWebGpuProbing`, `BOARD_WEBGPU_BG_KINDS`, `boardWebGpuColor`, `boardWebGpuPushRect`, `setupBoardWebGpu`, `BOARD_GPU_WEBGPU_ENABLED`, `ensureBoardWebGpu`, `renderBoardWebGpuBackgrounds`, `renderBoardGpuPreview`.
- **Call sites that still reference it**: `renderBoardGpuPreview()` is called unconditionally inside the main render path (~line 1144, a no-op today since `boardGpuPreviewOn` can never become true, but still a function call on every render); a `window.addEventListener('resize', ...)` handler (~line 873) checks `boardGpuPreviewOn`; a Fisheye/GPU-Preview mutual-exclusion comment block (~lines 2013–2018) references it and should be simplified once GPU Preview is gone.
- **Scope**: delete all of the above. This shrinks the file by roughly 200 lines and removes two always-present, always-invisible canvas elements from every board render — a real (if small) performance and clarity win independent of the "never bring it back" instruction.
- **Acceptance criteria**: grep for `gpu`/`Gpu`/`GPU` (case-insensitive) in the file returns zero hits; `node --check` passes; a live-browser smoke test confirms board rendering, drag, resize, connectors, and notes all still work identically with the two canvas elements and their CSS gone.
- **Risk**: low. This is pure deletion of code with exactly one already-severed entry point — no other feature reads `boardGpuPreviewOn` or `boardWebGpu` for anything besides GPU Preview itself (confirmed by the grep above; every hit is GPU-Preview-specific).

### E. Board/group color tagging (Milanote-style)
**Evidence**: the Milanote screenshots show a `Color` panel — a fixed
palette of ~15 swatches plus a custom-color picker — for tinting a board
or column. Your app has `Choose Cover` (an *image*), not a flat color
swatch; grep for `group.color`/`board-group-color` found nothing.
- Add `group.color` (and optionally `board.color`) as a hex string,
  applied as the `.board-group` background/border tint; a small fixed
  swatch row + "Custom color…" input, matching the Milanote reference
  almost exactly since it's a proven, minimal pattern.

### F. True independent dual-board split — **CANCELLED (2026-08-23)**
Cancelled per explicit project-owner instruction. Single-board focus
(one board pane at a time) is intentional product design, not a gap.
Do not re-propose the `panes.a`/`panes.b` refactor, cross-pane drag, or
asset-folder disk-move described here in earlier drafts of this doc.
Existing split view ("project view + one board") is the intended final
state, not a stepping stone toward board+board.

## Suggested build order

1. **G — delete dead GPU Preview code** (near-zero risk, pure subtraction,
   do this first so no later session has to read around 200 lines of
   dead rendering code while working on anything else in this file).
2. **A — minimal/chromeless card mode** (pure CSS, smallest, immediate
   visual win closest to the PureRef density people are asking for).
3. **E — color tagging** (small, additive, matches an existing UI pattern
   almost exactly).
4. **C — frame presets** (small, extends an existing function).
5. **D — Settings panel** (medium; consolidation, not new logic — mostly
   moving existing controls into one dialog: Light Mode, Snap, Fisheye).
6. **B — shape tool** (medium-large; genuinely new item kind + rendering
   path).
7. ~~F — dual-board split~~ — **CANCELLED**, see item F above.

## Non-goals (explicitly out of scope, don't let a session drift into these)

- Matching Miro's full shape palette (9 shape types) — 4 covers what was
  actually shown in the reference video.
- Matching InDesign's full typography depth (tracking, per-line
  justification, hyphenation rules) — the note toolbar already exceeds
  Miro's text formatting; InDesign-level depth isn't what a moodboard
  tool needs.
- Real-time multi-user collaboration (Miro's actual core differentiator)
  — not requested, not implied by any reference shown.

## Cross-cutting reminder (unchanged from last session)

Don't inherit "no live browser" as a default — check the actual sandbox
capability first. Item F (dual-board split) especially needs a real
drag-and-disk-move verification, not a hand-traced one.

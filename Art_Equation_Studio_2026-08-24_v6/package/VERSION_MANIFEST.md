# Version Manifest — Art Equation Studio

**Read this file FIRST, before any other doc in this zip, whichever AI
you are.** This exists because multiple AI assistants (Claude, ChatGPT,
GLM 5.3) work on this project in parallel across separate sessions, and
two zips describing contradictory feature states got uploaded to the
same conversation on 2026-08-23. This file is the tie-breaker so that
never causes wasted work again.

## How this works

- Every zip handed to an AI from now on **must include this file at the
  project root**, updated in the same session as any other change.
- The `CURRENT VERSION` line below is the only thing that decides which
  zip is canonical if two zips ever disagree. Higher version wins,
  full stop — don't resolve a conflict by re-reading old handoff docs
  or re-litigating a feature's status from scratch.
- If a zip you were given does NOT contain this file, or contains an
  older version than one already referenced elsewhere in the
  conversation: **say so plainly and ask which snapshot is current
  before making any claim about feature status.** Do not guess from
  filenames or dates alone — this project's own filenames
  (`Post_GPU_Project_Polish`, `Post_GPU_Art_Equation_Studio_...`) look
  similar enough to cause exactly this mistake, and did.

## CURRENT VERSION

```
v10a — 2026-08-24
Canonical source: this package (ZCode hotfix session on top of v10).
Reason: v10 shipped with a JavaScript syntax error that killed the ENTIRE
app script — every button dead, board unopenable, film strip and project
list never rendering. One stray `}` at the end of renderBoard()'s header
line closed the function early; the rest of its body became bare IIFE
statements and the function's real closing brace then closed the whole
IIFE, so the parser died at `function rectEdgePoint` (art-equation-studio.
html line ~1417). Removed the one character; live-verified: app loads with
zero console errors, film strip and project list render, board opens in
split view, rail buttons fire, shape tool arms, notes add, undo enables.
See changelog v10a and HANDOFF_FOR_CLAUDE_2026-08-24_v10a.md.
```

Bump this every session that touches `app/*.html`: `v2`, `v3`, ... Add
a one-line reason next to the bump (see Changelog below). Same-day
sessions get a letter suffix if needed (`v1a`, `v1b`) rather than
skipping the number.

## Resolved feature statuses (don't re-litigate these)

### Feature roadmap (owner direction, 2026-08-24 close of v10a)
**Forward work is ordered in `scope/FEATURE_ROADMAP_2026-08-24.md` — read
it before planning any new feature.** Order: (0) architecture split of the
single HTML file — explicit top priority, gates the rest; (1) flowchart-
grade bendable connectors; (2) click-select → Delete → Ctrl+Z (code exists
at v10a, needs live verify, don't rebuild); (3) local-first ML track in
owner-ranked order: composition grid overlay → SAM smart crop → semantic
clustering → perspective detection → content-aware auto-layout → stroke
smoothing. All ML items are in-browser (ONNX Runtime Web / TF.js / WebNN),
no server, no API key.

### GPU Preview / Tier 12 WebGPU renderer
**Status: dead code, intentionally. Isolated, harmless, do not touch.**
Unchanged this session — see prior manifest history below for full detail.
**Do not delete or re-enable this code.**

### Tier 13 canvas feature-parity plan
Unchanged this session. Complete (A/B/C/D/E done, F cancelled). Remaining
optional polish: E (shape drag-to-create), I (empty-state secondary CTAs).
Polish item F (floating note toolbar) is inherited by the toolbar-reorg
work below, not separate.

**Item F (dual-board split) is CANCELLED — explicit standing instruction
from the project owner, 2026-08-23.** Do not re-propose it.

### Known issue found during v3 live verification
**Newly created frames/groups can render outside the visible canvas
pane** until the user clicks "Fit Board". Not touched this session.

### Known issue found+FIXED during v6 live verification
**Split-view board went fully blank at viewport widths <=1100px** — not
just the rail, the entire board. Root cause: `#boards-view` is DOM-nested
inside `.app`, and `body.split-view .app { display:none; }` at that
breakpoint hid it and all descendants, regardless of `#boards-view`'s own
`position:fixed; display:block !important` (a `display:none` ancestor
always wins over a descendant's own display/position — CSS fact, not a
bug in that rule's intent). Fixed by switching `.app` at that breakpoint
to `width:0; min-width:0; overflow:hidden; visibility:hidden;
pointer-events:none;` with `#boards-view` given `visibility:visible;
pointer-events:auto;` to restore it — `visibility` cascades but can be
overridden by a descendant, unlike `display`. Verified live at
1400/1100/1020/900/700/650px: board+rail render correctly at every width,
rail buttons still work at the narrow breakpoints, and nothing changed
at widths >1100px. Predates v5/v6 — unrelated to the rail or toolbar work,
just surfaced by testing the breakpoint the v5 handoff flagged as untested.

### Toolbar reorganization (updated in v6 — steps 2 and 3 done, both live-verified)
**Status: left rail (step 2) and contextual note toolbar (step 3) both
live-browser verified this session**, using Playwright/Chromium available
in this sandbox (headless Chromium launches fine; no external browser
download needed). Per the addendum's build order
(`scope/TOOLBAR_REORG_SCOPE_ADDENDUM_2026-08-24_083930Z.md` §3):

**Step 2 (left rail, built in v5) — now verified:** every rail button
fires its original action (checked via DOM item counts); Connect mode's
teal `.active` styling applies correctly to `#rail-toggle-connect`;
Fisheye toggle stays in sync with the Settings checkbox in both
directions; `board-focus` mode hides the rail. No console errors.

**Step 3 (contextual note-format toolbar, absorbing Tier 13 item F) —
built and verified this session:**
- `#note-format-toolbar` moved out of the fixed top toolbar row into
  `#board-canvas-wrap`, now `position:absolute` with a floating card
  style (background/border/shadow) instead of a full-width flex row.
- New `positionNoteFormatToolbar()` positions it just above whichever
  note is active (being edited) or selected, using the note card's live
  `getBoundingClientRect()` — this naturally accounts for the board's
  pan/zoom transform without duplicating that math. Falls back to
  positioning below the note if there's no room above, and clamps
  left/right so it can't run off the canvas edges.
- Called from `syncBoardNoteToolbar()`, `applyBoardView()` (so it tracks
  through pan/zoom/fit), `setSelectedBoardItems()`, the note blur
  handler, and a `window.resize` listener.
- **Regression found and fixed during this session's own verification,
  before declaring it done:** moving the toolbar inside
  `#board-canvas-wrap` meant its buttons' `pointerdown` now bubbled to
  the wrap's own pan/marquee/drag handler (`startBoardPan`), which broke
  every formatting command (Bold, Italic, lists, etc. — the click no
  longer visibly changed the note text). Root-caused by testing Bold
  against the pre-change file to confirm it wasn't a pre-existing issue,
  then fixed with `event.stopPropagation()` on the toolbar's own
  `pointerdown` listener (kept the existing `preventDefault()` on
  individual format buttons, which serves a different purpose — stopping
  them from stealing focus from the note). Verified Bold applies
  correctly (`<b>Hello world</b>`) after the fix.
- Toolbar confirmed to: stay hidden with no note active; appear directly
  above the note card on focus/selection; hide again on blur; not steal
  focus from the note when clicking format buttons.

**Not done yet (per addendum's build order, still ahead):** step 4
(right-click menu for object/board operations, removing the top-bar
buttons it replaces), step 5 (shape-tool context bar — stays a stub,
gated on nothing new this session).

**Not verified this session, flagged for next session:** dragging/panning
the canvas itself (independent of the toolbar) after the
`stopPropagation()` fix — the fix only targeted pointerdown events
starting *on* the toolbar, so canvas panning elsewhere should be
unaffected, but that wasn't explicitly re-tested with a live drag
gesture. Also not tested: the note-swatch (card color) buttons and the
font/size/color inputs inside the relocated toolbar specifically (Bold
was used as the representative test; the same `stopPropagation()` fix
should cover all of them since it's on the toolbar container, not
per-button, but worth a quick pass).

## Deprecated snapshots

Zips that are superseded — if you're holding one of these, it is
**not** the current source. Don't edit from it.

| Zip name | Superseded by | Reason |
|---|---|---|
| `Post_GPU_Project_Polish_2026-08-23.zip` | `Art_Equation_Studio_2026-08-23_chatgpt-handoff.zip` | Still shows the GPU Preview toggle button in the toolbar HTML — that button was already removed by the time of the chatgpt-handoff zip. An edit was mistakenly built on top of this stale copy and had to be redone. |
| `Art_Equation_Studio_2026-08-24_v4_toolbar-reorg-scope.zip` | this package (v5) | v4 was planning-only; v5 implements addendum step 2 (left rail) on top of it. |

## Changelog

- **v10a (2026-08-24)** — ZCode hotfix session: **fixed the v10 syntax
  error that broke the whole app** (owner report: "board is broken... can't
  click on any buttons and the board film strip no longer shows up").
  Root cause: when the v10 `syncShapeFormatToolbar()` call was added to
  `renderBoard()`'s header, the line gained a trailing `}` —
  `...positionNoteFormatToolbar();} syncShapeFormatToolbar();}` — which
  closed `renderBoard()` itself at that line. Its remaining body
  (breadcrumb, groups, cards, connectors, culling — the whole render pass)
  parsed as bare statements of the boot IIFE, and renderBoard's real
  closing `}` then terminated the entire IIFE. V8 reported the resulting
  `SyntaxError: Unexpected token 'function'` at the next declaration
  (`rectEdgePoint`, line ~1417). Because the IIFE never ran to completion,
  NO wiring executed and `renderProject()` never fired — hence dead
  buttons, empty film strip, empty project list. Fix: removed the single
  stray `}` (renderBoard now closes where its body ends). Diagnosis used a
  temporary error-probe copy of the page (since deleted) plus a
  per-line bracket-delta tokenizer (also deleted). Live-verified in
  browser: zero console errors; film strip renders 1 tile; project list
  renders; board opens via tile click (split-view on, 10 rail buttons);
  rectangle tool arms (`.active`); Add Note creates a note card; rail
  undo enables after the edit. NOT yet live-verified: shape drag-to-draw
  gesture, shape format bar interactions, connector right-click (the
  in-app browser session dropped tabs mid-test; these remain from the
  v10 checklist). Lesson recorded: div-balance counts (v8/v10) cannot
  catch JS brace errors — always live-parse the page after structural
  edits to the inline script.

- **v10 (2026-08-24)** — ZCode session (continuation of v7-v9): **drawing
  tools + connectors completed** (owner: "drawing tools should behave like
  Illustrator vector SVG, smooth drawing process"). (1) Shape tools are now
  real tools: rail shape buttons arm a tool (`.active` + crosshair cursor)
  instead of drop-inserting; left-drag on empty board rubber-bands the shape
  with live SVG regeneration (direct card-element updates, no mid-gesture
  renderBoard); Shift constrains rect/oval to square/circle and snaps
  line/arrow to 45°; drag direction is preserved via flipX/flipY so
  lines/arrows draw in the direction dragged (default rendering unchanged
  for existing shapes); Escape or re-click exits; a sub-12-unit drag stamps
  a default-size shape at the click point (old click-to-add stays
  reachable); Connect mode disarms the shape tool. (2) Shape format context
  bar `#shape-format-toolbar` (same contextual pattern as the note toolbar):
  type/fill/none-fill/stroke/stroke-width, stored on the item and applied as
  `--shape-fill/--shape-stroke/--shape-stroke-w` custom properties — the
  `.board-shape-svg` CSS consumes them with the old hard-coded values as
  fallbacks, so existing shapes render identically and hover/selected gold
  still overrides. Applies to all selected shapes; type change renames the
  card. (3) Undo/Redo added to the rail (`#rail-board-undo`/`#rail-board-
  redo`, kept in sync by `updateUndoRedoButtons()`; top-bar pair kept). (4)
  Connector right-click: new `connector-context` menu mode with Toggle
  Curve / Edit Label / Delete Arrow (connector selected on right-click);
  top-bar Curve + Delete Arrow buttons and all references removed.
  Grep-clean of dangling ids; boards-view divs balanced 21/21. Code-only,
  unverified — checklist in HANDOFF_FOR_CLAUDE_2026-08-24_v10.md.

- **v9 (2026-08-24)** — ZCode session (continuation of v7/v8): **viewport
  culling, the owner-requested perf track** ("I think we need thing for
  viewport culling"). Two layers. (1) CSS: `.board-card {
  content-visibility:auto; contain-intrinsic-size:190px 190px; }` — the
  browser skips layout/paint for off-screen cards; safe because every card
  is position:absolute with inline left/top/width, so skipped contents
  can't shift neighbors; image cards with auto height fall back to the
  spec's last-remembered rendered size. (2) JS: new
  `updateBoardCulling()` — computes the visible board rectangle via the
  app's own `screenToBoard()` math (canvas transform-origin is 0 0), then
  sets `display:none` on cards whose item data is >900 board-units outside
  it. O(n) with a Map lookup, zero per-card rect reads. Never culls the
  active note, selected cards, the connect-pending card, or an expanded
  note's card; culled cards return automatically as the view moves. Called
  from the end of `applyBoardView()` (pan/zoom/fit path) and `renderBoard()`.
  Explicitly NOT done: full virtualization (spatial index + only-visible
  DOM) — that's the heavier Milanote/Miro-grade architecture, flagged for
  its own session if boards outgrow this. **Also this bump (owner direction
  with Milanote/Miro screenshots): tool-rail restyle** — `#board-tool-rail`
  converted from a flush-docked full-height strip to a detached floating
  pill at the top-left (Milanote spacing/Miro creation-toolbar look):
  `align-self:flex-start` + margin + border-radius:14px + the same
  floating-card background/border/shadow as the contextual note toolbar so
  the two floating surfaces read as one system. Button gaps 4px→7px,
  buttons 34px→36px with border-radius:10px, wider separators, light-mode
  variant, responsive 700px rule updated. Pure CSS — ids, handlers, and
  flex layout flow unchanged. Code-only, unverified (owner:
  test once all features are in). Verification items appended to the v8
  handoff checklist, mirrored in HANDOFF_FOR_CLAUDE_2026-08-24_v9.md.

- **v8 (2026-08-24)** — ZCode session (continuation of v7): **implemented
  toolbar-reorg step 4 in code, live verification deferred by owner
  direction** ("get the hard code work done; live fixes cost too many
  calls"). `#board-context-menu` gained Ungroup, Send to Back (new
  `sendSelectedToBack()` — the first z-order-down op in the app),
  Duplicate (reuses `duplicateSelectedItems()`), and six Align entries
  (reuses `alignSelectedItems()`; enabled only at 2+ selection). New
  `ungroupSelectedItems()` clears `groupId` on selected cards and deletes
  group frames left empty. `updateContextMenuAvailability()` extended to
  gate the new items. Removed the now-duplicated top-bar controls:
  `#group-selected`, `#bring-selected-front`, `#board-arrange` select, and
  `#remove-selected` (markup + all four wiring lines + both
  `.disabled=` statements in `renderBoard()`/`setSelectedBoardItems()`;
  grep confirms zero dangling references). The transform group
  (`#tb-transform-group`) STAYS: the context menu's Flip/Rotate/Grayscale
  items delegate to its buttons via `.click()`, and it's already a
  contextual properties strip. Div balance in `#boards-view` 20/20
  (one tb-group div removed). Crude brace-count heuristics are unreliable
  on this template-literal-heavy code and were replaced by per-edit-site
  review — all edits are complete self-contained statements. **Not done:
  any live-browser check** (parse, menu rendering, each new item firing).
  Verification checklist is in HANDOFF_FOR_CLAUDE_2026-08-24_v8.md §2.

- **v7 (2026-08-24)** — ZCode session: **fixed the note-format-toolbar input
  bug** (the "text bar not fully working" item; includes the Enter-in-
  `#note-size` quirk documented in v6's handoff). Root cause was NOT Enter
  itself: the toolbar's real inputs (font/size/color) take actual focus,
  unlike the format buttons which `preventDefault` their mousedown — so
  clicking any input blurred the note body, whose blur handler cleared
  `activeBoardNoteId`. That made every `onchange` input command silently
  fail with "Click inside a note before formatting it", and hid the toolbar
  outright whenever the note card wasn't also selected (the v6 "Enter"
  repro — Enter merely fired the change event on an already-broken input).
  Fix (2 small edits in `app/art-equation-studio.html`): (1) the note-body
  blur handler now keeps the active-note state when focus is moving INTO
  `#note-format-toolbar` (checks `event.relatedTarget`/`document.activeElement`
  containment); (2) a new `focusout` listener on the toolbar restores the
  normal hide rules once focus leaves the toolbar for anywhere that isn't a
  note body, so the retained state can't get stuck visible. Live-verified in
  a real browser (ZCode in-app browser over local http server): app loads
  clean (no console/syntax errors — no Node in this environment, so the
  live parse replaces `node --check`), note added, toolbar appears on
  click-into-note, **toolbar stays visible after clicking the size input**
  (pre-fix failure point), and state remained intact after. Browser session
  was cut short by the project owner mid-verification (credit conservation)
  — the final fill-28+Enter apply step and the click-away cleanup step were
  code-traced but not observed live; next session can confirm both in one
  minute. Toolbar-reorg steps 4 (right-click menu migration) and 5 (shape
  context bar) remain, per v6 handoff.

- **v6 (2026-08-24)** — Claude session: **live-browser verified, using
  Playwright/Chromium in-sandbox.** Verified v5's left rail (all items the
  v5 handoff flagged as outstanding now confirmed working). Found and
  fixed a pre-existing, unrelated bug: split-view board went blank at
  widths <=1100px because a `display:none` ancestor was hiding
  `#boards-view` despite its own `position:fixed` (see Known Issues
  above for the fix). Implemented and live-verified toolbar-reorg step 3:
  relocated `#note-format-toolbar` from the fixed top bar to a
  contextual floating position above the active/selected note, tracking
  through pan/zoom/resize via `positionNoteFormatToolbar()`. Found and
  fixed a regression this same session (before declaring step 3 done):
  the relocated toolbar's buttons stopped working (verified against the
  pre-change file to confirm it was a real regression, not pre-existing)
  because moving it inside `#board-canvas-wrap` let its `pointerdown`
  events bubble into the canvas's own pan handler; fixed with
  `event.stopPropagation()` on the toolbar. `node --check` passed on the
  extracted inline JS; div nesting in `#boards-view` still balanced
  (21/21). **Not done this session:** step 4 (right-click object/board
  menu), step 5 (shape context bar stub). **Not re-verified this
  session:** canvas drag/pan behavior elsewhere on the board after the
  `stopPropagation()` fix, and the toolbar's non-Bold controls
  individually (font/size/color/swatches) — see
  `HANDOFF_FOR_CLAUDE_2026-08-24_v6.md` for the full outstanding list.
- **v5 (2026-08-24)** — Claude session: **code-only, left rail
  implemented, NOT live-verified.** Built the addendum's step 2: fixed
  `#board-tool-rail` left column (`.board-workspace` changed from
  column-flex to row-flex; existing toolbar/breadcrumb/canvas content
  now wrapped in a new `.board-main` column beside the rail). Migrated
  Add Note, the 4 shape-add buttons, Add Board Link, and the Connect
  toggle out of the top toolbar into the rail (ids renamed with a
  `rail-` prefix, all click handlers rewired, `toggleConnectMode()`
  updated to target the new id). Added a new Fisheye rail toggle
  (`#rail-toggle-fisheye`) that calls the existing `toggleBoardFisheye()`
  — the Settings-dialog checkbox is untouched and both now stay
  in sync via `syncSettingsControls()`. Confirmed with the project
  owner that the addendum's "Select"/"Text" rail entries don't map to
  anything this app actually has (no tool-mode architecture exists) and
  were deliberately left out rather than stubbed. `node --check` passed
  on the extracted inline JS; div nesting in the boards-view section
  verified balanced. **Live-browser verification not done this
  session** — next session should Playwright-click through: each rail
  button fires its original action, Connect-mode active/inactive
  styling still works, Fisheye rail button and Settings checkbox stay
  in sync in both directions, and layout doesn't break at the
  700px/1020px responsive breakpoints.
- **v4 (2026-08-24)** — Claude session: planning only, zero
  `app/*.html` changes. Wrote
  `scope/TOOLBAR_REORG_SCOPE_ADDENDUM_2026-08-24_083930Z.md`. See prior
  package for full entry.
- **v3 (2026-08-24)** — Claude session: implemented + LIVE-verified
  four Tier 13 UI parity items (G/A/C/D). See prior package for full
  entry.
- **v2a (2026-08-23)** — Claude session: re-traced 4 items in code,
  cancelled Tier 13 item F. See prior package for full entry.
- **v2 (2026-08-23)** — ZCode session: Tier 13 items E/C/D/B. See prior
  package for full entry.
- **v1 (2026-08-23)** — Manifest created to resolve GPU-Preview status
  conflict. See prior package for full entry.

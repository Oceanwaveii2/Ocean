# HANDOFF FOR CLAUDE — Art Equation Studio, toolbar-reorg step 4 (v8)

**Written:** 2026-08-24, by ZCode (same session as v7). **Read
`VERSION_MANIFEST.md` FIRST.**
**Canonical app file:** `app/art-equation-studio.html` (changed this session).

**Session context:** owner directed a code-only pass — "get the hard code
work done, live fixes cost too many calls" — so this feature is implemented
but NOT live-verified. A cheap verification session should run §2 before
building on top of it.

## 1. What this session did

Toolbar-reorg step 4 (per `TOOLBAR_REORG_SCOPE_ADDENDUM` §3.4): object
operations moved to the right-click menu, duplicated top-bar buttons
removed. Smaller than the addendum assumed — `#board-context-menu` already
existed; this completed it.

**Menu additions** (all `class="card-only"`, so they hide on empty-canvas
right-click, after "Bring to Front"):
- **Ungroup** — new `ungroupSelectedItems()`: clears `groupId` on selected
  cards; any group frame left with zero cards is deleted. Disabled unless a
  selected card is grouped.
- **Send to Back** — new `sendSelectedToBack()`: mirror of
  `bringSelectedToFront()` (selected items moved to the front of
  `board.items`, which renders behind since the canvas stacks in DOM
  order). First z-order-down operation in the app.
- **Duplicate** — existing `duplicateSelectedItems()`, now reachable from
  the menu (was Ctrl+D / keyboard only).
- **Align Left/Center/Right/Top/Middle/Bottom** — six buttons carrying
  `data-align`, wired through one `forEach` to the existing
  `alignSelectedItems()`; disabled unless 2+ cards selected (matches that
  function's own guard).
- `updateContextMenuAvailability()` extended to gate all of the above.

**Top-bar removals** (markup, wiring, and every JS reference — grep-clean):
- `#group-selected` (Group Selected), `#bring-selected-front` (Bring
  Front), `#board-arrange` (Align select), `#remove-selected` (Remove
  Selected), and the tb-group div that held the last two.
- Also removed the two `$('#remove-selected').disabled=...` statements in
  `renderBoard()` and `setSelectedBoardItems()`.
- **Kept deliberately:** `#tb-transform-group` (flip/rotate/grayscale/
  opacity) — the context menu's Flip/Rotate/Grayscale items delegate to
  its buttons via `.click()`, and it is already a selection-gated
  contextual properties strip (addendum §1b pattern), not an
  always-visible duplicate. Compact Pack stays (document-level, §1d).
  Curve/Delete Arrow stay (connector ops; a connector-specific context
  menu is a separate, unbuilt item).

## 2. Verification checklist for the next (verification) session

One browser session covers both v7 and v8:
1. Page loads with no console errors (no `node --check` possible in the
   ZCode Win environment; v8 is unverified even for parse).
2. Right-click a card: menu shows Ungroup/Send to Back/Duplicate/6 Aligns
   with correct enabled states (e.g. Ungroup disabled on an ungrouped
   card; Aligns disabled at 1 selected).
3. Each new item fires: Duplicate makes a +24px copy and selects it; Send
   to Back moves the card behind an overlapping one; Ungroup on grouped
   cards clears the frame (empty frames disappear); Align Middle on two
   cards aligns them.
4. Top bar no longer shows Group Selected / Bring Front / Align select /
   Remove Selected; nothing else broke (Undo/Redo, Compact Pack, transform
   group still appear/work).
5. v7 leftovers: fill 28 + Enter in `#note-size` applies font-size:28px
   with the toolbar still visible; clicking away from the toolbar hides
   it (new focusout cleanup); Bold still works.
6. Delete/Backspace, Ctrl+D shortcuts still work (their functions were
   untouched, only the button UI removed).

## 3. What's left

- Step 5: shape context bar — still a stub, and per v5's scope decision,
  a real Miro-style tool mode (activate tool → drag to create) needs its
  own scoped session/decision.
- Owner-flagged separate track: viewport culling
  (`content-visibility:auto` on `.board-card` as the cheap first step)
  and reducing full `renderBoard()` DOM rebuilds.

## 4. Package contents map

Unchanged from v7 except:
- `app/art-equation-studio.html` — step-4 changes (§1).
- `VERSION_MANIFEST.md` — bumped to v8, changelog entry added.
- `HANDOFF_FOR_CLAUDE_2026-08-24_v8.md` — this file, new.

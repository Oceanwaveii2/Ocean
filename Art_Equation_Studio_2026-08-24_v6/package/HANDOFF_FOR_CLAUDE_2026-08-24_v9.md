# HANDOFF FOR CLAUDE — Art Equation Studio, viewport culling (v9)

**Written:** 2026-08-24, by ZCode (same session as v7/v8). **Read
`VERSION_MANIFEST.md` FIRST.**
**Canonical app file:** `app/art-equation-studio.html` (changed this session).

**Session context:** owner direction — build all features code-first, one
consolidated live test once everything is in. So v9 is implemented but NOT
live-verified. Merge its checklist with v8's (§2 there).

## 1. What this session did

Viewport culling (owner-requested perf track), two layers:

1. **CSS layer** — `.board-card { content-visibility:auto;
   contain-intrinsic-size:190px 190px; }` (placed with the zoom-tier rules,
   commented). Browser skips layout/paint for off-screen cards. Safe here
   because cards are position:absolute with inline left/top/width, so a
   skipped card's contents can't shift anything around it; image/video
   cards (auto height) rely on the spec's last-remembered-size behavior.
   Unsupported browsers ignore the rule.
2. **JS layer** — `updateBoardCulling()`, defined just above
   `applyBoardView()`. Computes the visible board rectangle from
   `screenToBoard()` applied to `#board-canvas-wrap`'s corners (valid
   because `.board-canvas` has `transform-origin:0 0`), adds a 900
   board-unit margin, then sets `display:none` on cards whose item x/y/w/h
   fall entirely outside. O(n) with a Map; no per-card
   `getBoundingClientRect()`. Never culls: the active note
   (`activeBoardNoteId`), selected cards, the connect-pending card, or a
   card with `.note-expanded-elsewhere`. Called at the end of
   `applyBoardView()` (so it tracks pan/zoom/fit) and `renderBoard()`.
   Culled cards are restored automatically on the next call as the view
   moves.

Deliberately NOT built: full virtualization (spatial index, only-visible
cards in the DOM). That's the Milanote/Miro-grade step and needs its own
scoped session if boards outgrow this middle tier.

**Also this bump — tool-rail restyle** (owner direction, given with
Milanote/Miro reference screenshots: "Milanote style of toolbar, see how
it's spaced out better; taking ideas from RealTimeBoard's toolbar"):
`#board-tool-rail` is no longer a flush-docked full-height strip. It's now
a detached floating pill hugging the top-left (Milanote spacing, Miro
creation-toolbar look): `align-self:flex-start`, 12/14px margins,
`border-radius:14px`, and the exact floating-card styling already used by
the contextual note toolbar (background `#1b1d21`, `var(--line)` border,
`0 10px 28px #000a` shadow, light-mode `#f7f4ee`) so both floating
surfaces read as one system. Button gap 4→7px, buttons 34→36px with
10px corner radius, separator margins widened, 700px breakpoint adjusted.
Pure CSS — ids, handlers, and the flex flow are untouched; the workspace
background (`#101113`) shows through around the pill as intended.

## 2. Verification checklist (add to v8's)

7. Pan a board with several cards far apart: distant cards' DOM nodes get
   `display:none`; panning toward them restores them without visual flash
   (900-unit margin should prevent pop-in at normal pan speeds).
8. The note being edited, selected cards, and the connect-pending card
   never get culled even when off-screen.
9. Marquee-select still works near the cull boundary; dragging a card
   across the board doesn't drop it (drag moves elements directly and
   doesn't call applyBoardView per-frame, so nothing culls mid-drag).
10. Fisheye mode on: iterating cards is unaffected by hidden ones
    (`applyBoardFisheyeAt` sets transforms on all cards; hidden ones are
    invisible no-ops). Quick sanity pass only.
11. Perf spot-check on a big board (100+ cards): pan/zoom should feel
    lighter than v8; if image-card sizes jump at cull boundaries, widen
    the margin or give image cards an explicit aspect-ratio height.
12. Rail restyle: floating pill renders detached at top-left in both dark
    and light mode; every rail button still works (pure CSS change, but
    confirm `align-self:flex-start` didn't collide with the 700px
    breakpoint or `board-focus` hiding); Connect/Fisheye active (teal)
    styling still visible against the new pill background.

## 3. What's left

- Step 5 (shape context bar) — still gated on the owner decision about
  Miro-style tool modes (v5 scope note: no tool-mode architecture exists).
- Full virtualization — only if testing shows the middle tier isn't enough.
- Consolidated live test session covering v7 leftovers + v8 + v9
  checklists.

## 4. Package contents map

Unchanged from v8 except:
- `app/art-equation-studio.html` — culling CSS + `updateBoardCulling()` +
  two call-site wires.
- `VERSION_MANIFEST.md` — bumped to v9, changelog entry added.
- `HANDOFF_FOR_CLAUDE_2026-08-24_v9.md` — this file, new.

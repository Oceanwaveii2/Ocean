# Feature Roadmap — Art Equation Studio
**Written:** 2026-08-24, from owner direction at close of v10a session.
**Order matters.** Item 0 (architecture) is explicitly the top priority and
gates the rest — do it before piling more features onto the single file.

---

## 0. Architecture: split the single-file app (TOP PRIORITY)

`app/art-equation-studio.html` is one ~395KB file: all CSS + all JS
(~1700-line inline script) + markup inline. Owner direction: **break the
site up into multiple HTML/JS files** to improve performance and ease of
repair. The v10a incident is the argument for this — one stray `}` anywhere
kills the entire app script, and the file is too big to safely edit or
review (multiple AI sessions have stepped on it).

Suggested shape (for whoever picks this up — decide details then):
- `app/` keeps thin HTML shells per view (studio, calendar, worksheet).
- Shared CSS and JS pulled into linked files (`css/`, `js/`), split along
  existing seams: state/persistence, board renderer, connectors, notes,
  reader/library, recipes/prompts, dialogs.
- `VERSION_MANIFEST.md` discipline stays; bump on every app-touching
  session. Update every handoff doc's "canonical file" claim after split.
- Watch: `localStorage` key `art-equation-studio-v1` and IndexedDB
  `art-equation-studio-files` must keep working — no data migration
  regressions. The other two pages (`daily-worksheet.html`,
  `project-calendar.html`) read/write the same storage.

## 1. Connectors: real flowchart behavior

Current connectors are straight/quad-curve lines between two card anchors.
Owner: connectors need to **bend and move around like real flowchart
connectors** — recognized as "a lot of work left." Means roughly:
- Editable bend points / vertex handles on a connector (click connector →
  drag segments/waypoints; orthogonal or free routing).
- Lines that re-route when cards move instead of just stretching between
  fixed anchor points.
- Keep existing: labels, curve toggle, right-click menu, Delete key.

## 2. Click-select → Delete key → Ctrl+Z (verify, likely partially built)

Owner expectation: *"click on something, hit the delete key, and it goes
away, then Ctrl+Z to undo it."*
Status per code read at v10a: **this appears already implemented** — the
split-view keydown handler (main script, ~line 2560) deletes selected
cards/connectors on Delete/Backspace and undo/redo is on Ctrl+Z /
Ctrl+Shift+Z / Ctrl+Y, with rail + top-bar buttons and `updateUndoRedoButtons()`
state sync. **Not yet live-verified since the v10a syntax fix.** First live
test session: click a card → Delete → Ctrl+Z; also test with a connector
selected. If it misbehaves, fix routing — do not rebuild from scratch.

## 3. Local-first ML feature set (the differentiation track)

Owner pasted a research-backed list of in-browser ML features (ONNX
Runtime Web / TF.js / WebNN — no server, no API key — "things
Milanote/Miro literally can't do"). Ranking below is the owner's stated
build order. Items 3a–3b are pure code; 3c–3f need ONNX Runtime Web (one
JS import). None need a server or API key.

### Build order (owner's ranking: max differentiation, min risk)

- **3a. Composition grid overlay** — pure math, zero dependencies,
  immediately useful, looks professional. Grid overlay (thirds/golden
  spiral/etc.) toggleable over reference images. Est. ~1 hour of code.
- **3b. Smart crop / auto-masking via SAM** — ONNX Runtime Web + SAM-tiny
  runs locally in-browser. One-click "extract subject" on right-click,
  replacing/simplifying the current manual erase/cutout workflow.
- **3c. Semantic reference clustering** — small CLIP/vision-encoder via
  ONNX embeds every dropped image; board auto-groups similar references
  (poses together, environments together); natural-language search
  ("figures in dynamic poses") highlights matching cards. The biggest
  "Milanote can't do this" moment.
- **3d. Auto-perspective alignment** — lightweight OpenCV-style CV:
  detect vanishing points / horizon in reference photos, overlay a shared
  perspective grid across references to verify matching camera angles.
  Unique to art production boards.

### Plausible but heavier (after 3a–3d)

- **3e. Intelligent auto-layout** — force-directed or embedding-aware
  arrangement: similar content near each other, main reference larger /
  center, supporting refs around it. Content-aware upgrade of Compact Pack.
- **3f. Predictive stroke smoothing** — Apple Pencil-style prediction for
  the freehand pen tool (MediaPipe or Kalman filter; lightweight, but
  depends on a pen/freehand tool existing first).

### Open decision from owner (answer at start of that session)

Owner's closing question was whether to start with the composition grid
(fastest win) or jump straight to ONNX integration for smart crop —
but architecture (item 0) comes first per the same message.

---

**Session close state (v10a):** v10 syntax error fixed; app loads clean;
board, rail, film strip, notes, undo verified live. Outstanding v10
checklist items (shape drag-to-draw, shape format bar, connector
right-click live tests) still apply and should ride along with item 2's
verification pass. See `VERSION_MANIFEST.md` changelog v10a and
`HANDOFF_FOR_CLAUDE_2026-08-24_v10a.md`.

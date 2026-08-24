# Toolbar Reorganization — Scope Addendum (2026-08-24)

**Status:** New item, not yet started. Companion doc to
`scope/TIER13_CANVAS_UI_UPGRADE_SCOPE_v3.md` — read that doc first for
standing rules (never rebuild what exists, GPU Preview stays dead, bump
the manifest, verify in a live browser before claiming done).

**Origin:** Project-owner direction, 2026-08-24, given by pointing at
Milanote's UI as a reference and contrasting it with the current app's
"everything at the top" toolbar. Formalized here against the actual
industry-standard pattern this maps to — confirmed by looking up how
Adobe InDesign and Affinity Designer structure the same problem, since
both use the identical underlying principle Milanote does, just under
different names — and cross-checked directly against live documentation
for the three reference apps used in this project's own screenshot pack
(Milanote, PureRef, and Miro — whose screenshots were captured under the
filename "Real_Time_Board," Miro's original product name,
RealtimeBoard).

## 0a. What the three reference apps' own docs actually confirm

- **Milanote**: the left toolbar is genuinely context-sensitive —
  available tools change based on where the cursor is, not just what's
  selected — and tools are placed via drag-and-drop onto the canvas
  rather than click-to-activate-then-draw. Right-click already covers
  *board*-level actions (duplicate a board, revert a template to a
  normal board), not just in-canvas object operations — this resolves
  the open question in §1c below in favor of extending right-click to
  board-level actions too, matching Milanote's own actual behavior.
- **PureRef**: the most extreme version of the same principle — the
  only thing permanently on screen is the images themselves; everything
  else (all actions, all settings) routes through the right-click menu
  or keyboard shortcuts. Settings are one fully consolidated dialog
  (already Tier 13 item D). PureRef also has a command palette reachable
  by opening the right-click menu and typing — noted here as a possible
  stretch idea, not requested or scoped.
- **Miro (RealtimeBoard)**: closest structural match to what's being
  asked for. A left-side "creation toolbar" holds tools (Select/Hand are
  permanent, un-removable baseline tools; others populate by
  drag-and-drop or click-then-place). Frame-specific actions (rename,
  delete, group, create-frame-around-selection) live behind a
  **right-click three-dot context menu**, while frame *properties*
  (color, size, aspect ratio) appear in a **separate context toolbar**
  that shows only once a frame is selected — i.e., Miro actually
  implements the same two-tier split this addendum proposes (right-click
  for actions, contextual toolbar for properties) as two genuinely
  different UI surfaces, not one merged menu. Zoom/navigation controls
  live in their own toolbar in the bottom-right corner, separate from
  the left creation toolbar — this resolves the other open question in
  §1a: zoom stays out of the left tool rail, matching Miro's own layout.

---

## 0. The underlying UX principle (not just a Milanote quirk)

This isn't "left rail vs. top bar" as a style choice — it's **contextual
disclosure**, and it's the standard every major design tool converges on
independently:

- **InDesign**: a fixed left-side Toolbox holds the tools themselves
  (selection, type, shapes, pen). A top Control panel is fully
  contextual — its content changes depending on the active tool and
  selected object. A right-hand Properties panel does the same job
  docked, with secondary controls hidden behind a "More Options"
  ellipsis instead of shown permanently.
- **Affinity Designer**: identical structure, different names. A fixed
  Toolbar holds the tools. A Context Toolbar appears immediately below
  it, directly above the canvas, and its contents change per active
  tool — e.g., different options for the Pen tool than for the Move
  tool.
- **Inkscape** (per their own UX backlog): treats right-click contents
  as something that should be sensitive to whichever object/tool is
  currently active, not a static menu.

The common shape across all of them:

| Zone | What lives there | Governing rule |
|---|---|---|
| Fixed side rail | Tool selection only (Select, Text, Shape, Note, Connect, Fisheye, etc.) | Always visible, never changes |
| Contextual bar, near canvas | Options for the *currently active tool* | Appears/changes per tool, hidden when not relevant |
| Right-click menu | Operations on the *currently selected object(s)* | Contents depend on what's selected |
| Fixed top bar | Document/global-level actions (not per-object, not per-tool) | Always visible, small and stable |

Nothing sits permanently visible unless it's actionable in the current
context. That's the actual standard being asked for — Milanote is just
one implementation of it, and it's what makes the current top-heavy
toolbar feel cluttered by comparison: everything is shown all the time
regardless of whether it currently applies to anything.

## 1. Target layout for Art Equation Studio

### 1a. Left rail — Tools (fixed, always visible)
Tool selection only. Candidate order (top to bottom), pending
confirmation:
- Select / pointer
- Text
- Shape
- Frame / board-link
- Note
- Connect (curved/straight)
- Fisheye (toggle — currently lives elsewhere; moves here as its own
  icon per direction given)

**Resolved (was an open question):** zoom/pan stays out of the left
tool rail — Miro keeps its zoom/navigation controls in a separate
bottom-right toolbar, not the left creation toolbar. Recommend Art
Equation Studio's existing zoom slider stay in the top bar (or move to
a bottom-right nav cluster, matching Miro) rather than join the left
rail.

### 1b. Contextual bar — tool-specific options (appears near canvas, changes per active tool)
- **Text tool active / editing a note:** the existing rich-text toolbar
  (`#note-format-toolbar` — font, size, bold/italic/underline/
  strikethrough, lists, color, highlight) relocates here instead of
  living in a fixed top position. This is explicitly item F from
  `TIER13_CANVAS_UI_UPGRADE_SCOPE_v3.md` (floating per-object note
  toolbar) — **this addendum does not duplicate that item, it inherits
  it**: the toolbar-reorg work and item F should be built together,
  since "hide unless editing, position near the object" is exactly the
  contextual-bar principle applied to the one contextual control this
  app already has.
- **Shape tool active:** shape-type picker + fill/stroke controls
  (depends on Tier 13 item B, the shape tool itself, being built first
  or alongside).
- **Select tool, object(s) selected:** this is where InDesign/Affinity
  would show a light properties strip (position, size, opacity) — worth
  deciding whether Art Equation Studio wants this now or defers it;
  not requested explicitly, flagged as an option. Miro's own frame
  selection shows exactly this kind of properties strip (color, size,
  aspect ratio) as a genuinely separate UI surface from its right-click
  menu, which is evidence this is worth doing rather than skipping —
  but still flagged as optional/deferrable, not confirmed by the
  project owner.

### 1c. Right-click context menu — object operations
Moves out of any persistent toolbar location into a right-click menu,
contents depending on what's selected:
- Group / ungroup selected
- Bring to front / send to back
- Align selected
- Duplicate
- Delete
- (Board-group-specific, when right-clicking a frame/group) Rename,
  Choose Cover, color tag (once Tier 13 item E ships)

**Resolved (was an open question):** Milanote itself puts board-level
actions (Duplicate the board, Revert template to board) behind
right-click on the board's tile — so extending right-click to cover
Choose Cover/Duplicate/Delete for whole boards, not just in-canvas
objects, matches the reference app's own behavior rather than being
scope creep. Recommend including it, scoped as its own build step
(§3) so it doesn't get tangled with the in-canvas object menu work.

### 1d. Top bar — global/document-level actions (fixed, stays visible)
Stays at the top because these aren't per-tool or per-object:
- Auto-collage / Compact Pack
- Frame presets (Tier 13 item C, once built)
- Settings (Tier 13 item D, once built)
- Fit Board
- Undo / Redo
- Zoom slider — or relocate to a bottom-right nav cluster alongside Fit
  Board, matching Miro's separate navigation toolbar; either keeps it
  out of the left tool rail per §1a

## 2. Relationship to existing Tier 13 polish-guide items

This reorg **subsumes and depends on** work already scoped elsewhere
rather than duplicating it:

- **Inherits polish-guide item F** (floating per-object note toolbar) —
  building that IS building 1b's text-context-bar behavior. Do these
  together, not as two separate passes over the same code.
- **Depends on Tier 13 item B** (shape tool) for 1b's shape-context-bar
  row to have anything to show. If the shape tool isn't built yet, this
  addendum's shape-context-bar row is a stub for later, not a blocker.
- **Depends on Tier 13 item E** (color tagging) and **item C** (frame
  presets) for their respective entries in the right-click menu and top
  bar to be meaningful. Same non-blocking relationship — right-click
  entries for features that don't exist yet simply don't appear.
- Does **not** touch board-level split-view/navigation, which the base
  scope doc already marks out of scope (item F, cancelled) — this is
  strictly an in-canvas toolbar reorganization.

## 3. Suggested build order

1. Confirm the three open questions in §1a/1b/1c with the project owner
   before writing code — they change where several controls land.
2. Left rail: introduce the fixed tool rail and migrate existing tool
   selection (Select/Text/Note/Connect/Fisheye) into it. Pure UI move,
   no data-model change.
3. Contextual bar for Text/Note (absorbing polish-guide item F in the
   same pass, per §2).
4. Right-click menu for object operations (group/z-order/align/
   duplicate/delete), removing their current top-bar buttons once the
   menu covers them.
5. Leave Shape-tool context bar and any features gated on unbuilt Tier
   13 items as stubs until those items ship.

## 4. Acceptance criteria

- Left rail is present, fixed, and contains only tool-selection
  affordances — no document-level or object-level actions.
- Text-formatting toolbar only appears while a note is being edited,
  positioned near the note card, not fixed at the top.
- Right-click on a selected object/group shows only the operations
  applicable to what's selected (a single card vs. a frame vs. multiple
  selected items should not show identical menus).
- Top bar retains only true document/global actions — verify by
  grepping the top-bar markup for anything that duplicates a
  now-relocated tool or object operation.
- Live-browser verification (this project's standing rule) before
  marking any of the above done — code-traced confirmation isn't
  sufficient per the base scope doc's own §0 rules.

## 5. Non-goals

- Redesigning which features exist (this is a relocation of existing
  and already-scoped controls, not new functionality beyond what Tier
  13 already lists).
- Board-level navigation/management UI — stays where it is.
- Customizable/user-rearrangeable toolbars (InDesign/Affinity support
  this at a much deeper app-shell level) — out of scope unless
  explicitly requested later.

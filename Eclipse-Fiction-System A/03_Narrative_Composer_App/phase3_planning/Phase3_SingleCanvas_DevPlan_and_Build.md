> **Status: BUILT — August 17, 2026.** This plan has been executed. The merged
> prototype it specifies is `../Narrative_Composer_SingleCanvas_MERGED.html`.
> The two source mockups referenced throughout this doc
> (`Narrative_Composer_Whiteboard_Prototype.html`, `Narrative_Composer_UX_Mockup.html`)
> have been moved to `../archive/` with `_SUPERSEDED` suffixes — they're kept
> for reference only, per the "cannibalize, don't preserve" framing below.
> Section 5's open questions were **not** resolved by this build (as planned —
> they were explicitly out of scope) and remain open for a future session.
>
> What shipped vs. what this doc asked for:
> - Single canvas, no mode toggle, manuscript blocks as first-class draggable/
>   connectable nodes, author-placed nodes on the same board — done.
> - Inspector panel (Recompute Scope, Evidence Influence, Trace/Why) retargeted
>   to whatever's selected on the canvas rather than a separate view — done.
> - `wire-glow`/`wire-flow` animated edge pattern copied from the Drilldown
>   mockup verbatim, edge color set per-connection via CSS custom properties — done.
> - Parameter/Attribute/Channel three-layer scaffold present on every node,
>   built as structure (not a locked schema, per §5.2 below) — done.
> - The "All `<Character>`" grouping pattern — done as a concrete worked example
>   (Noir wired to two blocks from one node) rather than solved at scale (§5.3
>   — many scenes, many blocks — is still open).
> - Real pan/zoom was added on top of what this doc asked for: neither source
>   mockup actually implemented working pan/zoom despite the "infinite canvas"
>   framing, so it was built for real rather than left decorative.
> - Recompute stayed mocked, node taxonomy stayed undecided, mid-block
>   narration/dialogue splitting (§5.1) stayed open — all as planned below.
>
> Original plan follows unchanged.

---

# Narrative Composer — Single-Canvas Rework: Dev Plan / Session Handoff

**Status:** Planning/handoff only. Nothing below has been built. This document exists so the next AI session can start building instead of re-deriving these decisions from scratch.

**Read this before touching `Narrative_Composer_UX_Mockup.html` or `Narrative_Composer_Whiteboard_Prototype.html`.** Both files are superseded by the spec below — they're source material to cannibalize, not the design to preserve.

---

## 1. What this session resolved

Prior sessions produced two Narrative Composer mockups that disagreed with each other on the basic interaction model:

- `Narrative_Composer_Whiteboard_Prototype.html` — infinite canvas where the manuscript is one draggable page object sitting next to separate floating node objects.
- `Narrative_Composer_UX_Mockup.html` — a Compose/Graph/Split mode-switcher (three separate views of the same document).

**Resolved this session: there is only supposed to be one thing.** The manuscript auto-splits into blocks, and those blocks *are* the flowchart nodes — not a page next to a graph, not a graph view of a page. Everything lives on one infinite canvas: manuscript-derived nodes and author-placed nodes, wired together, no mode toggle. The Whiteboard Prototype's canvas mechanics are the right base; the UX Mockup's mode-switcher is the part to discard (it was an earlier AI session splitting one intended thing into two).

Also resolved this session:

- **Segmentation rule:** the manuscript divides by writing type — narrator/environment-description text vs. character-dialogue text — using the manuscript's own paragraph/beat boundaries as node boundaries. A block is not strictly one-character: a back-and-forth exchange between two characters can legitimately live in one block with multiple character tags on it (see the Whiteboard Prototype's second `.block`, which already does this — two speakers, one block).
- **External/behavior nodes feed blocks, not replace them.** A node like a character-behavior or lore node connects into whichever manuscript-blocks it's tagged as influencing.
- **Grouping:** one shared node can drive every block belonging to a given character across the whole canvas (the "All Akane" pattern) rather than being re-wired per scene/per block.
- **Node taxonomy is explicitly still undecided.** The specific nodes in both existing mockups ("Rainee Transformation Lore," "Noir Character Node," "Stewie Evidence Cluster," etc.) are placeholder dressing from early sketching, not a committed set of node types. Don't treat them as spec.

---

## 2. Target deliverable for next session

**One combined HTML prototype** that merges the two source files into the single-canvas model above. Concretely:

1. Infinite pannable/zoomable canvas (reuse Whiteboard Prototype's `.board`/`.workspace` + pointer-drag mechanics — don't rebuild this).
2. The manuscript is not a monolithic `.page` object. It's pre-split into individually-draggable/individually-connectable block-nodes (narrator blocks + dialogue blocks) sitting on the canvas, styled consistently with the existing block/chip visual language already in both mockups.
3. Author-placed nodes (behavior/lore/evidence/reference nodes) live on the same canvas and connect into block-nodes via ports, same as the Whiteboard Prototype already does.
4. Keep the UX Mockup's **inspector panel** concepts (Recompute Scope, Evidence Influence weighting, Trace/Why) — those are good and orthogonal to the mode-switch problem — but they should describe/operate on the single canvas, not a separate editor view.
5. Drop the UX Mockup's `.modes` toggle (`Compose` / `Graph` / `Split` buttons) entirely.

### Animated connection lines

Don't invent a new animation system — reuse the pattern already implemented in `Eclipse_Nested_Levels_Drilldown_Mockup_CURRENT.html`:

- Each edge is drawn as **two overlaid SVG paths**: a `wire-glow` path (soft static glow) and a `wire-flow` path on top of it.
- The `wire-flow` path uses `stroke-dasharray:6 10` with a `@keyframes flow { to { stroke-dashoffset:-32; } }` animation (~1.1s linear infinite) to create the moving-dash "data flowing along the wire" effect.
- Edge color is set per-connection via CSS custom properties (e.g. `--node-rel-edge`, `--wire-a/b/c`) rather than a single fixed stroke color — reuse this so edge color can encode connection type/character grouping.

### Three-layer node data model (cross-app compatibility)

Each node — manuscript-block or author-placed — should carry data split into three layers, per the Houdini-derived distinction already flagged as the most directly applicable idea in `Extraction-to-Behavior_Prior-Art_Dossier.md` (§2, §4):

- **Parameter** — author-set configuration: something a person declared true (a rule, a name, a stated trait).
- **Attribute** — computed/derived data carried through the graph (e.g. a relationship inferred from co-occurrence).
- **Channel** — data that varies across the timeline (a status, a relationship state — the thing Novelcrafter's Progressions model would track).

This is what makes a node exportable/interoperable with the other three apps (Mining App, Visual Narrative Authoring App, Fiction Engine) via the portable node envelope already defined in `Phase3_Node_Schema_and_Mining-to-Eclipse_Boundary.md` — the three-layer split is a refinement *inside* that envelope's payload, not a competing schema. This is design intent to build toward, not a locked schema — the dossier explicitly marks Parameter/Attribute/Channel as an open question (§5), so implement it structurally in the mockup but don't treat the exact field names as final.

---

## 3. Explicit non-goals this round

- **Not** deciding the final node taxonomy (still open, per §1 above).
- **Not** resolving the dirty-propagation/opinion-stack rewrite mechanism — that's the mechanism for how editing a node patches the manuscript text back, and it's explicitly paused in `Phase3_FictionEngine-to-Composer_Boundary_and_Bidirectional_Contract.md` pending Rain finishing the Composer's own graph functionality first. Don't try to make the mockup's "recompute" button actually rewrite text correctly — a mocked/fake compute step (like both existing prototypes already have) is fine.
- **Not** production code. Still a single-file HTML/CSS/JS prototype, same tier as the existing mockups.

## 4. Source files to reuse, not rebuild

| File | What to take from it |
|---|---|
| `Narrative_Composer_Whiteboard_Prototype.html` | Canvas/pan mechanics, pointer-drag code, port/anchor visual pattern — this is the base to build on top of. |
| `Narrative_Composer_UX_Mockup.html` | Inspector panel sections (Recompute Scope, Evidence Influence, Trace/Why, Evidence Matrix modal) — keep these, re-target them at the single canvas. Discard the `.modes` toggle. |
| `Eclipse_Nested_Levels_Drilldown_Mockup_CURRENT.html` | Copy the `wire-glow` + `wire-flow` animated-edge CSS/SVG pattern verbatim rather than reinventing it. |

## 5. Open questions to carry forward (not to solve this round)

- Exact chunk-boundary rule when a manuscript paragraph mixes narration and dialogue mid-block — does it force-split, or does one block just carry multiple type-tags (as it already does for multi-character exchanges)?
- What the three node layers (Parameter/Attribute/Channel) actually contain per node type — needs a product decision from Rain/the user, not just this mockup.
- How an "All `<Character>`" grouping node is represented and wired at scale once there are many scenes (one node fanning out to N blocks across N manuscripts) — visually and structurally.

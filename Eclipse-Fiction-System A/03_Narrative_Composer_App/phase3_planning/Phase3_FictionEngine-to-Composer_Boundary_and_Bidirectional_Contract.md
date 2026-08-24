# Phase 3 — Fiction Engine → Narrative Composer Boundary & the Composer's Bidirectional Contract

**Status:** Planning/structure only — no build work. Illustrator sketches still deferred. This document is the "Fiction Engine → Narrative Composer boundary shape" slice of the Phase 3 task list from `START_HERE.md`, plus the reverse-path clarification flagged by an outside AI architecture review on 2026-08-16 (see note at bottom).

**⏸ Paused (2026-08-17; reaffirmed 2026-08-19):** Rain wants detailed sketches of the
Composer and graph functionality before this boundary is finalized. The reverse path,
`action_type`, dirty propagation, opinion-stack, DAG, and recompute material below is
background research/proposal only. Do not treat it as an active requirement or build
against it yet. See `Documentation_Migration_and_Authority.md`.

**Trigger for this doc:** a review of the full package (by another AI, cross-checked against the actual source files) noticed that `Narrative_Composer_UX_Mockup.html` and `Narrative_Composer_Whiteboard_Prototype.html` already contain UI for JSON compilation, node attachment, and selective recompute — meaning the Composer was already implying a two-way relationship with structured data that nothing in the docs had formalized. This doc formalizes it, at the same planning level as `Phase3_Node_Schema_and_Mining-to-Eclipse_Boundary.md`.

**Scope of this doc:** (1) the Fiction Engine → Composer handoff shape (forward, generation output), and (2) the Composer's reverse path — turning existing/edited narrative back into structured proposals, grounded against nodes that already exist in Eclipse. **Not covered here:** the Eclipse → Fiction Engine boundary (still a separate, not-yet-started deliverable), and no changes to any mockup, HTML, or build. Nothing below is a locked spec — same status as the Mining → Eclipse boundary doc.

---

## 1. Why this is a boundary-contract question, not a new app

Same principle already settled for Mining → Eclipse: the four apps keep separate internal representations by design. Fiction Engine has its own episode/character/state model (`Fiction_Behavior_Engine_v3.5_DEV_NOTES.md` §3, §5). The Composer's whiteboard has its own scene/node/evidence model (`Narrative_Composer_Whiteboard_Prototype.html`). Neither needs to become the other. What's missing is only the **envelope shape at the boundary** — same portable-node pattern already defined in `Phase3_Node_Schema_and_Mining-to-Eclipse_Boundary.md` §2, reused here rather than re-invented.

The Composer is not becoming "a fourth competing source of truth" (the thing `README.md` already says it should not become). It stays downstream in the primary generation path. What this doc adds is: when the Composer *does* produce structured data — either passing through what Fiction Engine gave it, or extracting new structure from edited/existing narrative — that data uses the same envelope everything else does, and any update to an existing Eclipse node goes through author review, never a silent write.

## 2. Direction A — Fiction Engine → Composer (forward, primary path)

What Fiction Engine actually produces per episode is documented in DEV_NOTES §5 (`episode_anchor` shape) plus whatever the branching/interaction resolution (§9–10) settles on for a given scene. Wrapped in the same envelope as the Mining → Eclipse example:

```json
{
  "schema_version": "1.0",
  "id": "fictionengine:rainee_stewie_ultra_luxury_diaper:scene_014",
  "type": "generated_scene",
  "label": "Rainee & Noir — Jade City market, Transformation State 03",
  "origin_app": "fiction_engine",
  "provenance": {
    "source": "family_guy_s08e17",
    "captured_by": "inferred",
    "confidence": 0.78
  },
  "evidence_links": [
    "eclipse:rainee:evidence:001",
    "eclipse:rainee:relationship:noir_recognition"
  ],
  "payload": {
    "targetCharacterId": "rainee",
    "targetStateId": "rainee_stewie_ultra_luxury_diaper",
    "beats": ["setup", "problem", "escalation", "reaction"],
    "prose": "..."
  }
}
```

Notes:
- `evidence_links` here is what lets the Composer later trace a line of generated prose back to the specific Eclipse nodes (evidence + relationship) that produced it — this is the field that makes Direction B's provenance chain (§5 below) possible at all.
- `payload` is Fiction Engine's real shape (DEV_NOTES §5), untouched — Composer reads what it understands (`prose`, `targetCharacterId`) and passes the rest through.

## 3. Direction B — Composer → structured proposal (reverse path)

When the Composer ingests existing/edited narrative (whether just-generated or hand-revised) and extracts structure, the output is a **proposal**, using the same envelope, with `origin_app: "narrative_composer"`:

```json
{
  "schema_version": "1.0",
  "id": "composer:scene_014:beat_03:proposal_001",
  "type": "extraction_proposal",
  "label": "Noir — defensive reaction on seeing Rainee",
  "origin_app": "narrative_composer",
  "provenance": {
    "source": "fictionengine:rainee_stewie_ultra_luxury_diaper:scene_014",
    "captured_by": "inferred",
    "confidence": 0.78
  },
  "evidence_links": ["fictionengine:rainee_stewie_ultra_luxury_diaper:scene_014"],
  "payload": {
    "target_node_id": "eclipse:noir:001",
    "narrative_segment": "scene_014.beat_03",
    "observations": ["Noir became defensive"],
    "proposed_relationships": [],
    "proposed_state_changes": [
      { "property": "emotional_state", "value": "defensive" }
    ],
    "action_type": "propose_state_change",
    "review_status": "proposed"
  }
}
```

`confidence` here inherits from the Fiction Engine node it was extracted from where the segment is unedited, and should drop when the Composer is extracting from author-edited prose the Fiction Engine never generated — that distinction (edited vs. generated) is a real one Direction B needs to carry, even at this planning level, since it changes how much author review a proposal needs before it's trustworthy.

## 4. `action_type` — the merge-semantics enum

The outside review's biggest actual gap-catch: extraction must not default to "create new node." `action_type` is a required `payload` field on every extraction proposal, one of:

| Value | Meaning |
|---|---|
| `attach_evidence` | New evidence for an existing node; node itself unchanged |
| `propose_relationship_change` | Modifies an existing relationship (strength, type, mode) |
| `propose_state_change` | Modifies a character/environment state |
| `merge_relationship` | Folds into an existing relationship rather than creating a parallel one |
| `create_new_node` | No existing node matches — genuinely new entity |

Every value except `create_new_node` requires `target_node_id` to resolve to something already in Eclipse. This is a naming/structure decision only — the actual entity-resolution logic (how the Composer decides *which* existing node "Noir" resolves to) is explicitly out of scope for this doc, same way Mining → Eclipse's doc left the `data_type` inference algorithm as a flagged-not-solved item.

## 5. Provenance chain — extending the existing pattern one more hop

Mining → Eclipse already established: nothing becomes canonical without a path back to source (`Phase3_Node_Schema_and_Mining-to-Eclipse_Boundary.md` §2). Direction A/B above extends that same chain one hop further rather than starting a new one:

```
mining evidence id
  → eclipse node id  (evidence_links)
    → fiction engine generated-scene id  (evidence_links)
      → composer extraction-proposal id  (provenance.source)
        → (if accepted) updated eclipse node
```

No new field type needed — `evidence_links` and `provenance.source` are the same two fields already carrying this chain since the first boundary doc. This is what "grounding against the existing graph" (the review's phrase) actually cashes out to at the data-shape level: a proposal is only ever accepted by walking this chain back, never by keyword-matching narrative text against node labels.

## 6. Recompute scope — proposed solution

**Status: a proposed pattern, not a locked algorithm.** This is a well-solved problem outside fiction/story tooling — every 3D/VFX pipeline with a node graph hits the identical question ("I changed one thing, what else needs to redo its work?"), and they've all converged on the same shape: **dirty propagation over an existing dependency graph, evaluated lazily.** Checked against three real implementations before writing this (Houdini's node cooking, Blender's `depsgraph`, and Pixar's USD composition model — see §8 for what each contributes and their sources). None of these are being adopted wholesale; the underlying pattern is what transfers, mapped onto fields this project already has.

**The core mechanism, restated for this project:**

1. **The dependency graph already exists — it's `evidence_links`.** Every envelope (§2, and the Mining → Eclipse doc's §2) already records what it was built from. That *is* a dependency graph; nothing new needs to be invented to have one. This is the same relationship Houdini's node-input wires and Blender's datablock relationships represent — Eclipse/Fiction Engine/Composer just haven't used theirs for invalidation yet.

2. **Tag dirty, don't recompute yet.** When a narrative segment is edited, or an author accepts a Composer proposal that changes an Eclipse node (§4), that `id` gets marked dirty. Nothing regenerates at this moment — same as Houdini/Blender: tagging and recomputing are two separate steps.

3. **Dirty propagates forward, by walking `evidence_links`.** Anything whose `evidence_links` includes a dirty `id` is now dirty too, transitively. This *is* the "Recompute Scope" — the list is simply every `id` reachable by walking `evidence_links` forward from the edited node. No separate scope-tracking structure needed; it's a graph traversal over data the envelope already carries.

4. **Evaluate lazily (pull), not eagerly (push).** Don't auto-regenerate everything dirty the instant something changes — that's expensive and, per your credit-budget-conscious way of working, wasteful. Instead: dirty items just sit marked. Regeneration happens only when something asks for that item's output — i.e., when the author actually hits "Recompute Scope" in the Composer UI (already-existing button, `Narrative_Composer_UX_Mockup.html`) on a specific dirty segment, or opens/views it. The button's job becomes concrete: *list what's currently dirty downstream of this point, then regenerate only that list on request.*

5. **Constraint this places on the graph:** `evidence_links` needs to stay acyclic (a DAG) for forward-propagation to terminate cleanly — the same requirement Houdini/Blender/USD all have. Worth flagging now for whoever eventually designs branching Relationship Node serialization (§9), since a branching structure that lets a variant reference back to something that references it would break this.

**A second, related idea worth carrying over from USD, for a different question (not recompute — conflict/history):** USD never lets a stronger edit silently overwrite the original; edits stack as layered "opinions," strongest wins, but nothing underneath is destroyed or lost. Applied here, that's a natural extension of the "Proposed Update" object already defined in §3 — instead of an accepted Composer proposal directly mutating an Eclipse node's field, it lands as a new opinion in a stack on that field, so the node's history stays fully inspectable and reversible, not just approved-then-gone. This is a separate mechanism from dirty propagation (one is "what needs redoing," the other is "how conflicting edits coexist without destroying data") — flagged here because they'd likely get designed together, not because they're the same thing.

**Left open on purpose, since the Composer's own feature set isn't fully scoped yet:** whether "Recompute Scope" surfaces to the author as an automatic list or something they review/approve first; how the opinion-stack idea would actually show up in the whiteboard UI; and exact cycle-prevention enforcement. These are UI/interaction decisions for whenever there's more to design against — the graph-walk-plus-lazy-evaluation shape above is the part borrowed from prior art and reusable regardless of how those get answered.

## 8. Addendum — prior art consulted for §6 (2026-08-17)

Researched before writing §6, rather than designing the recompute-scope mechanism from scratch:

- **Houdini node cooking** — "dirty" nodes only recook when their output is actually requested (pull evaluation); dirtying propagates forward along existing node connections. ([SideFX HDK docs](https://www.sidefx.com/docs/hdk/_h_d_k__op_basics__overview__cooking.html), [dependencies docs](https://www.sidefx.com/docs/hdk/_h_d_k__op_basics__overview__dependencies.html))
- **Blender's dependency graph (`depsgraph`)** — datablocks get tagged for update on edit; tags flush forward along the relationships already recorded between objects; only what's actually displayed/rendered gets re-evaluated. ([Blender Developer docs](https://developer.blender.org/docs/features/core/depsgraph/), [Dependency Graph Overview](https://archive.blender.org/wiki/2015/index.php/Dev:Source/Data_System/Dependency_Graph/Overview/))
- **Pixar USD composition** — non-destructive layering: edits stack as "opinions" on top of weaker layers rather than overwriting; strongest opinion wins, nothing underneath is destroyed. Source of the opinion-stack idea in §6, not the dirty-propagation part. ([Introduction to USD](https://openusd.org/release/intro.html), [USD Glossary](https://graphics.pixar.com/usd/docs/USD-Glossary.html))

## 9. Addendum — checked against the live app (2026-08-17)

`Fiction_Behavior_Engine_v3_5_SIMPLE_EPISODE_JSON.html` is the actual running app (README calls it out as ground truth), so the merge-semantics question in §4 was checked against its real code rather than left as pure design.

**What the live app already does, and how it maps onto §4:**
- `mergeValues`/`mergeEntry` — a working deep-merge: arrays merge by matching `id`/`sceneId`/`sequence`, objects merge key-by-key, and an explicit `mergeMode: "replace"` field lets an entry override instead of merge.
- `mergeDatasetEntries`/`resolveEpisodeAnchors` — incoming data is checked against existing library entries via `extendsId`/`parentId`. A match merges as a **supplement** of the existing entry; no match pushes a new one. This is real running precedent for the `attach_evidence` vs. `create_new_node` split in §4 — just scoped to Fiction Engine's own library import, not the Composer's narrative-extraction case. Worth reusing this pattern's shape (a matching key + merge-vs-replace flag) rather than inventing a different one when the Composer's reverse path actually gets built.

**What it confirms is still open (§6, unchanged):**
The app's only scope mechanism is `activeIds` — a flat list the user toggles by hand (checkboxes) to choose what's included in a given AI run. There's no dirty-tracking, invalidation, or dependency-walking anywhere in the current code. This confirmed, at the time it was checked, that nobody had built an answer to the Recompute Scope question yet anywhere in the project — §6 above is the first proposed answer, not something retrofitted from existing code.

## 10. Not covered here (next slices)

- Eclipse → Fiction Engine boundary shape (still open, still separate — unchanged by this doc)
- Entity-resolution algorithm for Direction B (how "Noir" in prose actually resolves to `eclipse:noir:001`)
- Recompute-scope trigger UX (automatic vs. author-reviewed) and cycle-prevention enforcement (§6 proposes the underlying dirty-propagation mechanism; these are the remaining interaction-design questions)
- Opinion-stack UI (how a field's edit history would actually surface in the whiteboard)
- Any Composer UI/mockup changes — this doc only defines the data contract those UI elements would eventually talk to
- Author-review UI/flow for accepting/rejecting a proposal

---

*Note: this doc formalizes a gap surfaced by an outside AI review of the full documentation hub ZIP (2026-08-16), cross-checked against the actual source files before acting on it — not acted on speculatively.*

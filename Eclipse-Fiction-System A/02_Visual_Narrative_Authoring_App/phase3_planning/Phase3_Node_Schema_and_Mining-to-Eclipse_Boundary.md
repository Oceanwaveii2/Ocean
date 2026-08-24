# Phase 3 — Portable Node Schema & Mining App → Eclipse Boundary Shape

**Status:** Planning/structure only — no build work. Illustrator sketches still deferred (asked and deferred twice per Phase 1/Phase 2 notes). This document is the "define the portable node" + "one boundary shape" slice of the Phase 3 task list from `START_HERE.md`.

**Scope of this doc:** (1) what fields every node needs regardless of app, vs. what stays app-internal, and (2) the Mining App → Eclipse (App 1 → App 2) handoff shape as a worked example. The other two boundaries (Eclipse → Fiction Engine, Fiction Engine → Narrative Composer) and the branching-variant serialization question are explicitly **not** covered here — separate deliverables.

---

## 1. Why a portable envelope, not a shared schema

Each app's internal node shape is legitimately different and should stay that way — this was already settled in Phase 1 ("DEV_NOTES schema in sync with Eclipse schema?" was retired specifically because they're separate apps by design). Eclipse needs containment level, persona weights, priority stacks. The Fiction Engine needs local character/state trees and transformation metadata. Forcing one shared internal schema across all four apps would mean flattening data every app actually needs.

What *does* need to be shared is the shape of data **at the moment it crosses a boundary** — same principle as a file format: Illustrator and Photoshop don't share an internal document model, but a PSD import/export contract lets meaning survive the trip. So the right unit isn't "the node schema" — it's an **envelope** that every app can wrap its own payload in in the same way.

## 2. The portable node envelope (universal fields)

Every node, at the point it crosses an app boundary, carries these fields — regardless of which app produced it or which app is about to consume it:

```json
{
  "schema_version": "1.0",
  "id": "string — stable within its namespace; see Documentation_Migration_and_Authority.md",
  "type": "string — app-specific type tag (see §3)",
  "label": "string — human-readable name/summary",
  "origin_app": "mining | eclipse | fiction_engine | narrative_composer",
  "provenance": {
    "source": "string — where this came from (episode id, screenshot, transcript, upstream node id)",
    "captured_by": "manual | automated | inferred",
    "confidence": "number 0.0–1.0"
  },
  "evidence_links": ["array of ids — traceable pointers back to the raw evidence/nodes this was built from"],
  "payload": { }
}
```

Notes:
- `id` / `evidence_links` make the pipeline traceable end to end. This is a bookkeeping and audit feature, not a canon gate: the author prepares the source transcripts/captures, and the apps process them. The schema does not decide what is canon.
- `provenance.confidence` generalizes the confidence field that already exists independently in the Mining App's evidence-worker contract *and* in Eclipse's Internal Data Node (§6/§4 respectively) — same concept, now given one canonical home in the envelope instead of being redefined per app.
- `payload` is intentionally opaque at the envelope level — it's where each app's real internal shape lives, untouched.

## 3. What stays app-specific (inside `payload`, not standardized)

| App | Stays internal / app-specific |
|---|---|
| Mining App | `time_start`/`time_end`, raw `features`, `source_type` (`direct \| structural \| archetypal \| analogical`), `analogical_source_character` (`character_id`/`character_label`/`rationale`, required iff `source_type == "analogical"` — see `Phase3_DataType_Mapping_Table.md` §5), screenshot/lyric alignment fields |
| Eclipse | containment level (World/Persona/Evidence), `persona_weights`, `priority`, `global_weight`, `node_rules`/`node_biases`/`node_overrides`, Relationship Node branching-variant structure |
| Fiction Engine | local character/state tree (persona states, transformation states), `beats`, `observations`, derived-vs-source-evidence distinction (§4 of DEV_NOTES) |
| Narrative Composer | *(not reviewed this session — out of scope)* |

None of this needs to be forced into a common shape. It only needs to survive, unmodified, inside `payload` as it moves between apps — the receiving app either reads what it understands or ignores what it doesn't.

## 4. Worked example: Mining App → Eclipse

### 4a. Historical shapes and current planning format

The two shapes below are retained as historical illustrations of the earlier
worker/manual drafts. For new planning, use the modern `capture_entry` format in
`Mining_App_Project_Scope.md` §7 and `Phase3_Gap_Resolutions.md` §4. The human
selects and prepares the capture; the Mining App automates processing over it.

Two real shapes exist in the current docs — the general evidence-worker contract (§4 of `Mining_App_Project_Scope.md`) and the proposed manual-capture entry (§7):

```json
// evidence-worker contract
{
  "type": "audio_event",
  "source_id": "akane_ep04",
  "time_start": 65.0,
  "time_end": 70.0,
  "features": {},
  "observations": [],
  "confidence": 0.8,
  "provenance": {}
}
```

```json
// manual capture entry (v0.3 proposed)
{
  "timestamp": "01:04.2",
  "screenshot": "akane_ep04_frame112.png",
  "jp_lyric": "...",
  "translation": "...",
  "visual_notes": "icy, soft-spoken condescension",
  "thematic_notes": "Casual Ease phase"
}
```

### 4b. Wrapped in the portable envelope

```json
{
  "schema_version": "1.0",
  "id": "mining:akane_ep04:frame112",
  "type": "manual_capture",
  "label": "Akane — Ep4 frame 112 (Casual Ease)",
  "origin_app": "mining",
  "provenance": {
    "source": "akane_ep04",
    "captured_by": "manual",
    "confidence": 0.9
  },
  "evidence_links": [],
  "payload": {
    "timestamp": "01:04.2",
    "screenshot": "akane_ep04_frame112.png",
    "jp_lyric": "...",
    "translation": "...",
    "visual_notes": "icy, soft-spoken condescension",
    "thematic_notes": "Casual Ease phase"
  }
}
```

### 4c. What Eclipse does with it — Internal Data Node

Eclipse's Internal Data Node shape (§6 of `Eclipse_Architecture_and_Schema.html`) already has slots that map cleanly onto the envelope:

```json
{
  "id": "eclipse:akane:evidence:001",
  "type": "evidence",
  "data_type": "image",
  "source": "mining:akane_ep04:frame112",
  "target": "akane",
  "scope": "persona",
  "global_weight": null,
  "priority": null,
  "confidence": 0.9,
  "evidence": "icy, soft-spoken condescension",
  "extracted_signals": ["Casual Ease phase"],
  "node_rules": [],
  "node_biases": [],
  "node_overrides": []
}
```

Mapping:
- `source` = the envelope's `id` (this is the traceability link — Eclipse never re-derives evidence, it points back at it)
- `confidence` passes through from `provenance.confidence` unchanged
- `evidence` / `extracted_signals` are populated from `payload.visual_notes` / `payload.thematic_notes` — this is genuinely new work Eclipse does (interpreting mined evidence into signals), not a passthrough
- `data_type` is inferred from envelope `type` (`manual_capture` with a `screenshot` field → `image`)
- Everything Eclipse-specific (`global_weight`, `priority`, `node_rules`/`biases`/`overrides`) starts empty at import time and gets authored inside Eclipse — it's not something Mining App could ever populate correctly, and the boundary shape doesn't pretend otherwise.

## 5. Open item this raises (flag, not resolved here)

`data_type` inference (image vs. transcript vs. audio) from the Mining App's `type` field works cleanly for the two shapes shown above, but the Mining App doc lists eight-plus evidence dimensions (Transcript, Image, Audio, Video Analysis, Social/Cultural Reference, Character Reference, Relationship Evidence, General Writing Reference — §6 of the Eclipse doc). A real mapping table between Mining App's `type`/`source_type` values and Eclipse's `data_type` enum doesn't exist yet. Worth a short follow-up pass once more Mining App output shapes exist to check against — not urgent, since v0.3 itself is still just a proposed direction.

## 6. Boundary/recompute material explicitly parked

The Fiction Engine → Narrative Composer reverse path, proposal acceptance behavior,
dirty propagation, cycle handling, and recompute scope are **not active requirements**
for this planning package. They depend on detailed sketches of how the apps should
function. The earlier reverse-path research is retained as background only; it must
not be read as requiring a DAG, an opinion stack, or an automatic proposal-to-node
write-back loop.

In particular, `evidence_links` may document source/dependency relationships, but
this document does not currently define whether generated prose can link back into
the same Eclipse nodes that supplied it. That question is intentionally deferred.

## 7. Not covered here (next slices)

- Eclipse → Fiction Engine boundary shape
- Fiction Engine → Narrative Composer boundary shape
- How a branching Relationship Node (Phase 2) serializes across a boundary — all variants vs. active-only
- Carrying the visual token system from the drill-in mockup into other app mockups

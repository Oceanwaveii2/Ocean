# Eclipse / Fiction System — Consolidated Project Package
**Phase 3 in progress — August 17, 2026**
*Phase 1: doc cleanup + Eclipse UI structure design. Phase 2: resolved which mockup wins, retired Convergence Node into Relationship Node's branching variants, scoped that round as UI-only (no mining). Phase 3 (planning-level only — Illustrator sketches still deferred): defined the portable node envelope and worked through the Mining App → Eclipse boundary shape end-to-end; added the live Fiction Engine app (`04_Fiction_Engine/Fiction_Behavior_Engine_v3_5_SIMPLE_EPISODE_JSON.html *(byte-identical twin exists at `01_Mining_App/Sample and Test from Miniing Apps/02_Interfaces_HTML/` — copied deliberately so 04 is self-contained)*`) to the package as ground truth; defined the Fiction Engine → Narrative Composer boundary and the Composer's reverse/bidirectional path, including a proposed Recompute Scope mechanism — now **paused** pending Rain finishing the Composer's own graph-functionality planning. Eclipse → Fiction Engine boundary still open. **New (Aug 17):** the Narrative Composer's single-canvas rework is built — see the app 03 section below. **New (Aug 18):** `Phase3_Functional_Gap_Analysis.md`'s follow-up — `Phase3_Gap_Resolutions.md` (this level) proposes solutions for every flagged gap (with earlier review claims clearly marked historical; Mining App capture/processing roles clarified), including a turn-based scene-loop design for the character-to-character simulation gap. Full details and remaining Phase 3 slices in `START_HERE.md`.*

**Guiding concept — Pseudo-cognition:** convert media-derived observable behavior, social responses, context, and relationships into editable nodes that can support fictional simulation and, conceptually, narrative decomposition and recomposition.

This package consolidates all planning docs, architecture notes, and UI mockups
for the four-app pipeline into one organized structure. Duplicate files were
removed and everything was renamed to describe its contents rather than its
export filename.

`Documentation_Migration_and_Authority.md` is the cleanup index for deciding which
material is current, proposed, historical, or parked.

- `Extraction-to-Behavior_Prior-Art_Dossier.md` — prior-art research on extraction-to-behavior systems (root level).

`Eclipse_System_Architecture_CANON.md` (2026-08-21) is the authoritative
architecture statement: a **deterministic, rule-driven procedural system with an
AI layer for specific functions** — no training/fine-tuning anywhere; AI touches
the pipeline at exactly two bounded points (media→text interpretation,
hooks→prose rendering); text is the canonical format; storage policy (JSON source
of truth, SQLite index later, graph DBs deferred) lives there too.

**Note on build order:** unlike a typical project where each app gets built and
shaped separately before talking to the others, all four apps here are being
planned and built **simultaneously**. `Cross-App_Unified_Node_Schema_DRAFT.md`
(this level) is an early, non-locked exploration of what a schema shared across
all four apps from the start could look like — see `START_HERE.md` for status.

**Also in 03 (uncatalogued before 2026-08-21):** `phase3_planning/Bethjamin_Button_Composer_Mockup.html` — Composer mockup used by `Phase3_Gap_Resolutions.md`.

## The four apps

| # | App | Folder | Responsibility |
|---|---|---|---|
| 1 | **Mining App** | `01_Mining_App/` | Extract, analyze, align, and mine source evidence (transcripts, screenshots, audio) into traceable JSON datasets |
| 2 | **Visual Narrative Authoring App** ("Eclipse") | `02_Visual_Narrative_Authoring_App/` | The node-graph editor — Character Brain / Group / Character / Relationship nodes, nested source roles, and authored functions — that composes independently mined datasets |
| 3 | **Narrative Composer App** | `03_Narrative_Composer_App/` | Whiteboard for working on a single story/fiction output after generation |
| 4 | **Fiction Engine** | `04_Fiction_Engine/` | Generates original fiction from resolved character/behavior evidence: `source evidence → behavior extraction → character/state mapping → interaction simulation → branching → prose → audit` |

Data flows left to right: **Mining App → Visual Narrative Authoring App → Fiction Engine → Narrative Composer App.**

**Canonical mining evaluation library:** the BBL / Rangiku / Rainee discussion is preserved separately in [`01_Mining_App/minning evaluation project/Minning Mark down Project.txt`](01_Mining_App/minning%20evaluation%20project/Minning%20Mark%20down%20Project.txt) with its browser companion [`01_Mining_App/minning evaluation project/Minning_Evaluation_Documentation.html`](01_Mining_App/minning%20evaluation%20project/Minning_Evaluation_Documentation.html). It includes the self-contained session media library, direct-versus-derived evidence labels, football and Montreal case studies, and research references. It documents extraction scope only; relationship behavior stays with Eclipse.

## What was cleaned up

- Removed 6 byte-identical duplicate files (same content, different export
  suffix like `__1_`, `__2_`):
  - `eclipse_architecture_schema_2026-08-15__1_.html`
  - `Fiction_Behavior_Engine_Image_Visual_Evidence__1_.md`
  - `image_conditioned_narrative_influence_research__1_.html` and `__2_.html`
- Identified `eclipse_cognition_studio_uxui_mockup_2026-08-15.html` as an
  earlier draft of `..._v2.html` (same title, earlier/larger export) — kept
  v2 as the current mockup and moved v1 to
  `02_Visual_Narrative_Authoring_App/archive/` labeled SUPERSEDED rather than
  deleting it outright, in case it has layout details v2 dropped.
- Renamed every file from its raw export name to a descriptive name and
  sorted it into the app folder it actually documents.

## Folder contents

### 01_Mining_App/
- `Sample and Test from Miniing Apps/03_API_Mining/Mining_App_Project_Scope.md` — full scope doc (at its real depth, was listed as if at 01 root): evidence hierarchy
  (signal → observation → inference → pattern → author-accepted rule),
  feasibility findings, manual capture workflow decision (v0.3 direction),
  the Akane Aikawa test case, and mining approaches for characters with no
  dedicated source footage.
- `01_Mining_App/minning evaluation project/` — canonical BBL / Rangiku / Rainee mining
  evaluation and a self-contained `assets/` library for the supplied direct media,
  generated visual reinterpretations, and concept sketches. This is an evidence
  library, not a second relationship-graph specification.
- `phase3_planning/Mining_Video_Behavior_Enhancement_Research.html` — Claude-authored
  research page (sorted into the package 2026-08-18): mining short video clips as
  time-series of observable events — unified tracking layers (face, body, hair,
  clothing, appearance regions), anime + physical expression layers, motion fusion,
  temporal event miner, behavioral pattern ladder, relationship graph, cross-video
  mining, and a recommended research stack. Core principle — "don't jump from pixels
  to personality" — is the project's evidence hierarchy applied to video. The
  video-channel counterpart of the reaction-pairs pass proposed in
  `Phase3_Gap_Resolutions.md` §1a.
- `phase3_planning/Phase3_MultiPass_JSON_Mining_Ideas.md` — the multi-pass JSON
  mining proposal (pass 1 relationship/tonal scan, pass 2 literature/dialogue-heavy
  + image, PDF assemblable on one timecode spine); the Akane performance-record
  extract it references lives in `reference/`.

*Naming note (2026-08-21): the engine testbed calls the Jillian-derived master "Nori" (`Nori_Jillian_data.json`); project docs say "Noir". Same character — treat Nori as the filename spelling only.*

### 02_Visual_Narrative_Authoring_App/
- `Eclipse_Architecture_and_Schema.html` — the working conceptual schema:
  Group Node / Character Node / Relationship Node with branching variants,
  rules/biases/priorities/overrides hierarchy, computation model.
- `Eclipse_Cognition_Graph_PerNode_Architecture.html` — per-node data
  architecture detail.
- `Eclipse_Visual_Authoring_UX_Mockup.html` — UX mockup.
- `Eclipse_Visual_Authoring_Graph_Mockup_Preview.html` — rendered graph-board
  preview (character layer / world layer / Fiction Behavior Engine node).
- `Eclipse_Cognition_Studio_UXUI_Mockup_v2.html` — current authoring-board
  UI mockup.
- `Eclipse_Nested_Levels_Drilldown_Mockup_CURRENT.html` — **the resolved
  nav paradigm.** Drill-in/breadcrumb navigation, hybrid Houdini/Unreal
  aesthetic. Starting point for further UI work.
- `archive/Eclipse_Cognition_Studio_UXUI_Mockup_v1_SUPERSEDED.html` — earlier
  draft, kept for reference only.
- `archive/Eclipse_3Layer_TabSwitch_Mockup_SUPERSEDED.html` — the competing
  tab-switch nav paradigm; superseded by the drill-in mockup above.
- `phase3_planning/Phase3_Node_Schema_and_Mining-to-Eclipse_Boundary.md` — the
  portable node envelope + worked Mining App → Eclipse boundary example
  (Phase 3, planning-level only). See `START_HERE.md` for status and gaps.
- `phase3_planning/Eclipse_Writing_Node_Spec_v0.1.md` — Claude-authored draft spec
  (sorted into the package 2026-08-18, corrections applied same day): a **Writing
  Node** downstream of baked character/world JSON that owns prose style —
  anti-AI-tell pass, locked per-character voice profiles, evidence-gated sensory
  detail (grounded vs flagged-unsourced inference, per sense). Naming corrected per
  Rain: the artboard's "Visual Composer AI" is the Narrative Composer (image-gen
  prompting branch). Open question it flags: single shared prose output vs. dual
  tuned variants for the two consumers.
- `phase3_planning/Eclipse_Writing_Node_Pipeline_Artboard.png` — Rain's hand-drawn
  pipeline sketch the Writing Node spec is based on (preserved in-package
  2026-08-18). 
- `phase3_planning/Princess_Sari_Cheryl_Transformation_Worked_Example.md` —
  worked example for Level 0 configured Princess Sari group nodes, their Level 1
  internal network, optional configuration variants, external group relationships,
  and the attached Dog/Rush personality trait.
- `phase3_planning/Node_Activation_and_Story_State_Presets.md` — working proposal
  for reusable named story states, bypass/off behavior, dominance settings, preset
  inheritance, and resolved-stack previews.
- `phase3_planning/assets/sari_cheryl_early_drafts/` — five early node-layout drafts
  supplied as visual references for the Princess Sari configurations and Twin
  Sisters external relationship; not final sketches or locked UI specifications.

### 03_Narrative_Composer_App/
- `Narrative_Composer_SingleCanvas_MERGED.html` — **current prototype.** Manuscript blocks
  (narrator/dialogue, pre-split by beat) and author-placed cognition nodes (Lore/Character/
  Transcript/Reference) live on one pannable/zoomable canvas, wired with the animated
  `wire-glow`/`wire-flow` edge pattern carried over from the Drilldown mockup. No mode toggle —
  replaces the two archived prototypes below. Inspector panel (Recompute Scope, Evidence
  Influence, Trace/Why) now targets whatever's selected on the canvas, and every node carries a
  structural Parameter/Attribute/Channel data split (design intent, not a locked schema).
  *(Aug 18: connector wires rebuilt to side-aware routing — each wire attaches on the side of a
  node that faces the other node, with one spread port slot per connection, so lines no longer
  share a single anchor point.)*
- `phase3_planning/Phase3_SingleCanvas_DevPlan_and_Build.md` — the dev plan that specified the
  merged prototype (segmentation rule, grouping pattern, non-goals), with a status header recording
  what actually shipped vs. what stayed open.
- `phase3_planning/Phase3_FictionEngine-to-Composer_Boundary_and_Bidirectional_Contract.md` — the
  Fiction Engine → Composer handoff shape, plus the Composer's reverse path (narrative → structured
  proposal, grounded against existing Eclipse nodes via an `action_type` enum so extraction never
  defaults to creating duplicate nodes), and a proposed Recompute Scope mechanism. Planning-level
  only, **paused** pending Rain finishing the Composer's graph-functionality planning — see
  `START_HERE.md` for status.
- `archive/Narrative_Composer_Whiteboard_Prototype_SUPERSEDED.html` — earlier prototype: the
  manuscript as one draggable page object next to separate floating nodes. Canvas/drag mechanics
  were cannibalized into the current prototype above.
- `archive/Narrative_Composer_UX_Mockup_SUPERSEDED.html` — earlier prototype: a Compose/Graph/Split
  mode-switcher over the same document. The inspector-panel concepts were cannibalized into the
  current prototype above; the mode toggle itself was dropped by design.

### 04_Fiction_Engine/
- `Fiction_Behavior_Engine_v3_5_SIMPLE_EPISODE_JSON.html` — **the actual live/running app *(status 2026-08-21: recorded as an **early test of the idea** — no further fixes/extension per the authority map; stage contracts remain porting material)***, not just a mockup. Primary artifact referenced by the DEV_NOTES below. Ground truth for the Fiction Engine's real current schema.
- `Fiction_Behavior_Engine_v3.5_DEV_NOTES.md` — the primary handoff doc:
  purpose, character/state model, episode evidence library, provider
  architecture, multi-character interaction, branching, the 15-stage
  pipeline, debugging protocol, and the session handoff prompt.
- `Fiction_Behavior_Engine_Image_Visual_Evidence.md` — image/keyframe
  evidence design (behavior frames, visual evidence object schema).
- `Fiction_Behavior_Engine_Audio_Behavior_Input.md` — vocal/prosody evidence
  design (text vs. vocal behavior, audio evidence object schema).
- `Fiction_Engine_Architecture_Map.html`
- `Image_Conditioned_Narrative_Influence_Research.html`
- `Audio_Conditioned_Text_Generation_Research.html` — music/audio as a
  conditioning signal rather than transcription source.
- `reference/Fiction_Behavior_Engine_v3.5_Live_App_Screenshot.pdf` — full-page
  screenshot of the actual running v3.1/v3.5 HTML app (Engine, Cast &
  Transformation States, Data Library, Evidence & Behavioral Memory,
  Generated Fiction, Log/Audit/Project JSON panels) — kept as ground-truth
  reference for what's actually implemented vs. what's still a design doc.

## Open cross-app questions (status updated 2026-08-21)

*Note: "Convergence Node" as a standalone node type is retired — folded into
Relationship Node's branching-variant structure. See `START_HERE.md` §2 if
architecture docs below still reference it as separate.*

- ~~Where does JP/EN comparison happen~~ — **resolved 2026-08-19** (Mining scope §9, DataType Mapping §4): parallel tracks stay separate in Mining; comparison happens in an Eclipse Relationship Node via shared `moment_key`.
- ~~Is the HTML's accepted schema in sync with Eclipse's node model~~ — **retired**: the apps are separate by design (Phase 1 decision); sync is a non-goal.
- ~~v0.3 scope: manual capture only~~ — **resolved 2026-08-19** (Mining scope §7/§9): manual capture + automated processing over captured media.
- **Still genuinely open:** the Eclipse → Fiction Engine boundary doc (see `Project_Gap_Scan_2026-08-21.md` Priority Zero #2); the capture_entry / gold-clip / behavior-master format reconciliation; provenance tiers into the data schemas.

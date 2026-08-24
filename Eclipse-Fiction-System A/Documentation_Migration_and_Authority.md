# Documentation Migration and Authority Map

**Updated:** 2026-08-19
**Purpose:** explain which documentation is current, which material is historical,
and which questions are intentionally parked. This is a documentation-cleanup
record, not a software specification and not an implementation plan.

**Guiding concept — Pseudo-cognition:** convert media-derived observable behavior, social responses, context, and relationships into editable nodes that can support fictional simulation and, conceptually, narrative decomposition and recomposition.

## 1. Authority order

When documents disagree, use this order:

1. Explicit user decisions recorded in `START_HERE.md`.
2. Current worked examples and diagrams supplied by the author, marked as early
   drafts when they are visual exploration.
3. Current app-specific scope and handoff documents.
4. Research and prior-art documents.
5. Superseded mockups and historical notes.

Research, examples, and proposals can suggest architecture, but they do not become
decisions merely because they contain a JSON example or a confident sentence.

## 2. Current project decisions

| Area | Current position |
|---|---|
| Mining workflow | The human manually captures/selects material; the Mining App automatically processes those captures into structured JSON. |
| Mining capture unit | The modern `capture_entry` format in `Mining_App_Project_Scope.md` §7 and `Phase3_Gap_Resolutions.md` §4 is canonical for planning. Older worker/manual examples are historical illustrations. |
| Same-video parallel tracks | JP, EN, audio, image, and other tracks remain separate entries when they need independent processing. `moment_key` groups the same time window without merging it. |
| JP/EN comparison | Mining preserves parallel track entries; Eclipse performs the comparison through a Relationship Node using the shared `moment_key`. |
| Vocal archetype | Raw delivery observations belong in Mining capture entries. A resolved reusable voice/archetype belongs in an Eclipse Level 3 Speech and Behavior node. |
| Convergence Node | Retired as a standalone type. Its useful behavior is a branching variant or interaction mode inside a Relationship Node. |
| Derived characters | No clone/lineage architecture is currently locked. A derived character may simply be authored as a new character; any number may be created. `extends`, `clone_of`, and dominance inheritance remain uncommitted options. |
| Sari configurations | Level 0 configured Group Nodes can show variants such as Princess Sari Crazy Girl and Princess Sari Crazy Girl Rush Dog, each with a Level 1 internal network. |
| Canon | The system does not decide canon. The author prepares source transcripts and captures; the apps process, organize, compare, and transform that material. Provenance means traceability, not a canon gate. |
| Contradiction authority | No contradiction-resolution rule is currently decided. The earlier “human decides at use time” proposal was retracted and remains parked. |
| Composer recomputation/reverse path | Parked until detailed function sketches define the app behavior. No DAG, acceptance-loop, opinion-stack, or reverse-write implementation should be inferred from the research proposal. |
| System architecture class | `Eclipse_System_Architecture_CANON.md` (2026-08-21) is the authoritative statement: deterministic, rule-driven procedural system with an AI layer for functions — no training/fine-tuning anywhere. AI touches the pipeline at exactly two bounded points: the interpretation boundary (media→text, Mining App) and the prose boundary (hooks→scene text, Fiction Engine). Text is the canonical format; no pixels/audio flow downstream. |
| Storage | JSON files are source of truth and interchange format; SQLite as a disposable index layer when volume demands; dedicated graph databases explicitly deferred (KùzuDB discontinued 2025). Every dataset carries `schema_version`; one migration script per version. See `Eclipse_System_Architecture_CANON.md` §6. |
| Failure-mode framing | The deterministic core cannot hallucinate. Its characteristic risk is rule collision (confident wrong behavior when two valid rules fire against each other), guarded by the Relationship Node rules/biases/priorities/overrides precedence hierarchy. The only place hallucination can enter the canon is the interpretation boundary, which is why the human curation gate sits there. |
| AI-use classification | Two generative touchpoints (interpretation: media→text; prose: hooks→scene text) plus bounded AI sub-services whose output is structured data that deterministic code validates/rejects ("the LLM proposes, the graph disposes"). Any AI use must fit this classification. Older docs' broader LLM claims (e.g., Mining scope §8 "LLM-powered relationship engine", v3.5 DEV_NOTES four LLM roles) are superseded by this canon classification. |
| Role-addressed behavior transfer | `Role_Addressed_Behavior_Transfer.md` (2026-08-21) is the adopted design for cross-character/cross-world transfer: behavior rules are owned by the character, addressed to roles (partner-type + relation axes) with slot-affinity weights; the literal mined pass is always the floor and archetype addressing only routes. It unifies the transplant discussion's beats-with-slots, the Cancer Farts archetype pass, the Mallory↔Queen Alice analogies, and the engine core's `generic_archetypes` join. |
| Two-layer substrate (2026-08-21) | The data model has two layers with opposite properties: **transcripts** (effectively infinite; limited only by recording ability; the evidence/literal-floor layer) and the **Archetype Registry** (finite but large; ~30-40+ core classes per culture+era with dual/mixed archetypes; the addressing/routing layer — see Role doc §10). Registry entries carry culture+era coordinates; cross-cultural analogues (dumb blonde ≈ gyaru) are typed-edge mappings with affinity weights, not identities. Japanese dere taxonomy is the existence proof and the seed source. The registry lives in Eclipse (app 02) as curated data. |
| Capture vs. proposal authorship | Reconciled (2026-08-21): both models are true at different layers and neither replaces the other. **Media layer** — the human captures/selects source material; the Mining App automatically processes captures into structured JSON (authority map's original row). **Edge/role layer** — the LLM/mining pass *proposes* typed edges, role tags, and registry mappings; the human approves at the curation gate / Eclipse authoring surface. Humans own what enters the canon; automation drafts what they approve. |
| Agent runtime architecture (HIGH PRIORITY, 2026-08-22) | `Agent_Runtime_Architecture.md` is the decision: the primary runtime is an **agent session operating the hub directly** (ZCode/Codex/GLM; `AGENTS.md` at hub root is the interface contract), replacing 'standalone app + distant API calls' as the default. Core rationale (Rain): the probability side and deterministic side work co-located - the LLM reads captures, runs the engine, observes output, fixes in place - instead of guessing whether distant API calls got the job done. Three-driver model: agent (primary, flat sub) / HTML interfaces (visual console over the same JSON) / API (unattended-only, dormant not dead). Canon continuity preserved (deterministic core, two touchpoints, human gate); 'LLM proposes, graph disposes' becomes mechanically enforceable. The open LLM-deterministic interface question gains its answer's shape: the interface is filesystem + CLI + AGENTS.md protocols. |
| Known open holes | `Project_Gap_Scan_2026-08-21.md` records the full gap scan: the Eclipse→Fiction Engine boundary doc does not exist; three unreconciled engine/fragment-format version lines (fiction_engine.py v0.2 / Behavior Engine v3.5 / schema-2.1 core; capture_entry vs gold-clip vs behavior-master); provenance tiers and schema_version not yet in any data format; fact-ledger and Muse ownership ~~undecided~~ **resolved 2026-08-21** (rows below); the working testbed is ~~not wired into navigation~~ **surfaced since 2026-08-21** (README 01 section, START_HERE, INDEX twin-note). Still open: Eclipse→FE boundary doc (waits on Rain's sketches), fragment-format reconciliation incl. schema_version/provenance fields, role-vocabulary import, evaluation spec. Fix order is in that doc. |
| Fact-ledger ownership (resolved 2026-08-21, delegated by Rain) | The **Fiction Engine computes** per-story state (its schema-2.1 `canon_ledger` is the implementation — renamed conceptually the *story-state ledger*, per-story, not global canon); the **Narrative Composer displays and annotates** the timeline and holds human overrides. The testbed's "any invention becomes binding canon" rule is **demoted**: inventions are flagged proposals; promotion to anything reused across stories requires human approval (consistent with "the system does not decide canon"). |
| Muse ownership (resolved 2026-08-21, delegated by Rain) | Muse is **not a fifth app**. It is a bounded AI sub-service (canon §2 class: lint-flagged-sentence rewrites, diffable) whose configuration/authoring surface is the **Eclipse Writing Node** (`02_Visual_Narrative_Authoring_App/phase3_planning/Eclipse_Writing_Node_Spec_v0.1.md`). Runtime in the engine's prose path; ruleset authored in the Writing Node. |
| Engine lineage (recorded 2026-08-21, delegated by Rain; amended same day) | v3.5 HTML = **early test of the idea** — record as such, invest nothing further (see v3.5 no-fix row); schema-2.1 testbed = running core; `04_Fiction_Engine/code/fiction_engine_v0.2.py` (copied into package 2026-08-21) = canon-conformant deterministic binding layer. Full rebuild expected once the LLM-deterministic interface is understood (see open question row); no artifacts deleted. |
| v3.5 HTML engine disposition (Rain, 2026-08-21) | **No fixes, no extension.** The Class-1 reliability fixes (output validation, dead mode switch, unbounded stuffing, self-graded audit) are deliberately NOT applied: tokens not to be spent on a rig that will be rebuilt from scratch once pseudo-cognition design is understood. The HTML stands as an early test that already demonstrated the core claim (engine-driven beats raw LLM on the Rainee/Stewie test). Its stage contracts and hard-rules prompts remain porting material. |
| LLM-deterministic interface (open, 2026-08-21) | How the LLM and the deterministic rules actually *talk to each other* is still being worked out. Goal: genuine emergent behavior and generated fiction, **useless unless transcripts are the basis controlling the behavior** ("making Jillian feel like Jillian"). No locked spec yet, **but the first architecture sketch now exists: `Deterministic_LLM_Interface_Flow.md` (2026-08-22)** — the scaffold-then-fill loop (load scaffold → state slice → role routing → hook selection → single LLM prose call → boundary validation with fed-back failure reasons → validated ledger deltas → Muse lint → telemetry → human gate), grounded in Stanford Generative Agents (scaffold/memory/retrieval/reflection), drama-manager theory (Riedl & Bulitko), and Façade/Versu/Prom Week. Proposal status until Rain's sketches. |
| Mini cognition node (project vocabulary, Rain 2026-08-21) | Slang for the atomic codex unit: **a transcript + basic memory + co-relationships to classes of archetypes and behavior** (e.g., Dumb Blonde class + Jillian transcripts). Unifies Layer-1 (transcript evidence), Layer-2 (archetype registry addressing), and the memory/witness fields of the field notes. See Role doc §11. |
| Archetype Registry (2026-08-21) | `Archetype_Registry_and_Source_Material.md` is the Layer-2 seed catalog: master indexes (TVTropes, Wikipedia stock characters), per-culture registries with culture+era coordinates (US, JP dere taxonomy, CN internet-slang incl. 绿茶婊 family + the §3.3a XHS style-tag lexicon, IN Bollywood, BR novela), multi-language labels (EN/JA/ZH/PT/HI), slang/era register layers, and the self-learning registry (unmatched-cluster → candidate-class proposals → human gate — a bounded AI sub-service). Combination law: archetype class × unique transcript = unique variation. Import order in its §6. Xiaohongshu policy: manual/small-sample tag survey selected by Rain, no bulk scraping. **Scope note (Rain, 2026-08-21): the project is architecture-planning only for now — the only data supplied is small tests/demonstrations; bulk registry import from TVTropes/Wikipedia/dere wikis is a later build step, not current work.** |
| Eclipse→Fiction Engine boundary (2026-08-21) | Rain will produce **heavily documented, detailed sketches of what relationships do** before the boundary doc is attempted — the boundary must explain relationship behavior, and that specification has to come from Rain's sketch process (brainstorm → hand-drawn nodes → real decisions). Boundary-doc work waits on the sketches; this is the agreed order, not a stall. |

## 3. Identifier policy for planning

IDs use a stable namespace plus an immutable local identifier:

```text
<namespace>:<kind>:<local-id>
```

Recommended namespaces:

```text
mining:<kind>:<id>
eclipse:<kind>:<id>
fiction:<kind>:<id>
composer:<kind>:<id>
asset:<kind>:<id>
```

When an object crosses an app boundary, its original ID remains the source ID in
`provenance` or `evidence_links`; the receiving app may create its own new ID. It
must not silently reuse the source ID for a different object. A boundary envelope
should therefore distinguish:

```json
{
  "id": "eclipse:evidence:001",
  "origin_app": "mining_app",
  "provenance": { "source_ids": ["mining:capture:001"] },
  "evidence_links": ["mining:capture:001"]
}
```

This is a planning convention, not a claim that every current prototype already
implements namespaced IDs.

## 4. Same-timecode identity policy

`identity_hash` is for deduplicating equivalent captures, not for grouping every
observation that happens at the same time. The planning key is:

```text
identity_hash = hash(source_media_id | track_id | timecode_window |
                     subject_id | fragment_kind)
moment_key    = source_media_id | timecode_window
```

Consequences:

- JP and EN lines from the same video share a `moment_key` but have different
  `track_id` values and therefore remain separate.
- Two speakers at the same time remain separate when `subject_id` differs.
- Repeated copies of the same capture on the same track can deduplicate.
- An image, lyric, vocal note, or reaction observation can remain separate when
  `fragment_kind` says it needs independent processing.

## 5. Status labels

Every planning document should identify itself as one of:

```text
decision | current scope | worked example | research | proposal | superseded
```

The Sari/Cheryl images are **early drafts**, not final sketches or UI specifications.

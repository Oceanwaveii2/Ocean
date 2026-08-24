# Eclipse System Architecture — Canon
**Status:** decision (per `Documentation_Migration_and_Authority.md` §5 status labels)
**Date:** 2026-08-21
**Purpose:** the single authoritative statement of *what kind of system Eclipse is*, so that no doc, session, or collaborator misdescribes it again. When anything else in the package disagrees with this document, this document wins for architecture class, AI-touchpoint scope, and storage policy; `Documentation_Migration_and_Authority.md` remains the resolver for everything else.

---

## 1. What Eclipse Is (and Is Not)

**Eclipse is a deterministic, rule-driven procedural system with a thin AI layer for specific functions.**

- It is **NOT** a generative AI model.
- It involves **no training, no fine-tuning, no LoRA, no inference over learned weights** for its core logic.
- The app logic is closer to **The Sims' authored-behavior AI** or a **Vue-style procedural graph** than to a generative model.
- Characters are not "trained in" — e.g., Rick and Morty is not being modeled; **the show's observable behavior is forced into predetermined, hard-coded JSON rules**, and those rules are executed.

**Core principle — anti-hallucination by default.** The deterministic pathway is the system: forcing generation through predetermined rules means the system cannot invent facts, because its core has no mechanism to invent with. The data is hard-coded relationships; the procedures are explicit code.

**Deployment scope (Rain, 2026-08-21):** Eclipse is a **private authoring-time system, not a game runtime.** No LLM can feasibly run in a shipped game today — local inference at useful quality needs server-class hardware (DeepSeek-class models ≈ 96 GB VRAM), and per-player API calls at millions-of-players scale are only absorbable by a big company. Consequence of the architecture: the **deterministic core is runtime-portable** (rules, ledgers, coverage selection, slot-affinity routing are cheap CPU work — the class of computation games actually ship), while the **two LLM touchpoints are authoring-time services** paid per generation, not per player-frame. If game deployment were ever wanted, the path is bake-at-dev-time: run the pipeline offline, ship the outputs. **Primary embodiment (2026-08-22, see `Agent_Runtime_Architecture.md` — HIGH PRIORITY):** the authoring-time system's default runtime is an **agent session operating the hub directly** (AGENTS.md interface); API calls are the unattended-only alternate driver, HTML apps the visual console. For private use, the cost control is selective regeneration — determinism means you only pay the API for what changed, and prose results cache by hook-bundle.

## 2. The Two Generative Touchpoints (where unbounded AI text is produced)

There are exactly two boundaries where the LLM produces *generation* (open-ended text that enters the system):

```
┌────────────────────────────────────────────────────────────────────┐
│                    DETERMINISTIC CORE (no AI)                       │
│                                                                    │
│  JSON datasets ──► typed-edge graph ──► rule evaluation            │
│  (hard-coded)        (hard-coded)        (hard-coded procedures)    │
│                                                                    │
│   • coverage tiers / hook selection      • protected contracts     │
│   • fact ledger / timeline state         • validation checks       │
│   • relationship variant rules           • graph metrics           │
│   • role-addressed rule routing          • precedence resolution   │
└──────▲─────────────────────────────────────────────────▲───────────┘
       │                                                 │
   [TOUCHPOINT 1]                                   [TOUCHPOINT 2]
   INTERPRETATION BOUNDARY                          PROSE BOUNDARY
   media (video/audio/image) ──AI──► text capture   selected hooks ──AI──► scene prose
   the ONLY door into the canon                    output re-checked against
                                                    contracts; never writes back
```

**Touchpoint 1 — Interpretation boundary (media → text).** Vision/audio models are used once, here, with direction and filtering (per-channel checklists, character-bias knobs, register overrides). Text is the canonical format: nothing downstream ever sees pixels or waveforms again. Because this is the only door into the canon graph, it is the only place hallucination can *enter* — a false claim wearing a V-tier badge would then be propagated faithfully by deterministic code. The curation gate (human review of interpreted captures) therefore sits exactly here, and nowhere else needs one.

**Touchpoint 2 — Prose boundary (hooks → scene text).** The LLM renders selected behavioral hooks into fiction. It never edits the graph, never updates the ledger, and its output is checked against the protected contract. If it drifts, the drift is confined to one scene's prose and is re-generatable; it cannot corrupt data.

**Bounded AI sub-services (not touchpoints).** Besides the two generative boundaries, the pipeline may call the LLM as a *bounded service*: a call whose output is structured data that deterministic code validates, accepts, rejects, or queues — never free text that enters the canon or state directly. Permitted classes: ledger-check violation lists (LLM proposes structured deltas; the ledger validates), Muse-style lint rewrites (only flagged sentences, diffable), rule-drafting suggestions for human approval, LLM-as-judge scoring, and test-case generation for rule-collision checking. The rule for all of them: **the LLM proposes, the graph disposes.** Any future AI use must be classifiable under this rule or it violates the canon.

**Everything else is code.** The knowledge graph, coverage tiers, trait projection, timeline ledger, relationship variant rules, role-addressed rule routing (see `Role_Addressed_Behavior_Transfer.md`), cognition-web metrics — predetermined procedures over predetermined data. A deterministic system's characteristic failure is not hallucination but **confident wrong behavior from rule collision** (two valid rules firing against each other) — guarded by precedence policies inside Relationship Node rules (see §5).

## 3. Data Flow Across the Four Apps

Data flows **Mining (01) → Eclipse (02) → Fiction Engine (04) → Narrative Composer (03)** — note the flow order differs from folder numbering; text is canonical at every boundary. Listed here in flow order:

1. **Mining App (01)** — human selects material; app processes captures into structured text/JSON (multi-pass: dialogue, literature, archetype; provenance tiers V/C/R/D; non-diegetic overlay filter). Touchpoint 1 lives here.
2. **Visual Narrative Authoring App / Eclipse (02)** — node-graph editor relating mined datasets: Character Brain / Group / Character / Relationship nodes with branching variants, rules/biases/priorities/overrides. This is where edges are authored and where the Cognition Web Analysis reads graph metrics (centrality = character core; orphans = weakly grounded; hubs = caricature warning). Role-slot fields and slot-affinity weights are authored here (`Role_Addressed_Behavior_Transfer.md`).
3. **Fiction Engine (04)** — binds characters to story scaffolds (function-tagged beats), selects hooks by coverage tier (mined → inferred → projected), routes rules by role address, tracks state. Touchpoint 2 lives here.
4. **Narrative Composer App (03)** — per-story whiteboard + JSON Timeline: deterministic fact ledger (location, body state, who-knows-what) updated per scene via bounded ledger-check services; LLM checks run per scene against the ledger slice, never over the whole corpus; plot holes are listed as ledger violations.

## 4. Known Problems → Where They Are Fixed (summary register)

| Problem | Where it's handled | Mechanism |
|---|---|---|
| Hallucinated capture entering canon | Touchpoint 1 | Provenance tiers + human curation gate at interpretation; source media kept for re-interpretation |
| Rule collision / confident wrong behavior | Deterministic core | Precedence policy in Relationship Node rules/biases/priorities/overrides hierarchy |
| Sparse characters | Fiction Engine v0.2 | Overmining (provenance=inferred) + trait projection into scene registers (provenance=projected) |
| Plot holes growing with data volume | Narrative Composer | Fact ledger + per-scene checks (incremental, never whole-corpus) |
| Robotic output register | Prose wrap (Muse) | Lexical tells + structural rhythm fixes, genre anchors |
| Schema drift | Storage policy (§6) | Version field on every dataset + one migration script per version |
| Selection quality at Stewie-scale | Fiction Engine | Compiled bundles (3 hooks/scene); embedding upgrade path when bag-of-words plateaus |
| Fidelity measurement | Evaluation practice | Vertical slices: cook datasets → generate → blind rate (mix in characters you didn't author) |

Legal/publishing: explicitly out of scope — private writing engine.

## 5. Rule Governance (deterministic-core safeguards)

These are the deterministic analogues of "safety," all already present in the planning docs:

- **Rules/biases/priorities/overrides hierarchy** (Eclipse Relationship Nodes) is the precedence policy that prevents rule collision.
- **Role-addressed routing** (`Role_Addressed_Behavior_Transfer.md`): behavior rules are owned by the character and addressed to roles (partner-type and relation axes, with slot-affinity weights). Archetype addressing routes rules; it never replaces the literal mined floor. Graded affinity keeps transfer deterministic and tunable.
- **Interaction modes** (blend / override / conditional switch) govern how two datasets combine — a rule-governed choice, not a model judgment.
- **Protected contracts + validation** (Fiction Engine) are ordinary assertions: identity preserved, plot skeleton preserved, provenance present, no silent characters.
- **Provenance discipline** (`mined | inferred | projected`, V/C/R/D evidence tiers) means every fact carries its origin, so any bad datum is traceable and removable.

## 6. Storage Decision — Is JSON the Best Answer?

**Decision: JSON files remain the source of truth and interchange format for now; SQLite becomes the query/index layer when volume demands it; a dedicated graph database is explicitly deferred.** Research findings (2026-08-21) and rationale:

**Why JSON files are right today:**
- The system's data is *authored* — hand-curated, reviewed, edited. Files under version control (git) treat datasets as code: reviewable diffs, blame, branch experiments. A database hides exactly the provenance discipline the system depends on.
- Portability across the four apps (the Adobe-apps rule: data passes app boundaries with meaning intact) is trivial with files; every app already speaks it.
- At current scale (tens of characters, hundreds of fragments), in-memory graph operations via plain Python are instant. Graph metrics (centrality, orphans) run fine over loaded JSON (e.g., `networkx` on the side, no DB required).

**The research landscape for "better than JSON":**
- **KùzuDB** — the leading embedded graph DB ("the SQLite of graphs") — **was discontinued/archived in late 2025** ([HN announcement](https://news.ycombinator.com/item?id=45560036), [embedded-graph landscape analysis](https://gdotv.com/blog/kuzu-legacy-embedded-graph-database-landscape/), [Reddit discussion](https://www.reddit.com/r/semanticweb/comments/1sk362y/graph_databases_still_dont_have_a_good_embedded/)). The embedded-graph niche it served has no clear successor.
- **Neo4j / ArcadeDB** are server-based (or JVM) — operationally wrong for a private single-user Windows Python app; overkill until recursive multi-hop queries over tens of thousands of edges are a real workload ([ArcadeDB migration guide](https://arcadedb.com/blog/from-kuzudb-to-arcadedb-migration-guide/)).
- **DuckDB with recursive CTEs** turns out to be competitive with graph DBs for many graph queries ([HN discussion](https://news.ycombinator.com/item?id=45560036)) — a strong analytical option if cognition-web metrics outgrow in-memory Python.

**The upgrade path (in order, each triggered by a real symptom):**
1. **Now:** JSON files + `schema_version` on every dataset + a small Python migration script per version. `identity_hash`/`moment_key`/namespaced IDs per the authority map.
2. **Symptom: load times / cross-file queries get slow** → add **SQLite** as a build artifact (auto-indexed from the JSON, JSON1 + FTS5): the JSON stays source of truth, SQLite is disposable cache. This solves selection-at-scale without changing authoring.
3. **Symptom: multi-hop relationship queries dominate** (deep ancestry/recursion across relationship variants) → evaluate DuckDB (embedded, analytical) before any server graph DB. A true graph DB only if a maintained embedded one re-emerges.

**What NOT to adopt now:** server databases of any kind, graph DBs, vector DBs (embeddings, when needed, live as plain files alongside their fragments).

## 7. Documentation Consequences

- Documents describing Eclipse as "multimodal data" systems should be read as: *media interpreted into text at Touchpoint 1*. `Eclipse_App_Goal_Breakdown_and_Research.md` §1 carries the corrected statement.
- Nothing in this package proposes training/fine-tuning. Any future doc that does is a research note, not architecture, and contradicts this canon.
- Engine lineage note (recorded 2026-08-21, with the v0.2 code copied into `04_Fiction_Engine/code/fiction_engine_v0.2.py` so the package is self-contained): three engine lines exist with distinct roles — **Fiction Behavior Engine v3.5 HTML** (`04_Fiction_Engine/`, design ground truth; note its title/filename/heading disagree v3.5/v3.5.1/v3.1 — treat as v3.5), **schema-2.1 engine core testbed** (`01_Mining_App/Sample and Test from Miniing Apps/`, the currently-running implementation), and **`fiction_engine.py` v0.2** (canon-conformant deterministic binding layer: data-driven character registry, coverage tiers, provenance discipline, LLM only at the prose boundary). Reconciliation direction: the v0.2 concepts are the architecture's binding layer; the 2.1 testbed is the running core; the v3.5 HTML remains design reference. Full merge is an open task (see `Project_Gap_Scan_2026-08-21.md`).
- Older docs predating this canon (v3.5 DEV_NOTES, Audio/Image evidence notes, Mining scope §8) describe LLM uses that this canon reclassifies: interpretation steps belong to Touchpoint 1 regardless of which app performs them, and any "LLM decides what relates to what" claim is superseded — the graph is deterministic; the LLM may only *propose* edges for human approval.

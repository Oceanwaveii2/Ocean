# Project Gap Scan — 2026-08-21
**Status:** current scope (scan record)
**Method:** full read of all 30 .md files in the hub, JSON artifacts inspected, HTML titles skimmed, cross-references verified. Performed immediately after the architecture canon, role-addressing design, and goal/research docs were added.
**Note:** fixes marked ✅ were applied the same day. Items marked ⬜ remain open.

---

## Priority Zero — the five things that most endanger the project

1. **Two-touchpoint rule was internally contradicted** — the canon said "exactly two AI touchpoints" but also described per-scene ledger LLM checks and a Muse pass; several older docs (v3.5 DEV_NOTES §2/§8, Mining scope §8, Fiction_Engine_Guide §3/§7) describe LLM uses outside the two boundaries. **✅ Fixed in canon §2:** two *generative* touchpoints + a "bounded AI sub-services" class (LLM proposes, graph disposes); older docs' broader LLM claims explicitly superseded in canon §7 and the authority map.
2. **No Eclipse → Fiction Engine boundary doc exists** — the one boundary the founding thesis (character-to-character scene loop) was assigned to. Acknowledged as open since Aug 16 in README, START_HERE, Gap Analysis §1, Gap Resolutions §1b. The scene loop is designed on paper and homeless. **◐ Update (2026-08-21, Rain's call):** boundary-doc work deliberately **waits on Rain's heavily-documented relationship-behavior sketches** — the boundary must explain what relationships *do*, and that specification comes from the sketch process (authority map row added). This is the agreed order, not a stall; the Versu/Prom Week verification pass (§3.4) remains a recommended pre-step when sketching starts.
3. **Three unreconciled Fiction Engine version lines**: ~~`fiction_engine.py` v0.2 (in Downloads, not the package)~~ **✅ copied into `04_Fiction_Engine/code/` 2026-08-21; lineage roles recorded in CANON §7 and the authority map**, Fiction Behavior Engine v3.5/v3.5.1/v3.1 (HTML title/heading/filename disagree), and the schema-2.1 engine core testbed in `01_Mining_App/Sample and Test from Miniing Apps/` (undocumented at top level). **◐ Reconciled 2026-08-22:** canon §7 records the lineage; `Agent_Runtime_Architecture.md` §5 sets the going-forward execution model (**v0.2 CLI + agent operator**); the full engine-core rebuild for the generation layer remains expected once the LLM-deterministic interface work matures. No artifacts deleted.
4. **Three competing mining fragment formats**: `capture_entry` (declared canonical in Mining scope §7), the gold-clip dossier format (Goal Breakdown §8 build order), and the behavior-master objects the working testbed actually runs on — with **no spec for the capture→master compilation**. **⬜ OPEN — needs one schema doc reconciling them.**
5. **The canon's provenance vocabulary exists in no data format.** V/C/R/D tiers and `mined|inferred|projected` appear in zero schemas: `capture_entry` has no field for them, behavior masters have none, `episode_anchor` has none; `capture_entry` also lacks `schema_version` (canon §6 mandates it). **⬜ OPEN — the anti-hallucination mechanism is unimplemented at the schema level.**

## 1. Contradictions / stale claims

- **App numbering:** canon originally numbered Engine=3, Composer=4, contradicting every other doc and the folder names. **✅ Fixed (canon §3: Composer=03, Engine=04).**
- **README "open questions" list:** three entries already resolved/retired elsewhere (JP/EN comparison, schema sync, v0.3 scope). **✅ Trimmed 2026-08-21** (struck through with resolutions).
- **START_HERE title said "Phase 2 complete — August 16"** while body tracked Phase 3. **✅ Fixed.**
- **`source_class` enum self-contradiction:** Mining scope §7's example used `"mainline"`, which is not in its own enum (`direct | structural | archetypal | analogical | social_clip | paratext | derived`). **✅ Fixed (example now uses `direct`).**
- **Capture-vs-proposal authorship model:** canon/Goal Breakdown say "mining proposes, human approves" edges; authority map/Mining scope say human captures, app processes. **✅ Reconciled in authority map (2026-08-21):** both true at different layers — media layer (human captures, app processes) vs. edge/role layer (LLM proposes, human approves at the gate).
- **Fact-ledger ownership:** canon places it in the Composer; the working engine core implements `canon_ledger` + continuity audit inside the Fiction Engine, including "any invention becomes binding canon" — which also collides with the authority map's "the system does not decide canon." **✅ Resolved same day (authority map, delegated):** Engine computes story-state, Composer displays/overrides; invention-promotion demoted to propose-until-human-approves.
- **Muse ownership split:** Goal Breakdown makes Muse a layer; the Eclipse Writing Node spec v0.1 puts the anti-AI pass in an Eclipse node. **✅ Resolved same day (authority map, delegated):** Muse = bounded sub-service; Writing Node is its authoring surface.
- **Engine guide table says schema v2.0** while the JSON and INDEX say v2.1 (24 tests passing). **✅ Fixed 2026-08-21.**
- **Two `mining evaluation project` folders existed** (correct vs original misspelling). **✅ Fixed — merged into the established `minning evaluation project/`; README links repaired (they also pointed outside the package).**

## 2. Missing components (needed, no doc defines)

- **Eclipse → Fiction Engine boundary doc** (see Priority Zero #2) — including the scene-loop/`generate()` per-beat model and whether each beat-call counts as a Touchpoint 2 invocation (currently unstated).
- **Story/scaffold format spec** — called "the single most important design decision" in the transplant doc, but three incompatible candidates exist (`episode_anchor`, `Fiction_story.json` skeleton, slot-based beats) with no reconciliation. The role-vocabulary list (Role doc §8) is part of this.
- **Evaluation/benchmark spec** — fidelity protocol, blind-rating procedure, cast-swap test measurables, mining-quality metrics. The BBL eval library covers extraction scope only. **Baseline + goal recorded (Rain, 2026-08-21):** the Fiction Behavior Engine v3.5 + OpenAI API test (Rainee-as-Stewie "Ultra Luxury diaper girl") works *repeatedly* — writing more nuanced, character reacts with distinct personality, no drift into dumbassery — but is **not yet at the Family Guy register**, on a half-complete dataset (~4 episodes of Stewie; Jillian scenes even weaker). The evaluation goal is therefore **improvement-per-data-added**, not proof-of-work: a fixed test scaffold, re-run on each dataset version, rated on (1) nuance, (2) distinct personality, (3) no collapse/dumbassery-drift, (4) register closeness to source show — so "how much closer did this mining pass get us" becomes a comparable number. The current test *is* data point 1 of that series. Scope note: project is architecture-planning only; only small test/demo data exists by design.
- **`capture_entry` completion** — `schema_version`, provenance-tier fields, sanitize-exemption/register-override fields, `negative_observation` payload, `reaction_pair.shape` vocabulary, `motifs[]` vocabulary, multi-pass channel outputs (SFX onset charts etc.), and the capture→behavior-master compilation spec.
- **JSON Timeline / fact ledger spec** — named in README and Goal Breakdown; no Composer doc mentions it.
- **Touchpoint 2 prompt/format** — nothing specifies the prose-generation prompt, protected-contract check, or output format (DEV_NOTES has one leakage sentence).
- **Touchpoint 1 checklists** — the per-channel extraction checklists and character-bias knob prompts exist as prose goals only; the Qwen two-pass reference in the testbed is unreferenced by planning docs.
- **Namespaced-ID migration** — authority map §3 defines the convention; no artifact uses it; the FE→Composer boundary doc invents `fictionengine:` (not in the namespace list); no migration plan or status inventory.
- **Mining processing-side design** — §7 makes the app an automated multi-pass processor; no doc designs the processing.
- **Composer graph-functionality planning doc** — the document multiple items are parked waiting on; does not exist.
- **Cognition Web metric definitions** (thresholds), **Muse/anti-tell ruleset**, **schema migration scripts**, **beat-alignment stage owner**, **curation-gate workflow/UX** — all named, none specified.

## 3. Parked items now blocking

1. **Composer reverse-path/recompute pause** — parked pending the Composer planning doc (which doesn't exist); now also blocks cycle-prevention, proposal oscillation handling, and contradiction handling; the meanwhile-adopted paratext-override class has override semantics that were never spec'd (load-bearing parked item).
2. **Illustrator sketches** — gate for the unified node schema function catalog, Writing Node, single-vs-dual output; tension: the Aug-21 canon and Goal Breakdown already make schema-level decisions while the draft schema says "wait for sketches."
3. **Versu / Prom Week verification pass** — marked prerequisite "before the boundary doc is written"; still unrun.
4. **Mining v0.3 smoke test** (3–5 screenshot/lyric pairs) — no record it was run, yet §7 promotes the format to canonical.
5. **Scope doc §9 open question** (Akane ↔ engine interface) — substantially answered by the transplant doc + working testbed; never linked/closed.

## 4. Hygiene

- **✅ Fixed today:** README mining-eval links (were resolving outside the package); duplicate eval folders merged; START_HERE title; canon internal contradictions; HUB_README front door now indexes the Aug 20–21 docs (the Hub HTML itself remains stale — regenerating it is ⬜ optional); Mining scope §1 trailing-`%20` link repaired and verified; `source_class` example corrected; capture-vs-proposal authorship reconciled in the authority map; two-layer substrate (infinite transcripts / finite Archetype Registry) added to the Role doc §10 with culture/era coordinates.
- **◐ Remaining (status 2026-08-22):** scope-doc depth/Bethjamin/Nori-Noir/Convergence-banner items **✅ fixed 2026-08-21**; still open: `Eclipse_Visual_Authoring_Session_Notes.md` cited by START_HERE (missing); scope doc listed in README at the wrong depth (actually at `01_Mining_App/Sample and Test from Miniing Apps/03_API_Mining/`); `Eclipse_Architecture_and_Schema.html` still contains retired "Convergence" language (Phase 2 assigned its update, never done); Bethjamin Button mockup absent from README's 03 section; "Nori/Noir" naming inconsistency in the engine guide.
- **◐ External-to-package assets:** `fiction_engine.py` v0.2 **✅ copied in (2026-08-21)**. Still external: Cancer Farts PDF/HTML (gold-anchor dataset) and the Akane .docx — mark external in citing docs or copy in, Rain's call.

## 5. Suggested fix order (cheapest unblock first)

1. ✅ Canon patches + hygiene (done 2026-08-21).
2. Authority-map one-paragraphers: capture-vs-proposal reconciliation, fact-ledger ownership decision, engine version-line decision. (Needs Rain — these are decisions, not edits.)
3. Write the **Eclipse → Fiction Engine boundary doc** with the scene loop as headline (unblocks the most parked items).
4. One **fragment-format schema doc** reconciling capture_entry / gold-clip / behavior-master, adding `schema_version` + provenance tiers + register-override fields, and specifying capture→master compilation.
5. Define the **shared role vocabulary** (Role doc §8) and the **story scaffold format** together — one address space.
6. **Evaluation spec** (cast-swap + fidelity + mining-quality metrics).

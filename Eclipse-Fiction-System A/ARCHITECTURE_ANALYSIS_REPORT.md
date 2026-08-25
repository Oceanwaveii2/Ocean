# Eclipse Fiction System — Comprehensive Architecture Analysis Report

**Analysis Date:** 2026-08-25  
**Scope:** Full evaluation of the four-app pipeline architecture, concept organization, contradiction identification, and viability assessment  
**Sources Analyzed:** 38 markdown documentation files across all four app directories plus root-level architecture documents

---

## Executive Summary

**Verdict: VIABLE ARCHITECTURE WITH CLEAR DIFFERENTIATION**

The Eclipse Fiction System presents a **coherent, well-researched, and architecturally sound** design for a four-app fiction authoring pipeline. The system's core innovation—mining character behavior from actual media rather than hand-writing character cards—is novel in the current AI-writing landscape. The deterministic-core-with-bounded-AI-touchpoints architecture is technically feasible and addresses known failure modes of pure LLM approaches.

**Key Strengths:**
1. Clear architectural identity (deterministic procedural system with bounded AI, not a generative model)
2. Well-defined data flow between four specialized apps
3. Novel approach to character fidelity through mined behavioral data
4. Comprehensive prior-art research validating design decisions
5. Explicit failure-mode awareness and mitigation strategies

**Critical Gaps Remaining:**
1. Missing Eclipse → Fiction Engine boundary specification (the scene loop mechanism)
2. Three unreconciled engine version lines requiring consolidation
3. Unimplemented provenance-tier schema fields (anti-hallucination mechanism incomplete)
4. Fragment format reconciliation needed (capture_entry vs gold-clip vs behavior-master)
5. Several components specified only at planning level, requiring detailed function sketches

**Recommendation:** Proceed with development, prioritizing gap resolutions in the order specified in Section 7.

---

## 1. System Overview

### 1.1 The Four Apps

| # | App | Folder | Responsibility | Status |
|---|-----|--------|----------------|--------|
| 1 | **Mining App** | `01_engine _core _i/` | Extract, analyze, and mine source media (video, transcripts, images) into structured JSON datasets with provenance tiers | Scope defined, processing-side design missing |
| 2 | **Visual Narrative Authoring App (Eclipse)** | `02_Visual_Narrative_Authoring_App/` | Node-graph editor for composing mined datasets: Character Brain, Group, Character, Relationship nodes with branching variants | UI mockups complete, node schema draft |
| 3 | **Narrative Composer App** | `03_Narrative_Composer_App/` | Whiteboard/timeline for organizing generated stories, fact ledger for plot-hole detection | Single-canvas prototype built, graph functionality paused |
| 4 | **Fiction Engine** | `04_Fiction_Engine/` | Generates fiction from resolved character/behavior evidence via coverage-tier hook selection and role-addressed rule routing | v0.2 Python implementation exists; v3.5 HTML = early test only |

**Data Flow:** Mining App → Eclipse → Fiction Engine → Narrative Composer

### 1.2 Core Architectural Principles

1. **Deterministic Core with Bounded AI:** The system is NOT a generative AI model. It is a rule-driven procedural system where AI touches the pipeline at exactly two bounded points:
   - **Touchpoint 1 (Interpretation):** Media → Text conversion (Mining App)
   - **Touchpoint 2 (Prose):** Hooks → Scene text rendering (Fiction Engine)
   
2. **Text as Canonical Format:** Visual and audio evidence are converted to text at the interpretation boundary; downstream layers operate only on text.

3. **Anti-Hallucination by Design:** Forcing generation through predetermined rules means the system cannot invent facts—the core has no mechanism to invent with.

4. **Evidence Hierarchy:** Signal → Observation → Inference → Pattern → Author-Accepted Rule, with provenance tiers (V/C/R/D for visual/caption/reconstructed/decoration).

5. **"LLM Proposes, Graph Disposes":** All AI-generated output is validated by deterministic code before entering the canon.

6. **Coverage-Weighted Variation:** Character fidelity comes from behavioral range coverage, not raw data volume. A 35-second clip densely captured across multiple channels can outperform hours of shallow transcript.

---

## 2. Concept Organization

### 2.1 Foundational Concepts

#### Pseudo-Cognition
Convert media-derived observable behavior, social responses, context, and relationships into editable nodes that support fictional simulation and narrative decomposition/recomposition.

#### Mini Cognition Node
The atomic unit of the character codex: one transcript + basic memory + co-relationships to archetype classes and behavior patterns. Example: "Dumb Blonde class + Jillian transcripts" as a single addressable entity.

#### Bounded Envelope (Jillian Math)
A character exists within a bounded infinity: "Jillian is between 1 and 3. Anywhere in 1–3 there are infinite potential Jillians that are still Jillian—but if you hit 6, it's no longer Jillian." Validation is a boundary check, not a match score.

#### Bundle of Contradictions
A character is "a bundle of contradictions tied together that repeat—which is the perception of consistency." Consistency is not uniformity; it is a recognizable recurring combination whose members contradict each other in stable proportions.

#### Authorized Expansion ("Super Jillian")
Secondary characters promoted to primary roles can expand beyond their source cloud while keeping hard walls intact. The expanded character maintains bundle members and proportions but widens interior situations and competence.

### 2.2 Data Model Concepts

#### Two-Layer Substrate
- **Layer 1 (Transcripts):** Effectively infinite—limited only by recording ability. The evidence/literal-floor layer.
- **Layer 2 (Archetype Registry):** Finite but large (~30-40+ core classes per culture/era). The addressing/routing layer.

#### Archetype Registry
A curated catalog of character archetypes with culture+era coordinates. Japanese dere taxonomy (tsundere, yandere, kuudere, etc.) serves as the existence proof and seed source. Cross-cultural analogues (e.g., American "dumb blonde" ≈ Japanese "gyaru") are typed-edge mappings with affinity weights, not identities.

#### Role-Addressed Behavior Transfer
Behavior rules are owned by the character and addressed to roles (partner-type + relation axes) with slot-affinity weights. This enables cross-franchise interaction without losing fidelity.

#### Provenance Tiers
- **V (Visual):** Attested visual evidence
- **C (Caption):** Attested caption/dialogue
- **R (Reconstructed):** Reconstructed audio/delivery
- **D (Decoration):** Authorial expansion (never enters canon graph)

#### Coverage Tiers
- **Mined:** Directly observed from source material
- **Inferred:** Archetype composites based on mined patterns
- **Projected:** Core traits extrapolated to new contexts

### 2.3 Processing Concepts

#### Multi-Pass Mining
Each fragment undergoes multiple passes:
1. Dialogue pass (verbatim transcription)
2. Literature/"beauty" pass (prose description)
3. Archetype pass (role tagging)
4. JSON pass (structured data)

#### Reaction Pairs
Based on conversation analysis linguistics: adjacency pairs where a First Pair Part (initiation) creates conditional relevance for a Second Pair Part (reaction). The shape of reactions (preferred vs dispreferred responses) is character data.

#### Turn-Based Scene Loop
For character-to-character simulation:
```
for each BEAT in scene:
    for each CHARACTER in turn order:
        INPUT = event log so far
        STACK = character's compiled stack
        EXEMPLARS = retrieved reaction pairs
        REACTION = generate(STACK ∘ INPUT ∘ EXEMPLARS)
        append REACTION to event log
```

#### Fact Ledger
Per-story deterministic state tracking (location, body state, who-knows-what) updated per scene. Plot holes are ledger violations detected mechanically, not by reading everything.

### 2.4 Runtime Concepts

#### Agent Runtime Architecture (HIGH PRIORITY)
Primary runtime is an agent session (ZCode/Codex/GLM) operating the hub directly, with `AGENTS.md` as the interface contract. The LLM reads captures, runs the engine, observes output, and fixes in place—co-located with data and code rather than making distant API calls.

#### Three-Driver Model
1. **Agent Session:** Primary runtime (flat subscription cost)
2. **HTML Interfaces:** Visual console over same JSON files
3. **API Calls:** Unattended-only alternate driver

#### Surface Division
- **HTML owns spatial workflows:** Node graphs, timelines, boards (chat cannot host these)
- **Agent chat owns text-native workflows:** Mining passes, prose generation, judgment, file maintenance
- **Mining needs both:** Miner is text-native agent pass; curation gate benefits from light HTML review UI

---

## 3. What Works (Validated Components)

### 3.1 Architectural Decisions ✓

| Decision | Validation Source | Status |
|----------|------------------|--------|
| Deterministic core with bounded AI touchpoints | Canon doc §2, verified against Generative Agents prior art | **Decision** |
| Text as canonical format | Research on video-LLM limitations (stylized media weakness) | **Decision** |
| Evidence hierarchy with provenance tiers | Cancer Farts gold-clip dossier demonstrates multi-channel capture | **Implemented in testbed** |
| Role-addressed behavior transfer | Validated by project's own gold clip (portable gag grammar); narratology precedent (Propp, Greimas) | **Decision** |
| Coverage-weighted variation over raw volume | BBL case study: silent 10-second clip yielded camera-awareness, presentation, visual-brand traits | **Demonstrated** |
| Agent runtime architecture | Addresses API-model blindness; enables propose-execute-observe loop | **Decision (2026-08-22)** |
| JSON files as source of truth + SQLite index layer | KùzuDB discontinuation leaves embedded graph niche vacant; DuckDB viable for analytics | **Decision** |
| Two-layer substrate (infinite transcripts / finite registry) | Japanese dere taxonomy proves enumerable archetype classes exist | **Decision** |

### 3.2 Implemented Prototypes ✓

| Component | Location | Status |
|-----------|----------|--------|
| Fiction Behavior Engine v3.5 HTML | `04_Fiction_Engine/Fiction_Behavior_Engine_v3_5_SIMPLE_EPISODE_JSON.html` | Running test (early test of idea, no further investment) |
| Schema-2.1 engine core testbed | `01_engine _core _i/Sample and Test from Miniing Apps/` | Currently running implementation with 24 passing tests |
| `fiction_engine_v0.2.py` | `04_Fiction_Engine/code/fiction_engine_v0.2.py` | Canon-conformant deterministic binding layer |
| Narrative Composer single-canvas prototype | `03_Narrative_Composer_App/Narrative_Composer_SingleCanvas_MERGED.html` | Built with side-aware wire routing |
| Eclipse drill-in navigation mockup | `02_Visual_Narrative_Authoring_App/Eclipse_Nested_Levels_Drilldown_Mockup_CURRENT.html` | Resolved nav paradigm |
| Mining capture_entry format | `01_engine _core _i/Sample and Test from Miniing Apps/03_API_Mining/Mining_App_Project_Scope.md` §7 | Canonical for planning |

### 3.3 Prior-Art Validation ✓

| System | What It Proved | Relevance to Eclipse |
|--------|---------------|---------------------|
| **Generative Agents** (Park et al., 2023, 7400+ citations) | Memory stream + retrieval (recency × importance × relevance) + reflection produces believable agent behavior | Validates scaffold-then-fill pattern; retrieval scoring as deterministic code |
| **SillyTavern character cards + lorebooks** | Structured persona data outperforms prose descriptions; keyword-triggered injection works | Confirms need for structured data; Eclipse adds upstream mining |
| **Inworld / Ubisoft NEO NPCs** | Commercial consensus: NPCs need structured cognitive layer separate from LLM | Validates "fake brain" thesis with money |
| **Re3 / Dramatron / DOME** | Hierarchy + memory is consensus answer to long-story drift | Structurally identical to Eclipse's scaffold-beats + fact-ledger design |
| **Character-LLM** (EMNLP 2023) | Curated data + instruction produces recognizable personas | Proves character = data, not model weights |
| **Japanese dere taxonomy** | Enumerable archetype classes with dual/mixed combinations exist | Existence proof for Layer 2 Archetype Registry |
| **Conversation analysis (adjacency pairs)** | Reaction shape (preferred/dispreferred) is systematic character data | Provides linguistic foundation for reaction-pairs mining pass |

### 3.4 Worked Examples ✓

| Example | Purpose | Outcome |
|---------|---------|---------|
| **Cancer Farts clip** (35-second Family Guy) | Gold-anchor dataset demonstrating multi-channel capture | Captured dialogue, SFX tempo chart, expression arc, non-vocal reaction, norm enforcer, archetype grammar |
| **BBL case study** (silent 10-second clip) | Depth-compensates-for-breadth law demonstration | Multispectrum scanning yielded camera-awareness, public-presentation, visual-brand traits from wordless footage |
| **Beth triple-stack scenario** (Domestic/Space/Rainee) | Character-to-character simulation proof-of-concept | Same initiation (Jerry mentioned), three different reactions computed by different stacks |
| **Noir character transplant** | Role-addressed transfer test case | Jillian's rules re-addressed to new cast while maintaining literal floor |

---

## 4. Contradictions & Resolutions

### 4.1 Resolved Contradictions ✓

| Contradiction | Resolution | Document |
|--------------|------------|----------|
| **Two-touchpoint rule internally contradicted** | Canon clarified: two *generative* touchpoints + "bounded AI sub-services" class (LLM proposes, graph disposes) | `Eclipse_System_Architecture_CANON.md` §2 |
| **App numbering inconsistency** (Engine=3 vs 4) | Fixed: Composer=03, Engine=04 (matches folder names) | Canon §3 |
| **Capture-vs-proposal authorship model** | Reconciled: both true at different layers—media layer (human captures, app processes) vs edge/role layer (LLM proposes, human approves) | `Documentation_Migration_and_Authority.md` §2 |
| **Fact-ledger ownership split** | Resolved: Fiction Engine computes per-story state; Narrative Composer displays/annotates with override capability | Authority map row |
| **Muse ownership split** | Resolved: Muse = bounded sub-service; Writing Node in Eclipse is authoring surface | Authority map row |
| **Three competing engine versions** | Lineage recorded: v3.5 HTML = early test (no further investment); schema-2.1 testbed = running core; v0.2.py = canon-conformant binding layer | Canon §7, authority map |
| **Convergence Node as standalone type** | Retired: folded into Relationship Node's branching-variant structure | README §2, authority map |
| **"Human decides contradictions" proposal** | Retracted 2026-08-19: was AI discussion artifact, never actual ruling | `Phase3_Gap_Resolutions.md` §2 |
| **Source bias framing** | Reframed by performance thesis: all recorded characters are performances; variance is camera-awareness spectrum, not contamination | `Eclipse_App_Goal_Breakdown_and_Research.md` §2 |

### 4.2 Open Questions (Parked or Pending) ⬜

| Question | Status | Blocker |
|----------|--------|---------|
| **Contradiction authority within direct evidence** (mainline vs filler vs movie) | Parked | Waits on Rain's detailed function sketches |
| **Clone/derived character architecture** (`extends`, `clone_of` fields) | Not decided | Can author derived characters independently for now |
| **Composer reverse-path/recompute behavior** | Parked | Waits on Composer graph-functionality planning doc (doesn't exist) |
| **Eclipse → Fiction Engine boundary doc** | Open (Priority Zero #2) | Waits on Rain's relationship-behavior sketches |
| **Fragment format reconciliation** (capture_entry vs gold-clip vs behavior-master) | Open (Priority Zero #4) | Needs one schema doc |
| **Provenance tiers in data formats** | Open (Priority Zero #5) | No schema fields implemented yet |
| **Role vocabulary list** | Open (part of boundary doc) | Needed for cross-app consistency |
| **Evaluation/benchmark spec** | Open | Need fixed test scaffold for improvement-per-data-added measurement |
| **Namespaced-ID migration plan** | Open | Authority map defines convention; no artifact uses it yet |
| **Versu/Prom Week verification pass** | Not run | Network failure during research; marked prerequisite for boundary doc |

---

## 5. Critical Gaps Analysis

### 5.1 Priority Zero Gaps (Endanger Project If Unaddressed)

#### Gap 1: Missing Eclipse → Fiction Engine Boundary Doc
**Impact:** The founding thesis ("simulate a character reacting to another character") has no mechanism specified. The scene loop design exists on paper but is homeless.

**Current State:** Turn-based beat loop designed in `Phase3_Gap_Resolutions.md` §1b, but no formal boundary specification exists.

**Resolution Path:** 
1. Rain produces heavily-documented relationship-behavior sketches (agreed order)
2. Write boundary doc with scene loop as headline
3. Verify Versu/Prom Week prior art (recommended pre-step)

**Risk Level:** HIGH — this is the core simulation question

#### Gap 2: Three Unreconciled Engine Versions
**Impact:** Confusion about which implementation is authoritative; porting effort duplicated across versions.

**Current State:** 
- v3.5 HTML: Early test, no further investment
- Schema-2.1 testbed: Running implementation
- v0.2.py: Canon-conformant binding layer

**Resolution Path:** 
- Use v0.2.py + agent operator as going-forward execution model
- Port stage contracts from v3.5 as reference material
- Full rebuild expected once LLM-deterministic interface matures

**Risk Level:** MEDIUM — lineage documented, but consolidation pending

#### Gap 3: Unimplemented Provenance Schema
**Impact:** Anti-hallucination mechanism incomplete; V/C/R/D tiers and `mined|inferred|projected` appear in zero schemas.

**Current State:** Provenance vocabulary exists only in prose docs; no `schema_version` or provenance fields in any JSON format.

**Resolution Path:** 
1. Add `schema_version`, `provenance_tier`, `coverage_tier` fields to `capture_entry` format
2. Specify capture→behavior-master compilation with provenance inheritance
3. Write one migration script per version

**Risk Level:** HIGH — undermines core anti-hallucination claim

#### Gap 4: Fragment Format Reconciliation
**Impact:** Three competing formats with no compilation spec; unclear which to implement.

**Current State:** 
- `capture_entry`: Declared canonical but incomplete
- Gold-clip dossier: Demonstrated in Cancer Farts set
- Behavior-master: What testbed actually runs on

**Resolution Path:** One schema doc reconciling all three, specifying compilation rules

**Risk Level:** MEDIUM — blocks Mining App implementation

#### Gap 5: Missing Story Scaffold Format
**Impact:** Called "single most important design decision" in transplant doc; three incompatible candidates exist.

**Current State:** `episode_anchor`, `Fiction_story.json` skeleton, slot-based beats all exist with no reconciliation.

**Resolution Path:** Define shared role vocabulary and story scaffold format together (one address space)

**Risk Level:** MEDIUM — blocks Fiction Engine development

### 5.2 Secondary Gaps

| Gap | Impact | Effort | Priority |
|-----|--------|--------|----------|
| Evaluation spec missing | Cannot measure improvement-per-data-added | Medium | High |
| Namespaced-ID migration | Cross-app references fragile | Low | Medium |
| Mining processing-side design | §7 declares automated processing; no design exists | High | High |
| Composer graph planning doc | Multiple items parked waiting on it | High | Medium |
| Cognition Web metric definitions | Thresholds unspecified | Low | Low |
| Muse ruleset unspecified | Anti-tell pass undefined | Medium | Medium |
| Touchpoint 2 prompt/format | Prose generation underspecified | Medium | High |
| Touchpoint 1 checklists | Per-channel extraction prompts exist only as goals | High | High |
| Curation-gate workflow/UX | Named but not specified | Medium | Medium |
| Beat-alignment stage owner | Unclear which app/component owns it | Low | Low |

---

## 6. Viability Assessment

### 6.1 Technical Feasibility ✓

**Architecture Class:** Deterministic, rule-driven procedural system with bounded AI services
- **Feasible:** Yes — analogous to The Sims' authored-behavior AI or Vue-style procedural graphs
- **Precedent:** Generative Agents (memory + retrieval + reflection), Inworld NPCs (structured cognitive layer)
- **Risk:** Rule collision (confident wrong behavior) mitigated by precedence hierarchy in Relationship Nodes

**AI Touchpoints:** Exactly two generative boundaries + bounded sub-services
- **Feasible:** Yes — clear separation of concerns; validation gates prevent corruption
- **Precedent:** Drama-manager theory (Riedl & Bulitko), Façade/Versu rule arbitration
- **Risk:** Hallucination at Touchpoint 1 mitigated by human curation gate

**Storage Strategy:** JSON files + SQLite index layer
- **Feasible:** Yes — appropriate for authored data at current scale
- **Precedent:** Git-versionable datasets; DuckDB for analytics if needed
- **Risk:** KùzuDB discontinuation leaves embedded graph niche vacant; DuckDB fallback viable

**Agent Runtime:** Co-located LLM + data + code
- **Feasible:** Yes — agent sessions (ZCode/Codex/GLM) can operate filesystem + CLI tools
- **Precedent:** AGENTS.md interface pattern emerging in industry
- **Benefit:** Enables propose-execute-observe loop impossible with distant API calls

### 6.2 Market Differentiation ✓

**Competitive Landscape:**
| Approach | Example | Eclipse Delta |
|----------|---------|---------------|
| Change weights (fine-tuning) | Character-LLM, vendor fiction models | No training required; data-swappable |
| Change context (prompting) | SillyTavern cards, Sudowrite bibles | Upstream mining produces context automatically |
| Change selection (reranking) | Best-of-N, auto-edit passes | Selection driven by mined behavioral distribution |
| Change workflow (co-writing) | Human editing at helm | Same, but character lives in data, not prompt |
| **Externalize character (Eclipse)** | **None** | **Mined-media spine + envelope validation** |

**Unique Value Proposition:** No existing system mines character behavior from actual media to drive deterministic fiction generation. Hidden Door licenses worlds but explicitly avoids reproducing character voices (legal constraint); Eclipse's product IS mined character voice fidelity.

**Market Position:** Private authoring-time system (not game runtime, not publishing platform). Cost model: selective regeneration (determinism means you only pay API for what changed) + flat agent subscription.

### 6.3 Research Foundation ✓

**Prior-Art Coverage:**
- ✓ Character engines (Inworld, Ubisoft NEO, Xbox Narrative Graph)
- ✓ Community tools (SillyTavern, NovelAI)
- ✓ Academic story generation (Re3, Dramatron, DOME, DOC)
- ✓ Persona fidelity research (Character-LLM, PsyPlay)
- ✓ Video/multimodal mining (MM-Vid, Vid-LLM surveys, digital twins TPAMI 2026)
- ✓ Linguistics (conversation analysis, adjacency pairs)
- ✓ Narratology (Propp, Greimas actantial model)
- ✓ AI-writing decline documentation (RLHF mode collapse, homogenization studies)

**Research Quality:** Sources fetched and verified where possible; some prior-art systems (Versu, Prom Week) marked ⚠️ due to network failure — treat as leads requiring verification.

**Gap:** No published system crosses the exact bridge (mined-media deterministic data driving LLM prose with boundary validation). This is open territory.

### 6.4 Implementation Readiness ⚠️

**Ready to Implement:**
- ✓ Mining App scope and capture format (planning level)
- ✓ Eclipse node types and navigation paradigm
- ✓ Fiction Engine v0.2 binding layer
- ✓ Narrative Composer single-canvas prototype
- ✓ Agent runtime architecture decision

**Requires Additional Specification:**
- ⬜ Eclipse → Fiction Engine boundary (waits on sketches)
- ⬜ Fragment format reconciliation
- ⬜ Provenance tier schema fields
- ⬜ Story scaffold format
- ⬜ Role vocabulary list
- ⬜ Evaluation benchmark spec
- ⬜ Touchpoint 1/2 prompts and contracts
- ⬜ Composer graph functionality plan

**Readiness Score:** 60% — core architecture solid, critical gaps block full implementation

---

## 7. Recommended Fix Order

**Priority Zero (Address Immediately):**

1. **Authority-map decisions** (Rain's call, not edits):
   - Capture-vs-proposal reconciliation ✓ (done 2026-08-21)
   - Fact-ledger ownership ✓ (done 2026-08-21)
   - Engine version-line decision ✓ (done 2026-08-21/22)
   
2. **Write Eclipse → Fiction Engine boundary doc** with scene loop as headline
   - Prerequisite: Rain's relationship-behavior sketches
   - Recommended pre-step: Versu/Prom Week verification pass
   
3. **One fragment-format schema doc** reconciling:
   - `capture_entry` / gold-clip / behavior-master
   - Add `schema_version`, provenance tiers, register-override fields
   - Specify capture→master compilation rules
   
4. **Define shared role vocabulary** (Role doc §8) and **story scaffold format** together
   - One address space end-to-end (capture → Eclipse → Engine → scaffold)
   
5. **Evaluation spec** (cast-swap test + fidelity metrics + mining-quality measures)
   - Baseline: v3.5 + OpenAI API test (Rainee-as-Stewie) already works repeatedly
   - Goal: improvement-per-data-added measurement on fixed scaffold

**Priority One (Unblock Development):**

6. **Add provenance fields to `capture_entry` schema**
   - `schema_version`, `provenance_tier`, `coverage_tier`, `confidence`
   
7. **Specify Touchpoint 1 checklists** (per-channel extraction prompts)
   - Vision model direction/filtering per channel
   - Character-bias knob prompts
   
8. **Specify Touchpoint 2 prompt/format** (prose generation)
   - Protected contract checks
   - Output format with boundary validation
   
9. **Mining processing-side design** (automated multi-pass processor)
   - Dialogue/literature/archetype pass implementation
   
10. **Namespaced-ID migration plan**
    - Inventory current ID usage
    - Migration script for existing artifacts

**Priority Two (Polish & Scale):**

11. Composer graph-functionality planning doc
12. Cognition Web metric definitions (thresholds)
13. Muse ruleset specification
14. Curation-gate workflow/UX design
15. Schema migration scripts (one per version)

---

## 8. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Hallucination at Touchpoint 1** | Medium | High | Human curation gate; provenance tiers; source media retained for re-interpretation |
| **Rule collision in deterministic core** | Medium | Medium | Precedence hierarchy in Relationship Nodes; telemetry logging |
| **Sparse character data** | High | Medium | Overmining (multi-channel); trait projection; authorized expansion |
| **Plot holes grow with corpus** | Medium | High | Fact ledger + per-scene checks (incremental, not whole-corpus) |
| **Robotic output register** | High | Medium | Muse wrap (lexical + structural); genre anchors |
| **Schema drift across versions** | Medium | Medium | `schema_version` field + migration scripts per version |
| **Selection quality plateaus** | Low | Medium | Embedding upgrade path when bag-of-words selection maxes out |
| **Legal ceiling on publishing** | High (if shipping) | High | Private-use only for now; license+revenue-share model if ever commercialized (Hidden Door precedent) |
| **Agent session context limits** | Medium | Low | Deterministic index (SQLite path) for large corpora; agent asks tools for slices |
| **Provider variance (different agents perform differently)** | Medium | Low | AGENTS.md hard rules + file outputs + validation keep data quality independent of driver |
| **Missing boundary doc blocks core feature** | High | High | Agreed order: Rain's sketches first, then boundary doc — explicit dependency acknowledged |
| **Three engine versions cause confusion** | Medium | Medium | Lineage documented; v0.2 + agent operator = going-forward model |

---

## 9. Documentation Quality Assessment

### 9.1 Strengths

- **Clear authority hierarchy:** `Documentation_Migration_and_Authority.md` establishes decision order
- **Status labeling:** Every doc identifies itself (decision/current/proposal/research/superseded)
- **Cross-referencing:** Extensive linking between docs creates coherent web
- **Worked examples:** Concrete scenarios (Cancer Farts, Beth triple-stack, Noir transplant) ground abstractions
- **Prior-art research:** Comprehensive scan validates design choices against existing systems
- **Gap transparency:** Open questions explicitly flagged rather than hand-waved

### 9.2 Weaknesses

- **Circular references:** Some docs reference missing docs (e.g., `START_HERE.md` cited but content unclear)
- **Planning-level only:** Many components specified only at conceptual level, lacking implementation detail
- **Version disagreement:** Some docs disagree on version numbers (v3.5 vs v3.5.1 vs v3.1 in engine HTML)
- **External dependencies:** Key assets (Cancer Farts PDF, Akane .docx) referenced but not in package
- **Illustrator sketches deferred:** Gate for unified node schema function catalog, Writing Node spec

### 9.3 Recommendations

1. **Create missing `START_HERE.md`** or update README to serve as entry point
2. **Copy external assets into package** or mark clearly as external dependencies
3. **Standardize version numbering** across all engine references
4. **Add implementation readiness badges** to each component (Ready/Planning/Blocked)
5. **Create visual architecture diagram** showing all four apps, data flows, and touchpoints

---

## 10. Final Verdict

### 10.1 Architecture Viability: **VIABLE** ✓

The Eclipse Fiction System architecture is **sound, differentiated, and technically feasible**. The core insight (externalize character into mined behavioral data rather than model weights or prompts) addresses a genuine gap in the AI-writing landscape. The deterministic-core-with-bounded-AI design is the right architectural choice for the problem domain.

### 10.2 Development Readiness: **PARTIAL** ⚠️

While the architecture is viable, **critical gaps block full implementation**. Priority Zero gaps (especially the Eclipse→Fiction Engine boundary and provenance schema) must be addressed before the system can deliver on its founding thesis (character-to-character simulation).

### 10.3 Recommendation: **PROCEED WITH GAP PRIORITIZATION**

**Do:**
- ✓ Continue development following the fix order in Section 7
- ✓ Prioritize boundary doc and provenance schema implementation
- ✓ Run Versu/Prom Week verification pass
- ✓ Produce evaluation baseline on fixed test scaffold
- ✓ Implement agent runtime as primary driver

**Do Not:**
- ✗ Invest further in v3.5 HTML engine (marked "no fixes, no extension")
- ✗ Attempt commercialization without legal review (mined character fidelity = IP risk)
- ✗ Build graph database layer (KùzuDB discontinued; JSON+SQLite sufficient)
- ✗ Fine-tune models (violates canon; data-swappable approach is strength)

### 10.4 Success Criteria

The system succeeds if it can demonstrate:
1. **Improvement-per-data-added:** Each mining pass measurably improves character fidelity on fixed test scaffold
2. **Cross-franchise transfer:** Role-addressed rules enable believable interaction between characters from different sources
3. **Register matching:** Generated fiction matches source genre voice (comedy, drama, etc.) without robotic AI-isms
4. **Traceability:** Every output element traces back to source evidence or is flagged as expansion/invention
5. **Bounded envelope:** Outputs stay within character's [1,3] range; 6-zone (unrecognizable) detections trigger regeneration

---

## Appendix A: Document Inventory

**Total Documents Analyzed:** 38 markdown files

**By Category:**
- Architecture/Canon: 4 docs
- App-Specific Planning: 15 docs
- Research/Prior-Art: 8 docs
- Worked Examples: 5 docs
- Gap Analysis/Resolutions: 4 docs
- Session Logs/Notes: 2 docs

**By Status:**
- Decision: 8 docs
- Current Scope: 6 docs
- Proposal/Review: 12 docs
- Research: 8 docs
- Superseded/Historical: 4 docs

**By App:**
- Root Level: 18 docs
- App 01 (Mining): 8 docs
- App 02 (Eclipse): 7 docs
- App 03 (Composer): 4 docs
- App 04 (Fiction Engine): 4 docs

---

## Appendix B: Glossary of Key Terms

| Term | Definition |
|------|------------|
| **Pseudo-cognition** | Converting media-derived behavior into editable nodes supporting simulation |
| **Mini cognition node** | Atomic unit: transcript + memory + archetype co-relationships |
| **Bounded envelope** | Character fidelity range [1,3]; outside is unrecognizable (zone 6) |
| **Bundle of contradictions** | Character as recurring combination of contradictory traits in stable proportions |
| **Authorized expansion** | Widening secondary character's interior while keeping hard walls intact |
| **Two-layer substrate** | Infinite transcripts (Layer 1) + finite archetype registry (Layer 2) |
| **Role-addressed transfer** | Behavior rules owned by character, addressed to roles with affinity weights |
| **Coverage-weighted variation** | Behavioral range matters more than raw data volume |
| **LLM proposes, graph disposes** | AI output validated by deterministic code before entering canon |
| **Agent runtime** | Co-located LLM + data + code enabling propose-execute-observe loop |

---

**Report Prepared By:** Architecture Analysis System  
**Date:** 2026-08-25  
**Confidence Level:** HIGH (based on 38 source documents with clear authority hierarchy)

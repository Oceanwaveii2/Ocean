# Eclipse Fiction System — Research Package (v2)

Purpose: consolidates the original feasibility discussion, the research roadmap, supporting literature, and a reassessment driven by the mining/node-engine/Composer split and planned Codex runtime. Supersedes v1.

---

## 1. Feasibility Assessment (current)

| Target | Likelihood | Why |
|---|---|---|
| A useful private authoring/mining workflow | **78–88%** | Core direction is coherent: curated text captures, deterministic JSON/rules, human review, agent operating directly on files. Parts already work as demos. Supplementary literature (DOC/Re³, EIPE-text, KG-storytelling user study) confirms structured-extraction-plus-human-review is a proven pattern elsewhere, not a novel bet. |
| Character-faithful fictional scenes that improve as curated data is added | **68–80%** | Demonstrated baseline plus a sensible improvement loop. The prior open question — "how would we even know coverage is enough" — now has borrowable answers (PersonaGym, CharacterBench, PICon) instead of requiring a from-scratch evaluation methodology. PCL gives direct evidence the mechanism class (structured, self-questioning generation) produces measurable consistency gains. |
| The full editable pseudo-cognition system (media → relationship graph → simulation → narrative editing) | **55–70%** | Revised upward from the original 40–60% band. See §5 — the mining → node-engine → Composer split formally decouples deterministic relationship/scenario assembly from narrative generation, which removes most of the surface area the "100-turn persona drift" research describes. Remaining uncertainty concentrates almost entirely in Composer-side prose generation and whether the ledger-check step reliably catches drift *within* a single pass — a smaller, more testable problem than system-wide coherence. |
| A broadly reliable "simulate any character in any situation" system | **20–35%** | Unchanged. Bottleneck here is the observer-dependence of fiction, not a research-coverage gap — nothing in the new material or architecture touches this. |

**Scoping decision on target 4 (unchanged):** not treated as a failure condition. Fiction is interpreted through an observer's culture, taste, attention, and social setting — Eclipse should model a chosen, traceable *authorial reading*, not claim to recover an objective total person.

**Core positive (unchanged):** the architecture doesn't rely on "train a model and hope." It supports iterative, falsifiable progress — improve a capture → compile into rules → regenerate a fixed test scene → judge whether behavior became more specific and less generic.

**Main risk (unchanged):** over-building architecture before establishing a repeatable vertical slice. The proof point to prioritize: one character, a handful of high-density curated clips, compiled into the behavior model, run against a fixed scaffold repeatedly, measuring whether each pass produces more recognizable reactions.

---

## 2. Research Roadmap — Story Logic & Game AI

Priority order: **#1, #2, #3 first** — they determine what to capture, how to encode it, and how to test whether mining improved output. The rest becomes valuable once those basics are stable.

### 2.1 Evaluation design for character fidelity (highest leverage)
Fixed "vertical-slice" test: same story beat, same character dataset, new dataset version each run. Score on recognizability, behavioral specificity, relationship response, continuity, and source-register fit. This is how you prove mining helps, not an optional nicety.

### 2.2 Behavioral observation / social interaction coding
Conversation analysis, nonverbal behavior coding, embarrassment/face-work, status behavior, turn-taking, repair, concealment, gaze, reaction timing — vocabulary for turning small actions into structured observations instead of generic traits. E.g.: trigger → bodily reaction → attempted concealment → witness response → status consequence → repeated pattern.

### 2.3 Game-AI decision logic: utility systems, behavior trees, GOAP
Hybrid, not one system for everything:
- Behavior trees for reliable local routines and state changes.
- Utility scoring for competing impulses (hide embarrassment, preserve status, seek comfort, retaliate, flirt, withdraw).
- GOAP/planning only when a character pursues a longer goal through actions.

### 2.4 Relationship and theory-of-mind simulation
Characters act on what they believe, want, fear, and think others believe — not merely shared facts. This is what makes relationships *generate* scenes rather than decorate character sheets.

### 2.5 Narrative planning and drama management
Keep a story editable while characters retain agency — distinguish character logic ("what would this person do?"), story constraint ("what still needs to happen?"), and author intervention ("change this node, explore consequences").

### 2.6 Memory and retrieval, adapted to a deterministic model
The transferable idea from agent-memory research is the retrieval question, not autonomy: given a scene, which past relationships/incidents/hooks should matter right now. Keep selection logic deterministic; use the LLM only at defined touchpoints.

### 2.7 Narrative reversal / story decomposition
Event extraction, coreference, causal links, character-state tracking, relationship change, timeline reconstruction — supports story → editable nodes → changed state → recomposed story.

---

## 3. Research Roadmap — LLM Control Layer

Research control systems *around* the model, not training. The LLM interprets media into text and renders selected hooks into prose; deterministic code and human review decide what survives.

### 3.1 Structured extraction with schemas
Model returns a proposed `capture_entry`, reaction pair, or relationship-edge candidate — never freeform notes. Validator checks required fields, provenance, IDs, timecodes.

### 3.2 Context engineering and retrieval
Feed a compact scene packet, never "the whole character": current beat + story-state, relevant character invariants, active relationship rules, 3–8 selected source hooks, required register, prohibited drift, output contract.

### 3.3 Character consistency and controllability evaluation
Test set of situations designed to pull characters apart: embarrassment, status threat, attraction, shame, public/private difference, conflict with a specific person, repeated mundane irritation.

### 3.4 LLM-as-judge, calibrated against human judgment
Use the model to flag contract violations (missing hook use, ledger contradiction, generic dialogue, wrong register) — never as final arbiter of fidelity.

### 3.5 Multi-pass prose generation
Staged flow: select evidence → beat-level intent → draft scene → deterministic ledger check → style/Muse pass → final human review. This staged, re-anchoring structure is also the main defense against within-pass drift (see §5).

### 3.6 Model comparison by task, not "one best model"
Different models for mining vs. prose vs. evaluation. **Note (Codex runtime):** running inside Codex on a subscription rather than raw API means this is initially simulated via different prompts/roles against one model rather than literal multi-provider routing — not a blocker, just a staging note for later.

### 3.7 Failure catalogues / adversarial tests
Eclipse-specific failure examples: sanitized capture missing social meaning, invented visual fact labeled as observed, generic dialogue ignoring a selected hook, a character who knows something they shouldn't, a relationship rule overwriting literal source behavior, prose that's technically consistent but socially "dead."

**Deprioritized for now:** fine-tuning, agent swarms, autonomous long-term character memory.

**Cheapest high-value experiment:** one fixed scene, one character, three conditions — (1) normal character prompt, (2) current mined dataset, (3) compact Eclipse packet with selected behavioral hooks + relationship context. Blind-rate the three.

---

## 4. Supplementary Literature

### 4.1 Character/persona consistency benchmarks (→ §2.1, §3.3, §3.7)
- **PersonaGym** — five-dimension persona-agent benchmark (expected action, toxicity control, linguistic habits, persona consistency, action justification), LLM-judge pipeline; lighter "PersonaGym-Light" for fast iteration.
- **CharacterBench** — "dense" vs. "sparse" evaluation dimensions with boundary-consistency checks; addresses narrow dimension coverage in older benchmarks.
- **RPEval** — emotional understanding, decision-making, moral alignment, in-character consistency.
- **PICon** — multi-turn *interrogation* framework chaining logically connected questions to expose latent contradictions.
- **HEART-Bench** — pairs psychological character profiles with character-agnostic scenarios (duty, adversity, social interaction, emotional valence).
- **"Consistently Simulating Human Personas with Multi-Turn RL" (NeurIPS 2025)** — documents persona drift after ~100 turns; formalizes prompt-to-line, line-to-line, and Q&A consistency. See §5 for why this maps only narrowly onto Eclipse's architecture.
- **Persona-Aware Contrastive Learning (PCL)** — self-questioning "role chain" method, measurable consistency gains including on smaller open models.
- **Deflanderization** (CPDC 2025) — suppresses *excessive* role-play in favor of behavioral fidelity; useful counterweight if generated scenes read as generically "in-character" rather than specifically in-character.

### 4.2 Theory of mind & social simulation (→ §2.4)
- **ToMA** — generates candidate mental-state/utterance pairs and simulates dialogue from them; closest analogue to belief-driven scene generation.
- **Sotopia / Sotopia-π / Sotopia-S4** — interactive social-agent environments; usable as an evaluation-environment template even with a deterministic simulation core.
- **AgentSociety** — explicit "mind" modules (emotions, needs, motivations) driving external action.
- **"Validation is the central challenge for generative social simulation"** — argues LLM-driven ABMs may worsen validation difficulty (black-box structure, cultural bias, stochastic output). Cautionary read against over-trusting simulation-based fidelity metrics; reinforces keeping relationship/scenario assembly deterministic (see §5).
- **BDI-grounded work** (NegotiationToM, ToM-Agent) — disentangles belief and confidence in a way that maps onto a relationship-graph/behavior-master structure.

### 4.3 Long-form narrative coherence & planning (→ §2.5, §2.7, §3.5)
- **DOC / Re³** — hierarchical outline-then-draft frameworks built to fix "insufficient high-level planning → local fluency, global incoherence." Closest prior art to the §3.5 staged flow.
- **StoryWriter** — modular multi-agent long-story framework.
- **"Lost in Stories: Consistency Bugs in Long Story Generation by LLMs"** — taxonomizes narrative consistency error types at scale (2,000 prompts); adapt directly into the §3.7 failure catalogue.
- **Guiding Generative Storytelling with Knowledge Graphs** — user study (n=15): KG-assisted storytelling improves quality *and* users' sense of control when editing the graph directly. Directly relevant to the node engine's editable-graph premise.
- **StoryVerse** — translates author-defined "abstract acts" into detailed character actions via narrative planning; close conceptual sibling to the author-intervention layer (§2.5).
- **EIPE-text** — mines an explicit, human-reviewable plan from text; relevant to the reverse-direction problem (§2.7).
- **"Narrative Theory-Driven LLM Methods" (survey)** — argues literary/narrative theory should inform system design, not just NLP metrics; useful for schema/vocabulary design.

### 4.4 Structured extraction & retrieval-side control (→ §3.1, §3.2)
- Persona/agent-memory retrieval literature confirms even strong retrievers recover well under 50% of relevant context at moderate noise — reinforces that deterministic, curated retrieval (vs. pure RAG) is a reasonable hedge, not a shortcut avoided for no reason.

---

## 5. Drift Reassessment: Why the Mining → Node Engine → Composer Split Changes the Numbers

**The mechanism the 100-turn drift research actually describes:** persona defined once in a system prompt, then generation continues turn after turn, with each new turn's context including an accumulating pile of the model's *own prior generated output*. Drift is regression toward baseline behavior as that self-generated momentum dilutes the original anchor.

**Why Eclipse's architecture mostly sits outside that mechanism, in two layers:**

1. **General deterministic-anchoring point:** each Composer pass pulls from a fresh, curated packet (selected hooks, ledger, relationship rules) built from the deterministic behavior master — not from a growing pile of the model's own previous guesses. There's no accumulating self-generated context to drift into, because nothing is asking one continuous session to "remember" a character across many turns of its own output; every pass re-grounds from source truth.

2. **Mining app → node engine → Composer split (the specific factor that raised Target 3 the most):** relationship and scenario assembly happens in the node engine as a **deterministic combinatorial operation**, not a generative one. The engine isn't asking an LLM "how would this character react, given everything that's happened so far" — it assembles a scenario from structured nodes, and only then hands a bounded packet to the Composer for prose. This removes the character/relationship side almost entirely from the drift mechanism, because there's no unbroken autoregressive chain on that side for drift to accumulate in.

**Where the risk is still real, narrowed:** only inside a single Composer pass, if a scene runs long enough that the model's own mid-scene output starts dominating its own context before the ledger-check step (§3.5) catches it. That's a small, contained, testable risk — not "the whole character drifts over a long relationship."

**What data volume solves vs. doesn't:** 43 seasons of source material solves *coverage* — more situations, more specific behavioral hooks, less generic filler in any single generation. It does not by itself solve *context-accumulation drift*, which is about what's in the model's working context on a given pass, not how much source material exists upstream. A thin dataset run through the deterministic-ledger architecture would still resist accumulation-drift; a rich dataset run through a naive continuous autoregressive loop would not be immune just because the source was deep. Both are working in Eclipse's favor, but they're separate levers — worth keeping them distinguishable in the §2.1 evaluation design, so a fidelity failure gets diagnosed correctly as a *coverage gap* vs. a *context-anchoring gap* rather than lumped together.

**Runtime note (non-research, for later):** running inside Codex on a GPT subscription rather than a pay-per-token API doesn't change any of the above. It does mean the §3.6 multi-model bake-off is initially a multi-role/multi-prompt exercise against one model rather than literal multi-provider routing, and that a standalone-app/API path stays open later if needed.

---

## 6. Design Rationale: Why This Isn't "Ask the AI to Write Fiction"

For any AI collaborator picking up this project: **the point of this architecture is not to make an LLM write better prose. It's to stop needing it to.**

**The observed problem.** Direct prose/fiction generation is a known weak point for current LLMs, and there's a widely observed (if not rigorously measured) sense that general-purpose model prose has gotten more generic, not less, since the GPT-4 era — flatter voice, safer word choices, less specificity. The likely mechanism: heavy RLHF/safety/alignment tuning tends to sand down exactly the kind of specific, idiosyncratic word choices that make prose read as written by *someone in particular* rather than a generically helpful assistant. Asked "write a Marge Simpson scene" cold, a model has to invent voice, attention, and restraint from a thin, generic prior — precisely the condition under which this flattening shows up worst, because nothing in the prompt constrains the output away from "generic sitcom mom."

**Why the architecture sidesteps this instead of fighting it.** Eclipse never asks that open-ended question. The mining app + node engine handle everything that would otherwise require the model to *invent* specificity — curated behavioral hooks, deterministic relationship state, scenario assembly — and hand the Composer a narrow, well-constrained rendering job: given this specific hook, this specific relationship state, this specific register constraint, render this. That is a fundamentally easier and more constrained task than "be Marge," and it's the kind of narrow, well-specified generation where models are least likely to default to generic output, independent of whether their free-form prose ability has drifted.

**The reframe to hold onto when building or extending this system:** the Composer's job is not "write good fiction." It's closer to a compiler than an author — assemble a well-constrained rendering job out of pieces that already encode the specificity, and render it. Success isn't measured as "does the AI write well" — it's "does the packet leave the model nowhere generic to retreat to." Every schema, validator, and evaluation design in this document (§2.1, §3.1–§3.3) should be read with that goal in mind: they exist to remove degrees of freedom from the generation step, not to coach a better performance out of it.

---

## 7. Practical Near-Term Priorities

1. Run the **evaluation design** (§2.1/§3.3) — a fixed vertical-slice test — before expanding capture breadth. Borrow question-chaining from PICon and dimension sets from PersonaGym/CharacterBench rather than designing from scratch.
2. Run the **three-condition packet experiment** (§3.7) as first concrete evidence pseudo-cognition helps.
3. Treat **"Lost in Stories"**'s error taxonomy and the **Deflanderization** framing as a starting checklist for the Eclipse failure catalogue, rather than building one from zero.
4. When interfaces get drawn for the node engine and Composer, revisit the **KG-storytelling user study** methodology for structuring a "does editing the graph feel like control" check — directly applicable once there's a visual node UI to test.
5. In the eval design, explicitly separate **coverage failures** (not enough curated data) from **context-anchoring failures** (ledger-check didn't catch mid-pass drift) — see §5. Conflating them will make debugging harder later.

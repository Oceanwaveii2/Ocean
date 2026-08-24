# The Deterministic ↔ LLM Interface — Architecture Flow (v0 sketch)
**Status:** proposal (simulation-level architecture sketch — the thing to build the new engine on; not a locked spec)
**Date:** 2026-08-22
**Answers:** the authority-map open question "how the LLM and the deterministic rules actually talk to each other." This doc is the first concrete answer; supersedes nothing, sits under `Agent_Runtime_Architecture.md` (the co-location decision) and the canon (two touchpoints + bounded sub-services).

---

## 1. What the prior art already solved (research anchors)

| System | What it proved | What we inherit |
|---|---|---|
| **Stanford Generative Agents** (Park et al. 2023, 7400+ citations) | The closest published instance of our problem: a **deterministic scaffold seeded by hand** (persona brief + daily schedule), recursively decomposed by LLM calls into finer actions; agents run on **memory stream + retrieval (recency × importance × relevance) + periodic reflection**. The LLM never holds the character — the scaffold and memory do; the LLM fills in. | The **scaffold-then-fill** pattern; retrieval scoring as deterministic code; reflection as a bounded sub-service |
| **Drama-manager theory** (Riedl & Bulitko, *Interactive Narrative: An Intelligent Systems Approach*) | A director process tracks story state and *chooses* which beat comes next while the player/characters act freely — beat selection is code, performance is open | Our **beat-function scaffolds** + the model of a deterministic "director" layer scheduling LLM performances |
| **Façade / Versu / Prom Week** (rule-based character systems) | Rich character behavior from authored rules + salience weighting, no learning — believable interaction from small data | The **relationship-node rule model** (already our canon); Versu/Prom Week verification pass still recommended before the boundary doc |
| **Wampfler, *A Platform for Interactive AI Character Experiences* (2026)** | Modern LLM-era character platform concerns: character integrity, personality/emotion management as platform services | Confirmation that "character integrity as a *service boundary*" is the current research frontier — and unoccupied by mined-media data |

**Net:** nobody has crossed *our* exact bridge (mined-media deterministic character data driving LLM prose with boundary validation), but every span of the bridge exists somewhere. The flow below assembles them.

## 2. The flow — one story request, end to end

```
                         ┌─────────────────────────────────────────────┐
                         │  HUMAN (Rain) — request + curation gate      │
                         └──────┬───────────────────────────▲──────────┘
                                │ story request             │ review queue
                                ▼                           │ (captures, deltas,
┌──────────────────────── DETERMINISTIC CORE (code) ────────┤  flagged scenes)
│                                                             │
│  1. LOAD SCAFFOLD     story JSON: scenes → beats, each beat│
│                       function-tagged + role slots         │
│                                                             │
│  2. PER BEAT ───────────────────────────────────────────┐  │
│     │                                                    │  │
│     │  2a. STATE SLICE      ledger: location, body state,│  │
│     │                       who-knows-what, relations    │  │
│     │                                                    │  │
│     │  2b. CAST ROUTING     scene partners → role fills; │  │
│     │                       slot-affinity weights scale  │  │
│     │                       each rule (0–1 dials)        │  │
│     │                                                    │  │
│     │  2c. HOOK SELECTION   per character: coverage tier │  │
│     │                       (mined → inferred →          │  │
│     │                       projected) — top-3 bundle,   │  │
│     │                       provenance + confidence kept │  │
│     │                                                    │  │
│     │  2d. REGISTER DIAL    scene register detected;     │  │
│     │                       style anchors retrieved      │  │
│     ▼                                                    │  │
│  ╔════════════ TOUCHPOINT 2 (the only LLM generation) ═══╪══╪══╗
│  ║                                                        ║  ║  ║
│  ║  3. PROSE CALL    prompt = beat contract + state      ║  ║  ║
│  ║                    slice + hook bundle + register +   ║  ║  ║
│  ║                    invariants + style anchors.        ║  ║  ║
│  ║                    NOTHING else. No corpus.           ║  ║  ║
│  ║                                                        ║  ║  ║
│  ╚══════════════════════════════╦════════════════════════╩══╪══╝
│                                 ▼                            │
│  4. VALIDATE (boundary check, code)                          │
│     ├─ hard walls: invariants, bundle proportions,          │
│     │  no-name-leak, contract preservation                   │
│     ├─ soft walls: era/register drift                        │
│     └─ ledger consistency (nothing referenced that the       │
│        who-knows-what slice forbids)                         │
│           │                                                  │
│     PASS ▼                            FAIL ▼                 │
│  5. LEDGER DELTA                 4x. FEEDBACK LOOP           │
│     proposal (bounded LLM        failure reason + rule id    │
│     extraction of state changes  returned to prose call —    │
│     → ledger validates/applies   regenerate (max N);         │
│     or rejects)                  soft fails = nudge prompt   │
│           │                      (fix this line only)        │
│           ▼                                                  │
│  6. MUSE LINT (bounded): flagged-sentence rewrites,          │
│     diffable; anti-tell structural checks                    │
│           │                                                  │
│           ▼                                                  │
│  7. TELEMETRY: fires_count++, offered_vs_used logged,       │
│     register_dial recorded                                    │
│           │                                                  │
│     next beat ──► (loop 2) ──► all beats done ──► archive    │
│                                          run + human review  │
└──────────────────────────────────────────────────────────────┘
  SEPARATE, UPSTREAM: TOUCHPOINT 1 (media → text capture) —
  agent-guided passes + counter-scripts kit → curation gate →
  the mining JSON that steps 2b/2c read from; its archetype pass tags role addresses and its unmatched trait clusters draft **candidate registry classes** (the self-learning loop). Same propose→
  validate→gate pattern, different data direction.
```

## 3. Stage-ownership table (who does what)

| Stage | Owner | Prior-art anchor | Our basis |
|---|---|---|---|
| 1 Scaffold load | D | drama-manager beat scripts | transplant doc beats-with-slots |
| 2a State slice | D | Generative Agents' retrieval (recency/importance/relevance — but ours is a *fact ledger*, not free memory) | timeline ledger |
| 2b Cast routing | D | Prom Week salience | role doc §4 affinity dials; **role vocabulary = registry classes (era/culture-pinned)** |
| 2c Hook selection | D | retrieval scoring | engine v0.2 coverage tiers; **inferred tier draws archetype composites from the registry (combination law: class × transcript)** |
| 2d Register dial | D | — | v0.2 `scene_register` |
| 3 Prose call | **LLM (only generation)** | scaffold-then-fill | Touchpoint 2 |
| 4 Validation | D | Façade's rule arbitration | envelope boundary check (goal doc §2) |
| 4x Feedback regen | L (bounded, ≤N) | — | co-location dividend (agent runtime) |
| 5 Ledger delta | L proposes → D commits | Generative Agents' observation write-back | "LLM proposes, graph disposes" |
| 6 Muse lint | L (bounded, diffable) | AI-edit passes (arXiv 2409.14509) | Muse decision |
| 7 Telemetry | D | — | field notes #13–15 |
| Review | H | — | curation gate |

## 4. Simulation — one beat of Jillian (data-eye view)

Beat: *"protagonist humiliated in public; function: strip status; slots: {subject, witness, authority}"* — cast: Jillian fills *subject* (affinity 1.0 on her shameless-joy rules; her `witness_count`-confirmed trait "taboo-as-triumph reframe" rides at tier *mined*, 0.85). Ledger slice: hotel, Brian knows about the fart habit, patron next door does not. Bundle: 3 hooks (medical-triumph reframe; rhythmic escalation; ignore-norm-enforcer at 0.7). Register: comedy. **Prose call** returns a scene where Jillian *apologizes* → validation hits hard wall (invariant: zero-shame) → failure reason + rule id fed back → regenerate → she reframes it as a health milestone → pass → delta proposal "patron now aware; Brian reserve +1" → ledger validates (consistent) → Muse lints two flagged lines → telemetry: reframe rule fires_count++. Total LLM calls: 1 prose + 1 regen + 1 delta + 2 lint fixes. Everything else was code.

## 5. Design rules the flow asserts (candidates for canon once sketched)

1. The LLM never sees the corpus — only the assembled bundle for one beat (Generative Agents' discipline, enforced).
2. Every LLM output re-enters the core through a validator; nothing writes back directly.
3. Failure reasons are *data fed back into the retry* — the co-location advantage; distant APIs can't do this cheaply.
4. State changes only via validated deltas (propose → dispose).
5. Regeneration is bounded (≤N) with escalation to the human queue — the gate is never silently bypassed.
6. The same propose→validate→gate pattern governs both touchpoints; only the data direction differs.
7. The Archetype Registry is a deterministic data component of the core (not an LLM feature): classes address rules, candidates are *proposed* by mining and *approved* at the gate — the registry never self-publishes.

# Agent Runtime Architecture — The LLM Moves In With the Data
**Status:** decision · **HIGH PRIORITY** (architecture change, Rain 2026-08-22)
**What changed:** the system's primary runtime is no longer "standalone app making API calls." It is an **agent session (Codex / ZCode / GLM agent) operating the hub directly**, with `AGENTS.md` (hub root) as the interface contract. The API path survives as an alternate driver, not the default.

---

## 1. The Core Insight (Rain's)

> It lets the probability side and the deterministic side work **more closely together**, rather than **guessing whether the distant API calls get the job done**.

In the API model, the LLM is a **distant oracle**. The engine composes a prompt, throws it over a wall, and hopes: hope the JSON parses, hope the model respected the evidence hierarchy, hope the selection was relevant — no visibility, no iteration, one-shot cost per hope. The v3.5 engine's repair-retries and emergency fallbacks were engineering built *around* this blindness (see its review: "priority is told, not enforced" — enforced priority requires the enforcer to see the result).

In the agent-runtime model, the LLM lives **in the same environment as the data and the code**:

```
API MODEL (distant oracle)                AGENT RUNTIME (co-located)
┌──────────┐   prompt   ┌─────┐          ┌──────────────────────────┐
│ engine   │ ─────────► │ LLM │          │  agent session           │
│ (local)  │ ◄───────── └─────┘          │  ┌─────┐    reads        │
└──────────┘   response (hope)           │  │ LLM │◄─ captures, docs│
      │                                 │  └──┬──┘                 │
      ▼ blind                            │     │ writes             │
   parse/repair/retry                    │     ▼                    │
                                         │  JSON / passes           │
                                         │     │ runs               │
                                         │     ▼                    │
                                         │  python core (validate)  │
                                         │     │ observes output    │
                                         │     ▼                    │
                                         │  fixes in place, retries │
                                         └──────────────────────────┘
                                              human gate at the end
```

The loop **closes**: propose → write → execute → observe → correct, all in one environment, before anything reaches the curation gate. "The LLM proposes, the graph disposes" stops being a policy and becomes a *mechanical fact* — the agent can literally run the validator on its own output and fix failures locally instead of re-paying to re-hope.

## 2. What This Unlocks (the closeness dividend)

1. **Enforced priority becomes possible.** The agent reads the captures before writing the pass, checks provenance tiers before quoting them, runs the engine's coverage/selection itself, and diffs results against the ledger. Blindness was the reason priority could only be "told."
2. **Self-verifying output.** Malformed JSON gets fixed *in-environment* (parse → see error → repair with context) instead of the API model's blind repair-prompt lottery. The v3.5 weaknesses (no output validation, self-grading audit) are addressable because the verifier and the generator share a desk.
3. **Zero-cost iteration.** Re-reading a file, re-running the deterministic core, re-diffing — all local, all free. Every API-model retry was money.
4. **The curation gate gets a queue, not a flood.** The agent assembles review-ready artifacts (captures with tier flags, discrepancies marked, confidence sorted) instead of the human reconstructing state from chat scrolls.
5. **The deterministic core gains an operator.** `fiction_engine_v0.2.py` and future tools stop being "run by whoever remembers the CLI" — the agent is a standing operator that knows the workflows (AGENTS.md §3).

## 3. The Three-Driver Model (one pipeline, three hands on the LLM step)

| Driver | Cost model | Role | When |
|---|---|---|---|
| **Agent session** (ZCode/Codex/GLM sub) | flat (sub) | **Primary runtime** — mining passes, counter-scripts, prose, judgment, file maintenance | default |
| **HTML interfaces** (v3.5 engine, Fiction Studio v5.1, future cognition board) | free (local) | **Visual console** — cast slots, debug panels, boards over the same JSON files; authoring/inspection surfaces, not a competing system | when eyes beat chat |
| **API calls** | per-token | **Unattended driver** — overnight eval loops, bulk registry import, any no-human-present batch | only when autonomy justifies cost |

The data layer is **provider-agnostic**: no schema, prompt, or capture knows which vendor executed it. Driver slots stay swappable.

**Workflow-surface division (Rain, 2026-08-22):** the surfaces split by workflow nature, not by preference —
- **HTML owns the spatial workflows:** the Visual Narrative Authoring app (node-based cognition/relationship graphs) and the Narrative Composer (timeline/board) *require* canvas-type interfaces; chat cannot host node graphs. These are where HTML is not optional.
- **Agent chat owns the text-native workflows:** mining passes, counter-scripts, prose, judgment, file upkeep — where the closed propose-execute-observe loop lives.
- **Mining needs both:** the *miner* itself is a text-native agent pass, but the **miner selection matters** — the mining driver must already be biased enough toward the result we want (entertainment-media registers, willingness to see salient/crude/unfiltered content) before the counter-script kit biases it further. Driver choice is itself a quality lever: blindness profiles differ by provider (counter-script doc §3), so pick miners pre-disposed the right way, then install the rest of the bias with the pass kit. And mining's **curation gate benefits from a visual surface** (capture queue with tier flags, approval stamps, discrepancy markers) — a light HTML review UI over the same JSON, not a full node board.
The two surfaces exchange JSON files; neither replaces the other.

## 4. What Does NOT Change (canon continuity)

- **Deterministic core, two generative touchpoints, bounded sub-services** (canon §2) — intact. Interpretation (media→text) and prose rendering remain the generative moments; the agent's *other* work (running tools, checking ledgers, maintaining files) is bounded sub-service/procedure, now physically co-located.
- **Text-canonical, JSON storage, provenance tiers, schema_version** — unchanged; the agent is a better-behaved client of them, not a replacement.
- **The human gate** — unchanged and strengthened: agents draft more, humans approve the same amount, but with better-prepared queues.
- **Schemas, pass kit, engine CLI** — already conformant; this change added an interface (`AGENTS.md`), not new formats.

## 5. Documentation Consequences

- This doc amends the canon's deployment-scope note (authoring-time system): the agent session *is* the authoring-time system's primary embodiment.
- `AGENTS.md` (hub root) is the **operational interface**; this doc is the **rationale and architecture**. Keep both current together.
- Engine lineage: `fiction_engine_v0.2.py` CLI + agent operator is the going-forward execution model; v3.5 HTML's API-call orchestration is the historical pattern this replaces (its stage contracts remain porting material).
- The open "LLM–deterministic interface" question (authority map) gains its answer's *shape*: the interface is the filesystem + CLI + AGENTS.md protocols — the agent mediates between probability and determinism through files and tools, not through prompt-hoping.

## 6. Risks / Notes

- **Session context limits:** very large corpora still need the deterministic index (SQLite path per canon §6) — the agent asks tools for slices, never reads everything.
- **Agent variance:** different agents/sessions perform differently; AGENTS.md's hard rules + file outputs + validation keep the *data* quality independent of the driver's mood.
- **Chat-history lock-in:** forbidden by convention — everything canonical lands as files (AGENTS.md §4).
- **The API path is dormant, not dead:** keep the provider abstraction in tools so the unattended driver can wake up without rework.

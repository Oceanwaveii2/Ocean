# Phase 3 — Gap Resolutions (research + proposed solutions)
**2026-08-18 · companion to `Phase3_Functional_Gap_Analysis.md` · status: proposed solutions for Rain to accept, modify, or reject**
**Cleanup pass 2026-08-19:** the "contradictions: the human decides" item below was retracted by Rain (§2), the clone-lineage section was downgraded to a pre-architecture planning option (§3), and `identity_hash` was fixed for same-video dual-track capture (§4).

One current decision and one historical review topic are recorded below:

1. **Derived characters:** no clone or lineage architecture is locked. Characters can be authored independently in any number; the master-node material in §3 is historical research only.
2. **Mining App: it is the first app, and it is a JSON processor.** Every scrap in, structured JSON out — capture is manual (the human), processing is automated (the app).

Retracted 2026-08-19: a third item previously listed here — "contradictions: the human decides" — came out of an AI discussion thread and was never an actual ruling. See §2.

Research status note: sources below were fetched and verified this session where marked ✅; two prior-art systems (Versu, Prom Week) could not be fetched due to network failure and are marked ⚠️ (described from general knowledge, not re-verified — treat as leads, not citations).

---

## 1. The scene loop — how "a character reacting to another character" actually runs

The gap analysis's headline finding: the founding thesis has no mechanism written down. Rain's framing of where the answer lives: *"this is more of a transcript translation deal on the mining."* That framing turns out to be exactly right, and it splits the problem into two halves that already have prior art:

### 1a. The mining half — transcripts ARE character-reacting-to-character data

Every dialogue transcript is already a recorded simulation of characters reacting to each other. The linguistics field of **conversation analysis** has a name for the unit: the **adjacency pair** ✅ — a First Pair Part (the initiation: a question, an offer, an accusation) creates *conditional relevance* for a Second Pair Part (the reaction: an answer, an acceptance, a deflection). Two properties matter for this project:

- **The reaction is shaped by preference organization.** ✅ Preferred responses (agreeing, accepting) come fast and clean; dispreferred responses (refusing, disagreeing) carry delays, mitigation, and *accounts* — the "why" softening. That structure is precisely the difference between Space Beth's flat "Fuck Jerry" (preferred-shaped for her frame — dismissal needs no account) and Domestic Beth's "…we probably shouldn't mention this. Again." (dispreferred-shaped — guilty, hedged, accounted for). The shape of a reaction is character data.
- **Same initiation, different reactions, systematically.** Who reacts and through what frame determines the second pair part. That is the Beth payoff in linguistic terms: one FPP (Jerry gets mentioned), three SPPs, each computed by a different stack.

**Proposal — a "reaction pairs" mining pass.** When the Mining App processes a transcript, it doesn't just store lines: it stores *pairs* — (initiation, reacting-character, reaction, reaction-shape). This is a translation of the Akane per-line format (line + context + vocal note) into a linked unit: the line, who it was answering, and how the answer was shaped. The accumulated library becomes "how people like this react to things like that" — mined exemplars, not invented rules. This is Rain's "transcript translation deal," made concrete, and it reuses the already-proven capture unit.

**Video-channel counterpart (independently converged, 2026-08-18):** a Claude-authored research page now in-package — `01_Mining_App/phase3_planning/Mining_Video_Behavior_Enhancement_Research.html` — lands on the same shape for the *visual/behavior* channel: a temporal event miner and relationship graph over observable motion/expression events, with the explicit rule "don't jump from pixels to personality" (the project's evidence hierarchy, applied to video). The two channels — dialogue reaction pairs (this section) and behavioral event sequences (that page) — were written independently and are compatible; together they feed the scene loop's exemplar library from both directions.

### 1b. The engine half — a turn-based beat loop

Prior art, verified this session:

- **Generative Agents (Park et al., 2023, "Smallville")** ✅ — the strongest existing demonstration of the exact loop needed. Each agent has a **memory stream**; every event (including *other agents' actions and utterances*) lands in it as an observation. When an agent must act, a retrieval step scores memories by **recency, importance, and relevance** to surface what matters *to that agent*, reflections synthesize memories into higher-level conclusions, and only then does the agent plan/act. The key architectural fact: **there is no shared "mood" or merged state — each agent filters the same world through its own retrieval and memories, and different agents produce different behavior from the same events.** That is structurally identical to "A's output becomes B's input, filtered through B's stack."
- **Versu / Prom Week** ⚠️ (unverified this session) — two social-simulation game systems where characters evaluate events through their own stances/practices (Versu) or pick social exchanges against a relationship-state network (Prom Week's CiF engine, where one character's exchange updates the relationship values that constrain everyone's next exchange). Worth a later verification pass; they are the deepest game-AI prior art for socially-conditioned reaction.

**The proposed loop — turn-based, one beat at a time:**

```
SCENE = ordered set of characters whose nodes are ON (per-node switch = loop membership)
EVENT LOG = the scene's running record of beats (starts with the scene premise)

for each BEAT in the scene's beat budget (or until the author stops it):
    for each CHARACTER in the active turn order:
        INPUT      = event log so far (other characters' outputs included)
        STACK      = that character's compiled stack (clone-and-dominate resolved,
                     filters like the Jerry Filter active)
        EXEMPLARS  = reaction pairs retrieved for this situation
                     (scored like Generative Agents: relevance to the current beat,
                     weight/importance per the evidence hierarchy, recency in-story)
        REACTION   = generate(STACK ∘ INPUT ∘ EXEMPLARS)   ← one dialogue/action beat
        append REACTION to event log (as an envelope entry, evidence_links intact)
        state changes (dominance flips, relationship updates) → new nodes/proposals
```

Why turn-based first, and not the alternatives:

- **Turn-based** maps 1:1 onto the beat model the live Fiction Engine app already uses (`episode_anchor` beats ✅ per DEV_NOTES §5) and onto the Composer's manuscript blocks. It's debuggable — every reaction has a visible input, stack, and exemplar set. The Generative Agents loop is turn-based at its core (per-agent update cycles), and it produced the most believable agent behavior yet demonstrated.
- **Event-driven** (reactions trigger reactions immediately) is the Prom Week model ⚠️ — more lifelike, much harder to keep coherent and audit. It's the v2 upgrade path once turn-based is boring: an interrupt/urgency flag on certain beats is the bridge.
- **Single-pass with characters-as-context** is what the live app does today (`activeIds` = everyone injected at once ✅ per boundary doc §9) — it stays valid for scenes where nobody's reaction *changes* what the others do next. The loop is only needed when they do, which is exactly the wine-night scene.

**The Jerry walkthrough (proof the loop produces the payoff):** the wine-night repeat enters the event log once. Beat N, Domestic Beth's turn: her stack (full marriage load, mom-guilt frame dominant) + retrieved reaction pairs for guilty-but-naughty → her hedged line. Beat N+1, Space Beth: her stack (space delta dominant, no-attachment frame) + her exemplars → "Fuck Jerry" — no account needed, preferred shape for her. Beat N+2, Beth-Rainee: the Jerry Filter (an L3 routing node *inside* her stack) rewrites the input through the awful-men corpus before generation → the full-body shiver. Same log, three filters, three characters.

**Where this lives:** as recommended by the gap analysis, this becomes the headline of the still-unwritten **Eclipse → Fiction Engine boundary doc** — the loop is that doc's core subject. Nothing here needs new schema: loop membership = the per-node ON/OFF switches already decided; each turn's compile = the same "cook" already chosen for the Rainee network; outputs = ordinary envelope entries with `evidence_links`, so the provenance chain and dirty propagation work unchanged.

---

## 2. Contradictions in direct evidence — RETRACTED 2026-08-19

The resolution previously in this section ("the human decides, at the moment of use"; surface-don't-resolve; record picks as opinions) was **cut by Rain**: it was contributed by an AI during a discussion and "got lost in the sauce" — it was never an actual ruling, and nothing was ever built on it.

Where this leaves the underlying question (the gap analysis's "contradiction authority within direct evidence" flag): **open, and parked.** No authority-ranking, conflict-surfacing, or resolution mechanism is decided. This question will be picked up when Rain produces the detailed function sketches for how the apps should actually work — it should not be re-proposed before that.

---

## 3. Clone/derived characters — not an architecture decision

**Status note (Rain, 2026-08-19):** no clone or lineage architecture has been chosen. A clone/derived character can simply be authored as a new character, and any number may be created. The `extends`/`local_overrides` material below is retained only as research and a possible future option; it is not required by the current project.

Rain's proposed structure — a master Beth node with Domestic Beth, Space Beth, and Beth-Rainee as linked variants — is a known-good pattern with a name: **prototype-based delegation** ✅. In languages like Self and JavaScript, a child object holds a *live pointer* to its parent; the child inherits everything, shadows (overrides) only what it locally redefines, and **when the parent changes, children see the change automatically — except where they overrode it.** That is precisely the behavior the gap analysis asked for: expand the master's horse corpus → every Beth variant that didn't override horse data gets the expansion.

Two more confirmations this is the right shape:

- **The live Fiction Engine app already does it.** ✅ `mergeDatasetEntries`/`resolveEpisodeAnchors` match incoming data to existing library entries via `extendsId`/`parentId` and merge as a supplement of the existing entry (boundary doc §9). The mechanism has running precedent in this project — the schema just needs to make the pointer official at the envelope level.
- **The Beth worked example already implies it.** Space Beth is canonically "Beth's full dataset plus the space delta, Space Beth dominant" — i.e., a prototype child with one override. Kid states are children of children (delegation chains are fine).

**Proposed envelope fields (minimal):**

```json
{
  "id": "eclipse:beth:space:001",
  "extends": "eclipse:beth:prime",
  "local_overrides": ["space_delta", "reaction_frame:no_attachment"],
  ...
}
```

- `extends` — pointer to the master/parent node id (null for a prime like Beth master or Rainee core). This answers "which nodes descend from Beth prime?": walk `extends`. It also slots into dirty propagation as a second edge type: a parent's field changes → every child that did *not* override that field is dirty; children (and grandchildren) recompute lazily as already designed.
- `local_overrides` — the list of what this variant owns outright. Everything not listed is inherited live from the parent. This is the shadow list; it's also what makes propagation safe — a parent update never stomps a deliberate variant choice.
- **Shared sub-nodes need no new field:** the Rainee network's shared sub-nodes (things that stay Rainee across forms) are just evidence nodes referenced by several variants through `evidence_links` — reference, not copy, which the envelope already does.

**The resulting Beth family tree:**

| Node | `extends` | `local_overrides` |
|---|---|---|
| Beth master (prime) | — | everything: base personality, expanded horse corpus, Jerry history |
| Domestic Beth | Beth master | mom-guilt frame, marriage load weighting |
| Space Beth | Beth master | space delta, no-attachment reaction frame |
| Beth-Rainee | **Rainee core** (not Beth master) | Beth impression (absorption rule governs depth), Jerry Filter |
| kid variants | their respective adult node | kid data promoted dominant (the dominance flip, as an override) |

One deliberate modeling note: Beth-Rainee extends *Rainee core*, not Beth master — she is a Rainee variant wearing a Beth impression, per the fixed absorption rule ("distinct mimic, not a copy"). Her access to Beth data flows through the impression link, which is why expanded horse knowledge reaches her only as residue. Getting her `extends` pointer right is what makes the whole worked example compute correctly.

---

## 4. Mining App = the first app, a JSON processor

Rain's framing (2026-08-18): the six mining gaps from the analysis aren't six problems — they're the app's actual product statement. Consolidated into one capture-unit schema (the Akane per-line format promoted to THE entry type):

```json
{
  "id": "mining:beth:frag:0192",
  "type": "capture_entry",
  "origin_app": "mining_app",
  "identity_hash": "hash(source_media_id + track_id + timecode_window + subject_id + fragment_kind)",
  "moment_key": "ram_s05e09|00:11:42-44",
  "provenance": { "source": "ram_s05e09", "source_class": "mainline", "track": "en", "timecode": "00:11:42-44" },
  "motifs": ["horse_reference", "guilt_deflection"],
  "fragment":  { "raw": "Her ass is as big as one of my horses.", "speaker": "Beth", "delivery": "flat, half-audible, eyes still on the road" },
  "observation": "Deflection via absurd comparison; callbacks to horse identity under mockery",
  "inference":  "Horse knowledge surfaces socially as comic capital, not just expertise",
  "reaction_pair": { "initiation": "eclipse:beth:frag:0188", "shape": "dispreferred+account" }
}
```

- **Fragment-first:** `fragment` is the only required sub-object; a 3-second clip or one screenshot is a complete entry. Observation/inference can be added later or by passes. `fragment.delivery` is the Akane record's per-line vocal-note column given a permanent home — manual vocal/performance description, the part of the acoustic dimension text analysis can't reach but a listening human can.
- **Multi-granularity in one action:** fragment (signal) + observation + inference are the evidence hierarchy's first three levels captured in one act — one capture, all levels.
- **`motifs[]`** preserved verbatim so the relationship engine can group fragments across episodes into patterns.
- **`identity_hash` is capture-aware — same-video rule (fixed 2026-08-19).** JP and EN dialogue over the same video share timecode windows, so the hash includes `track_id`, `subject_id`, and `fragment_kind` in addition to media and time. JP and EN therefore remain separate, while genuinely repeated copies of the same track/subject/fragment can deduplicate.
- **`moment_key` groups without merging.** Every track using the same source media and time window shares one `moment_key`. This lets the comparison stage retrieve JP, EN, and audio observations together without flattening their differences.
- **`reaction_pair`** is §1a made into a field: points at the fragment this one answers, with its conversation-analysis shape (preferred/dispreferred, account present, delay) — the transcript-translation product.
- **`negative_observation`** as an entry `type` sibling (payload: subject, what's absent, scope of the search, why it matters): "Naga never gets depth" becomes minable, which is the project's founding argument finally expressible in its own schema.

Everything above stays inside the existing evidence-worker contract and portable envelope — this is the capture format growing to match the goal, not a new architecture.

---

## 5. What this deliberately does NOT change

- The provenance chain, evidence hierarchy, and manual-capture-as-authoring (gap analysis §6: already solid).
- The Recompute Scope mechanism — `extends` joins `evidence_links` as a dirty-propagation edge; the walk just gains one edge type.
- The paused Fiction Engine → Composer boundary doc — nothing here unpauses it.
- The four-app boundary architecture — the scene loop is a runtime behavior of the Fiction Engine fed by Eclipse data and mined exemplars; no app's responsibilities move.
- **No override/merge mechanism is locked (Rain, 2026-08-19: "I haven't started with the architecture").** The live app's merge fields, `extends`/`local_overrides`, USD opinion stacks, and clone-and-dominate weights are examples or research options. None governs the project yet.

## 6. Open items this leaves

- Event-driven upgrades to the loop (interrupts, urgency beats) — v2, only after turn-based is real.
- Versu / Prom Week verification pass ⚠️ — fetch failed this session; both are worth one focused read before the boundary doc is written, since they're the deepest game-side prior art.
- Whether `local_overrides` needs granularity below field level (whole sub-trees vs. single values) — test against the kid-state cases first.
- Turn-order policy in the loop (fixed, rotating, or chosen per beat by salience) — an interaction-design question, not a schema one.
- **Contradiction handling (§2) — parked** until Rain's detailed function sketches exist; retracted proposals should not be re-derived.
- **Recompute/acceptance-loop questions — parked for the same reason (Rain, 2026-08-19):** detailed sketches of how the app should function come first. This covers the noted risk that accepting Composer proposals writes back into Eclipse nodes that sit inside the recompute graph (a potential cycle), and the proposal → edit → recompute → new-proposal oscillation case. Recorded as open in the boundary doc's parked section; not to be solved before the sketches.

## 7. Sources

✅ verified this session:
- Generative Agents — architecture, memory stream, retrieval scoring (recency/importance/relevance), reflection: [arXiv:2304.03442](https://arxiv.org/abs/2304.03442); overview of the observe→reflect→plan pipeline: [Lilian Weng, "LLM Powered Autonomous Agents"](https://lilianweng.github.io/posts/2023-06-23-agent/)
- Adjacency pairs, conditional relevance, preference organization (preferred/dispreferred response shapes): [Conversation analysis — Wikipedia](https://en.wikipedia.org/wiki/Conversation_analysis)
- Prototype-based delegation (live parent reference, automatic propagation, shadowing): [Prototype-based programming — Wikipedia](https://en.wikipedia.org/wiki/Prototype-based_programming)
- Live app precedent for `extendsId`/`parentId` supplement-merge: `Phase3_FictionEngine-to-Composer_Boundary_and_Bidirectional_Contract.md` §9 (in-package, checked against `Fiction_Behavior_Engine_v3_5_SIMPLE_EPISODE_JSON.html`)

⚠️ described from general knowledge, not re-verified this session (network failure):
- Versu (Richard Evans) — social simulation via practices/evaluative stances
- Prom Week / Comme il Faut (McCoy et al.) — social-exchange network engine, relationship-state-driven responses

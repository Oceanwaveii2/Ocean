# Fiction Engine — Guide

A quick reference for how the narrative reinterpretation engine works, how the files plug together, and how to run a new scenario through it.

---

## 1. What the engine does

Take an existing story (a "scenario"), keep its plot skeleton, and regenerate everything performative — dialogue, reactions, comedy timing, SFX, character behavior — from **character behavior master** data files.

```
scenario text  ──►  narrative JSON (skeleton + bindings)  ──►  rewritten story
                        ▲                                        ▲
   behavior masters ────┘          (character data plugged in) ──┘
```

Three files are involved in the current setup:

| File | Role |
|---|---|
| `Rainee_data.json` | Behavior master for **Rainee** (9 datasets, Stewie-derived patterns, applied as a behavioral layer — never as identity) |
| `Nori_Jillian_data.json` | Behavior master for **Noir** (13 datasets, Jillian-derived abstract patterns — never as identity) |
| `Fiction_story.json` | The **narrative intermediate representation** (schema v2.1 — the v2.0 label was stale; the JSON and INDEX confirm 2.1, 24 validation tests passing): plot skeleton + behavioral bindings + interaction mechanics |

---

## 2. Core rules (never break these)

1. **Identity is never swapped.** Stewie material is a behavioral layer on Rainee; Jillian material is an abstract pattern layer on Noir. Neither character ever speaks transcript lines or takes on the source identity.
2. **Abstract patterns, not transcripts.** Every dataset carries `DO_NOT_SAY_LITERALLY` / `DO_SAY_ABSTRACT`. Generated text uses the *mechanism*, never the wording.
3. **Precedence order** (when rules compete): character identity and story state → explicit story overrides → core traits → relationship rules → behavioral mechanisms → surface details.
4. **Literary SFX only.** Bodily/comedy sounds come from the palette (`pffffffft!`, `braaaap!`, `pooooot!`, `pffft-pffft!`, whoa-chains, `VROOOOM`). Never hertz, frequency, or acoustic-technical wording.
5. **Filters are data.** Excluded or abstract-only datasets are listed in `dataset_filters` in the story JSON — the engine never guesses.

---

## 3. The compilation pipeline (how a scenario becomes a bound story JSON)

This is the 9-stage process documented in `Fiction_story.json → compilation_pipeline`. Only stage 2 truly needs an LLM; the rest is mechanical joining and validation.

1. **Scenario intake** — accept raw story text (markdown/transcript) or an existing skeleton JSON.
2. **Skeleton extraction** — pull out scenes, events, causal chains, participants, narrative functions, performance slots. *(LLM step.)*
3. **Role assignment** — map participants onto character roles declared by the masters (`application_mapping.target_character`, header overrides).
4. **Archetype slotting** — join each master's `generic_archetypes` to story roles via `archetype_role_map`. Unmatched archetypes are unused or flagged as sequel hooks.
5. **Dataset retrieval** — for each scene, score datasets by (a) archetype match through a scene participant and (b) pattern satisfies a narrative function / performance-slot need. Apply `dataset_filters`.
6. **Binding** — emit per-scene `behavioral_bindings`: dataset id + `use_pattern` + `apply_at` event ids + delivery note.
7. **Dial assignment** — set per-scene `persona_dial` from the transformation timeline stage; assign `sfx_slots` from the palette.
8. **Duet assignment** — for scenes with 2+ bound characters, activate `duet_patterns` whose source datasets are already bound there (compositionality rule).
9. **Validation** — run `validation_tests`; fail on unresolved dataset ids, literal-line reuse, dial violations, or filter breaches.

**Join keys** (this is the whole trick):
- `generic_archetype` → story role (via `archetype_role_map`)
- behavioral pattern → narrative function / performance-slot need
- `special_rules_override` → arc checkpoints (via `persona_emergence_track`)

---

## 4. What makes interactions rich (the v2.0 additions)

- **behavioral_bindings** — every scene names the exact datasets and abstract patterns driving each character, down to the event ids.
- **duet_patterns** — named two-character mechanics with fixed start/escalation/termination rules:
  - *literal_question_vs_chain_logic* — Noir's literal questions puncture Rainee's rationalization chains
  - *proud_disclosure_vs_dignity* — Noir celebrates what Rainee would conceal; the pride frame transfers to Rainee by the end
  - *directed_care_vs_boundary* — Rainee imperiously directs her own care; Noir sets a boundary, complies anyway, reframes it as affection
  - *recognizer_vs_performed_self* — Noir names Rainee's performed persona, converting pretense into public fact
- **persona_emergence_track** — numeric 0–1 dials per scene (`stewie_behavior_layer`, `future_rainee_persona`), monotonically increasing along the transformation timeline. Flashbacks carry their own stage's dial.
- **sfx_palette** — fixed sound vocabulary + placement rules per scene.
- **dataset_filters** — excluded material (tonal/context mismatch) and abstract-only restrictions are explicit, enumerable data.

---

## 5. Checklists

### Mining a new clip into a behavior master
- [ ] `id` with the master's prefix (`stewie…` / `clip…`)
- [ ] `complete_transcript_source` marked FOR REFERENCE ONLY
- [ ] `behavioral_mapping_abstract` with `DO_NOT_SAY_LITERALLY` and `DO_SAY_ABSTRACT`
- [ ] `generic_archetypes` filled (this is what the engine joins on — no archetype, no binding)
- [ ] `literary_sfx` notes where applicable (palette terms only)
- [ ] `application_mapping` declares target character, state, and identity-preservation rule
- [ ] Header overrides for anything character-specific (identity rules, orientation/lore, special clip overrides)

### Compiling a new scenario
- [ ] Extract skeleton (scenes / events / participants / functions / slots)
- [ ] Assign roles from master declarations
- [ ] Build `archetype_role_map` for this story; leave unmatched archetypes explicit
- [ ] Decide `dataset_filters` (excluded + abstract-only) for the story's context
- [ ] Bind datasets per scene with `apply_at` event refs
- [ ] Set persona dials from the timeline; add sfx slots
- [ ] Activate duets by compositionality
- [ ] Run validation: every binding resolves, no dangling event refs, no excluded datasets bound, dials monotonic, no literal lines

---

## 6. Validation tests (the engine's acceptance criteria)

1. Same core transformation cause preserved?
2. Rainee still Rainee / Noir still Noir (identity + sibling relationship intact)?
3. Regression changes behavior without erasing identity?
4. Stewie/Jillian material appears as a behavioral layer, never literal identity or lines?
5. Supernatural cause → regression logic still connected?
6. Merchant behavior and jade-profit motivation still causally important?
7. Every behavioral binding resolves to a real dataset id in a declared master?
8. Every scene stays within its persona dial (no overshoot, no undershoot)?
9. All bodily sounds from the literary palette (no hertz/frequency wording)?
10. Arc checkpoints hit (shame-to-pride completes by the final scene)?
11. Every two-participant scene runs at least one duet pattern to termination?
12. All dataset exclusions and abstract-only restrictions respected?

*(Full 24-item list lives in `Fiction_story.json → validation_tests`.)*

---

## 7. Scaling up

- Each new character = one new master cartridge (declare target character, id prefix, archetypes, identity rule in the header).
- Each new scenario = one pass through the 9-stage pipeline.
- The compiler around stages 3–9 can be plain code; only skeleton extraction and final prose generation need an LLM.
- Sequel hooks: unmatched archetypes (e.g., the rare-component quest) can be parked for future stories.

---

## 8. Emergence layer (v2.1) — going beyond reperformance

The bindings and duets guarantee the characters are *recognizable*. The emergence layer guarantees each telling is *alive*: it licenses invention instead of just replaying patterns. Bindings are the floor; emergence is the ceiling.

### The five injection mechanisms (`Fiction_story.json → emergence_layer`)

1. **Invention licenses** — explicit domains where the generator MUST invent material that exists in no source dataset: Rainee's pacifier taxonomies, spreadsheet fields, and invented units of measurement; Noir's fresh malaprop chains and folk-medical reframes; new market vendors, containment-system quirks, and sensory detail.
2. **Fusion operators** — five cross-master pattern collisions that produce compound behaviors present in *neither* master alone (true emergence lives here):
   - *vocabulary_contamination* — Noir's mangled term names a real phenomenon; Rainee institutionalizes the error
   - *escalation_spiral* — Rainee's rationalizations become Noir's proud announcements, looping
   - *reframe_ping_pong* — reframes compound into a third meaning neither sister intended
   - *literalization_demand* — a boast is taken literally and must be demonstrated, becoming a market legend
   - *persona_osmosis* — registers leak across the sisters until each speaks a little of the other's language
3. **Open escalation rungs** — duet ladders have no ceiling; once source rungs are exhausted, generate new ones by the pattern's own mechanic (termination rules still apply; escalation never resolves the plot).
4. **Canon ledger** — the compounding engine: any invention becomes binding canon for the rest of the telling, at least one invention per telling is promoted to seed future tellings, and later scenes MUST call back to earlier inventions instead of re-inventing equivalents.
5. **Drift vectors** — sanctioned directions characters may grow *beyond* their source data across tellings (Rainee's baroque record-keeping, Noir's accidental expertise), with hard limits at the identity rules.

### Per-scene injection points

Every scene in `scene_injection_points` carries an injection directive (S09's folk theory must be invented fresh each telling; S06 mandates the escalation-spiral fusion; S11 must call back to at least three earlier inventions and end with an emergent quirk no dataset contains).

### Emergence guardrails

Inventions obey identity rules, dials, and precedence; never resolve the core conflict (no cure, no contract exit); never contradict the skeleton; must compound on earlier canon; and stay inside the comedy register. Validation now checks invention presence, canon persistence, callbacks, fusion compounds, and guardrail compliance (tests 19–24).


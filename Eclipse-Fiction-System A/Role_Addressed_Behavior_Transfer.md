# Role-Addressed Behavior Transfer — Design
**Status:** decision (mechanism design; implementation pending)
**Date:** 2026-08-21
**Problem it solves:** the hardest transfer case — a character whose deterministic data was mined in one world (Jillian/Noir, Family Guy) being driven into **new characters** and **non-source-world interactions** without losing fidelity or hand-writing everything twice.
**Preceded by:** `01_Mining_App/minning evaluation project/Discussion_Character_Transplant_Feasibility_2026-08-20.md` (beats-with-slots, function tags); the Cancer Farts archetype pass (gag grammar "portable to any cast"); `Eclipse_App_Goal_Breakdown_and_Research.md` §6 row 12 (Mallory↔Queen Alice role-slot analogies); the engine core's `generic_archetypes`/`archetype_role_map` join.

---

## 1. The Theory (validated)

When Jillian's interactions are re-encoded so that her partners appear as **roles** instead of names (Brian = {lover + straight man + caretaker}), her behavior rules become **portable by re-addressing**: a new cast that fills the same role slots receives the same behavior; a cast that fills them *differently* produces new, emergent interactions — routed by the deterministic graph, not invented by the LLM.

Evidence this works:
- **The project's own gold clip already proved it.** The fart-dossier archetype pass (Radiant / Straight Man / Norm Enforcer) explicitly notes the gag grammar "is portable to any cast (Sonic/Archer/etc.) without copying dialogue."
- **Narratology precedent:** Propp's dramatis personae and Greimas' actantial model — narrative function transfers across surfaces; a century of structural analysis depends on it.
- **The Mallory↔Queen Alice mapping** in the design notes is this same mechanism one level up (relationship-level role analogies).

## 2. Core Rule

> **Behavior rules are owned by the character, addressed to roles.**

- **Literal pass** (Jillian↔Brian, provenance `mined`) is the **floor** — the untransferrable specificity (shame-inversion, the medical-triumph reframe, exact delivery) that makes her *her*.
- **Archetype pass** is the **addressing layer** — it says *who the rules apply to*, never what they are. Role tags are delivery addresses, not personality summaries.

A rule never moves to another character; only its activation conditions reference roles, so new partners in the slot receive the behavior.

## 3. Dual Axes and Partial Overlap

Two role axes, tagged separately:

1. **Partner type** (comic/functional): straight man, norm enforcer, boaster, fool, mentor…
2. **Relation** (social): lover, sibling, rival, authority, stranger…

Emergence mechanism = **slot mismatch**. Brian is {lover + straight-man + caretaker}. A new partner who is {lover + boaster} fires her affectionate-disclosure rules but not her deadpan-against-stillness rules — and the scene gets whatever the boaster's own dataset brings. The graph routes differently; the collision of partial overlaps *is* the new interaction. Non-source-world interaction stops being a special case: every new cast comes with its own slot fills.

## 4. Slot-Affinity Weights (graded, not binary)

Each rule carries per-slot affinity:

```json
{
  "rule_id": "jillian:rule:shameless_taboo_joy",
  "owned_by": "jillian",
  "behavior": "performs taboo act with pride; reframes as triumph (medical/fashion/etc. per literal floor)",
  "addressed_to": [
    {"axis": "relation",     "role": "lover",       "affinity": 1.0},
    {"axis": "partner_type", "role": "straight_man", "affinity": 1.0},
    {"axis": "partner_type", "role": "norm_enforcer", "affinity": 0.7},
    {"axis": "relation",     "role": "rival",       "affinity": 0.3}
  ],
  "provenance": "mined",
  "source_dataset": "FG_resort_fart_gag"
}
```

Affinity scales rule firing strength through the existing Relationship Node rules/biases/priorities/overrides precedence hierarchy — deterministic and tunable, no LLM in the loop.

## 5. The Leakage Guard (the one real danger)

Over-generalization collapses a character into the stock type (Jillian → "ditz") and loses the mined specificity. Guard, deterministic:

- The literal pass is **always consulted as floor**; archetypes only route. If a generated scene matches the archetype but violates the literal floor, the floor wins and the scene is flagged for regeneration.
- Provenance stays attached per rule; a projected/archetypal rule can never silently outrank a mined one (consistent with engine coverage tiers `mined > inferred > projected`).

## 6. Worked Example — Noir

Noir is "Jillian's deterministic data + identity overlay + different home cast." Under this design:

1. Jillian's rules are dual-encoded (literal floor kept; role addresses attached during the archetype pass).
2. Noir's identity overlay (guardrails, sister relationship to Rainee, name) replaces the identity layer — the rules themselves are inherited by reference, provenance intact.
3. In Noir's scenes, Rainee and others fill role slots (sibling, merchant, supernatural-aware…); partial overlaps against Jillian-era addresses produce Noir-specific emergent behavior.
4. Identity check in validation: literal-floor violations AND identity-overlay violations are both hard failures.

This makes Noir the first implementation target — she's simultaneously the mechanism's test case and a character the project wants anyway.

## 7. Validation — the Cast-Swap Test

Extends the evaluation harness (blind LLM-judge):
1. Take mined Jillian scenes; strip names to role-only addressing.
2. Regenerate with a different cast filling the slots (engine, Touchpoint 2).
3. Blind-judge: *did the behavior survive while the surface changed?*
Pass = role-addressing works. Fail modes are diagnostic: behavior lost (addressing too thin), surface copied (literal pass leaking where it should be floor-only).

## 8. Where It Lives in the Pipeline

| Layer | Change |
|---|---|
| Mining capture | Archetype pass adds `role_address` tags per interaction partner (proposes; human approves — curation gate) |
| Eclipse (app 02) | Relationship Nodes gain role-slot fields; slot-affinity weights edited here (this is the authoring surface); the **Archetype Registry** (§10) is authored and curated here |
| Fiction Engine | Hook selection matches scene-partner role fills against rule addresses (deterministic join, same pattern as the existing `archetype_role_map`) |
| Story scaffolds | Beats-with-slots (transplant doc) use the same role vocabulary — one address space end-to-end |

**Vocabulary owner:** the role vocabulary is the **Archetype Registry** (§10) — one list for the whole system, defined once, referenced everywhere.

## 9. Open Questions

- Registry size and granularity per culture/era (too few = mush; too many = never matches). §10 gives the sizing evidence.
- Who authors role tags for ensemble characters with no dedicated data (mined-from-context vs. defaulted)?
- How role addresses interact with the JP/EN `moment_key` parallel-track policy (roles should be track-independent — believed trivially true, unverified).

## 10. The Two-Layer Substrate & Archetype Registry

The system runs on two data layers with opposite mathematical properties, and the separation is load-bearing:

**Layer 1 — Transcripts: effectively infinite.** Any recorded human interaction or behavior is minable; the only limit is our ability to record (the Mining App problem — fragment capture, channels, curation throughput). This layer is the evidence pool: mined, provenance-tiered, the literal floor.

**Layer 2 — Archetypes: finite but large.** There are only so many archetypes per culture per era — a large but enumerable list. The ultimate pool of source material is **culture + era** (Japan; America 1980s–2026): archetypes come from media in a time period. This layer is the routing/rubric pool: addressing, comparison, evaluation. The registry never replaces mined data; mining output *references* registry entries.

**Seed catalog:** `Archetype_Registry_and_Source_Material.md` is the registry's working catalog (master indexes, five per-culture seed registries, multi-language policy, self-learning design, import order). **Existence proof — the Japanese dere taxonomy.** Anime culture already maintains exactly this structure: a fan-curated, largely predictable, wide-gamut archetype taxonomy — tsundere (itself split into type A / type B subvariants), yandere, kuudere, dandere, deredere, himedere, sadodere, kamidere, undere, plus adjacent classes (genki, ojou-sama with elegant vs. warahime variants, gyaru, meganekko…). Core classes run ~30–40+ per culture, and characters are routinely **dual/mixed archetypes** ("tsundere × ojou-sama") — combination, not just selection. Otaku culture *prefers* predictability with a wide gamut, which is precisely the registry property we want: enumerable at class level, combinable, specific at instance level. The registry is not a theoretical invention; Japanese media culture has been crowd-maintaining one for decades — we formalize it.

**Culture/era coordinates.** Every registry entry carries `culture` and `era` coordinates. Cross-cultural analogues are **mappings, not identities**: American "dumb blonde" ≈ Japanese "gyaru" — similar class (glamour + perceived naivety + social performance), different cultural mechanics. An analogue map is a typed edge with affinity weights — the same deterministic machinery as slot-affinity. Generating for a Japanese-era setting addresses rules with Japanese registry roles; porting a character across cultures goes through the analogue map (deterministic, human-approved at the gate).

```json
{
  "registry_id": "archetype:jp:1990-2026:gyaru",
  "culture": "jp", "era": "1990-2026",
  "label": "Gyaru",
  "class_notes": "fashion-forward, socially performative glamour; perceived-naivety coding",
  "cross_culture_analogues": [
    {"registry_id": "archetype:us:1980-2026:dumb_blonde", "affinity": 0.6,
     "diff": "US analogue leans naivety-real; gyaru leans naivety-performed"}
  ],
  "common_mixes": ["archetype:jp:*:genki", "archetype:jp:*:tsundere_b"]
}
```

**Why the separation matters:** the infinite layer is where fidelity lives (only transcripts can prove what a specific character actually does); the finite layer is where transfer lives (only an enumerable registry can route, compare, and cross-map). Collapsing them either drowns transfer in unbounded data or flattens characters into classes — the leakage guard (§5) is the enforcement of this boundary.

## 11. Mini Cognition Node (project vocabulary)

Rain's term for the atomic unit of a character codex: **one transcript plus basic memory plus co-relationships to classes of archetypes and behavior** — "Dumb Blonde + Jillian" as a single addressable thing.

What it bundles, in system terms:
- **Transcript (Layer 1):** the mined evidence — the part that makes Jillian *Jillian* and the non-negotiable basis of behavior control (per Rain: emergence and generated fiction are useless if transcripts aren't what controls the behavior).
- **Basic memory:** the witness/stitch fields (`witness_count`, `witness_clip_ids`, pattern status — Sketch Prep Field Notes #1) plus whatever the node remembers of prior use.
- **Co-relationships (Layer 2):** its archetype-class attachments and role addresses (slot-affinity to Straight Man, Lover, etc.) — the addressing that lets this transcript ride the class and re-route to new casts.

The combination law (registry doc §1) instantiated: class supplies the predictable frame, the transcript supplies the unique variation, memory supplies the audit trail. Curation happens at this granularity — "curate for cells, not clips" means curate mini cognition nodes.

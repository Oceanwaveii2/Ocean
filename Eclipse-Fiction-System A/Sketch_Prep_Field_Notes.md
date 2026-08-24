# Sketch-Prep Field Notes — Small Fields, Big Leverage
**Status:** proposal (helpful-notes class — suggestions for Rain's sketch sessions and the schema work; none are decisions until sketched/approved)
**Date:** 2026-08-21
**Companions:** these extend `Role_Addressed_Behavior_Transfer.md` (role fields), `Mining_App_Project_Scope.md` §7 (capture_entry), the canon §4/§5 (governance), and the eval notes in `Project_Gap_Scan_2026-08-21.md`. Each item: the field(s), and the one reason it earns its place.

---

## A. Capture level (mining fragments)

1. **`witness_count`, `witness_clip_ids`, `pattern_threshold`** — the stitch counter. A candidate trait graduates to pattern when independently-clip-confirmed N times (N visible, tunable). This is the sparse-character strategy (Jillian clause) made auditable at a glance: dense cluster = proven trait; single-witness = candidate; zero = unmined or noise.
2. **`non_reaction` capture type** — silence and non-response are first-class data (Brian's deadpan IS the characterization). Needs its own capture shape: subject, what didn't happen, over what window, with what expected-basis. Without this field, the straight-man half of every comedy pair is unrecordable.
3. **`channel_dissonance` edge** — when channels disagree (mouth says fine, body says misery), that's not an error to resolve away; it's character. Type it, keep it, let relationship rules read it. Dissonance patterns are among the most transferable behavior data.
4. **Per-channel provenance tier** — a fragment's channels (visual/caption/audio/inferred) each carry their own V/C/R/D; one bad channel shouldn't doom a fragment, and one good channel shouldn't launder a bad one.
5. **`sanitize_exempt` + `register` on the fragment** — the anti-corporate-voice override, recorded per fragment so the register survives compilation (goal doc problem #1's promised fields).
6. **`overlay_excluded` list** — what non-diegetic material was filtered at ingest (tubic logo precedent) and why. Keeps the filter honest and re-runnable when the clip is re-interpreted by a better model.
7. **`era` + `language` pins on captures** — not just on registry entries: a 2005 fragment and a 2023 fragment of the same character are different register evidence (the dumb-blonde-by-era point). Cheap now, impossible to reconstruct later.

## B. Node / sketch level (for Rain's relationship sketches)

8. **Slot-affinity as arrow thickness** — role-address weights (`Role_Addressed_Behavior_Transfer.md` §4) sketch naturally: the lover/straight-man arrows into Jillian's rules draw thick, the rival arrow thin. If a rule's address arrows are hard to draw, the rule is probably underspecified.
9. **A visible "who wins" dial on every Relationship Node** — the collision guard. Rules/biases/priorities/overrides exist in the schema, but sketches should make the precedence order *visible* (a numbered stack, a dial, anything drawable). Two valid rules firing against each other is the deterministic system's characteristic failure; the sketch is where its resolution becomes obvious instead of emergent.
10. **`interaction_mode` badge** (blend / override / conditional switch) — one badge per Relationship Node variant; the Phase-2 ruling that folded Convergence in. Drawing it as a badge keeps it from being forgotten inside property panels.
11. **`human_approved_by` / `human_approved_date` on everything AI-proposed** — captures, edges, registry candidates, role tags. The curation queue sorts by `lowest confidence × highest downstream usage`; the stamp is what separates canon from draft. Unstamped = invisible to generation (the gate, enforced by a field).
12. **`derived_from` back-references** — any inferred/projected node carries the list of mined rows it leans on; clicking a projected behavior shows the literal floor it must not violate (the leakage guard, navigable).

## C. Runtime telemetry (engine, per run)

13. **`fires_count` per rule** — increment every time a rule drives a generated beat. Dead rules (never fire) and hub rules (fire everywhere) are both pathologies: the first means bad addressing, the second is the caricature warning. This is the cognition-web analysis fed by live usage instead of structure alone.
14. **`offered_vs_used` hook log per scene** — which hooks selection offered, which prose actually used. The audit trail that answers "why did she do that?" with dataset row-ids, and the debugging tool for when the LLM ignored good hooks.
15. **`register_dial_value` recorded in output** — the comedy/drama/… register chosen per scene is written into the run JSON, so eval axis 4 (register closeness) can be scored automatically later.

## D. Eval integrity

16. **Frozen-scaffold hash** — test scaffolds get a content hash logged with every run, so a "worse" result is never secretly a changed test. The improvement-per-data-added loop (gap scan eval note) is only valid if the test provably didn't move.
17. **`dumbassery_guard` checklist as data** — the no-collapse axis (drift into generic idiocy) works best as an explicit negative checklist per character: 5–10 things *this* character would never do, derived from the mined floor. Cheap to write at mining time, decisive at rating time, and it doubles as a hard validation rule in the engine.

---

**If only three survive sketching:** #1 (stitch counter), #9 (who-wins dial), #11 (approval stamp) — together they make the sparse-character strategy auditable, the deterministic core debuggable, and the human gate enforceable.

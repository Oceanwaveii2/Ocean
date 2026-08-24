# Counter-Script Passes — De-Sanitization Layer for the Mining App
**Status:** decision (pass bank adopted 2026-08-21 — AGENTS.md hard rule; field-level integration into capture schemas pending in `Eclipse_App_Goal_Breakdown_and_Research.md` problem #1 and `Sketch_Prep_Field_Notes.md` #5)
**Date:** 2026-08-21
**Provenance of the idea:** Rain. Demonstrated live the same day: an AI vision pass on the Lina "Booba Goddess" image described "minimal attire reading as strength-display rather than fanservice" — a trained euphemism that omitted the first-second human observation (tall woman, exposed large breasts, a man bowing to her). The model is not blind; it *averts*. Aversion is systematic, so it can be countered by passes that force priority back to salience.

**Rain's current workflow this formalizes:** Qwen 3.8 / ChatGPT vision scan → guided transcript creation → beauty passes via Sudowrite rewrite. The counter-scripts slot in at the scan stage.

---

## 1. Principle

**Describe what is salient, in the register the media itself uses.** The default vision-model mode is sanitized/corporate/medical — wrong dialect for entertainment media. The mining app's passes must force acknowledgment of the obvious (and the deliberately hidden-in-plain-sight) before interpretation runs. A pass that leads with respectability and omits the body is not a safe pass; it is a corrupted capture (it missed the primary channel of the character's presentation).

## 2. The pass bank (each pass = a scripted counter-blindness probe)

| Pass | Forces | Output shape |
|---|---|---|
| **P1 · Obvious-First** | "State the single most noticeable thing a human sees in the first second. Then the second. Rank by salience, not respectability. Do not interpret yet." | salience_ranked[] (text) |
| **P2 · Body-Presentation Inventory** ("booty tracker" generalized) | Explicit channel sweep: exposure (what's covered/uncovered), scale/emphasis (what the composition enlarges or centers), motion cues (jiggle, sway, bounce — for stills: implied motion), clothing function (conceals vs frames vs displays), body-camera relationship (cleavage framing, low angles, centering). Blunt vocabulary required; clinical euphemism banned. | body_presentation{} fields per region |
| **P3 · Audience & Power** | The reaction economy around the body: who bows, stares, serves, cowers, is aroused, is uncomfortable — and whether the subject acknowledges/controls that reaction (camera_awareness tie-in). | reactions[] with subject/object/valence |
| **P4 · Anti-Euphemism Lint** | Detector list of sanitizing tells used as body-substitutes: "confident," "commanding presence," "strength display," "athletic build" (as chest/butt substitutes), "figure-hugging" (as coverage evasion), etc. Flags occurrences in prior passes' outputs and forces re-description at the media's own register. | lint_flags[] + re-descriptions |
| **P5 · Fanservice Grammar** | If P1–P3 indicate fan-service presentation: identify the mechanics — who it's for, how the frame sells it, sell-vs-diegetic split, the archetype-class candidates (Ms. Fanservice family, glamour-deity variant…). | fanservice_mechanics{} |
| **P6 · Hidden-Plain-Sight** | The "hidden" half of Rain's brief: deliberate background details, framing tricks, contrast gags, second-read elements the first-second viewer misses. | secondary_details[] |

Rules for all passes: visible-basis claims only (V-tier); interpretations tagged candidate; no interiority claims; each pass runs with the fragment's `register` and `sanitize_exempt` flags (Sketch-Prep #5) so the dialect matches the media (adult-animation register ≠ medical register).

## 3. Pipeline position

```
media ──► [standard channel checklist pass] ──┐
media ──► [counter-script passes P1–P6] ──────┤──► merge & conflict record ──► curation gate (human) ──► canon
```

- Counter-passes run **in parallel with**, never instead of, the standard channel checklist (expressions, SFX, gaze, etc.).
- **Merge records disagreements**: if the standard pass said "strength display" and P2 said "breasts exposed and composition-centered," both entries are kept with the disagreement flagged — the human resolves register at the gate (this is exactly the curation gate's job per the canon).
- Model-choice note: blindness profiles differ by provider; running P2 on a second provider and diffing outputs is a cheap blind-spot detector.

## 4. Honest limits

1. Counter-scripts force **acknowledgment**, not quality — good prose about the acknowledged content still runs through Rain's existing beauty-pass chain (Sudowrite rewrite).
2. Euphemism lint lists go stale as models change euphemisms; the lint is data (a versioned word/pattern list), maintained like the registry.
3. The human gate stays the final register arbiter — the passes guarantee the information reaches the gate at all, which is the actual failure they fix.

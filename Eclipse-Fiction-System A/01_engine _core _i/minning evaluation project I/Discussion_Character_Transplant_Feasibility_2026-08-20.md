# Discussion: Character Transplant Feasibility (Mining Systems)

**Date:** 2026-08-20
**Topic:** What a strong mining system must enable — the "Rangiku into Emperor's New Groove" transplant test
**Status:** Design discussion / feasibility conclusions
**Successor:** developed into `../../Role_Addressed_Behavior_Transfer.md` (role-addressed transfer, archetype registry, two-layer substrate) and the canon's per-app mapping

---

## The scenario (the test case)

- **Source character (A):** Rainee — female character driven by ~4–8 hours of mined Rangiku material (writing/behavior), plus media data of horse transformation (visual/physical conditioning). She transforms into a large, heavy, big-bodied horse creature.
- **Target scaffold (B):** *The Emperor's New Groove* — a story about a man turned into a llama. We hold only basic rewritten material adapting the beginning so the inciting logic fits our version (why *she* gets transformed).
- **The ask:** Replace Kuzco with Rangiku/Rainee. New writing, new emergent interactions with preexisting behaviors — a mixture of the deterministic mined data and the LLM. New scenes, new behavior, because a different character (mind *and* body) is driving it. Each run generates new dynamic interactions on top of the same scaffold.

## Core architectural conclusion

Three separated concerns:

1. **Character behavior data** (portable, deterministic asset) — mined from hours of source material.
2. **Story scaffold** (fixed world) — beats with slots, function-tagged, not prose/scripts.
3. **Emergent layer** — the LLM negotiating between card and scaffold at every beat, fresh per run (seeded variance).

**Verdict:** Feasible now with current LLMs, provided two conditions:
- The character card is **generative, not descriptive** — it encodes *how she reacts* under humiliation, flattery, boredom, physical change (behavior nodes/dials, bindings/duets per the v2.0 model), not just traits.
- The scaffold is **beats with slots, function-tagged** — e.g., "this beat = strip protagonist of status" — not scripted content.

## The hardest design problem

Stories are character-shaped. ENG's arc *is* Kuzco's arc (arrogant ruler learns humility). Rainee won't fail the way Kuzco fails. Each beat must carry a **function tag** so the system can satisfy the beat's purpose through different friction — bend the beat or branch — rather than cosplaying the original scene. Beat-function abstraction in the mining/scaffold format is the single most important design decision for transplants.

## The body is half the behavior (physical transplant)

The horse creature vs. the llama is not a visual reskin — it inverts the story's physical logic:

- **Kuzco/llama:** small, scrawny, powerless — bundled, dragged, tossed. Comedy of being too small.
- **Rainee/horse creature:** massive, heavy, wide — too big for the world (doorways, bridges, booths). Comedy/presence of taking up space; the reaction economy changes (side characters read threat/marvel/staring, not "joke").

Therefore the physical form must be **part of the character card as behavioral data**:

- **Body-schema node** — what the body *does*: gait, weight, sitting, turning, bumping; what stays human in mannerism vs. what's equine. The TF media data is the conditioning source (how the shape moves and occupies space, not just appearance).
- **Beat-physics collision** — beats must renegotiate against the body. "Protagonist bundled into wagon": a llama gets bundled; a horse creature doesn't — the beat's *function* (loses control / is humiliated) is satisfied differently (she goes along confidently; the wagon suffers; Pacha's problem becomes transport/hiding something this size).
- **Reaction re-derivation** — every side-character beat involving "notice the transformed protagonist" is re-derived, never reused.

The character card thus has **two coupled drivers**:
- **Mind** — mined from the Rangiku writing.
- **Body** — mined from the horse-TF media data.

## Emergence model

Each beat fires with: scaffold beat contract + character constraints (mind + body) + prior-scene state. Deterministic data is the **floor** (she never acts out of character); LLM + seed is the **variance**. Character = driver, story = track, each run = a new drive over the same track.

## Validation experiment (proposed)

Run the same scaffold twice: (1) swap only the mind, keep llama physics; (2) swap mind + body. Measurably different stories off the same track would validate the emergent layer concretely.

## App implication

The mining app's job is making the two data products **interchangeable**: mine any character, load any scaffold, hit run. This is the scenario→bound-story pipeline with the character as the swappable module; constraints stay as data.

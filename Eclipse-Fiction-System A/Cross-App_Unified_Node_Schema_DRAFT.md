# Cross-App Unified Node Schema — Early Draft

**Status: rough sketch, not a spec.** This captures Rain's own words for the idea ("nodes have about 3 nested levels mostly, and then some simpler nodes that have 1 level that can be used on any floor and have some kinda function") and checks it against real prior art. Feature list isn't finished; hand-drawn sketches still to come. Nothing here should be built against — this is preplanning material, same status as everything else in this package.

## 1. Why this is a different question than the boundary docs

The two existing boundary docs (`Phase3_Node_Schema_and_Mining-to-Eclipse_Boundary.md`, `03_Narrative_Composer_App/phase3_planning/Phase3_FictionEngine-to-Composer_Boundary_and_Bidirectional_Contract.md`) both assumed the Adobe pipeline model: each app already has (or will independently grow) its own internal representation, and only the *handoff* needs a shared envelope — Illustrator, Photoshop, and InDesign don't share a document model, just an interchange format.

That assumption made sense for a project where apps get built one at a time, each already shaped by its own use before the next one exists to trade data with it. **Rain has clarified this project isn't that — all four apps are being planned and built at the same time.** When nothing is built yet, forcing four independent schemas into agreement later is strictly more work than agreeing on a shared base now. This is a real, named trade-off in software architecture — not a niche idea — and worth naming honestly, tradeoffs included, rather than just adopting it.

**The pattern this matches: Shared Database / Shared Schema integration.** The classic description of it: an enterprise has multiple applications being built together and wants them to exchange information reliably, so instead of translating between separate schemas, they agree on one shared schema up front. The benefit is real — nothing can get out of sync if everything already speaks the same shape. But the honest trade-off (from the classic Enterprise Integration Patterns description of this exact pattern): designing a schema that meets every application's needs is a genuinely hard problem, and if one application's needs don't fit the shared shape, there's real pressure to break away from it. For this project the usual political version of that risk (different teams arguing over the shared schema) isn't a factor — one person, one vision — but the *design* difficulty still is: a schema that serves Mining App's raw-evidence capture, Eclipse's containment graph, Fiction Engine's episode/state model, and the Composer's narrative whiteboard all at once is a harder thing to get right than four separate ones. Worth building slowly and testing against real sketches rather than locking early.

## 2. Rain's rough idea, mapped to real prior art

What's described — most nodes have a fixed ~3-level position, plus simpler nodes that aren't tied to a level and just "do something" wherever they're attached — is close to a distinction Pixar's USD makes between two different kinds of schema:

- **Typed ("IsA") schemas** — these give something an identity/type, and in USD's case, position it in the structural hierarchy. This is the ~3-level part of Rain's idea — it already matches the Level 1 (World/Group) → Level 2 (Character/Persona) → Level 3 (Evidence) structure already documented for Eclipse in `START_HERE.md`. A typed node's "floor" is part of what it *is*.
- **API ("has a") schemas** — in contrast to typed schemas, these attach a bundle of properties/behavior to something without changing what type it fundamentally is — applying one means whatever it's attached to gains those properties regardless of its own type or level. This is the "simpler nodes, one level, usable on any floor, with some kind of function" part almost exactly — a functional node in Rain's model wouldn't care whether it's attached to a Level 1, 2, or 3 node; it just contributes its function wherever it's placed.
- USD further splits API schemas into **single-apply** (attach once) and **multiple-apply** (attach several times to the same target, each a separate named instance) — worth keeping as an open design knob, since some of Rain's "function" nodes will probably want to be attachable more than once to the same node (e.g. more than one evidence-tag or rule on the same character) and others won't.

This mapping isn't a claim that the project should literally adopt USD (a 3D-scene format) — it's that the *shape* of the idea Rain already has in their head is a known-good pattern with a real name and years of production use across very different tools (which is exactly the "how does USD round-trip through Houdini/C4D/Maya/Blender" question that prompted this search).

## 3. Sketch of what a unified node record could look like

Not a locked schema — a shape to react to once more of the Composer/Mining/Fiction Engine feature lists exist:

```json
{
  "id": "string — stable across the whole project, not just one app",
  "floor": "1 | 2 | 3 | null — Rain's ~3-level position; null for floor-agnostic nodes",
  "type": "string — the node's structural identity at its floor (e.g. 'character', 'relationship', 'evidence')",
  "functions": [
    {
      "function_type": "string — which functional/trait node this is (e.g. 'rule', 'override', 'evidence_marker', 'comedy_tag')",
      "instance_name": "string — only needed if this function_type can attach more than once to the same node",
      "payload": { }
    }
  ],
  "payload": { }
}
```

- `floor` + `type` + top-level `payload` is essentially what the existing portable envelope (`schema_version`/`id`/`type`/`origin_app`/`provenance`/`evidence_links`/`payload`) already does — this draft doesn't replace that shape, it proposes making it the **actual internal shape** every app uses, not just the wrapper used when data crosses a boundary. If that direction holds up, the earlier boundary docs get simpler, not obsolete: `evidence_links`, the dirty-propagation proposal, and the `action_type` proposal-vs-mutation rule all still work unchanged, since none of them care what shape lives inside a node — they only care about `id` and the links between ids.
- `functions[]` is the open part — the actual catalog of function types (what a "rule" node does vs. an "evidence marker" vs. whatever else Rain sketches) isn't defined here on purpose. That list is exactly the "haven't finished describing all the features yet" part.

## 4. What's explicitly open

- The real catalog of function/trait types — waits on Rain's sketches.
- Whether all four apps actually share the same ~3 floors, or whether e.g. Mining App (which mostly produces flat evidence, not a nested graph) only ever populates `floor: null` nodes, while Eclipse is the only app that really uses all three floors.
- Single-apply vs. multiple-apply per function type.
- Whether a function node behaves identically regardless of which floor it's attached to, or whether some functions are only meaningful at specific floors (this is the one place the "any floor" idea might need a guardrail — worth testing against real examples once sketches exist).
- How this reshapes (or doesn't) the two existing boundary docs — deliberately not rewritten yet, since that would be locking decisions ahead of the sketches this whole doc says to wait for.

## 5. Sources consulted

- USD typed ("IsA") vs. API ("has a") schemas, single-apply vs. multiple-apply: [USD Terms and Concepts](https://openusd.org/release/glossary.html), [Generating New Schema Classes](https://openusd.org/dev/tut_generating_new_schema.html), [OpenUSD-plugin-samples README](https://github.com/NVIDIA-Omniverse/OpenUSD-plugin-samples/blob/main/src/usd-plugins/README.md)
- Shared Database / Shared Schema integration pattern and its trade-offs: [Enterprise Integration Patterns — Shared Database](https://www.enterpriseintegrationpatterns.com/patterns/messaging/SharedDataBaseIntegration.html)

# Extraction-to-Behavior Prior Art Dossier

**Status: brainstorm material, same status as everything else in this package — nothing here should be built against.** This is a compiled reference of outside ideas relevant to one specific problem: how does raw text (what Mining App reads) turn into structured, typed nodes and behavior (what Eclipse/Composer/Fiction Engine consume)? It draws on two unrelated bodies of prior art — narrative-processor products that already do text→structured-fact extraction, and node-graph systems (Houdini, Blender, Unreal) that have spent 15+ years solving "how do you type and compose behavior in a graph." Cross-referenced against `Cross-App_Unified_Node_Schema_DRAFT.md`; doesn't replace it.

## 1. Text-extraction prior art — what already turns prose into structured facts

**Caveat, confirmed on review: none of the four tools below extract behavior or logic — only descriptive facts.** PlotLens, Novarrium, and Novelcrafter all stop at continuity-checking: traits, locations, timeline events, stored as inert data to display or diff against, never anything a system runs or evaluates. articy's Templates/Features come closer structurally (a runtime could query them), but even articy doesn't derive them from media — a human authors them by hand. None of these fill the "behavior" half of "turning text into behavior"; that problem is still open. What's useful here is narrower than it first looks: the *shape* of a fact (typed, cited, provenance-tracked), not a solved path to deriving logic or world-behavior from source text.

**PlotLens** — reads a manuscript and extracts typed entities (characters w/ aliases and traits, locations, timeline events, objects, factions, world rules), with **every extracted fact citing back to the exact sentence that established it** — click a fact, land on the chapter/page/line. The bible is re-derived from the manuscript rather than maintained in parallel, so it can't drift out of sync with the text.

**Novarrium** — describes its pipeline as three explicit layers: **extract** (scan text, identify typed facts — character/location/rule/timeline/relationship — store as discrete typed entries, not free paragraphs), **inject** (pull only the facts relevant to the current scene into context, weighted by importance), **verify** (compare newly generated text against the stored fact base, flag contradictions). Facts are stored with a source-chapter tag and a confidence score.

**Novelcrafter (Codex)** — adds a temporal dimension the other two don't: **Progressions** — a fact can be tied to a specific point in the story timeline, and a later Progression overwrites what's "current" without deleting the earlier one. A character's status isn't one static fact, it's a sequence of facts each scoped to when they became true.

**articy:draft (Templates/Features/Entities)** — not an extractor, but relevant as *the shape text would need to resolve into*: Entities (instances) draw their structure from Templates (type definitions), and Features (reusable property bundles) attach to Entities independent of their Template. This is the destination shape the extraction step above would be filling in.

## 2. Node-system ideas that map onto "text becomes behavior"

**Houdini — Network/Node recursion.** A Network (a container of nodes) is itself implemented as a Node — nesting isn't a special case, it's the same primitive containing itself. Directly answers an open question in the schema draft: floor-nesting doesn't need a separate parent/child mechanism bolted onto the node shape; a "floor 1" node can just be a node whose children happen to be floor-2 nodes, using the exact same node type machinery all the way down.

**Houdini — HDA (Digital Asset).** A subnet gets its internals hidden and only a defined interface (a fixed set of parameters) exposed, becoming a reusable, shareable, versioned node type. Useful model for the open "catalog of function types" question: a `function_type: "rule"` doesn't need external consumers to understand its internals — only its exposed `payload` shape, the same way an HDA only exposes its promoted parameters.

**Houdini — Parameters vs. Attributes vs. Channels.** Three distinct kinds of "data on a node," each with different semantics: a **Parameter** is author-set configuration (a dial someone turned); an **Attribute** is per-element data computed and carried downstream through the graph; a **Channel** is a value that varies over time and can drive a parameter. This three-way split is new and not yet in the schema draft — see §3 below, it's the most directly applicable idea here.

**Blender — Fields (static value vs. deferred computation).** Blender's node sockets distinguish plain **data** (a value, computed once) from a **field** — not a value but an instruction evaluated later, in the context of whatever it ends up attached to. Maps directly onto the open question already flagged for `functions[]`: does a given `function_type` carry a fixed `payload`, or a rule meant to be evaluated relative to whatever floor-node it's attached to? Blender makes that distinction visible in the type system rather than leaving it implicit — worth doing the same.

**Blender — Attribute Domain.** The same attribute can live at different structural levels (vertex/edge/face/instance) without being a different kind of thing. Confirms `floor` is a normal, well-precedented axis to keep as a first-class property rather than something to special-case.

**Unreal — Actor Components.** An Actor gains functionality by having Component objects attached to it — independent confirmation (a third one, after USD API-schemas and articy Features) that "type/identity is one axis, attachable behavior is a separate orthogonal axis" is a convergent, load-bearing pattern rather than an artifact of any one tool.

## 3. A specific application — Narrative Composer "Memory" as an HDA-shaped, exportable unit

**Review note (Rain's idea, captured as stated).** Some facts are narrative-special rather than identity-special: they belong to the plot, and the plot can retcon them — an established fact can later be overwritten (the worked example given: a starship existed, then it was destroyed; the "destroyed" state doesn't erase that it once existed, it supersedes it). Contrast this with something like a character's origin ("she was born in Metropolis") — that could be stored as static pre-history directly on the Character node, but the stated preference is to keep it out of the Character node and at the Narrative Composer level instead, specifically because plot-level facts change in ways identity-level facts shouldn't. Explicit locations matter to the story universe but the volatility belongs to the plot layer, not the identity layer.

This is a different concept from the `functions[]` floor-agnostic pattern in §2 — that pattern is about *behavior* attaching to a node regardless of floor. This is about *volatile plot facts* that shouldn't be owned by any single node's identity at all, only referenced/connected to it. Two pieces of prior art from this dossier map onto it directly:

- **PlotLens' extraction-with-citation** is a plausible way to *populate* this Memory from source material — it already separates "plot events" and "world rules" from character traits as distinct extraction categories, which is roughly the identity-fact / plot-fact split this idea needs.
- **Houdini's HDA pattern** is a plausible *storage and interchange shape* for a Memory entry: a self-contained unit with its internals hidden and only an interface exposed, exportable as its own file, and connectable wherever it's needed rather than duplicated into every node it touches. Applied here: a Memory entry isn't owned by the Character or World node it's about — it's authored/updated independently, exported as its own portable file, and wired into the Narrative Composer graph on demand.

## 4. Synthesis — what this suggests for Mining App's extraction step specifically

Combining the extraction-pipeline prior art (§1) with the node-system typing ideas (§2) suggests a mined fact isn't just "text → one node." Each extracted fact plausibly needs several independent classifications, not currently distinguished in the schema draft:

- **Parameter vs. Attribute vs. Channel** (Houdini): is this fact something an author/character *stated as true* (parameter-like — a rule, a name, a declared trait), something *derived/computed* from other nodes (attribute-like — e.g. a relationship inferred from co-occurrence), or something that *changes across the timeline* (channel-like — a status, a relationship state, anything Novelcrafter's Progressions would track)? These probably want different storage/versioning treatment even inside the same `functions[]` array.
- **Static payload vs. field/rule** (Blender): does the fact's `payload` just sit there, or does it need re-evaluating against whatever node it's attached to?
- **Typed floor-node vs. floor-agnostic function** (already in the draft): does this fact establish a new Level 1/2/3 entity, or attach a trait/rule to an existing one?
- **Provenance with location, not just source** (PlotLens): the boundary docs' envelope already carries `provenance`/`evidence_links`, but PlotLens' click-to-exact-sentence model is a step more precise than "which app/node produced this" — worth considering whether Mining App's extraction should carry a text-offset or line reference, not just a document-level source.

None of this is a proposal to add four new required fields to the schema — it's a sharper set of questions to test the schema sketch against once Mining App's actual feature list and Rain's sketches exist, per the existing draft's own stated posture.

## 5. What's explicitly open

- Whether "Parameter / Attribute / Channel" is a distinction worth encoding explicitly in the schema, or whether it's implicitly handled by existing fields (`function_type`, `floor`, the dirty-propagation proposal) and doesn't need new structure.
- Whether Mining App's extraction should track source location at sentence/line granularity (PlotLens-style) or stay at the document/chapter granularity the boundary docs already use.
- Whether Novelcrafter's Progressions model (fact-versions scoped to a timeline point, non-destructive) is worth adopting for anything beyond what the dirty-propagation proposal already covers — open question, not a recommendation.
- The Character Mining / World Mining split (noted in prior review) intersects this: World Mining facts skew toward Parameter/static (rules, setting facts); Character Mining facts skew toward Channel/Progression (status and relationships that change over time). Worth testing once sketches exist, not assumed.
- Whether "Memory" (§3) needs its own top-level shape distinct from `functions[]`/floor nodes, given it's volatile and plot-scoped rather than identity-scoped or behavior-scoped — or whether it can reuse the existing envelope with `floor: null` and a dedicated `function_type: "memory"`.
- How a Memory entry references what it's "about" (a location, a character's history) without being owned by that node — could reuse `evidence_links`, could need a new reference/link type of its own.
- What "supersede without erasing" (the Enterprise-D example) actually requires structurally — this sounds related to the dirty-propagation proposal already in the boundary docs, but hasn't been checked against it yet.

## 6. Sources consulted

- PlotLens: [Story Bible Software That Builds Itself](https://plotlens.ai/solutions/story-bible-software/)
- Novarrium: [Best AI Novel Writing Tool 2026](https://novarrium.com/blog/best-ai-writing-tool-novels-2026), [AI Story Bibles Are Useless — Here's What Actually Works](https://novarrium.com/blog/ai-story-bible-structured-memory)
- Novelcrafter Codex: [novelcrafter.com/features/codex](https://www.novelcrafter.com/features/codex)
- articy:draft: [articy.com](https://www.articy.com/en/), [How articy:draft X Helps Developers Streamline Narrative Integration](https://www.articy.com/en/how-articydraft-x-helps-developers-streamline-narrative-integration/), field notes at [dark-acre.com](https://dark-acre.com/posts/gamedev/notes/articy.html)
- Houdini: [HDK Architectural Overview](https://www.sidefx.com/docs/hdk/_h_d_k__op_basics__architecture.html), [Understanding Houdini Nodes](https://www.artivoxa.com/understanding-houdini-nodes-for-practical-3d-workflows/), [The Power of VOPs](https://www.artivoxa.com/the-power-of-vops-a-visual-guide-to-houdinis-node-system/)
- Blender: [Attributes and Fields — Blender Developers Blog](https://code.blender.org/2021/08/attributes-and-fields/), [Fields — Blender Manual](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/fields.html)
- Unreal Engine: [Anatomy of a Blueprint](https://dev.epicgames.com/documentation/unreal-engine/anatomy-of-a-blueprint-in-unreal-engine), [Tips for Blueprint Organization](https://techarthub.com/tips-for-blueprint-organization-in-unreal-engine/)

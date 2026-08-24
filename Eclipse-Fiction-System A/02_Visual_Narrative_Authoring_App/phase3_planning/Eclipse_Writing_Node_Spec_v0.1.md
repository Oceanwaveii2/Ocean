# Eclipse — Writing Node Spec (v0.1 draft)

**Status:** Discussion draft, not yet locked. No Illustrator sketch exists yet — this is a starting point for that sketch.

**Corrections & context (2026-08-18):**
- The artboard this spec references is now in-package alongside this doc: `Eclipse_Writing_Node_Pipeline_Artboard.png` (hand-drawn pipeline sketch, Rain).
- **"Visual Composer AI" on the artboard is the Narrative Composer** — same app, wrong name on the sketch (Rain, 2026-08-18). All references below updated.
- "RELATIONSHIP VARIANT" vocabulary below has been updated to the Phase 2 ruling: it's retired as a standalone type and lives as Relationship Node's branching variants.

## Position in the pipeline

Per the artboard diagram (`Eclipse_Writing_Node_Pipeline_Artboard.png`), the Writing node sits **downstream** of the Character relationship data nodes and World Nodes. It is the *last* processing step before output branches to:

- **Fiction Engine** (full prose)
- **Narrative Composer** (image-gen prompting — labeled "Visual Composer AI" on the artboard)

Both consumers pull from the same underlying resolved evidence, but likely need differently-formatted text (see "Dual-Output Formatting" below).

**Processing order, clarified:** Character + World nodes are "baked" — i.e. fully resolved to a processed JSON state — *first*. The Writing node then takes that already-baked JSON and applies a separate layer on top: global writing rules and style rules (the anti-AI-ism pass, informed by Sudowrite-derived ideas). Writing style is treated as a **separate construct from data capture** — it is not part of how evidence gets mined or how character/world data gets resolved. The one exception: if a *particular way of writing* is found to capture certain evidence more accurately, that's a data-capture concern that would live upstream, not in this node.

**Relationship Node, clarified** *(vocabulary updated 2026-08-18: "RELATIONSHIP VARIANT" was retired as a standalone type in Phase 2 and folded into Relationship Node's branching variants)*: the Relationship node is about relating data from one transcript's character to a *different* transcript's character — cross-character trait merging — not just multiple evidence nodes describing the same character. Example: Beth's transcript data + Rainee's transcript data converge into a hybrid character with a trait swapped in from Beth's source (e.g. horse ears/tail replacing Rainee's usual fox ears/tail). This is distinct from the Writing node entirely — the relationship resolution produces new *character* data; the Writing node only touches how already-resolved data gets rendered into prose.

## Core design constraint: evidence-grounded, not free-invented

Sudowrite's Describe tool free-generates sensory detail on demand. That model breaks Eclipse's premise — everything in the system is supposed to be traceable back to mined evidence. A Writing node that invents smells, textures, or reactions that were never in the source material is fabricating canon, not polishing prose.

So sensory/detail generation splits into two tiers, and they must never be treated as equivalent:

### Grounded sensory
Only surfaces when mined evidence actually contains it:
- A line of dialogue that states it ("you smell like sulfur")
- A described reaction in the source text
- A visual cue tagged during mining

The Writing node pulls this in as-is or lightly rewords it for flow. Fully traceable back to a source evidence node.

### Inferred / embellishment
Reasonable extrapolation from established scene context with **no direct evidence** behind it (e.g., a grimy industrial world probably smells like smoke/oil, even though no source line ever said so).

- Off by default
- Toggle-gated, per sense (sight/sound/taste/touch/smell), same shape as the Sudowrite Describe toggle bank but with an evidence flag attached to each
- Visually flagged in the node graph as "unsourced" so invented lines can be audited later and distinguished from traceable ones

This mirrors the existing Level 3 evidence-node → RELATIONSHIP VARIANT structure: sensory detail is just another evidence type that either exists or doesn't, rather than a free knob.

### Mining-side limitation: touch is the weakest sense to extract

Sight and sound are the two senses the Mining App can realistically detect at scale — they're directly present in the source (frames, audio, subtitles/dialogue). Smell and taste almost never have direct evidence either, and mostly only surface through dialogue callouts ("ew, you smell like sulfur").

**Touch is the hardest of all** to mine automatically. Unless a character states a touch sensation out loud, or there's a visible physical-contact cue tagged during frame extraction (a hand on a shoulder, a punch connecting), there's usually nothing in a mined dataset that maps to "touch" as a distinct evidence category — most action/comedy source material just doesn't verbalize or visually emphasize it.

This is genre-dependent, though: in romance-heavy source material, touch is often *the* load-bearing sense (lingering hand contact, embraces, the weight of proximity), and would show up much more reliably in dialogue, blocking descriptions, and framing choices (close-ups on hands/faces). So touch-evidence density should be expected to vary hugely by source genre, and the Writing node shouldn't assume a flat/equal availability of evidence across all five senses — some projects may only ever populate 2 of the 5 sense categories with grounded evidence, and that's expected, not a mining failure.

## Proposed feature set

| Feature | Description |
|---|---|
| **Grounded sensory pull** | Sight/sound/taste/touch/smell, each gated by evidence presence per the tier split above |
| **Voice/tone consistency** | Checks output against each character's locked voice profile — e.g. the crude/deadpan banter rhythm seen in the "Burp Attack in Quartz Quadrant" sample is a voice fingerprint that should be locked per-character and checked against |
| **Anti-AI-tell pass** | Sentence-length variance, strip stock AI transition words ("Moreover," "Little did she know"), avoid over-neat/stacked metaphors |
| **Register/humor calibration** | Matches joke type to source material (crude physical humor vs. wit vs. deadpan) instead of defaulting to one generic "funny AI voice" |
| **Dual-output formatting** | See below |

## Dual-output formatting (open question)

Since output branches to two different consumers, the Writing node may need to decide whether the de-robotify pass:

- **(a)** Runs once, producing one shared prose output both consumers pull from, or
- **(b)** Produces two tuned variants:
  - Fiction Engine: full voicey prose
  - Narrative Composer (image-gen branch): concrete, filmable/describable language optimized for image-gen prompting (less voice-dependent, more literal)

**Not yet decided** — worth resolving before this goes into an Illustrator sketch, since it affects whether this is one node with two output ports or two sub-passes.

## Open questions / not yet locked

- Exact toggle UI shape for the evidence-gated sensory bank
- Where the "locked voice profile" per character actually lives (new node type? attribute on existing Character/Persona node?)
- Whether the anti-AI-tell pass is a fixed ruleset or itself configurable per project
- Single vs. dual output port resolution (above)


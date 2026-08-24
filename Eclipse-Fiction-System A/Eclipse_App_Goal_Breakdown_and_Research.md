# Eclipse App — Goal Breakdown & Prior-Art Research

**Status:** decision (goal statement, per `Eclipse_System_Architecture_CANON.md`) + research
**Date:** 2026-08-21
**Scope:** Full-system goal statement, per-app purposes, data philosophy, prior-art scan, and a problems/solutions register.
**Inputs:** Eclipse design notes (cleaned), the Cancer Farts capture dossier (`Cancer_Farts_Visual_Script.pdf` + capture HTML), fiction engine v0.2 work, character-transplant discussions (2026-08-20/21), and web research on comparable systems.

---

## 1. The Goal, Stated Plainly

Eclipse is a fiction-authoring system that **interprets media into text** — video, visual evidence, audio, and transcripts are converted to text captures at the mining boundary — and stores those captures as **densely annotated, deterministic structured data** (script / prose / archetype / JSON passes with provenance tiers), then **generates character-faithful stories** whose voice matches the source genre — with human curation gating automation, an archetype layer enabling cross-character/cross-franchise interaction, and a final "Muse" polish layer that strips robotic AI-isms.

**Architecture note — text as the canonical format:** visual and audio evidence never flows downstream as pixels or waveforms. The vision model is used *once*, at the interpretation step (with direction/filtering per channel), and everything after — the knowledge graph, the fiction engine, the timeline, the Muse pass — operates on text. This concentrates all visual-model weakness (stylized anime, temporal reasoning, sanitization) into a single boundary where per-channel checklists, register overrides, and human curation gates apply; downstream layers are model-agnostic and LLM-native. The provenance tiers encode exactly this: V (attested visual) and R (reconstructed audio) record *what the text claim was interpreted from*.

**Core stance:** we do not believe AI is intelligent. We fake the intelligence of a character through carefully curated data supported by traditional procedural processing, combined with an LLM.

```
INGEST (video/visual/audio) → INTERPRET TO TEXT (per-channel, directed, filtered) → BEAT ALIGNMENT
→ MULTI-PASS ANNOTATION (script / prose / archetype / JSON)
→ CURATION GATE → KNOWLEDGE GRAPH (characters · relationships · traits · gags · provenance tiers — all text)
→ GENERATION (modes & registers) → MUSE VOICE PASS → HUMAN A/B FEEDBACK LOOP
```

---

## 2. The Data Question: Variation vs. Amount

**Question on the table:** what matters most about AI data — the variation or the amount?

**Answer (and it's the system's founding insight):** neither alone. **Coverage-weighted variation beats raw volume.** A thousand scenes of a character being angry adds volume, not coverage; ten scenes spanning comedy, grief, embarrassment, and triumph add coverage. Volume is only valuable when each unit adds a *new* behavioral cell to the grid.

- Stewie (hundreds of episodes, full emotional range) yields a flexible model because of **range**, not hours.
- Jillian (a few Season 5 episodes) is sparse — but a 35-second clip densely captured across five channels (dialogue, SFX tempo, expression arc, non-vocal reaction, straight-man silence) can outperform hours of shallow transcript.
- **The deterministic relationships between data points matter more than volume.** Ten traits wired with typed edges (triggers, suppresses, contrasts-with) generate more faithful behavior than a thousand floating descriptions.
- Corollary: mine in increasingly **smaller fragments**. Micro-clips are value-dense if extraction is multi-channel; cross-clip pattern stitching compounds confidence on each micro-trait.

**The expansion law (Rain, 2026-08-21 — "making a novel out of a mundane clip"):** beyond mining (extract what's there) and generation (invent new scenes) there is a third operation: **deliberate data expansion by authorship** — manually supplied description passes (e.g., what she looks like in the scene, in any register) plus AI passes grown from the clip, artificially expanding a very mundane 37-second fragment into novel-scale text. Demonstrated by the Cancer Farts set: one clip now carries capture table, tempo chart, archetype grammar, script pass, and two beauty generations (v3 + Rain's v4), each joinable to the same timecodes. **The guard, reframed per Rain (2026-08-21): this is a personal creative sandbox — creating characters and modifying behavior is the point, not a violation; invention is always allowed. The guard is traceability, not purity:** the failure mode is not making things up (everything is made up) but *lost trace* — when expanded text can no longer be distinguished from the model’s averaged prior, the character dilutes back to flat. Rationale: an LLM asked to “write a story” fetches the Wikipedia-grade “basic idea” then regresses to the centroid of its probability database — the average of every similar character — which is dilution; sanitized/corporate training averages again over what is permitted, flattening further (master essayist, terrible organic-fiction character). Rich media patterns with traceable expression pull the character OFF that centroid. Strict-mining form of the guard retained below for the evidence-ledger case: the evidence ledger stays tiny and attested (V/C/R tiers over the source fragment) while the expression corpus grows without limit (all passes, all registers, human-edited). The corpus conditions *how she is written* (voice, texture, register); the ledger controls *what she does* (behavior). Expanded prose must never be re-mined as if it were source — that is generation laundering (evidence incest: the system's own decoration fed back as canon, compounding hallucination). Provenance rule: expansions inherit D-tier by default except where they restate attested facts; they live beside the fragment in the mini cognition node's expression corpus, not in its witness ledger. Why mundane clips especially reward this: the mundane is where continuity texture lives (performance thesis: fiction elides it, so it must be manufactured) — expansion is how the "inner life never captured on film" gets its raw material.

**The censored-sample thesis (Rain, 2026-08-21):** professionally produced fiction is an *artificially limited* sample of human behavior space. The filter chain — capital risk, broadest-audience targeting, religion, regulation, cancellation economics (TOS was cancelled *while doing well*) — means what survives to screen is not the truest or most common, only the least risky. The real world contains vastly more behavioral/archetype information than all professional media combined. **Empirical census (Rain's survey):** fictional protagonists with the BBL-class body number ~2 — one badly written one-off where the transformation *reverses at the end*, and Aunt Fanny (*Robots*) — permitted only because she's a robot. For actual human beings with that body: **social media, reality TV, rap videos, and nothing else.** Two consequences: (1) *the reset trope is the censor's fingerprint* — transformation episodes that restore the status quo are market risk-avoidance written into plot grammar; mining fiction without accounting for this bakes the censor's grammar into characters (this engine deliberately mines against that grain: transformations persist); (2) *censored classes live in the unfiltered channels* — Chinese TV regulation pushes such classes entirely onto social media, which is why the CN registry's folk-source policy (Xiaohongshu manual survey) is not a workaround but the only place that data exists. **Source-bias rule, revised by the performance thesis (Rain, 2026-08-21):** *all characters in all media are performances* — Thor's bathroom trip exists but is elided unless story purpose demands it (narrative elision); a fanservice character is presented to the camera because it's hot, it sells toys, or the creator loves her (CLAMP's leanings as authorial bias). The **only structural difference** between a fictional character and a social-media person is **camera awareness**: the fictional character doesn't know the camera exists (unless the show is meta); the social-media performer does, and performs to it. Consequences: (1) "self-presentation bias" is not a contaminant to correct — performance is the universal condition of recorded character; what varies is *who authors the performance* (creator/committee vs. the person themselves) and *what it's curated for* (story purpose/market vs. self-chosen presentation); (2) **`camera_awareness` becomes a mined character attribute on a spectrum** (unaware / situational / self-aware / meta-aware), recorded per character per scene — with a **translation rule for porting**: social-mined characters entering fiction must have their audience-awareness converted into a diegetic trait (charisma, bravado, working-a-room) rather than dropped or left camera-breaking; (3) fiction's narrative elision means fiction-mined codexes are *pre-curated for drama* (only story-purposeful behavior recorded), while social-mined codexes contain mundane continuity — which is why cross-source stitching fills the elided cells: the BBL subject's "entire inner life" includes exactly the mundane material fiction would have cut. Cross-bias triangulation stands, redefined: a trait witnessed under *different authorship* (creator-curated and self-curated) is stronger than one witnessed repeatedly under a single author. And for such characters, the inner life fiction never captured must still be *generated*: the fiction engine is where it can first exist.

**The fidelity-as-envelope thesis (Rain, 2026-08-21):** there is no exact "truth" to a character at this degree. Even a writer who perfectly copied every rule of a show would produce an expression *similar to but different from* the original Jillian - creativity has natural variance even under perfect rule-recreation. Proof from the source itself: Rick across early/middle/late *Rick and Morty* consistently *sounds* like Rick (voice invariants hold) but the seasons don’t *feel* the same - perception drifts, production drifts, the character drifts inside its own show. (The v3.5 engine evidence already recorded this for Stewie: "early characterization emphasized megalomania and schemes; later became more eccentric, friendly, flamboyant.") Consequences: (1) **a character is a distribution, not a point** - model her as a family of expression clusters with era pins (early-Stewie and late-Stewie are both attested; era states, like transformation states but temporal/production-era); (2) **"in character" = inside the envelope**: recognizability + invariant floor held, not match-to-one-canonical-instance - natural variance is expected and desired, never scored as error; (3) **every renderer is a different hand** (original writers, new writers mid-show, Rain’s pass, the engine) - the hand is part of the output, so expression provenance tracks *whose* expression (source-era / Rain / engine), not just true/false.  **The bundle-of-contradictions definition + authorized expansion (Rain, 2026-08-21):** a character is "a bundle of contradictions tied together that repeat — which is the perception of consistency. If it changes too much, people say it is no longer the character." Consistency is not uniformity; it is a *recognizable recurring combination* whose members contradict each other (Jillian: sweet × shameless × ditzy × emotionally sincere) in stable proportions. The envelope walls are therefore "keep the bundle members and their ratios," not "be consistent." **Authorized expansion ("Super Jillian"):** a secondary character in the source has a *small cloud* — the show only ever expressed her inside one narrow function (girlfriend gag). When promoted to engine for another character (Noir) in a different series, the range must deliberately expand beyond the source cloud. The expanded character keeps the source’s hard walls (bundle members + proportions + invariants) but widens the interior (situations, competence, register). Schema consequence: character cards record (a) bundle members with relative weights, (b) which walls are load-bearing from the source, and (c) an **authorized_expansion note** (promoted-from-secondary; extrapolation beyond source situations is permitted via the projection tier) — so validation never rejects valid expanded behavior merely because canon never showed it.

Fidelity is the floor, not the ceiling. **The bounded-envelope formulation (Rain’s math version):** "Jillian is between 1 and 3. Anywhere in 1–3 there is an infinite number of potential Jillians that are still Jillian — but if you hit 6, it is no longer Jillian; the expression makes her unrecognizable. As long as we are in that cloud of infinite potential between 1 and 3, you get Jillian — or Jillian from a records point of view." The envelope is therefore **bounded infinity**: the invariants are the boundary (1 and 3); the interior is infinite valid expression; 6 is the out-of-character zone (the dumbassery/unrecognizable region). Engine consequence: validation is a boundary check ("is this output inside [1,3]?"), not a match score — the existing `invariants` field in character datasets is the boundary definition, and the dumbassery-guard checklist is the boundary detector. In practice the region is multi-dimensional (one axis per trait/invariant), with hard walls on invariants and soft walls (era/register drift) elsewhere.

**The depth-compensates-for-breadth law (Jillian clause):** some characters will *always* be sparse — Jillian's canon is a handful of Season 5 episodes and never grows. The compensation is **multispectrum scanning**: infer a personality layer independently on every channel (video/body-language, textual/dialogue, audio/SFX, speech/delivery — how she talks), so a wordless clip still testifies. Proven on the BBL case study (`minning evaluation project`, Case Study A): a silent ten-second clip (look toward someone off-camera, candidate nose-scrunch, hip movement, deliberate walk away, editorial wobble-squeak cue) yielded camera-awareness, public-presentation-as-communication, and visual-brand traits — recorded as *candidate interpretations with confidence*, not private-psychology facts. Then **cross-clip pattern stitching**: when the same micro-trait recurs across independent clips, it graduates from candidate to pattern, and the stitched web grows denser than any single source. Channel depth × clip count substitutes for episode count. This is also why the **relationship-web visual display** (app 02's cognition graph) is a requirement, not a nicety: stitch clusters, archetype-class attachments, and orphan traits are only auditable when the web is visible (see `Role_Addressed_Behavior_Transfer.md` §8 and the cognition-web metrics in the canon §4).

---

## 3. Purpose of Each App

### 3.1 Mining App (01)
Turn source media (video, transcripts, images) into behavior datasets.
- **Direction & filtering:** decide what to track per channel (expression, gaze, SFX, touch, reaction-economy) — the "booty tracker" pattern: the operator tells the extractor what to look for.
- **Bias knob:** focus a scan on one character (e.g., bias toward Jillian in a Jillian scan) so the extractor mines *her* out of ensemble scenes.
- **De-sanitization:** default vision models are too corporate/medical for entertainment media. The mining app must override register — crude bodily humor, adult-animation lexicon, genre-accurate tone.
- **Multiple passes per fragment:** dialogue pass, literature/"beauty" pass, archetype pass — all grounded with provenance tiers.
- **Provenance tiers (V/C/R/D):** attested Visual, attested Caption, Reconstructed audio, authorial Decoration. D-tier never enters the canon graph.

### 3.2 Visual Authoring Board (02)
The editor: take multiple transcripts and **expand data**, then **set relationships** to expand a character beyond what the source contained. Connections between datasets create the "fake brain." Hosts the **Cognition Web Analysis** (graph metrics: edge-type distribution, centrality = the character's core, orphans = weakly grounded noise, hubs = caricature warning, complexity scoring).

### 3.3 Narrative Composer (03) + JSON Timeline
Organize multiple networks of compiled JSON data nodes and per-narrative outputs on a **timeline**; cross-reference for plot-logic holes.
- Plot holes grow with data volume; the fix is a **deterministic fact ledger** (location, body state, who-knows-what, promises) updated per scene, with LLM checks run **per scene against the ledger slice**, never over the whole corpus — small windows keep accuracy high.
- A hole = a ledger violation, listed mechanically, not "detected" by reading everything.

### 3.4 Fiction Engine (04)
Bind mined characters to story scaffolds. v0.2 shipped: data-driven character registry, per-scene coverage tiers (direct / adjacent / gap), three-tier hook selection (mined → archetype-inferred → projected core traits), provenance discipline (`mined | inferred | projected` + confidence), scene registers (comedy/drama/etc.) that re-express a fixed trait in a new context's register.

### 3.5 Writing Wrap ("Muse")
Intercept generated text and strip AI-isms so output reads like human, genre-appropriate media writing rather than "upstream" LLM prose. Word-level tells ("delve," "tapestry") *and* structural patterns both need treatment.

---

## 4. Worked Example — the Cancer Farts Clip (gold-anchor dataset)

Why this 35-second Family Guy clip is the model dataset:

| Channel | What was captured |
|---|---|
| Dialogue | Verbatim captions + cleaned line ("flatulence means my digestive system is working again!") |
| SFX tempo | Full onset chart: pfft → POOT → BRAAP ×3 → PRRRT+pfft doublet → staccato coda (intervals 0.67–2.14s, then ~0.5s spacing) — **rhythm as data** |
| Expression arc | sleepy → surprised → triumphant → revealed → strained → smug → self-amused |
| Non-vocal | Brian's unbroken deadpan = straight-man silence as first-class data; giggle layered *under* the fart tail |
| Norm enforcer | Off-screen patron button ("This is a nice hotel!") |
| Archetype | Straight Man / Uninhibited Joy / Off-screen Norm Enforcer + portable gag grammar: taboo-as-triumph → rhythmic escalation against stillness → outsider button |
| Filter demo | "tubic" logo and sticker overlays identified as non-diegetic and excluded — the filtering rule in action |

Key extrapolated traits (sparse-data overmining in action): shame-inversion (taboo reframed as medical triumph), rhythmic repetition with modulation, performing for a non-reacting audience and continuing anyway, external friction converting to delight.

Full dossier: `Cancer_Farts_Visual_Script.pdf` + capture HTML (beauty pass, deadpan pass, script pass, archetype pass, provenance annotations).

---

## 5. Prior-Art Research — What Exists, What's Close, What's Missing

### 5.1 Closest community prior art: SillyTavern character cards + lorebooks
The roleplay community's de-facto standard: structured character cards (description/personality/scenario always sent) plus **keyword-triggered lorebooks** injecting world knowledge on demand, plus memory/summary systems for long-session consistency; community work explores dynamically updated lorebooks for persistent state.
- **What they got right:** the card format proves structured persona data outperforms prose descriptions; keyword-triggered injection is a working retrieval model.
- **What they lack:** everything upstream (no mining — cards are hand-written), no provenance, no behavior channels beyond text, no archetype/relationship layer, no beat-function scaffolds.
- **Eclipse's delta:** cards are to Eclipse datasets what a sketch is to an anatomical model.

Sources: [SillyTavern character design docs](https://docs.sillytavern.app/usage/core-systems/characterdesign/), [card template guide](https://blog.mini-tavern.com/blog/sillytavern-character-card-template-the-ultimate-guide-to-formatting-and-best-pr-eec44c), [dynamic world-building discussion](https://github.com/SillyTavern/SillyTavern/discussions/3466).

### 5.2 Commercial character engines: Inworld, Ubisoft NEO NPCs, Xbox Narrative Graph
Inworld builds game NPCs with personality definitions, knowledge, relationships, emotion graphs and memory layers; GDC 2024 showed Ubisoft's NEO NPCs (situational awareness, dynamic reactions) and Xbox's Narrative Graph tool.
- **What they got right:** the commercial consensus that NPCs need a *structured cognitive layer* (goals, memory, relationships) separate from the LLM — exactly our "fake brain" thesis, validated with money.
- **What they lack:** they're built for *original* characters in *one* game world. No cross-franchise archetype porting, no mined-from-media fidelity, and heavy safety railings — the sanitized register problem again.

Sources: [Inworld](https://inworld.ai/), [LSVP analysis](https://lsvp.com/stories/inworld-ai-npcs-character-engine/), [GDC 2024 coverage](https://wccftech.com/inworld-ai-blows-up-at-gdc-2024-between-ubisofts-neo-npcs-xboxs-narrative-graph-tool-and-more/), [MDPI personalized NPC framework](https://www.mdpi.com/2673-2688/6/5/93).

### 5.3 Licensed fan-world narrative platforms: Hidden Door
Hidden Door (early access 2025) is "roleplay meets fan fiction": licensed fictional worlds, players create characters, generative AI narrates. Notably keeps content "legally distinct" from source — the opposite goal of Eclipse's mined fidelity, and a deliberate one: they can't legally reproduce character voice, which *is our product*.
- **Takeaway:** their licensing/revenue-sharing model is the map for what "publishing" an Eclipse-style dataset would legally require. For private use, this is not (yet) our problem — but it's the ceiling on ever shipping mined character data commercially.

Sources: [Variety launch coverage](https://variety.com/2025/gaming/news/hidden-door-ai-role-playing-fan-fiction-game-platform-1236488265/), [Forbes licensing model](https://www.forbes.com/sites/charliefink/2025/08/14/hidden-door-turns-fan-worlds-into-licensed-revenue-sharing-story-platforms/), [design review](https://ianbicking.org/blog/2025/08/hidden-door-design-review-llm-driven-game).

### 5.4 Story-generation research: Re3, Dramatron, DOME, DOC
The academic line on long-form coherence: Re3 (recursive reprompting + revision), Dramatron (hierarchical generation: logline → characters → scene summaries → script, DeepMind), DOME (dynamic hierarchical outlining + memory enhancement), DOC (coherency via detailed outlining + control).
- **What they got right:** hierarchy + memory is the consensus answer to long-story drift — structurally identical to our scaffold-beats + fact-ledger timeline design.
- **What they lack:** characters are *generated*, not *mined*. Nobody in this line asks "would this character actually do this?" against hundreds of hours of behavioral evidence. That's Eclipse's open lane.

Sources: [Re3 (Berkeley)](https://bcommons.berkeley.edu/coherent-and-consistent-long-story-generation), [Dramatron](https://sourceforge.net/projects/dramatron.mirror/), [DOME (arXiv)](https://arxiv.org/html/2412.13575v1), [survey list](https://github.com/Picrew/awesome-llm-story-generation), [character-centric generation (ACL 2025)](https://aclanthology.org/2025.findings-acl.82.pdf).

### 5.5 Persona-fidelity research: Character-LLM, PsyPlay
Character-LLM (EMNLP 2023) trains models to role-play specific figures (Beethoven, Cleopatra) using LLM-constructed training data from biographies/interviews; PsyPlay infuses explicit personality traits. Follow-up surveys cover role-playing language agents broadly.
- **What they got right:** proves "character = curated data + training/instruction" works; attribute-attribution from real experience traces is the same move as mining transcripts.
- **What they lack:** text-only, single-modality, no visual behavior channels, no provenance tiers, and fine-tuning per character is heavyweight vs. Eclipse's data-swappable approach.

Sources: [Character-LLM (arXiv)](https://arxiv.org/abs/2310.10158), [EMNLP page](https://aclanthology.org/2023.emnlp-main.814/), [PsyPlay](https://arxiv.org/html/2502.03821v1), [survey](https://www.semanticscholar.org/paper/7f575e1a8e4c465b31f8928ffd13ad48aa961789).

### 5.6 Video/multimodal mining: MM-Vid, Vid-LLM surveys, digital twins
Video-LLMs integrate vision+language+audio; MM-Vid (GPT-4V) does character identification across TV episodes; an IEEE TPAMI 2026 paper builds **interactive digital twin characters from TV-show dialogue videos** — the closest published thing to the mining app. Known limitations that directly hit us: no anime-specific benchmarks; stylized/non-photorealistic visuals challenge natural-image-pretrained models; long-video temporal reasoning is weak; models pattern-match rather than understand intent.
- **Implication:** confirms the design call to (a) mine in small fragments, (b) use per-channel checklists rather than open-ended "describe this video," (c) lean on human curation gates for exactly the channels the research says are weak.

Sources: [Vid-LLM survey](https://arxiv.org/html/2312.17432v5), [MM-Vid](https://multimodal-vid.github.io/), [digital twins from TV dialogue (TPAMI)](https://www.computer.org/csdl/journal/tp/2026/01/11143865/29yj5wiDMYg), [long-video limits](https://openreview.net/forum?id=OxKi02I29I), [animation script understanding (ACM)](https://dl.acm.org/doi/10.1145/3744464.3744483), [LLM understanding limits](https://pmc.ncbi.nlm.nih.gov/articles/PMC11370970/).

### 5.7a Improving LLM writing & character quality — the landscape (researched 2026-08-22)

**The decline is documented, not imagined.** RLHF measurably reduces output diversity vs plain fine-tuning (arXiv:2310.06452, ICLR 2024) - mode collapse toward safe average outputs; homogenization is quantified (Moon et al. 2025; "Artificial Hivemind," NeurIPS 2025) and is *worst in creative writing* among tested domains; LLMs show abnormally low uncertainty in creative text (trite, over-confident prose); newer reasoning-tuned models often score *worse* at writing than older ones (EQ-Bench Creative Writing). Mechanism: preference tuning rewards the highest-common-denominator; diversity is penalized. (Rain's observation that Chinese LLMs wrote better but are acquiring Western-model flatness fits: the flattening is recipe-driven [RLHF], not language-driven.)

**The four approaches others take:**
1. **Change the weights** - writing-preference alignment (AI-Slop to AI-Polish, arXiv:2504.07532: edit-based rewards on a 4,729-judgment Writing Quality benchmark), character fine-tunes (Character-LLM), vendor fiction models (Sudowrite Muse, NovelAI). Limit: the model stays the brain; averaging recurs at a better baseline.
2. **Change the context** - story bibles (Sudowrite), lorebooks/character cards (NovelAI/SillyTavern), few-shot style anchors, plan-then-write prompting (LessWrong fiction guides). Limit: consensus emerging that character consistency "was never a prompt-quality problem" - prompting alone degrades over long narratives.
3. **Change the selection** - best-of-N + reranking; automatic editing passes toward human-like text (arXiv:2409.14509, "Can AI writing be salvaged?").
4. **Change the workflow** - co-writing with human editing at the helm (the strongest results in practice; Sudowrite's own Describe/rewrite tools).

**Character.AI failure mode (Rain's Lina test):** one-paragraph persona + RLHF'd chat model + memory limits + safety flattening = thin impressions - the predicted failure of *description-based* personas with no behavioral distribution underneath. Nothing to be - just instructions to act like.

**Eclipse's position - a fifth approach:** none of the four change *where the character lives*. All keep it inside the model (weights) or inside the prompt (context). Eclipse externalizes it: deterministic mined data core, LLM reduced to interpreter/renderer, scene-sized provenance-controlled doses, boundary-check validation. The industry's "prompting isn't enough, so fine-tune" binary is sidestepped: the model doesn't need to *know* the character - it needs to be *handed* the character, with enforcement outside itself. ("Reduce the LLM," per Rain.) Closest existing pieces - retrieval augmentation, structured planning, reranking - exist separately; the mined-media spine + envelope validation is unoccupied territory.

### 5.7 AI-ism cleanup (Muse layer prior art)
Existing tools (community Claude skills, humanizer skills) tier the problem: frequency markers ("delve," "tapestry") vs. clarity edits ("in order to") vs. **structural patterns** — UMD research shows AI text is detectable structurally, not just lexically, so a real Muse pass must fix rhythm and sentence-shape, not just vocabulary.

Sources: [avoid-ai-writing skill](https://github.com/conorbronsdon/avoid-ai-writing), [Hermes humanizer](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/creative/creative-humanizer), [UMD study discussion](https://www.reddit.com/r/ClaudeAI/comments/1uwd8cb/i_read_the_umd_study_on_why_ai_text_is_detectable/).

---

## 6. Problems & Solutions Register

| # | Problem | Why it bites | Solution (design) |
|---|---|---|---|
| 1 | **Sanitized vision models** — default extractors won't describe crude/adult content accurately | Entertainment media is the target domain; refusal/mealy output corrupts the data layer | Register overrides + sanitize-exemption flags in the mining schema; per-rating lexicon allowances; few-shot anchors from gold clips |
| 2 | **Sparse characters** (Jillian: few episodes) | Character can't fill scenes; transplant goes silent | Overmining (archetype × SFX composites, provenance=inferred) + trait projection into scene registers (engine v0.2, shipped) |
| 3 | **Cartoon gag → text** (fart tempo vs. deadpan) | The joke lives in rhythm and non-reaction, which prose loses | SFX onset charts as data; sentence-length cadence carries rhythm; silence as first-class channel; script/literature dual modes |
| 4 | **Transcript protagonist bias** | Ensemble characters under-captured; reaction shots untranscribed | Character-bias knob per scan; explicit non-vocal channels (gaze, reaction, silence) |
| 5 | **Non-diegetic contamination** (logos, stickers, auto-captions) | Pollutes canon graph | Overlay filter pass at ingest; bracketed-uncertainty caption policy; provenance tiers V/C/R/D |
| 6 | **Plot holes grow with data volume** | More tracked facts = more contradiction surface | Deterministic fact ledger + per-scene LLM checks against ledger slice (never whole corpus); timeline violation listing |
| 7 | **Large-corpus LLM accuracy decay** | "Find holes in 300 pages" fails | Incremental checking; ledger as source of truth; LLM proposes, code verifies |
| 8 | **Robotic output register** ("upstream" AI prose) | Breaks genre voice | Muse wrap: lexical tells + structural rhythm fixes, genre-anchored few-shots |
| 9 | **Character drift out of identity** | LLM improvisation erodes the character over long output | Deterministic data as floor (traits, guardrails), provenance tiers; protected contracts + validation (engine v0.1/0.2) |
| 10 | **Contexts the data never covered** (comedy scene for a drama-mined character) | No mined hook matches → silence or generic filler | Coverage tiers + trait transfer: fixed trait, register-dial expression (engine v0.2) |
| 11 | **Anime/stylized visuals underperform** | Video-LLMs trained on natural images | Weakness is confined to the single interpretation boundary: fragment-size mining, per-genre expression taxonomies in the text-conversion prompts, human curation gate on interpreted text before it enters the graph |
| 12 | **Relationship porting across franchises** (Mallory↔Lana applied to Queen Alice↔Sally) | Explicit analogies break under pressure | Typed relationship edges + role-slot analogies; archetype layer portable, dialogue never copied |
| 13 | **Legal ceiling on publishing** | Mined character fidelity is the product; Hidden Door shows the licensed path only | Private-use now; if ever shipped, license-with-revenue-share model per Hidden Door precedent |
| 14 | **Manual curation doesn't scale** | Everything above leans on human gates | Automation for volume; humans curate gold-anchor clips (the Cancer Farts dossier = one); curation effort concentrated where confidence is low |

---

## 7. What the Research Says Is Possible (Verdict)

- **Nobody is doing mined-from-media character fidelity.** Every adjacent system either hand-writes personas (SillyTavern), generates characters (research line), licenses worlds but not voices (Hidden Door), or builds original NPCs (Inworld). The multimodal mining → deterministic dataset → LLM-bound pipeline is open territory. The TPAMI digital-twin paper is the nearest neighbor and is dialogue-video-only.
- **The architecture is validated piecemeal by others:** structured cognitive layers (Inworld/commercial), hierarchy+memory for coherence (Re3/Dramatron/DOME), curated data for persona fidelity (Character-LLM), keyword-triggered retrieval (SillyTavern lorebooks), structural de-AI-ification (Muse prior art). Eclipse's bet is assembling these under one data spine with provenance discipline.
- **The known-hard parts are exactly where we've put design work:** video-LLM weakness on stylized media and long temporal reasoning (→ fragment mining + curation gates), long-story drift (→ ledger timeline), sparse characters (→ overmining + projection).

## 8. Build Order (recommendation)

1. **Gold-clip schema** — formalize the Cancer Farts dossier structure as the canonical fragment format (channels, provenance tiers, overlay filter, archetype pass).
2. **Beat-aligned taggers** — vision-API passes with per-channel checklists and character-bias knobs.
3. **Relationship/archetype graph** — typed edges; cognition web metrics (centrality, orphans, complexity).
4. **Generators with register knobs** — fiction engine v0.2 is the seed; add Muse wrap.
5. **Timeline ledger** — fact state machine + per-scene checks in the Narrative Composer.
6. **Cross-franchise analogy porting** — role-slot relationship transfer, validated against the Mallory/Queen Alice scenario.

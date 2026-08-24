# Phase 3 — The Beth / Space Beth / Beth-Rainee Worked Example
**Captured 2026-08-17 · historical worked example/proposal — nothing here is built or locked.**

The clone-and-dominate language in this example is retained to preserve the
original discussion, but it is not a locked character or lineage architecture.
Current policy allows each derived character/configuration to be authored
independently; see `../../Documentation_Migration_and_Authority.md`.

## 1. What this document is

Rain has a complete, functional example of how the Narrative Composer is supposed to behave that predates this session's docs — it came up in conversation, was partially referenced by earlier AI sessions (a bare "Beth-derived" line survives in `04_Fiction_Engine/Fiction_Engine_Architecture_Map.html`), but was never written down in full. ChatGPT review passes also never captured it. This doc records it so it stops surviving only in chat history.

It matters because it's the clearest existing demonstration of the **layer split** this project is built around: some data belongs in the **character dataset** (Eclipse / Fiction Engine level), some belongs at the **narrative/joke level** (Narrative Composer), and the interesting behavior comes from the *difference between the two* — not from either one alone.

## 2. The scenario

A canon-episode insertion into Rick and Morty — "The Curvicksous Case of Bethjamin Button."

**Rainee in this continuity — "American Foxy Momma" — is a shapeshifter** trading technology with Rick from beyond the finite curve. Rick flakes on the deal and heads for Earth, leaving Rainee with the two Beths.

The scene that follows:

1. Beth and Space Beth interview Rainee about her people — is she one of Rick's girlfriends? Rainee flatly rejects the premise: she only likes women, and her species is (mostly) monogender into women.
2. The Beths ask to see her power: turn into Beth, see if she can hang with them.
3. Rainee shapeshifts. **In instance, she experiences Beth's personality and memories** — including the memory of sleeping with Jerry, which makes her cringe beyond comparison (she likes women). The resulting form — **Beth-Rainee** — reads as Beth with a red streak in her head and a big butt.
4. The Beths immediately notice: *"Did we always have a butt that big?"* — *"Her ass is as big as one of my horses."*
5. The dynamic plays out: Space Beth eggs Beth-Rainee into twerking (the Beths having a grand old time mocking her tail), the three of them end up together (consistent with the established Beth twin dynamic), and the verdict lands: *"You damn sure can hang with us."*
6. The rest of the episode then runs as canon — except there are **three** Beths who get turned into kids instead of two, and the two kid-Beths catch and de-age Beth-Rainee too.

Canon isn't rewritten; it's **extended by insertion**. The episode logic stays intact and one new dataset enters it, with knock-on effects flowing downstream through the existing plot.

## 3. Character-level data (Eclipse / Fiction Engine layer)

### Rainee — "American Foxy Momma" composition

Rainee's base dataset is itself a cross-source merge, exactly the Naga-style pattern from the project thesis:

| Source | Contribution | Notes |
|---|---|---|
| Rangiku (Bleach) | Core personality/demeanor | Curated; carries an explicit **override rule: lesbian** |
| BBL / reality-TV data (real-world) | Body data | Women with massive butts |
| Navia (Genshin Impact) | Merged traits | |
| Alice (Genshin Impact) | Merged traits | |
| Additional ear/tail data | Fox features | Distinct from personality data |
| Generic racial memory | Facts about her species she should know | Monogender-species knowledge lives here |

### Beth / Space Beth — deliberate canon expansion

The horse data is the key move. In canon, Beth's horse-surgery background is a background fact that rarely drives a story — so canon never invested much data in it. This project **expands it on purpose**: each Beth's dataset carries detailed horse knowledge *beyond* what the show ever depicts, on the reasoning that a real horse surgeon would have it even if the story never asks. This is the same argument as Naga: canon characters are flat where canon under-invested; depth is a function of invested data, and the system can invest more.

### Beth-Rainee — the merge, and the absorption rule

Beth-Rainee = Rainee + Beth, governed by an explicit rule in the rule system:

> **Rainee's shapeshift absorbs only physical appearance and an *impressionistic* memory/personality echo. The mimic's actual personality is generated from Rainee's own dataset — producing a distinct mimic, not a copy.**

Consequences in the example:

- She is **not** a horse surgeon. The Beths hold the full expanded horse dataset; Beth-Rainee carries only a weak impressionistic residue — effectively *a love of horses*, nothing technical.
- She experiences Beth's memories in-instance (the Jerry cringe), but that experience doesn't convert into Beth's competence.
- The physical read (red streak, big butt — the butt reading through Rainee's BBL-weighted data, not Beth's) is the appearance layer doing its job separately from the knowledge layer.

### The Rainee network — how transformation states are actually wired (Rain, 2026-08-17)

Rainee's transformation states are not variants tucked inside one node — they are **a group of character nodes linked together by relationship nodes**. Each form is its own character with its own sub-nodes, plus **shared sub-nodes** across forms (the things that stay Rainee regardless of shape). "It just a big network of nodes."

Two governing mechanisms:

- **Per-node on/off switch.** When a scene uses only one Rainee form, most of the network is switched off. An off form still supplies **basic analytical information**, but its **reactions don't fire and its relationships don't compute** unless its node is turned on.
- **Cook the group node.** Compiling the active group produces the JSON sent to the Narrative Composer. Same "cook" verb as the Houdini-style aesthetic already chosen for the UI, and the same lazy-compute philosophy as the dirty-tagging Recompute Scope mechanism proposed in the Fiction Engine → Composer boundary doc: only what's requested gets evaluated.

This doesn't conflict with the clone-and-dominate model (§5.5) — the data stacks live *inside* each character node; the network is how the forms relate to each other.

## 4. Where the joke lives — Composer level, not character level

This is the architectural point of the whole example.

The horse/big-butt joke does **not** get stored in the character editor. The reasoning:

- **The horse knowledge is already accounted for at the character level** — full strength in both Beths, weak impressionistic version in Beth-Rainee. That asymmetry is the joke's fuel.
- What's missing is *joke-format* data, and that belongs to the narrative, not the characters:
  - **A specific Narrative Composer node for "white girl big-butt jokes,"** wired to the Beths on the composer canvas. Grounded in real canon behavior — Rick and Morty already does rap jokes and big-butt jokes.
  - **A plausibility bridge:** a white girl of Beth's generation in 2026 plausibly took a twerking or pole class, listens to Cardi B. Canon Beth never shows this because she's never the center of the story — the detail is *likely-but-undepicted*, which is exactly the class of data that belongs at narrative level rather than being asserted into the character dataset.
  - **An evidence source: Speed (One Piece) transcript** — a woman who is half-horse. It's joke evidence that fits the dynamic: two characters with deep horse knowledge, one without.

The payoff is that the joke is **produced by the dynamic between datasets**, not stored anywhere as a joke: the Beths can reference horses with full authority, Beth-Rainee can only love them from the outside, the composer node supplies the big-butt joke format, and the Speed transcript supplies horse-girl precedent. The scene writes itself from the delta — Space Beth egging her into twerking, the tail mockery, the hang-with-us verdict.

**Rule of thumb this example establishes:** if data describes what a character *is and knows*, it lives in the character dataset. If data describes *how a scene gets to be funny* given the characters already in it, it lives on the composer canvas. Neither layer has to duplicate the other.

## 5. What this demonstrates architecturally

1. **Layer separation** — character data vs. narrative-level joke data, with the joke emerging from the gap between them (full horse dataset vs. impressionistic residue).
2. **Merge governance** — Beth-Rainee is a live case of the Phase 2 relationship-node rule system: override (Rangiku's lesbian rule), blend (body data), and conditional/absorption rules (impressionistic shapeshift), all on one composite.
3. **Deliberate canon expansion** — Beths' horse knowledge beyond canon, on the explicit "canon under-invested here" argument (the Naga thesis, applied).
4. **Per-episode insertion logic** — canon episode runs unchanged except for one added dataset, with effects propagating (three kid-Beths instead of two). This is the "set up narrative per episode" model: the episode is a rule context the inserted character reacts within.
5. **Static node per state — criterion and mechanism (resolved by Rain, then refined, 2026-08-17).** See §5.5 above — dramatic-and-consistent → clone-and-dominate.
6. **Clones diverge at Level 3 — arrangement is character.** The three Beths share ingredients (Beth data, kid data) but each stacks them differently, and Beth-Rainee adds a unique Jerry Filter node that reroutes the same input through Rainee-native material. Same data, different arrangement → different computed character. See "Post-wine-night reactions" and "The Jerry Filter" subsections above.
7. **Post-wine-night reactions as proof-of-concept.** One event (the twincest repeat + mention of Jerry), three structurally-determined reactions: guilty-naughty (Domestic), indifference (Space), visceral cringe via filter (Rainee). See reaction table above.
8. **Twincest memory amplification.** The same episode data carries amplified weight in Rainee's absorbed memory because her lesbian override makes it register as stronger and more vivid — the filter doesn't just suppress, it *reweights*. See Jerry Filter section above.
9. **Rainee's exact node notation preserved.** Character-level ASCII notation for all three Beths recorded verbatim — see "Rain's exact node notation" subsection above. Criterion: **if the personality change is drastic *and* consistent, you need a new character for it.** Kid-Beth, kid-Space-Beth, and kid-Beth-Rainee all pass that test — drastic shift, holds for the rest of the episode — same model as Luke pre-Jedi / post-Dagobah.

   The mechanism (Rain's refinement, same day) is **clone-and-dominate**, not data rewriting. Each character is a big node holding a *stack* of data variants, each with a dominance weight; a drastic state change is expressed by **cloning the whole stack and promoting the new state's data to dominant**. The episode's end state:

   | Node (big node → its data) | Stack contents | Dominance |
   |---|---|---|
   | Beth (domestic) | Beth data + kid data | kid Beth set to dominate after de-aging |
   | Space Beth | Beth data + Space Beth delta + kid data | Space Beth dominant over Beth base; kid dominant after de-aging |
   | Beth-Rainee | Rainee data + Beth impression + kid data | Rainee core with impressionistic Beth; kid dominates, but more Rainee survives |

   What the refinement establishes:
   - **Space Beth is modeled as what canon says she is — a clone:** Beth's full dataset plus the space-life delta, Space Beth set dominant over the Beth base. No separate from-scratch dataset.
   - **Dominated ≠ deleted.** The adult personality data stays in the node after de-aging — Rain's reading of the episode is that the Beths still *have* their full personalities and are simply overwhelmed by "the terror that is their kid self." The state change is a weight flip, not a replacement.
   - **Asymmetric retention — and Rainee-native biases.** Beth-Rainee's kid clone keeps more of her own character than the true Beths' clones — she was a "fake Beth" to begin with, so there's less Beth data in her stack for the kid state to overwhelm. But even she gets dominated. Crucially (Rain's refinement, same day): **her Beth is *more* unique than the real Beths', not less** — Rainee biases exist in her Beth that don't exist in the real Beths at all. Concrete case: the butt thing. Rainee has her own kid-history data — in one story, kid-Rainee turned herself into Shin Chan, butt-antics and all — so her kid version isn't just dominated-kid-Beth, it's kid-Beth filtered through Rainee's own established antics. The mimic is distinct by construction, not merely a weaker copy. It plays out in the scene: the kid Beths end up nicknaming her **"Horse Butt Beth"** — the persistent appearance trait (the big butt surviving the dominance flip, per below) plus the horse association becomes her identity among the three.
   - **Physical data survives the flip.** The big butt is appearance-layer data, not personality data, so it rides through de-aging untouched — **the horse-butt jokes still work on the kid nodes.**
   - Doc-side observation, flagged not decided: this sharpens the package's threshold between Eclipse's nesting levels — a state that *doesn't* meet the drastic-and-consistent bar stays a dominated variant inside the one node; one that does gets its own node as a cloned stack. The criterion decides *when* to clone; dominance weights express *what changed*.

### Post-wine-night reactions — the clones diverge in behavior

After the twincest repeat (see §2, steps 4–5), the three Beths react differently — this is the clone-arrangement producing different characters in real-time:

| Character | Reaction | Why |
|---|---|---|
| Domestic Beth | "We probably shouldn't mention to Jerry that we slept with each other again." — guilty, but feeling naughty about something bad | Beth data base, full Jerry marriage load, mom-guilt frame active. The twincest memory is standard weight for her. |
| Space Beth | Doesn't give a fuck. "Fuck Jerry." | Space-life delta dominant over Beth base; no-attachment reaction frame overrides guilt. Jerry is irrelevant. |
| Beth-Rainee | *Cringes. Shivers.* "Ugh — Jerry." | Everything Jerry passes through her **Jerry Filter** — a dedicated Level 3 routing node that rewrites Jerry-related content through transcripts of awful men, "made me want to become a lesbian" joke corpora, and men-bad-sex references. The cringe is structural, not a choice. |

### The Jerry Filter — Beth-Rainee's unique Level 3 node

This is the clearest case of clones diverging at Level 3. Both real Beths have full Jerry-relationship data. Beth-Rainee's stack processes the same material differently because a filter node sits between it and her behavioral output:

- **Everything Jerry-related routes through the filter** before it becomes a reaction.
- **Filter contents:** transcripts from shows about awful men, joke corpora about "men who made me want to become a lesbian," men-bad-sex references. These are Rainee-native data — they exist because Rainee is a lesbian, not because Beth is.
- **The twincest memory is weighted higher for Rainee than for the real Beths.** Because she's a lesbian, the twincest episode registers as stronger and more vivid in her absorbed Beth memory — it's what triggered the wine-night repeat in the first place. The other Beths have the same episode in their data, but it doesn't carry that amplified weight.
- **Result:** the same Jerry produces guilty-naughty in Domestic Beth, indifference in Space Beth, and visceral cringe in Beth-Rainee. Three different characters from the same ingredient, computed by arrangement.

### Rain's exact node notation (2026-08-17, for reference)

Three separate characters, each a big node with its own uniquely arranged stack:

```
CHARACTER 1 — Domestic Beth
  ( Domestic BETH   ( BETH DATA ) — ( KID data OFF ) )

CHARACTER 2 — Space Beth
  ( Space Beth ( Beth Data < SPACE BETH DATA DOMINATE ) — ( KID OFF ) )

CHARACTER 3 — Big Butt Beth-Rainee
  ( horse tail + ears / eidolissa fox person
    ( ( Rainee Data DOMINATE
      + Rainee FILTER of Beth memory / Space Beth
      + Beth Data
    ) ( Kid Beth DOMINATE / kid element of Rainee = Shin Chan ) )
```

"Each node structure is uniquely a different arrangement, so the JSON relationships compute differently, creating different characters — akin to how different Ricks are different people."

## 6. Open questions this raises (not resolved here)

- **~~How does a composer-level joke node serialize?~~ — RESOLVED (Rain, same day): Composer-only.** Take the source data, convert it to JSON, make a "Beth joke humor" node, and **attach it to the data port of the document**, linking it to the episode data. The test for what belongs here: minor, situational material that only applies because a big-booty Beth is in the conversation ("Becky — Beth — your butt is so big" territory). It never needs to cross an app boundary; evidence-backed *inputs* (e.g. the Speed transcript) still enter through the Mining App envelope like any other evidence.
- **~~Where does absorption strength live?~~ — RESOLVED (Rain, same day): fixed per character.** Rainee's impressionistic absorption depth is a set character rule — no per-transformation dial. A future shapeshifter could have a different fixed rule, but the dial isn't a per-transformation property. See §3 "The Rainee network" for how her states are actually wired.
- **~~Where does plausibility-bridge data live?~~ — RESOLVED (Rain, same day): plain author choice.** The twerking-class/Cardi-B reasoning is simply composer data Rain plugged into the Beths — no special rationale/provenance machinery. Doc note: the earlier lean toward mandatory rationale fields was considered and set aside; inspectability comes from the node being visible and attached on the canvas.
- **~~Clone-and-dominate trigger path?~~ — RESOLVED (Rain, same day): both apps, by character role.** Dominant characters who are mains live on the Visual Editor (Eclipse). The Composer can also create them, but it's usually used for minor characters — e.g. Snoop Dog showing up in one Rick and Morticia episode. No special trigger machinery; the author puts the node where it belongs.

## 7. Relationship to existing docs

- Uses the **portable envelope / provenance chain** vocabulary from `Phase3_Node_Schema_and_Mining-to-Eclipse_Boundary.md` and `Phase3_FictionEngine-to-Composer_Boundary_and_Bidirectional_Contract.md` — this example is arguably the first end-to-end *content* use of that machinery.
- The composer canvas behavior described (joke node wired to character nodes, scene blocks generated from the dynamic) is what `Narrative_Composer_SingleCanvas_MERGED.html` already models structurally — this example supplies the real content story for that UI.
- The merge-governance bullet in §5 is the Phase 2 Relationship-Node-with-branching-variants model (`START_HERE.md` §"Convergence Node — RETIRED") doing real work.
- The "Beth-derived" influence line in `04_Fiction_Engine/Fiction_Engine_Architecture_Map.html` is a partial ancestor of this example and should be read in its light.

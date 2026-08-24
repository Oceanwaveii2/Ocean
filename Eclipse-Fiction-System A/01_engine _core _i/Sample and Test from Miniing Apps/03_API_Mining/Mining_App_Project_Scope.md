# Mining App — Project Scope & Working Notes

*Consolidated from: Mining Test Engine v0.2 handoff package, deep research report, and scoping discussion (Akane Aikawa / Magic User's Club OP test case).*

---

## 1. What This Project Is

Four separate applications make up the larger architecture. This document concerns only the first.

| App | Responsibility |
|---|---|
| **Mining App** | Extract, analyze, align, and mine source evidence into datasets/JSON |
| Visual Narrative Relationships Graph | Connect independently mined datasets via authored relationships, hierarchy, extensions, overrides |
| Fiction Engine | Generate fiction from resolved inputs |
| Visual Narrative AI Composer | Work on a single story/fiction output after generation |

**Primary goal:** mine short audiovisual source material for dense, traceable evidence that can later become character behavior, vocal style, visual behavior, musical influence, and narrative-pattern data. The JSON output is a *compiled representation* of the mined data — not the mining process itself.

**Canonical evaluation case:** the BBL / Rangiku / Rainee study extends this goal from isolated character evidence to a mixed live-action, animation, post-metadata, generated-image, and concept-art library. The BBL social-media corpus is intentionally dominant for visible body form, camera awareness, movement, public presentation, clothing emphasis, and visual branding; Rangiku Matsumoto is an anime substrate and Bleach-world bridge. **Dedicated breast and posterior-region tracking is a high-priority feature, not an optional embellishment:** the system must preserve body-specific geometry, silhouette, motion, secondary motion, framing, clothing interaction, camera presentation, and narrative use. *(Clarified 2026-08-19: "tracking" is a processing goal, not a capture change — capture stays fully manual, §7; the tracking layers run as the Mining App's automated processing over the media the human captures. The research writeup of that processing side is `phase3_planning/Mining_Video_Behavior_Enhancement_Research.html` — research, not the current build plan.)* This Mining App document does not decide how those sources behave together. It records clean, provenance-aware evidence so the Visual Narrative Authoring App can later compose multi-node character, world, ensemble, and relationship structures. The canonical case study, preserved media library, psychosemantic-gap thesis, collection-scale process, and Montreal character/world example are documented in [`minning evaluation project/Minning Mark down Project.txt`](../../minning%20evaluation%20project/Minning%20Mark%20down%20Project.txt) and [`minning evaluation project/Minning_Evaluation_Documentation.html`](../../minning%20evaluation%20project/Minning_Evaluation_Documentation.html).

The case also confirms a central advantage of the system: human authorship is not automatically better than curated data. Human bias can prevent a source from being considered at all, while mining targets, source pools, transfer channels, provenance, and author review can be made explicit and adjusted. AI is not bias-free, but its search behavior is more operationally inspectable than an unexamined human reference pool.

**Test case:** Akane Aikawa (*Magic User's Club! / Mahou Tsukai Tai!*) — chosen specifically because her mined data is meant to drive the Fiction Engine's main character, not as a generic pipeline stress-test.

---

## 2. Current Build State (v0.2)

v0.2 is an **extraction harness** — it proves media can be opened, measured, sampled, aligned, and exported without the browser becoming the place the whole long-form AI pipeline lives. It does:

- local video loading
- lightweight audio measurements (RMS, peak, zero-crossing, envelope, onset-like activity, rough tempo)
- timestamped frame extraction (frames only — no semantic analysis)
- Japanese/English text layers
- aligned timeline
- JSON export
- HTML report export

It is **not yet** a behavior/character mining system, and the design intentionally keeps it that way for now.

---

## 3. Evidence Hierarchy (governing principle)

```
SIGNAL / MEASUREMENT
        ↓
OBSERVATION
        ↓
INFERENCE
        ↓
PATTERN
        ↓
AUTHOR-ACCEPTED RULE
```

Higher levels require provenance and confidence. A model inference must never silently become canonical character fact. This is the mechanism that keeps the project's authorial control over character truth intact — relevant given how much downstream work (Rainee, other framework docs) depends on deliberate, not automated, character canon.

*(Hierarchy mapping note, 2026-08-19: `phase3_planning/Mining_Video_Behavior_Enhancement_Research.html` uses a different 6-rung ladder — OBSERVATION → MEASURED EVENT → REPEATED EVENT → CONTEXTUALIZED EVENT → RECURRING MOTIF → CANDIDATE TENDENCY. That page is a research writeup of its proposed processing pipeline, not the project's evidence hierarchy. Where the two ladders describe the same concept at different granularity (OBSERVATION matches; PATTERN ≈ REPEATED EVENT + RECURRING MOTIF), they're compatible. The 5-rung hierarchy above (this §3) is the project's governing classification. The research page's ladder is a processing-stage breakdown that can nest inside it.)*

---

## 4. Feasibility Findings (from deep research report)

Ranked roughly by how solvable vs. genuinely unsolved each is:

1. **Full-file browser audio decoding doesn't scale.** `decodeAudioData()` decodes the whole file up front — fine for a ~90s OP, a real problem past that. Production direction: server-side/chunked decoding, not more browser JS.
2. **Japanese sung lyrics ≠ Japanese speech ASR.** Singing ASR is a materially different, harder problem (pitch variation, elongation, backing-music interference).
3. **Music analysis is probabilistic, not fact.** Tempo/instrumentation/harmony need confidence scores, never hard labels.
4. **Anime vision is a domain shift from photographic models.** Stylized faces confuse general vision models; even anime-tuned models confuse similar expression classes (e.g. Happy vs. Embarrassed).
5. **Cross-modal timestamp alignment is its own unsolved problem** — video/audio/ASR/lyric/shot clocks don't align just because they share a clock.
6. **No labeled data exists for "music → narrative influence" mapping specifically.** This is the real bottleneck — everything else above is expensive-but-known engineering; this one has no existing benchmark to lean on.
7. **Architecture must separate extraction from mining.** Raw measurements/evidence stay independent from inferred behavior, patterns, and tonal rules (see §3).

**Report's core argument:** don't scale by throwing more AI models into one HTML page. Stabilize a common evidence-worker contract first. *(The contract shape the report proposed has been superseded by the canonical capture entry defined in §7 and `Phase3_Gap_Resolutions.md` §4. The earlier per-line format and the §5 contract shape are both retired.)*

---

## 5. What the Akane Transcript Proved

A manually-compiled bilingual (JP original + EN dub) chronological transcript and vocal-performance comparison for Akane Aikawa was produced by hand for one episode. It already sits at the top of the evidence hierarchy:

- **Observation:** timestamped JP/EN dialogue, screams, nonverbal beats
- **Inference:** per-line vocal-quality description ("breathy, cooing head-voice," "icy, soft-spoken condescension")
- **Pattern:** a five-phase tonal arc (Casual Ease → Street Fight → Alien Attack → Spell Failure → Heroic Pivot)
- **Author-accepted rule:** the comparative JP-vs-EN performance matrix — a finished narrative claim

**Key implication:** the target output format is already proven achievable, because it was produced manually for a full episode. The open question isn't "can this data exist," it's "can it be produced faster than by hand every time" — and whether it needs to be.

**Key structural gap this revealed:** the JP/EN dub divergence is itself the mineable signal, not noise to average away. Voice performance directly shapes personality perception — the same lines land as a completely different character depending on delivery (e.g. the Marilyn-Monroe-archetype English performance vs. the higher-pitched Japanese original). The English adaptation may read as more appealing while the original Japanese performance can still encode character traits — quiet condescension, specific status dynamics — that get flattened or lost in translation. Capturing both as parallel JSON and relating them is how that trait divergence becomes usable data rather than just a personal listening preference. Any pipeline needs a *comparison* stage, which the current evidence-worker contract doesn't have a slot for yet.

---

## 6. Reference Images vs. Scene Evidence

A character reference image (e.g. an official trading card) plays a different role than an in-episode frame:

- **Reference image** → canonical design anchor: fixed traits (hair color/style, eye color, outfit), independent of any scene's lighting or emotional state. Used to validate what counts as "Akane," not to prove what she's doing.
- **Scene/video frame** → actual behavioral evidence: pose, expression, action at a specific timestamp, compared against the reference.

The anime-vision domain-shift problem (§4.4) applies to the second category, not the first — a reference image just needs to be looked at and described once; frame-by-frame character tracking across a moving scene is the unsolved half.

---

## 6a. Tooling Split: Text vs. Audio/Visual

For most **text-layer mining** — translation, transcript analysis, tonal/pattern inference, comparative JP/EN work like the Akane transcript — a cloud processing API (e.g. the Claude API) is one available tool, not a locally-run model. *(Superseded 2026-08-22: the **agent session is the primary mining runtime** — see `Agent_Runtime_Architecture.md`; API = unattended-only alternate.)* This is scalable for text (batch transcripts, batch translation review, batch pattern extraction) without the domain-shift or decoding problems that block audio/visual.

This sharpens the split in the project:

- **Text** → cloud API, largely solved, scales today
- **Images** → cloud API can read/describe a single supplied frame or reference image directly, but bulk automated frame *extraction + tracking across a scene* is still the unsolved vision problem (§4.4)
- **Audio** → no cloud text/vision API reaches this at all; stays fully manual (human listening + description) or requires a dedicated audio/ASR/MIR pipeline (§4.1–4.3), which remains out of scope for now

## 6b. Two Separate Capture Tracks

**Track 1 — Music video (OP) processing.** Broken into three streams:

- **A. Image/clip + subtitle** — screenshots or short clips paired with a caption
- **B. Lyric + timestamp** — JP lyric line aligned to its moment
- **C. Audio** — status uncertain; not yet established as useful on its own separate from what's already captured in A/B

**Track 2 — Visual character authoring dataset.** A separate, larger effort: a database that defines a character purely from dialogue transcripts across the media featuring them — not tied to the OP or to music at all. Full episodes containing the character get captured and clipped in their entirety; this is treated as a normal, non-blocking part of the workflow, not a bottleneck.

These two tracks feed the same downstream relationship-node engine (§8) but are captured differently and at different scope — Track 1 is short-form and stream-segmented, Track 2 is full-episode and transcript-driven.

---

## 7. Decision: Manual Capture, Automated Processing (v0.3 direction)

**The split:** the human captures (screenshots at chosen timestamps, dialogue lines by ear/judgment, vocal-delivery descriptions, any notes on the material). The Mining App processes those captures into structured JSON — alignment, dedupe, multi-pass analysis, and whatever automated extraction runs over the media the human supplied. Capture is manual; processing is automated. Nothing here changes that v0.2's lightweight automated pieces (frame extraction, JSON/HTML export) stay alongside manual capture — they're the processing side, not the capture side.

Human-curated evidence starts at "observation" with authorial confidence, not "unverified model inference pending review" — it skips several rungs of the evidence hierarchy legitimately, because a person selected and verified it directly.

**Canonical capture entry — this is THE format** *(defined in `Phase3_Gap_Resolutions.md` §4; restated here as the scope doc's official shape — the older §5 evidence-worker contract and the previous §7 per-line format are superseded by this):*

```json
{
  "id": "mining:beth:frag:0192",
  "type": "capture_entry",
  "origin_app": "mining_app",
  "identity_hash": "hash(source_ref + track + timecode_window)",
  "moment_key": "ram_s05e09|00:11:42-44",
  "provenance": { "source": "ram_s05e09", "source_class": "direct", "track": "en", "timecode": "00:11:42-44" },
  "motifs": ["horse_reference", "guilt_deflection"],
  "fragment":  { "raw": "Her ass is as big as one of my horses.", "speaker": "Beth", "delivery": "flat, half-audible, eyes still on the road" },
  "observation": "Deflection via absurd comparison; callbacks to horse identity under mockery",
  "inference":  "Horse knowledge surfaces socially as comic capital, not just expertise",
  "reaction_pair": { "initiation": "mining:beth:frag:0188", "shape": "dispreferred+account" }
}
```

- **Going-forward field set (2026-08-22 note):** captures are expected to grow `schema_version`, provenance tiers (V/C/R/D), era/language pins, and witness fields (`witness_count`, `witness_clip_ids`) — the shape named in `AGENTS.md` workflow A and the goal doc's field notes. The §7 example predates these; the formal reconciliation into one schema doc is still the open gap-scan item (P0 #4/#5).
- **`fragment`** is the only required sub-object — a 3-second clip or one screenshot is a complete entry
- **`fragment.delivery`** — the Akane record's per-line vocal-note column given a permanent home: manual vocal/performance description. This is the part of the acoustic dimension that text analysis can't reach but a listening human can — it's not a tooling gap, it's the human capture.
- **`observation` / `inference`** — the evidence hierarchy's second and third rungs (§3), captured in the same action as the fragment
- **`motifs[]`** — preserved verbatim so the relationship engine can group fragments across episodes into patterns
- **`identity_hash`** — capture-aware dedupe: `hash(source_media_id + track_id + timecode_window + subject_id + fragment_kind)`. Same moment, same track, same subject, and same fragment kind can deduplicate while provenance grows. JP and EN versions of the same moment never merge because the hash includes the track. Two speakers or two independently useful fragments at the same time remain distinct because subject/kind are included.
- **`moment_key`** — groups without merging: `source_media_id|timecode_window` with no track, subject, or fragment kind. JP line, EN line, and an audio-behavior note on the same 3 seconds share one `moment_key` so the comparison stage can pull the whole set while each entry remains independent.
- **`reaction_pair`** — points at the fragment this one answers, with its conversation-analysis shape (preferred/dispreferred, account, delay)
- **`negative_observation`** — an entry `type` sibling: subject, what's absent, scope of the search, why it matters
- **Source classes** — `direct | structural | archetypal | analogical | social_clip | paratext | derived` (the last three from the Phase 3 gap analysis)

**The capture/processing distinction:** the human chooses and prepares the source
material and captures the important moments; the Mining App is allowed to automate
processing over those captures and source media—frame extraction, alignment, JSON
conversion, pattern passes, and other analysis. Automation does not replace the
author's selection and preparation step. See
`phase3_planning/Mining_Video_Behavior_Enhancement_Research.html` for the processing
research; it is not a separate capture workflow.

---

## 8. Resolved Scoping Decisions

**Tonal-arc structure is not a Mining App template.** The five-phase arc from the Akane transcript is a one-time computed output, not a reusable schema baked into extraction. It's generated downstream by the Visual Narrative Relationships Graph's author node — a system that takes two JSON evidence sets and relates them into a visual node library. Pattern-level structure lives in the relationship layer, computed per-instance, not stored as a fixed mining-unit template.

**Author-accepted sign-off is not a bottleneck.** Manual capture (screenshot/lyric alignment, subtitle conversion, editing) is treated as the authoring step itself — an art form, not a review pass applied after the fact. The acceptance happens at creation time because a person is doing the capture directly.

**Clarified pipeline shape:**

```
Mining App
  → raw JSON evidence/data (per source, per character)

Visual Narrative Relationships Graph
  → internal engine of mapping logic, powered by an LLM/API *(superseded 2026-08-21: per the canon and authority-map AI-use row, the graph is deterministic; the LLM only proposes edges for human approval)*
  → takes two JSON evidence sets as input
  → decides what relates to what
  → outputs relationship data / visual node library

Fiction Engine
  → consumes resolved relationship output
```

The Mining App's job stops at producing clean, traceable JSON. All relationship logic — including things like the tonal-arc pattern — is a separate, LLM-powered engine operating on pairs (or sets) of already-mined JSON, not a capability the Mining App itself needs to have.

## 9. Resolved and Remaining Questions

**Resolved 2026-08-19:**

- **JP/EN comparison stage ownership:** comparison is a Relationship Node computation in the Visual Narrative Authoring App, not a Mining App extraction step. JP and EN stay as separate `capture_entry` items (separate `track_id` values, same `moment_key`), and Eclipse pulls them together through the `moment_key` group. Mining preserves the tracks; Eclipse compares them.
- **v0.3 scope:** manual capture + v0.2 automated pieces (frame extraction, JSON/HTML export). The automated pieces are the *processing* side (see §7), not the capture side. This was always the direction; §7 now states it explicitly.

**Still open:**

- How does Akane's mined data interface with the Fiction Engine's main character — is that relationship also computed via the same relationship-node engine, using Akane's JSON as one of the two input sets?

---

## 10. Mining for Niche/Minor Characters (No Dedicated Source)

Some characters have no canon episode or footage to mine at all — e.g. Rainee appearing only as a Family Guy–style cutaway gag transforming into a group of strippers. Track 2 (full-episode transcript capture) doesn't apply here; there's no episode. "Over-mining" in this case can't mean extracting more thoroughly from existing footage — there isn't enough footage. It means mining *around* the character instead of *from* them, using sources with clearly different confidence levels:

1. **Structural mining** — mine the referenced *format* itself (e.g. actual Family Guy cutaway gags: their rhythm, "random deploy" structure, how a reveal lands). This is evidence about the joke's shape, not the character.
2. **Archetypal mining** — mine the broader archetype the gag draws on (e.g. "stripper as a visual beat" across animation/music videos: framing, pacing, scoring). This builds a trait library the character is *assembled from*, not extracted from. Music videos are especially useful here — short-form, persona-compressed sources, generalizing the OP-mining instinct beyond Akane to any dense short-form source.
3. **Analogical mining** — cross-reference other transformation-gag/chaos-deploy characters who may share behavioral DNA. Must be explicitly tagged as borrowed/analogical, not observed, or it quietly becomes false canon.
4. **Direct authored material** — if the gag itself was authored (written/drawn), that scene *is* the primary source and canon, captured the same way as Track 2, just scoped to a single gag rather than a full episode.

**Schema implication:** evidence for characters like this needs a `source_type` field — `direct | structural | archetypal | analogical` — since these carry meaningfully different confidence and provenance than evidence pulled straight from dedicated screen time. The relationship-node engine's job shifts from "distill a persona from direct footage" to "assemble a persona from adjacent material" for this class of character.

## 11. Suggested Next Step

Test the manual capture format on a small slice (3–5 screenshot/lyric pairs from the OP) before generalizing it — confirms the entry shape is right before committing to it as the v0.3 standard.

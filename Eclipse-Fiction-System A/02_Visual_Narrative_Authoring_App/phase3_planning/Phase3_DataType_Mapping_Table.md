# Phase 3 — Mining App `type`/`source_type` → Eclipse `data_type` Mapping Table

**Status:** Planning/structure only — no build work. This is a mapping proposal,
not a canon or authority system. The human selects/prepares source material; the
Mining App processes it. Use the migration authority map when this table conflicts
with newer capture-entry or JP/EN track decisions.

**Scope of this doc:** resolve which Eclipse `data_type` enum value (§6 of `Eclipse_Architecture_and_Schema.html`) a given Mining App evidence entry should map to, and flag which cases don't land cleanly on one value.

---

## 1. The two enums, side by side

**Mining App vocabulary** (from `Mining_App_Project_Scope.md`):
- `type` — what kind of evidence entry it is. Only `audio_event` and `manual_capture` appear as concrete examples so far; the doc's Track 1/Track 2 structure and §11's mining modes imply more values will exist once v0.3 is built (see §3 below for candidates).
- `source_type` — `direct | structural | archetypal | analogical`. Describes *how* the evidence relates to the character, independent of what medium it's in.

**Eclipse `data_type` enum** (from `Eclipse_Architecture_and_Schema.html` §6):
`Transcript | Image | Audio | Video Analysis | Social/Cultural Reference | Character Reference | Relationship Evidence | General Writing Reference`

These two vocabularies aren't doing the same job. Mining App's `type` describes the **capture format**; `source_type` describes **evidential distance from the character**. Eclipse's `data_type` conflates both axes in a single enum — that's the root of why no clean 1:1 mapping exists yet, not a naming oversight.

## 2. Core mapping — capture format → data_type

This part is straightforward: Mining App entries that are `direct` evidence (real footage/transcript of the actual character) map on medium alone.

| Mining App `type` (candidate/observed) | Eclipse `data_type` | Notes |
|---|---|---|
| `manual_capture` (screenshot present) | **Image** | Matches the worked example in the boundary doc |
| `manual_capture` (`jp_lyric`/`translation` present, no screenshot) | **Transcript** | Lyric-as-dialogue reads as transcript, not image, once separated |
| Bilingual JP/EN dialogue transcript (Track 2, full-episode) | **Transcript** | The Akane transcript case — §5 of `Mining_App_Project_Scope.md` |
| `audio_event` | **Audio** | Direct pass-through |
| Frame extraction w/ vision-model description (if/when built) | **Video Analysis** | Not yet built per v0.2 scope — frame extraction exists, interpretation doesn't |
| Reference image / trading card (§6 of Mining scope doc) | **Character Reference** | Explicitly distinct from scene evidence in the Mining doc — canonical anchor, not behavioral evidence |
| Cross-source comparative note (e.g. JP-vs-EN performance matrix) | **Relationship Evidence** | This is itself the "comparison stage" flagged as an open question in Mining scope doc §9 — see §4 below |

## 3. Where `source_type` changes the mapping

This is the case the boundary doc flagged and didn't resolve: does `archetypal` vs. `direct` shift the mapping even when the medium is identical? **Yes, for two of the four values** — `source_type` isn't just metadata riding along on top of a medium-based `data_type`, it changes which `data_type` applies:

| `source_type` | Effect on mapping | Example |
|---|---|---|
| `direct` | No shift — use §2's medium-based mapping as-is | Akane's actual episode transcript → **Transcript** |
| `structural` | Shifts to **General Writing Reference**, regardless of original medium | A Family Guy cutaway gag's rhythm/reveal structure (§11 of Mining scope doc) — the *evidence* here is about narrative form, not the character, even though the source clip is video |
| `archetypal` | Shifts to **Social/Cultural Reference** | "Stripper as a visual beat" trait library drawn from music videos — the medium is video/audio, but the evidential content is a cross-media pattern, not this character's footage |
| `analogical` | Stays as the target `data_type` for whatever it's evidence *of*, but must carry a mandatory cross-reference flag — see §5 | A behaviorally-similar chaos-deploy character's transcript, borrowed as Relationship Evidence for Rainee |

**Rule of thumb:** `direct` evidence maps on medium (§2 table). `structural` and `archetypal` evidence maps on *what the evidence is evidence of*, not on the medium it happened to arrive in — a video source can still resolve to a non-video `data_type`. `analogical` is evidentially closest to `Relationship Evidence` almost by definition (it's borrowed from a different character entirely) but needs the flag in §5 so it doesn't quietly read as `direct` Relationship Evidence for the target character.

## 4. The comparison-stage question (Mining scope doc §9) — RESOLVED

`Mining_App_Project_Scope.md` §9 asked: does the JP/EN comparison happen inside Mining App extraction, or is JP-Akane-JSON vs. EN-Akane-JSON itself the "two sets" fed into Eclipse's relationship-node engine?

**Resolved: the latter.** JP and EN stay as two separate `Transcript` nodes in Mining App output — no fused/pre-compared entry. The comparison itself is a **relationship node in Eclipse**, connecting the two Transcript nodes and defining how they interact (this is the same Relationship Node mechanism from Phase 2, not a new construct). Mining App entries are never `Relationship Evidence` for this case; that classification only exists on Eclipse's side, produced by the connecting node.

**General rule this establishes (applies beyond JP/EN):** two evidence entries only need to be split into two separate nodes if you want them to be able to interact differently from each other — different weights, rules, or overrides applied independently. If they'd always be treated identically, there's no reason to split them; a single node/entry is fine. JP-vs-EN needs the split specifically because the whole point is capturing where they diverge (§5 of `Mining_App_Project_Scope.md` — the divergence *is* the mineable signal), which requires each side to be independently adjustable via its own node.

## 5. Cases that don't land on one `data_type` cleanly

- **`analogical` evidence** (§11.3 of Mining scope doc) — **RESOLVED.** Spec'd as `analogical_source_character`, a field living alongside `source_type` inside the Mining App's `payload` (see `Phase3_Node_Schema_and_Mining-to-Eclipse_Boundary.md` §3), required whenever `source_type == "analogical"` and absent otherwise:

  ```json
  "payload": {
    "source_type": "analogical",
    "analogical_source_character": {
      "character_id": "string — id of the character this evidence was actually observed on",
      "character_label": "string — human-readable name, for display without a lookup",
      "rationale": "string — short note on why this character was judged close enough to borrow from"
    }
  }
  ```

  This is deliberately a separate field from `evidence_links` — `evidence_links` points back at *raw evidence* (a screenshot, a transcript span), while `analogical_source_character` names *whose* evidence it actually is. Conflating the two was the source of the false-canon risk §11.3 warns about. Rule for Eclipse's side: when building a Relationship Evidence node from an envelope with `source_type == "analogical"`, the node must carry `analogical_source_character` forward into its own payload rather than dropping it — so it never silently reads as direct evidence for the target character, at any later point downstream (including inside the Fiction Engine).

- **Track 1, Stream C (raw audio, "status uncertain")** — **RESOLVED.** Applying the same divergence rule §4 already establishes for splitting nodes (split only if the pieces need to be independently adjustable): Stream C hasn't been shown to carry anything that diverges from what Streams A (image) and B (lyric) already capture, so by default it does **not** get its own `data_type`/node. It folds into the paired A/B `manual_capture` entry's `extracted_signals`, the same pattern used for the screenshot+lyric case below. If a future capture surfaces audio content that actually diverges from the lyric — e.g. vocal delivery that contradicts or ironizes the literal line — that divergence is the trigger to split Stream C out as its own **Audio** node, exactly the way JP/EN divergence triggered the two-Transcript-node split in §4. No mapping is invented for the "no divergence" default case beyond "it doesn't need one."
- **`manual_capture` entries with both a screenshot *and* lyric/translation fields populated** (the common case, per the worked example) — **RESOLVED.** Applying §4's general rule (split only if the pieces need to be independently adjustable) the same way §5's other two items just did: the decision point is capture time, not a downstream Eclipse computation. §2's first two mapping-table rows already cover both single-field shapes (`screenshot` only → **Image**, `jp_lyric`/`translation` only → **Transcript**) — nothing new needed there. What was open was which shape to *use*:
  - **Default — image and lyric agree/reinforce:** capture as one combined `manual_capture` entry, same as the boundary doc's worked example. Maps to one **Image** node, with the lyric fields folded into `evidence`/`extracted_signals`. No split.
  - **Divergent case — image and lyric say different or contradictory things** (the ironic-lyric-over-contradicting-visual scenario): the person capturing makes that judgment at capture time (same authorial-judgment principle §7 already establishes for manual capture generally) and records it as **two separate `manual_capture` entries** instead of one combined one — a screenshot-only entry (→ Image) and a lyric-only entry (→ Transcript) — cross-linked via `evidence_links` so a downstream reader still knows they're the same moment. This mirrors exactly how JP/EN divergence triggers two Transcript nodes in §4; the trigger here is the same kind of "this needs to be independently adjustable," just decided by the capturer rather than inferred later.
  No new field is needed — this is resolved by which entry shape gets used at capture time, not by anything Eclipse or the mapping layer has to detect.

## 6. Not covered here

- Whether Mining App's `type` enum gets formally locked down as part of v0.3 (still an open scope decision per Mining scope doc §9)
- Eclipse → Fiction Engine / Fiction Engine → Narrative Composer boundaries (separate deliverables, per `Phase3_Node_Schema_and_Mining-to-Eclipse_Boundary.md` §6)

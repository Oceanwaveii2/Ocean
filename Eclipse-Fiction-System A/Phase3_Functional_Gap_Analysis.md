# Phase 3 — Functional Gap Analysis (all four apps)

**Status: proposal/review history.** This document records candidate gaps raised
during earlier review. It is not an authority for clone lineage, canon decisions,
contradiction handling, or Composer reverse/recompute behavior. Use
`Documentation_Migration_and_Authority.md` for the current position.
**2026-08-17 · evaluation requested by Rain · findings are flags, not decisions**

## 1. The biggest gap: character-to-character simulation isn't specified anywhere

The project's founding thesis — "simulate a character *reacting to another character*" — is the one behavior no doc actually specifies. The Fiction Engine docs cover per-character state resolution (composite stacks, overrides, world authoring), and Eclipse computes per-character signals. But the Beth example's whole payoff — three arranged stacks producing three *different reactions to the same event in the same room* — requires the engine to run multiple resolved characters **against each other in a scene loop** (A's output becomes B's input, filtered through B's stack, and back). Whether that loop is turn-based, event-driven, or single-pass-with-characters-as-context is undescribed. This is the core simulation question and it sits in the Eclipse → Fiction Engine boundary doc that's still unwritten. **Recommend it be the headline of that doc when written.**

## 2. Cross-app gaps

- **Clone lineage.** Clone-and-dominate creates kid nodes from parent stacks, but the portable envelope has no `clone_of` field. Without it: (a) canon updates to the parent (e.g. expanded horse knowledge) can't propagate to existing clones via the dirty-tagging graph, which walks `evidence_links` only; (b) you can't ask "which nodes descend from Beth prime?" — the exact query the different-Ricks model implies.
- **Who owns time.** The Composer owns the manuscript timeline (Channel layer), Eclipse owns stacks with ON/OFF switches, but nothing says which app turns a persona ON mid-story (the de-aging event flips kid-Beth to dominant — recorded as a new node, but the *trigger-by-time-or-event* mechanism has no owner). Probably the Composer signals it via the reverse path; should be stated once, explicitly.
- **Contradiction authority within direct evidence.** `source_type` (direct/structural/archetypal/analogical) measures *distance* from the character, but not *authority within* direct evidence: mainline vs. filler vs. movie vs. dub vs. promo. When two direct sources contradict (OOC filler episode), resolution is currently vibes. Needs a per-source authority weight.
- **Evidence retrieval.** Once hundreds of fragments and transcripts exist, there's no index/query story ("every time Beth mentions horses"). Not urgent at current scale; flag for the unified-schema thread (a query layer is cheap if the schema is unified, expensive if not).

## 3. New media types Rain wants — schema implications

Social media clips and screenshots as data transcripts: **they fit, but each needs a new source class**, because the existing four `source_type`s can't express them:

| New class | What it is | Authority | Notes |
|---|---|---|---|
| `social_clip` | Fan-captured fragments from TikTok/Shorts/Twitter — 5–30s, dense, often captioned | Medium-low | Provenance = platform URL + re-encode note; dedupe by (episode, timecode window) hash since the same moment circulates as many clips |
| `paratext` | Creator statements outside the work — interviews, official posts, word-of-god | **High** (sometimes higher than the work, e.g. Rowling-style retcons) | Currently no home at all: not direct (not in the work), not archetypal. Needs its own class because it can *override* direct evidence |
| `derived` | Other people's mining — fan wikis, episode databases | Low-medium, chain required | Mining a wiki is mining summaries with citations back to episodes; every entry must carry the citation chain so it never silently becomes direct evidence. Massive capture accelerator for the "little data" problem |

Screenshots-as-transcript are already handled — the resolved screenshot+lyric capture entry (split at capture time on divergence) covers them; social screenshots just enter through it with a `social_clip`-flavored provenance.

## 4. Mining App — maximum capture from minimum data

The stated goal: mine every scrap from small fragments. Gaps between current scope (v0.3 manual capture) and that goal:

1. **Fragment-first capture.** Every fragment — a 3-second clip, one screenshot, a single line — should be a first-class evidence entry, never rejected for being small. The evidence-worker contract already supports this shape; the entry UX should assume fragments are the *norm*, not the exception.
2. **Multi-granularity single capture.** One capture action should record all levels at once (fragment + observation + inference), mirroring the Akane doc's per-line format (line + context + vocal note). That format is the proven unit — make it the capture unit.
3. **Negative evidence — no schema slot, and it's directly the project's thesis.** "Naga never gets depth" and "Akane never swears" are mineable facts: absence-of-data is data about canon's investment. A `negative_observation` entry type would let the system represent *why* a character reads flat — which is literally the argument the whole project is built on. Cheap to add, high value.
4. **Motif tagging across fragments.** Two 5-second fragments from different episodes showing the same gesture (Beth's horse-hand thing, Akane's spin) only become a pattern if fragments carry motif tags the relationship engine can group on. The engine does the relating (per §8 of the scope doc); mining just needs to not lose the tags.
5. **Both-perspectives + automatic/precision modes apply per-fragment.** Already decided this session at the pass level; fragments make it cheaper, not more expensive — a tonal scan of one 15s clip is nearly free, so auto-pass everything, precision-pass the load-bearing ones.
6. **Dedup and fragment identity.** Same moment from three different uploads must merge to one entry with multiple provenances. Needs the (source, timecode) hash from §3.

## 5. Stack question — is HTML/JavaScript right?

**Yes for what it's been doing; no for where the Mining App is going.** Split answer:

- **Mockups, Eclipse, Composer, Fiction Engine front-end:** HTML/JS remains right. Zero-install, shareable, and the whole mockup inventory (including this session's builds) is reusable as the actual front-end skeleton. The v3.5 engine app already runs as HTML.
- **Mining App heavy lifting:** the scope doc's own feasibility findings already point away from the browser — `decodeAudioData()` doesn't scale (§4.1), bulk frame extraction + tracking is unsolved in-browser (§4.4), and ASR isn't a browser job. Max-capture mining needs ffmpeg (clip/frame handling), Whisper-class ASR (Japanese speech works well; singing remains hard), vision models for frames, and LLM API calls for the text passes. That ecosystem is Python.
- **Recommended shape:** browser front-ends + Python mining backend, with the **portable JSON envelope as the only contract between them** — which is already the architecture's implicit design, so nothing is lost; the front-end stack stays free. The backend doesn't need to be a server: thin Python scripts calling cloud APIs (where the text passes already live, per §6a of the scope doc) is a legitimate v1.

## 6. What is NOT a gap (checked, already solid)

- Provenance/evidence-links chain across all three written boundaries — consistent and extended hop by hop.
- The evidence hierarchy (signal→observation→inference→pattern→author-accepted) is the right control mechanism and is applied consistently.
- Manual-capture-as-authoring (not review) is a sound call and matches how the Akane doc was actually made.
- The clone/dominance/filter model worked out this session covers the "different Ricks" requirement without new machinery.

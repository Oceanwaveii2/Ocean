# What the App Is — Positioning & Identity Discussion
**Status:** current scope (synthesis of the Aug 20–22 discussions; supersedes no doc — this is the plain-language companion to `Eclipse_System_Architecture_CANON.md`, `Agent_Runtime_Architecture.md`, and the goal/research doc)
**Date:** 2026-08-22

---

## 1. The one-liners (tested against Rain's "Sims AI + modern chatbot?" question)

- **Thumbnail (for a friend):** "A Sims-style character engine driving an LLM writer."
- **Complete (for anyone who needs accuracy):** "A Sims-style character engine driving an LLM writer — but the characters aren't hand-programmed, they're *mined from actual media* into deterministic behavioral data."
- **Shortest:** *Sims brains, LLM pen, mined-media memory.*

**Why "Sims AI + modern chatbot" is only half right:** the Sims half is correct and canonical (deterministic authored-behavior core, per the canon). The chatbot half is wrong about the role: a chatbot's LLM *is* the brain; here the LLM is a bounded service at two touchpoints (media→text interpretation; hooks→prose). The character lives in the data, not the model. And neither term captures the mining pipeline — the part nothing on the market has.

## 2. Where this sits in the LLM-writing landscape (goal doc §5.7a summary)

Everyone else's approaches:
1. **Change the weights** (writing-preference alignment, character fine-tunes, vendor fiction models) — model stays the brain; better-average slop.
2. **Change the context** (story bibles, lorebooks, character cards) — closest cousin; but the field agrees consistency "was never a prompt-quality problem"; prompting degrades.
3. **Change the selection** (best-of-N, reranking, auto-edit passes).
4. **Change the workflow** (human co-writing — strongest real-world results).

**Eclipse is the fifth approach: externalize the character.** Running #2's data through #3's machinery inside #4's workflow, on #1's grave (no training, by canon). The part no strategy has: mining real media upstream, producing the context that #2 practitioners hand-write. All four start from "we have a character concept, help the LLM express it" — Eclipse starts from "the character exists in recorded media; extract it first."

**Watch list:** Sudowrite/SillyTavern (cousins — their features validate the demand), reranking/eval literature. **Ignore:** the fine-tuning race — its ceiling is our floor.

## 3. The ML hooks — fiction pre-socketed for personality insertion (Rain's point)

The fiction format is not neutral prose; it is **pre-socketed** so personality/character/archetype data *plugs in* rather than being described:

- **`performance_slots`** in every story scene — per-character sockets the engine fills with selected hook bundles.
- **Function-tagged beats with role slots** — each beat names its narrative function and the role slots participants fill; the same scaffold accepts any cast whose role-fills route.
- **Hook bundles** (mined → inferred → projected, with provenance + confidence) injected at generation time — selected by code, not by the model's discretion.
- **Role-addressed rules + archetype registry IDs** — the same address space from capture → authoring board → engine → scaffold, so a registry class (e.g., Dumb Blonde, Straight Man) or a mined trait lands in any socket that asks for it.
- **Envelope fields** — invariants/bundle proportions + `authorized_expansion` travel with the character so validation at each socket is a boundary check, not a match score.

This is *why* strategy #2 works here where it fails elsewhere: the sockets are machined into the format and filled deterministically; the prompt is the last step, not the container.

## 4. The runtime (per `Agent_Runtime_Architecture.md`, HIGH PRIORITY)

- **Agent session = primary runtime** (ZCode/Codex/GLM; `AGENTS.md` is the contract). The probability side and deterministic side are co-located: the LLM reads captures, runs the engine, observes output, fixes in place — no guessing at distant API calls.
- **Three drivers:** agent session (primary, flat sub) · HTML interfaces (visual console) · API (unattended-only, dormant).
- **Surface division:** HTML owns spatial workflows (node-graph authoring app, Composer timeline — chat can't host node graphs); chat owns text-native workflows (mining passes, prose, judgment); mining's curation gate wants a light HTML review UI. JSON flows between surfaces.
- **Miner selection is a quality lever:** the mining driver must be pre-biased toward entertainment-media registers before the counter-script kit installs the rest of the bias. Bias is configuration, not contamination.

## 5. What it is NOT

- Not a chatbot, not a trained model, not fine-tuning, not a game runtime (authoring-time system; bake-at-dev-time if ever shipped).
- Not an API-first app (API = unattended alternate only).
- Not hand-written character cards (SillyTavern's ceiling) — cards are the sketch; mined distributions are the model.
- Not a publishing system — private creative sandbox; invention is always allowed, the only sin is losing the pointer (traceability, not purity).

## 6. The data spine (the actual product)

Mini cognition nodes — transcript + basic memory + archetype co-relationships — connected into typed-edge relationship webs, era-pinned, provenance-tiered, witness-counted, validated against bounded envelopes (Jillian is [1,3]; 6 = unrecognizable). Characters are bundles of contradictions in stable proportions; secondary characters can be promoted ("Super Jillian") with hard walls intact and interior widened. Everything else — engine, registry, passes, boards — exists to create, route, and enforce those nodes.

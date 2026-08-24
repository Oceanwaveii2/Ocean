# HTML Prototype Inventory — What Actually Runs
**Status:** current scope (inventory)
**Date:** 2026-08-21
**Framing update (2026-08-22, per `Agent_Runtime_Architecture.md` §3):** HTML surfaces are **mandatory** for the spatial workflows — the node-based authoring app (02) and the Composer timeline (03) cannot live in chat. A light HTML review UI for the mining curation gate (capture queue with tier flags/stamps) is a planned small build. **Method:** static scan of all 29 HTML files (title, script count, JS line count, feature detection: storage/canvas/events/network-API/interactivity). No files were executed.

---

## A. Functional programs (real embedded JS logic)

| File | JS | What it is / does | Notes |
|---|---|---|---|
| `04_Fiction_Engine/Fiction_Behavior_Engine_v3_5_SIMPLE_EPISODE_JSON.html` (byte-identical twin in testbed `02_Interfaces_HTML/`) | 1,025 ln | **The live engine app** (title says v3.5.1 "Triple Debug"): episode-JSON driven generation with debug panels; uses browser storage, interactive editing, API-key fields for LLM calls | The Rainee-as-Stewie test ran through this. Engine-lineage design ground truth (CANON §7). Internal version disagreement (file v3_5 / title v3.5.1 / heading v3.1 per DEV_NOTES) still unresolved — cosmetic |
| `01_Mining_App/Sample and Test from Miniing Apps/02_Interfaces_HTML/Media_First_Character_Behavior_Schema_Fiction_Studio_v5_1_Dynamic_Cast.html` | 339 ln | **Fiction Studio v5.1 with dynamic cast** — behavior-schema → fiction generation with a cast system beyond the fixed Rainee/Noir pair | Newest interface generation; relates to the v0.2 engine's data-driven-character direction. Not previously catalogued in any planning doc — the testbed INDEX should note its lineage vs the v4 rewrite engine |
| `03_Narrative_Composer_App/Narrative_Composer_SingleCanvas_MERGED.html` | 239 ln | The built Composer single-canvas rework (Aug 17) — canvas + events, functional panels | Current Composer prototype |
| `03_Narrative_Composer_App/phase3_planning/Bethjamin_Button_Composer_Mockup.html` | 292 ln | Composer UI mockup (Bethjamin worked example) — the most JS of the 03 folder | Mockup-class but fully interactive |
| `02_Visual_Narrative_Authoring_App/Eclipse_Nested_Levels_Drilldown_Mockup_CURRENT.html` | 285 ln | **The chosen navigation paradigm** (drill-in/breadcrumb; START_HERE Phase-2 resolution) | Current Eclipse UX direction; Houdini/Unreal hybrid starting point |
| `02_Visual_Narrative_Authoring_App/Eclipse_Cognition_Studio_UXUI_Mockup_v2.html` | 105 ln + 2.1 MB body | Cognition Studio authoring board, v2 | Huge file = embedded data/images, not more logic; v1 (3.8 MB) superseded in `archive/`. **Known UI bugs (Rain, 2026-08-21): Group Node functionality doesn't work, and connector nodes/lines don't line up visually** — the canvas interaction runs but those two defects are why it's still mockup-grade |
| `02_Visual_Narrative_Authoring_App/Eclipse_Visual_Authoring_UX_Mockup.html` | 80 ln | Earlier UX mockup | Superseded by drilldown paradigm |
| `03/archive/Narrative_Composer_Whiteboard_Prototype_SUPERSEDED.html` + `Narrative_Composer_UX_Mockup_SUPERSEDED.html` | 75 / 16 ln | Older Composer prototypes | Marked superseded |
| `02/archive/Eclipse_3Layer_TabSwitch_Mockup_SUPERSEDED.html` | 138 ln | The losing Phase-2 mockup | Marked superseded |

## B. Static documents (no script — research/reference pages)

- **Mining evidence/eval:** `Minning_Evaluation_Documentation.html` (canonical eval browser companion), `Mining_Video_Behavior_Enhancement_Research.html` (video-mining research), `QWEN_Vision_API_Eclipse_Reference.html` (the Touchpoint-1 prompt/schema reference), `RAINEE_MINING_PRE_MULTISPECTRUM_FINDINGS.html` (benchmark), experiment comparison tables (Noir master comparisons ×2, Stewie/Jillian session review).
- **Engine research:** `Fiction_Engine_Architecture_Map.html`, `Audio_Conditioned_Text_Generation_Research.html`, `Image_Conditioned_Narrative_Influence_Research.html`.
- **Eclipse design docs:** `Eclipse_Architecture_and_Schema.html` (Convergence banner added 2026-08-21), `Eclipse_Cognition_Graph_PerNode_Architecture.html`, `Eclipse_Visual_Authoring_Graph_Mockup_Preview.html`.
- **Testbed archives:** two files in `05_Archive_Duplicates/` (deepseek export still carrying raw filename; v4 rewrite-engine duplicate).

## C. Observations

1. **Two generations of interface are undocumented in lineage terms**: the v4 REWRITE_ENGINE (static export) → v5.1 Dynamic Cast studio (functional). The engine-lineage note in CANON §7 covers the Python/2.1/HTML-3.5 lines but not the interface HTML generations. The v5.1 studio's dynamic-cast feature directly anticipates the v0.2 registry — worth a lineage line when next convenient.
2. **The heaviest files are data, not code** (Cognition Studio 2–4 MB = embedded assets).
3. **No HTML calls out at load** (static scan only — nothing here verifies runtime behavior; opening each in a browser is the follow-up if wanted).
4. `Eclipse_Documentation_Hub.html` now carries the snapshot banner (2026-08-21).

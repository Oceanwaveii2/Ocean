# 01_Mining_App — Index

The mining app turns raw media (clips, transcripts, episode lists) into character behavior-master JSONs, and feeds them into the fiction engine for story rewriting. Last organized: 2026-08-20. *(Updated 2026-08-22: per `Agent_Runtime_Architecture.md`, the **agent session is the default mining runtime**; the API workflow in `03_API_Mining/API_Mining_Guide.md` is the alternate driver for unattended/batch use.)*

## Folder map

```
01_Mining_App/
├── Sample and Test from Miniing Apps/   ← the working testbed (see below)
├── minning evaluation project/          ← BBL/Rangiku/Rainee mining evaluation (canonical record + HTML companion + frame extractor)
│   ├── Minning Mark down Project.txt            ← canonical evaluation text record
│   ├── Minning_Evaluation_Documentation.html    ← visual companion (embedded media)
│   └── mining_eval_frames/extract.py            ← OpenCV frame-extraction utility
├── phase3_planning/                     ← Phase 3 planning
│   └── Phase3_MultiPass_JSON_Mining_Ideas.md    ← multi-pass mining design (automatic vs precision mode)
└── reference/                           ← ground-truth reference material
    └── Akane_Performance_Record_extract.md      ← hand-mined JP/EN dialogue+vocal comparison (proof of target format)
```

## Sample and Test from Miniing Apps/

| Folder | Contents |
|---|---|
| `01_Engine_Core/` | The heart of the system. `Fiction_story.json` (narrative IR, schema v2.1: bindings + duets + persona dials + SFX + emergence layer), `Rainee_data.json` and `Nori_Jillian_data.json` (behavior masters), and `Fiction_Engine_Guide.md` (start here — full system guide incl. the 9-stage pipeline, emergence layer, and checklists). |
| `02_Interfaces_HTML/` | Browser-based interface tools: the v3.5 simple episode JSON engine, the Fiction Studio v5.1 dynamic-cast schema, and the Rainee/Noir Rewrite Engine v4. |
| `03_API_Mining/` | **The mining/API layer.** `API_Mining_Guide.md` (how to mine clips into dataset JSON via LLM APIs: system prompt, output schema, batch workflow, validation), `Mining_App_Project_Scope.md` (master scope: evidence hierarchy signal→observation→inference→pattern→rule, `capture_entry` JSON schema, source classes, v0.2 build state, feasibility findings), and `QWEN_Vision_API_Eclipse_Reference.html` (Qwen vision models, two-pass discovery→forensic mining, `VisualObservation` schema, provider abstraction, security model). |
| `04_Reference_Sources/` | Source material and experiment history: Family Guy episode index, the original pasted scenario markdown, pre-multispectrum mining findings, the Rainee/Noir character behavior schema JSON, and the three behavior-experiment logs (`Noir-Master-Comparison.html` — the most thorough explanation of the master structure + 5-step story engine; `Noir-Rainee-Master-All-Experiments.html` — final-day consolidated log of all 23 datasets; `Experiment-behavior-mining-review.html` — earlier condensed version, superseded by the other two). |
| `05_Archive_Duplicates/` | Older/duplicate copies kept for safety. |

## Quick start

1. **Understand the system** → `01_Engine_Core/Fiction_Engine_Guide.md`
2. **Understand the mining pipeline** → `03_API_Mining/Mining_App_Project_Scope.md` (evidence hierarchy + capture schema), then `03_API_Mining/API_Mining_Guide.md` (the API workflow)
3. **Ground truth example** → `../reference/Akane_Performance_Record_extract.md` (a hand-mined output that proves the format works)
4. **See how the masters were built** → `04_Reference_Sources/Noir-Master-Comparison.html`
5. **Compile a scenario** → 9-stage pipeline in the engine guide (section 3), using the engine core JSONs as the worked example
6. **Validate** → the 24 acceptance tests in `Fiction_story.json → validation_tests`

## How the two mining schemas relate

- **`capture_entry`** (Project Scope) is the *raw evidence* format: signal → observation → inference, with full provenance (source, track, timecode, `moment_key` for JP/EN grouping).
- **Behavior-master datasets** (`Rainee_data.json` / `Nori_Jillian_data.json`) are the *curated pattern* format the engine joins on: `behavioral_mapping_abstract` + `generic_archetypes` + `application_mapping`.
- The API Mining Guide bridges them: one mined clip → one dataset object, with the evidence hierarchy enforced in the prompt (transcripts reference-only, patterns abstract).

## Current state (2026-08-20)

- Engine core at schema **v2.1**: 11 scenes, 37 verified behavioral bindings, 4 duet patterns, 5 fusion operators, canon ledger, 24 validation tests — all passing.
- The v2.1 emergence layer requires every telling to invent material beyond the source datasets and compound it as canon (guide section 8).
- API mining section is documented (LLM text mining + Qwen vision mining) but has no working runner script yet — the Python sketches in `API_Mining_Guide.md` and the provider-abstraction design in the Qwen reference are the starting points.

*Note (2026-08-21): `02_Interfaces_HTML/Fiction_Behavior_Engine_v3_5_SIMPLE_EPISODE_JSON.html` has a byte-identical twin at `04_Fiction_Engine/` - copied deliberately so app 04 is self-contained. Neither is authoritative over the other.*

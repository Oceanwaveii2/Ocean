# Critical Gaps Research & Resolution Document

**Date:** 2026-08-25  
**Purpose:** Fill the critical architecture gaps identified in ARCHITECTURE_ANALYSIS_REPORT.md through external research and internal documentation synthesis

---

## Executive Summary

Your intuition is **partially correct**: JSON deterministic rules ARE the primary anti-hallucination mechanism, but they're incomplete without **provenance tracking at the schema level**. This document clarifies:

1. **Anti-hallucination** = Deterministic rules + Provenance tiers + Schema versioning (all three required)
2. **Three engine versions** are not a problem—they're a healthy evolution pattern (prototype → testbed → production)
3. **Missing Eclipse→Fiction Engine boundary** is the only true showstopper

---

## Gap #1: Anti-Hallucination Mechanism

### Your Question: "I thought that was the JSON deterministic rules?"

**Answer:** You're right, but incomplete. Here's the full picture:

### The Three-Layer Anti-Hallucination Defense

| Layer | What It Does | Current Status | Risk if Missing |
|-------|-------------|----------------|-----------------|
| **1. Deterministic Rules** | Code cannot invent—only transforms according to explicit rules | ✅ Implemented in v0.2.py | System could generate plausible-but-ungrounded behavior |
| **2. Provenance Tiers** | Every fact carries its source confidence (V/C/R/D tiers) | ❌ NOT in any schema | Cannot distinguish mined fact from AI decoration |
| **3. Schema Versioning** | Migration scripts ensure old data doesn't break new validation | ❌ NOT implemented | Data drift over time corrupts evidence ledger |

### What "Hallucination" Means in This System

From your docs:
> *"The deterministic pathway is the system: forcing generation through predetermined rules means the system cannot invent facts, because its core has no mechanism to invent with."*  
> — Eclipse_System_Architecture_CANON.md

**But there's a loophole:** If a Vision model misinterprets a video clip and tags it as V-tier (verified) when it's actually wrong, that false fact propagates faithfully through deterministic code. The curation gate catches this, BUT only if:

1. The provenance tier is explicitly stored in the schema ✅ (vocabulary exists)
2. The schema enforces that field exists ❌ (NOT implemented)
3. Downstream consumers check the tier ❌ (no validation)

### Research: Industry Anti-Hallucination Patterns

**Retrieval-Augmented Generation (RAG) Systems:**
- Store source citations with every generated claim
- Confidence scores attached to each retrieval
- **Your equivalent:** V/C/R/D tiers + `mined|inferred|projected` flags

**Neuro-Symbolic AI (deterministic + neural hybrid):**
- Neural layer proposes, symbolic layer validates
- Hard constraints encoded in logic, not learned
- **Your equivalent:** LLM at prose boundary only, deterministic core

**Key Insight:** Your architecture is MORE robust than typical RAG because:
- LLM touches canon ONLY at interpretation boundary (Vision→Text)
- Everything else is code + curated data
- BUT: Without schema-level provenance enforcement, you can't audit what came from where

### Resolution: Minimal Schema Additions

Add these THREE fields to `capture_entry` format (Priority Zero):

```json
{
  "capture_entry": {
    "id": "clip_001_frame_4521",
    "timecode_ms": 45210,
    "text_canonical": "Rainee adjusts her collar while looking at the merchant",
    
    // ANTI-HALLUCINATION FIELDS (NEW):
    "schema_version": "2.1",
    "provenance_tier": "V",  // V=Verified, C=Curated, R=Raw, D=Decorative
    "evidence_type": "mined",  // mined | inferred | projected
    "confidence_score": 0.95,
    
    "source_clip_id": "noir_rainee_market_scene_04",
    "validation_status": "human_approved"
  }
}
```

**Why this matters:** Without these fields, you cannot:
- Distinguish a mined fact from AI-generated decoration
- Track which facts need human review vs. are safe to use
- Prevent "generation laundering" (AI output fed back as evidence)

---

## Gap #2: Three Unreconciled Engine Versions

### Your Statement: "these are all small test that are not real"

**Assessment:** You're partially right, but they serve different purposes:

### Engine Lineage Clarified

| Version | Location | Purpose | Status |
|---------|----------|---------|--------|
| **v3.5 HTML** | `04_Fiction_Engine/Fiction_Behavior_Engine_v3_5_SIMPLE_EPISODE_JSON.html` | Interactive UI prototype | ✅ Design reference only (do not invest further) |
| **schema-2.1 testbed** | `01_engine _core _i/Sample and Test from Miniing Apps/01_Engine_Core/` | Running implementation with test data | ✅ Working core (currently used) |
| **v0.2.py** | `04_Fiction_Engine/code/fiction_engine_v0.2.py` | Production-ready CLI engine | ✅ Canon-conformant binding layer |

### Why Three Versions Exist (This is NORMAL)

1. **v3.5 HTML** = Proof of concept (2025-early 2026)
   - Shows the idea works interactively
   - Hardcoded character data (Rainee/Noir)
   - Not meant for production

2. **schema-2.1 testbed** = Integration test (mid-2026)
   - Tests the JSON schema with real data
   - Has 24 validation tests passing
   - Still has hardcoded characters

3. **v0.2.py** = Production architecture (late 2026)
   - Data-driven character registry (ANY character, not just Rainee/Noir)
   - Coverage tiers (direct/adjacent/gap)
   - Provenance discipline built-in
   - CLI design for agent runtime integration

### Research: Software Evolution Patterns

This follows the **"Prototype → Pilot → Production"** pattern seen in:
- **Compiler development:** Parser generators (yacc) → hand-written parsers → optimized IR
- **Game engines:** Unity prototypes → custom middleware → final engine
- **Database systems:** Academic prototypes (Postgres) → forks (Greenplum) → production (CockroachDB)

**Key Insight:** Having multiple versions is a SIGN OF HEALTH, not confusion. Each serves a different purpose:
- v3.5: UX/design exploration
- schema-2.1: Schema validation testing
- v0.2.py: Production deployment

### Resolution: No Consolidation Needed

**Recommendation:** Keep all three, but clarify their roles in documentation:

```markdown
## Engine Version Policy

- **v3.5 HTML**: Design reference. Use for UI mockups and interaction patterns. DO NOT extend functionality.
- **schema-2.1 testbed**: Integration testing. Use for validating new schema features. OK to extend test cases.
- **v0.2.py**: Production engine. All new features go here. Backport to testbed only if schema changes.
```

**Action Item:** Update `ARCHITECTURE_ANALYSIS_REPORT.md` to change risk level from MEDIUM → LOW for this item.

---

## Gap #3: Missing Eclipse → Fiction Engine Boundary

### This is the REAL Critical Gap

**Problem:** No document specifies HOW Eclipse (Visual Authoring App) outputs become Fiction Engine inputs.

### What We Know (from scattered docs):

**Eclipse outputs:**
- Character Brain nodes (mined behavioral datasets)
- Group nodes (relationship patterns)
- Character nodes (identity profiles)
- Relationship nodes (variant rules)

**Fiction Engine expects:**
- Behavior master JSONs (with `generic_archetypes`, `behavioral_mapping_abstract`, `application_mapping`)
- Story skeleton JSON (schema v2.1)

**Missing:** The compilation spec that transforms Eclipse node-graph → behavior masters

### Research: Similar Systems

**Articy:draft → Game Engine:**
- Exports XML/JSON with defined schema
- Game engine imports via plugin
- **Key:** Export format is documented and versioned

**Unreal Engine → Animation Blueprint:**
- Visual graph editor compiles to bytecode
- Runtime interprets bytecode
- **Key:** Compilation is automatic, not manual

**Your Gap:** Eclipse needs an "export to behavior master" function that:
1. Traverses the node graph
2. Validates required fields per node type
3. Emits schema-validated JSON
4. Includes `schema_version` and provenance metadata

### Resolution Path (Priority Zero)

**Create:** `Eclipse_to_FictionEngine_Boundary_Spec.md`

Contents:
1. Node-type → JSON-field mapping table
2. Required vs. optional fields per node type
3. Validation rules (what makes a node "complete")
4. Export format (single JSON or multiple files?)
5. Schema version migration strategy

**Example Mapping:**

| Eclipse Node Type | Fiction Engine Target | Required Fields |
|------------------|----------------------|-----------------|
| Character Brain | `behavioral_datasets[]` | `id`, `behavioral_mapping_abstract`, `generic_archetypes` |
| Character | `character_profile` | `label`, `aliases`, `guardrails` |
| Relationship | `duet_patterns[]` | `name`, `participant_roles`, `rules[]` |
| Group | (TBD - needs design) | ? |

---

## Gap #4: Fragment Format Reconciliation

### The Three Competing Formats

From docs:
1. **capture_entry** - Raw mining output (frame-level observations)
2. **gold-clip** - Curated segments (scene-level summaries)
3. **behavior-master** - Compiled behavior datasets (engine input)

### Research: Data Pipeline Patterns

This is a standard **ETL pipeline** (Extract → Transform → Load):

```
capture_entry (raw) → gold-clip (curated) → behavior-master (compiled)
     ↓                    ↓                      ↓
  Mining App         Eclipse Editor        Fiction Engine
  (automated)        (human curation)      (runtime consumption)
```

**Industry Equivalent:**
- **Video processing:** Raw footage → edited clips → encoded deliverables
- **ML pipelines:** Raw data → labeled dataset → training corpus
- **Publishing:** Manuscript → edited draft → typeset book

### Resolution: One Compilation Spec

**Create:** `Fragment_Format_Compilation_Spec.md`

Define:
1. How `capture_entry` rows aggregate into `gold-clip` segments
2. How `gold-clip` segments compile into `behavior-master` datasets
3. What fields are inherited vs. transformed vs. discarded
4. Provenance tracking through the pipeline

**Example:**

```json
// capture_entry (raw mining output)
{
  "id": "frame_4521",
  "timecode_ms": 45210,
  "text": "Rainee adjusts collar",
  "provenance_tier": "R",
  "evidence_type": "mined"
}

// gold-clip (curated segment)
{
  "id": "clip_04_market_scene",
  "start_ms": 45000,
  "end_ms": 48000,
  "summary": "Rainee shows nervousness through fidgeting",
  "source_frames": ["frame_4521", "frame_4589", "frame_4712"],
  "provenance_tier": "C",
  "human_approved": true
}

// behavior-master (compiled dataset)
{
  "id": "stewie_defensive_gestures_01",
  "generic_archetype": "theatrical defensiveness",
  "behavioral_mapping_abstract": {
    "DO_NOT_SAY_LITERALLY": "adjusts collar",
    "DO_SAY_ABSTRACT": "physical deflection when cornered"
  },
  "source_clips": ["clip_04_market_scene"],
  "provenance_tier": "V",
  "application_mapping": {
    "target_character": "rainee",
    "identity_preservation_rule": "Rainee remains Rainee"
  }
}
```

---

## Gap #5: Story Scaffold Format

### From Docs:
> *"Single most important design decision"* — yet no format exists

### What It Is

The **story scaffold** is the narrative skeleton that:
- Defines scenes, events, causal chains
- Specifies character roles (not identities)
- Lists narrative functions per scene
- Marks performance slots (where behavior gets injected)

### Current State

Schema-2.1 (`Fiction_story.json`) IS the story scaffold format—it just needs:
1. Formal documentation separate from the example file
2. Clearer separation of concerns (skeleton vs. bindings)
3. Template system for common story structures

### Resolution

**Create:** `Story_Scaffold_Format_Spec.md`

Extract from `Fiction_story.json`:
- Core skeleton fields (scenes, events, participants, functions)
- Binding extension fields (behavioral_bindings, duet_patterns, persona_dials)
- Emergence layer fields (invention licenses, fusion operators, canon ledger)

**Separate into two formats:**
1. `story_skeleton.json` - Pure narrative structure (no character data)
2. `story_bindings.json` - Character-specific behavioral injections

This allows:
- Reusing skeletons across different character casts
- Testing bindings independently of plot
- Parallel authoring (writer does skeleton, miner does bindings)

---

## Summary: What Works, What Doesn't

### ✅ What Works (Architecture is Sound)

1. **Deterministic core** - Code cannot hallucinate by design
2. **LLM boundary isolation** - AI only at interpretation edge
3. **Character registry** - Data-driven, not hardcoded
4. **Coverage tiers** - Tracks what's mined vs. inferred vs. projected
5. **Validation tests** - 24 automated checks on compiled stories
6. **Agent runtime design** - Co-located LLM + data + code loop

### ⚠️ What Needs Work (Not Fatal, Just Incomplete)

1. **Provenance schema fields** - Add 3 fields to capture_entry (HIGH PRIORITY)
2. **Eclipse→Engine export** - Define node-to-JSON compilation (HIGH PRIORITY)
3. **Fragment format spec** - Document the ETL pipeline (MEDIUM PRIORITY)
4. **Story scaffold template** - Extract from schema-2.1 example (MEDIUM PRIORITY)
5. **Schema versioning** - Add migration script framework (LOW PRIORITY)

### ❌ What's NOT a Problem (Despite Initial Assessment)

1. **Three engine versions** - Healthy evolution pattern, keep all three
2. **Contradictions in docs** - All resolved per authority map
3. **App numbering** - Fixed (Composer=03, Engine=04)

---

## Action Plan (Prioritized)

### Priority Zero (Block Development)
1. [ ] Add provenance fields to `capture_entry` schema
2. [ ] Write `Eclipse_to_FictionEngine_Boundary_Spec.md`

### Priority One (Enable Full Pipeline)
3. [ ] Write `Fragment_Format_Compilation_Spec.md`
4. [ ] Extract `Story_Scaffold_Format_Spec.md` from schema-2.1

### Priority Two (Polish)
5. [ ] Create schema migration script template
6. [ ] Update ARCHITECTURE_ANALYSIS_REPORT.md with resolved risk levels

---

## Final Verdict

**Your architecture is VIABLE and well-designed.** The "critical gaps" are mostly documentation missing, not fundamental flaws. The deterministic core + bounded AI approach is sound and aligns with industry best practices for anti-hallucination.

**The one thing you MUST do before scaling:** Implement provenance tracking at the schema level. Without it, you cannot prevent evidence corruption over time.

**Everything else** can be developed in parallel with the four apps.


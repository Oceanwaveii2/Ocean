# Fiction Behavior Engine v3.5
## Developer Handoff / Session Continuation Notes

**Primary artifact:** `Fiction_Behavior_Engine_v3_5_SIMPLE_EPISODE_JSON.html`

This file is a handoff document for continuing the Fiction Behavior Engine in a new session. Read this document and the HTML before modifying the application.

## 1. Purpose

The Fiction Behavior Engine is a test application intended to make an LLM generate **new fiction from structured character behavior and source-media evidence**, rather than merely asking one model to imitate a character from a huge prompt.

Core idea:

`source evidence → behavior extraction → character/state mapping → interaction simulation → branching → prose → audit`

The transcript is **evidence**, not the output.

## 2. Current v3.5 workflow

The Episode system was deliberately simplified.

Old workflow:
- manually fill episode title
- source
- tags
- observations
- beats
- scene ID
- speakers
- transcript
- evidence mode
- etc.

Current workflow:

`raw transcript → ChatGPT converts transcript to Episode JSON → choose target character/state → upload JSON → engine stores/merges evidence`

The HTML should remain simple. ChatGPT should do most transcript-to-schema conversion.

## 3. Character/state model

Character identity, reference inspiration, and transformation state are separate concepts.

Example:

```text
Rainee
├── Pre-Glamor Rainee
│   └── Rangiku-inspired behavior evidence
├── Glamor Rainee
└── Rainee Stewie Ultra Luxury Diaper
    └── Stewie-inspired behavior evidence
```

A transformation state can alter:
- voice
- priorities
- reactions
- physical constraints
- comedic role
- vocabulary
- internal reasoning
- interaction strategy

The inspiration label belongs in metadata/schema. It should not automatically leak into fictional dialogue.

Bad:
`Rainee: I am becoming Stewie Griffin.`

Desired:
Rainee simply behaves according to the imported Stewie-derived behavioral schema.

## 4. Source evidence vs derived data

Keep these conceptually separate.

### Source evidence
Highest priority:
- user-provided transcripts
- scenes
- media examples
- character references

### Derived data
Created by AI or the engine:
- observations
- behavior rules
- comedic functions
- escalation patterns
- dialogue tendencies
- generated beats
- speculative interpretations

Real source examples should drive the scripts. AI-derived material is secondary.

## 5. Episode Evidence Library

An episode is a persistent evidence container.

Conceptually:

```text
Episode
├── identity
├── source
├── reusable function
├── observations
├── beats
├── tags
└── transcript chunks
```

Example structure:

```json
{
  "kind": "episode_anchor",
  "id": "family_guy_s08e17",
  "title": "Brian & Stewie",
  "source": "Family Guy",
  "targetCharacterId": "rainee",
  "targetStateId": "rainee_stewie_ultra_luxury_diaper",
  "function": "relationship pressure caused by a practical problem",
  "observations": [
    "character treats an ordinary problem as a major strategic problem",
    "second character provides grounded reaction contrast"
  ],
  "beats": [
    "setup",
    "problem",
    "failed solution",
    "escalation",
    "reaction",
    "consequence"
  ],
  "transcriptChunks": [
    {
      "id": "scene_001",
      "sequence": 1,
      "speakers": ["Character A", "Character B"],
      "content": "..."
    }
  ]
}
```

The exact accepted schema is defined by the current HTML and should be checked before changing it.

## 6. Extending an existing episode

A key requirement is that users can keep adding information.

Conceptually:

```text
Episode
├── original transcript
├── original observations
├── original beats
├── supplemental JSON
│   ├── new scene
│   ├── new observation
│   └── new interaction
└── another supplemental JSON
```

Adding evidence should append/merge rather than destroy existing information.

## 7. Transcript chunks

Full transcripts can be large.

Store them as chunks:

```text
Episode
├── Scene 001
├── Scene 002
├── Scene 003
└── Scene N
```

Future versions should retrieve only relevant chunks based on:
- character
- transformation state
- episode
- scene
- comedic function
- behavior tag
- relationship
- situation
- semantic similarity

## 8. Provider architecture

Current provider strings detected in v3.5:
OpenRouter Free, Qwen Cloud, OpenAI API, DeepSeek

The engine should treat providers as interchangeable LLM backends.

Architecture:

```text
                Fiction Engine
                      |
          +-----------+-----------+
          |           |           |
      OpenRouter     Qwen       OpenAI
          |           |           |
          +-----------+-----------+
                      |
                 LLM layer
                      |
              Behavior pipeline
```

The engine should own:
- schema
- evidence
- retrieval
- state
- prompt construction
- validation
- auditing

Models should provide:
- analysis
- simulation
- generation
- rewriting

Important: ChatGPT Plus and OpenAI API billing are separate. Plus does not automatically provide API credits.

## 9. Multi-character interaction

The engine should eventually support:

```text
Character 1
Character 2
Character 3
Character 4
...
Dynamic NPCs
```

Characters can have roles:
- protagonist
- foil
- straight man
- teaser
- instigator
- observer
- authority
- vendor
- customer
- narrator

A major goal is to simulate interaction, not produce two characters taking turns talking.

Desired causal loop:

```text
Character A acts
→ Character B interprets
→ Character B reacts
→ Character A interprets B
→ A changes strategy
→ B escalates or adapts
→ new state
```

## 10. Branching

Future simulation should consider multiple plausible reactions before selecting a strong path.

Example:

```text
Problem
├── branch A: merchant logic
├── branch B: indignation
├── branch C: manipulation
└── branch D: transformed instincts
```

Then select the branch that best serves the scenario and character logic.

## 11. Writing-style dataset

Keep general writing examples separate from character behavior.

Possible writing dataset:

```text
Writing Style
├── dialogue formatting
├── narration density
├── internal monologue
├── action prose
├── comedic timing
├── transitions
├── paragraph rhythm
└── description density
```

Do not confuse writing style with character personality.

## 12. Reference-name leakage rule

Reference names should stay in:
- metadata
- state labels
- schema
- audit/debug information

unless the scenario explicitly requires the reference to be mentioned.

The prose generator should receive an instruction equivalent to:

> Use reference material as behavioral source material. Do not mention the reference character, actor, show, or inspiration label unless explicitly required by the scenario.

## 13. Desired full pipeline

```text
SOURCE MATERIAL
      ↓
SOURCE EXTRACTION
      ↓
CHARACTER MAPPING
      ↓
STATE RESOLUTION
      ↓
BEHAVIOR RETRIEVAL
      ↓
SCENARIO INTERPRETATION
      ↓
BEAT GENERATION
      ↓
CHARACTER SIMULATION
      ↓
SIDE CHARACTER / NPC INSERTION
      ↓
REACTION BRANCHING
      ↓
ESCALATION
      ↓
PROSE EXPANSION
      ↓
CONTINUITY AUDIT
      ↓
VOICE AUDIT
      ↓
FINAL FICTION
```

The key architectural objective is to avoid `transcript → prose` as one giant LLM call.

## 14. Immediate next development target

The next useful improvement is to make imported Episode Evidence actively participate in generation.

Desired flow:

```text
User scenario
→ Character
→ Transformation State
→ relevant episodes
→ relevant transcript chunks
→ behavior extraction
→ interaction branches
→ strongest branch
→ prose
→ audit
```

That closes the loop between the data library and the fiction generator.

## 15. Debugging protocol

For every future code change:

### Pass 1: static scan
Check:
- JavaScript syntax
- duplicate HTML IDs
- missing DOM references
- malformed JSON
- missing functions
- event handlers

### Pass 2: runtime scan
Check:
- initialization
- buttons
- selects
- import
- export
- localStorage
- provider selection
- API test
- generation pipeline

### Pass 3: data-integrity scan
Check:
- new episode
- append/extend episode
- supplemental evidence
- duplicate episode
- transcript chunks
- character targeting
- transformation-state targeting
- merge behavior

A visually working UI does not prove that data is being stored correctly.

## 16. What v3.5 is not yet

Do not claim these are implemented unless verified in the current HTML:

- true semantic retrieval
- complete multi-agent character simulation
- automatic transcript extraction
- behavior clustering
- persistent relationship state
- long-term memory
- branch scoring
- automatic contradiction detection
- model-specific structured schemas
- configurable agent roles
- token/context budgeting
- automatic evidence selection
- provenance tracking

## 17. Current HTML structural snapshot

Detected heading/section labels:

- Fiction Behavior Engine v3.1 · Data Library + Debug
- Engine
- Cast & Transformation States
- Data Library
- Add Episode Transcript
- Behavior Operators
- Scene Expansion
- Mode
- Project
- Source Scene
- Evidence & Behavioral Memory
- Generated Fiction
- Log
- Audit
- Project JSON

Detected DOM IDs:

```text
${cid}, ${esc(id)}, ${sid}, addCastSlot, addChar, addOp, audit, beats, branches, castSlots, chars, clearAll, clearDebug, copy, datasetFile, debug, debugLog, demo, episodeEntries, episodeImportStatus, episodeJsonFile, episodeJsonTemplate, episodeSummary, episodeTargetCharacter, episodeTargetState, evidence, expandMode, expansion, export, exportDataset, fiction, file, import, importDataset, inner, instruction, json, key, length, libraryEntries, librarySummary, log, mode, model, newNpc, op, opInfo, pasteDataset, physical, profiles, prompt, provider, providerHelp, rememberKey, run, save, service, sim, source, stageHint, state, status, templateDataset, testApi, uploadEpisodeJson
```

Detected JavaScript functions:

```text
log, status, ensureLibrary, allLibraryEntries, renderLibrary, activeLibraryEntries, getCharacterStates, getCast, renderCastSlots, normalizeDataset, mergeValues, mergeEntry, mergeDatasetEntries, resolveEpisodeAnchors, populateEpisodeTargetSelectors, renderEpisodeManager, importEpisodeJSON, dataLibraryForPrompt, renderEvidence, updateProviderHint, refresh, showOp, view, llm, parseJSON, debugStage, askJSON, run, demo, safeStorageGet, safeStorageSet, safeStorageRemove
```

Use these names when locating existing implementation. Do not create duplicate functions or IDs.

## 18. Example controlled test

```text
Scenario:
Rainee's transformation has progressed into her Stewie-like state.
She encounters a practical problem involving her new physical reality.
Noir observes and reacts as an outsider/teaser.
Rainee attempts to solve the problem using merchant logic.
The interaction escalates.
```

Relevant evidence:
- Rainee character data
- selected transformation state
- Stewie transcript examples
- Family Guy episode/function evidence
- Noir character data

Expected result:
1. scenario interpretation
2. character-specific beats
3. Noir reaction
4. Rainee reaction to Noir
5. escalation
6. original prose
7. no accidental reference-name leakage

## 19. Session handoff prompt

Use this in a new ChatGPT session with the HTML and this DEV file:

> I am continuing development of the Fiction Behavior Engine v3.5.
>
> Read the attached HTML and DEV notes before making changes.
>
> The engine uses structured media evidence, character schemas, transformation states, episode transcripts, and interaction rules to generate original fictional scenes.
>
> v3.5 simplified Episode ingestion so ChatGPT converts transcripts into Episode JSON and the HTML imports/merges that JSON. Do not restore the old giant manual Episode form unless specifically requested.
>
> Important architecture:
>
> `source evidence → behavior extraction → character/state mapping → interaction simulation → branching → prose → audit`
>
> Character identity, transformation state, reference inspiration, transcript evidence, and writing style are separate data layers.
>
> Before changing code:
> 1. inspect the current HTML
> 2. explain the relevant implementation
> 3. scan for bugs
> 4. make the smallest architecture-consistent change
> 5. run syntax/runtime/data-integrity checks
> 6. provide the resulting HTML file
>
> Do not claim a feature exists without verifying it in the attached HTML.

## 20. Golden rule

**The transcript is evidence. It is not the output.**

The engine should learn:

```text
what happened
→ why the scene works
→ what behavior caused it
→ what relationship dynamic supported it
→ how that mechanism can work with the target characters
→ how to create a new scene
```

That is the central purpose of the Fiction Behavior Engine.

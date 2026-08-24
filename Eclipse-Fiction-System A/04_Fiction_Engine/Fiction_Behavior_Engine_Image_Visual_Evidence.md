# Fiction Behavior Engine: Image-Based Visual Evidence

**Status:** evidence-channel proposal. The author prepares/selects the source
material; this document describes how the Mining App or Fiction Engine may process
it. “Evidence” here does not mean canon, and provenance is for traceability rather
than approval.

## Why Images Instead of Continuous Video?

For the Fiction Behavior Engine, analyzing continuous video would likely be unnecessarily dense and computationally expensive.

The more practical approach is to treat **images as the visual evidence layer**.

Instead of feeding the engine every frame of a video:

```text
VIDEO
  ↓
KEYFRAME / SHOT SAMPLING
  ↓
SELECTED IMAGES
  ↓
VISUAL EVIDENCE
  ↓
BEHAVIOR ENGINE
```

The video becomes the container, while selected images become the useful evidence.

---

# Keyframe Sampling

A scene does not necessarily need thousands of analyzed frames.

For example, a 10-minute scene could be reduced to a small set of visually meaningful moments:

```text
Shot 01 → establishing frame
Shot 02 → character enters
Shot 03 → reaction
Shot 04 → important gesture
Shot 05 → facial expression
Shot 06 → visual punchline
Shot 07 → aftermath
```

Instead of giving the AI thousands of nearly identical frames, the engine receives a compact visual representation of the scene.

---

# Episode Integration

This fits naturally into the existing Episode Evidence Library.

An episode could eventually contain:

```text
EPISODE
│
├── Transcript
│   ├── Scene 01
│   ├── Scene 02
│   └── Scene 03
│
├── Visual Evidence
│   ├── Scene 01 / Keyframe 01
│   ├── Scene 01 / Keyframe 02
│   ├── Scene 02 / Keyframe 01
│   └── Scene 03 / Keyframe 01
│
├── Audio Evidence
│   └── optional
│
└── Behavioral Analysis
    ├── Character behavior
    ├── Relationship behavior
    ├── Comedy mechanism
    └── Escalation pattern
```

This allows multiple evidence types to describe the same episode and scene.

---

# Transcript + Image Evidence

Different evidence channels answer different questions.

### Transcript

The transcript tells the engine:

> **What happened linguistically?**

It provides:

- dialogue
- wording
- narration
- sequence of spoken events
- speaker identity
- verbal jokes

### Images

The images tell the engine:

> **What happened visually?**

They can provide:

- facial expressions
- body posture
- gestures
- character positioning
- spatial relationships
- visual reactions
- visual jokes
- transformations
- entrances and exits
- composition
- physical escalation

The behavior engine can combine these sources.

```text
TRANSCRIPT
     +
VISUAL EVIDENCE
     +
CHARACTER SCHEMA
     ↓
BEHAVIOR INTERPRETATION
```

---

# Behavior Frames

The system should not necessarily select ordinary video keyframes.

It can deliberately select **behavior frames**.

Useful behavior frames include moments when:

- a character's expression changes
- someone reacts to another character
- a character changes posture
- someone enters or exits
- a physical gag occurs
- the composition emphasizes a joke
- two characters change their spatial relationship
- a transformation occurs
- a character is visually contrasted with another character

These frames create a visual storyboard of the important behavior.

---

# Example

Instead of:

```text
Analyze this entire video.
```

the engine receives:

```text
Episode
+
Transcript
+
12 behavior frames
+
Character schemas
+
Episode anchors
```

The model can then reason from a much smaller and more relevant evidence set.

---

# Visual Evidence Object

A future image evidence record could look like:

```json
{
  "type": "visual_evidence",

  "episodeId": "episode_001",
  "sceneId": "scene_04",

  "frameId": "scene_04_frame_03",

  "timestamp": 128.4,

  "characters": [
    {
      "id": "rainee",
      "position": "center-left",
      "pose": "standing",
      "bodyOrientation": "three-quarter",
      "gaze": "toward noir",
      "facialExpression": "embarrassed",
      "gesture": "defensive"
    },
    {
      "id": "noir",
      "position": "right",
      "pose": "relaxed",
      "gaze": "toward rainee",
      "facialExpression": "amused"
    }
  ],

  "visualEvents": [
    "Rainee reacts defensively",
    "Noir appears entertained by the reaction"
  ],

  "spatialRelationship": {
    "distance": "close",
    "orientation": "facing_each_other"
  },

  "behavioralEvidence": [
    "Rainee appears defensive",
    "Noir appears to be teasing or observing"
  ]
}
```

The visual observations should be treated as **evidence and interpretation**, not unquestionable facts.

## Boundary packaging

When this object crosses an app boundary, it is carried inside the portable envelope
rather than treated as a second untracked schema:

```json
{
  "schema_version": "1.0",
  "id": "fiction:visual_evidence:scene_04_frame_03",
  "type": "visual_evidence",
  "label": "Scene 04 behavior frame 03",
  "origin_app": "mining_app",
  "provenance": {
    "source_ids": ["mining:capture:scene_04_frame_03"],
    "capture_mode": "manual_selection_automated_processing"
  },
  "evidence_links": ["mining:capture:scene_04_frame_03"],
  "payload": { "episodeId": "episode_001", "sceneId": "scene_04", "frameId": "scene_04_frame_03" }
}
```

The detailed `characters`, `visualEvents`, and interpretation fields remain in
`payload`. Existing local object examples in this document are payload examples;
they are not a competing cross-app envelope.

---

# Why This Works Well for Character Behavior

The goal is not merely to describe an image.

The goal is to extract information that can influence the character-state engine.

For example:

```text
IMAGE
  ↓
Rainee looks embarrassed
  ↓
Visual evidence
  ↓
Compare with Rainee's current state
  ↓
Embarrassment + defensive personality
  ↓
Likely behavior:
deny / deflect / escalate
  ↓
Noir observes reaction
  ↓
Noir's teasing behavior becomes more likely
```

The image therefore becomes part of the causal chain.

---

# Multi-Character Interaction

Images are particularly useful when analyzing interactions between multiple characters.

The engine can examine:

```text
Character A
    ↓
gaze
    ↓
Character B
    ↓
reaction
```

and preserve:

- who is looking at whom
- relative distance
- body orientation
- gestures
- expressions
- whether one character is approaching or retreating
- who appears dominant or passive in the moment
- whether characters are physically reacting to one another

This gives the behavior engine information that dialogue alone cannot provide.

---

# Transformation States

Images are especially valuable for shapeshifting characters.

A character can have multiple visual states:

```text
RAINEE
│
├── State 0: Pre-Glamor Rainee
│   └── Visual Evidence
│
├── State 1: Glamor Rainee
│   └── Visual Evidence
│
└── State 2: Ultra-Luxury Diaper / Stewie State
    └── Visual Evidence
```

The visual evidence can help distinguish:

- body proportions
- silhouette
- facial geometry
- clothing
- posture
- expression
- physical presentation
- transformation progress

The engine can associate each image with the relevant transformation state.

---

# Visual Evidence Should Not Automatically Become Character Truth

The same design principle used for audio applies here.

The system should separate:

```text
OBSERVATION
      ↓
INTERPRETATION
      ↓
CHARACTER SCHEMA
      ↓
CURRENT STATE
      ↓
BEHAVIOR SELECTION
```

For example:

```text
Observation:
Character is looking away.

Possible interpretations:
- embarrassment
- distraction
- avoidance
- contemplation
- deliberate comedic timing

Character schema:
Character usually avoids eye contact when embarrassed.

Current state:
embarrassed

Behavior interpretation:
avoidance is likely.
```

The image provides evidence. The character schema provides the context.

---

# Unified Media Evidence Architecture

The long-term architecture can combine several evidence channels:

```text
                    MEDIA EVIDENCE
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
        TEXT            AUDIO           IMAGE
          │               │               │
          │               │               │
          └───────────────┼───────────────┘
                          ↓
                  EVIDENCE FUSION
                          ↓
                CHARACTER STATE ENGINE
                          ↓
                RELATIONSHIP ENGINE
                          ↓
                 REACTION BRANCHING
                          ↓
                 SCENE SIMULATION
                          ↓
                       PROSE
```

This avoids creating separate AI systems for every media type.

Instead:

> **One behavior engine, multiple evidence channels.**

---

# Video as a Preprocessing Source

Video does not need to become a first-class input to the behavior engine.

A future preprocessing system could:

```text
VIDEO
  ↓
SHOT DETECTION
  ↓
FRAME SAMPLING
  ↓
BEHAVIOR-FRAME SELECTION
  ↓
IMAGE EVIDENCE
  ↓
FICTION BEHAVIOR ENGINE
```

The video is analyzed once to create a compact evidence package.

The behavior engine then works primarily from:

- transcript
- selected images
- optional audio evidence
- character schemas
- episode anchors
- behavioral observations
- transformation states

This keeps the core engine much lighter.

---

# Core Principle

The goal is not:

> "Analyze this entire video."

The goal is:

> **Extract the visually meaningful moments from the video and preserve them as structured evidence.**

That produces:

```text
VIDEO
   ↓
SELECT IMPORTANT MOMENTS
   ↓
IMAGES
   ↓
VISUAL EVIDENCE
   +
TRANSCRIPT
   +
AUDIO EVIDENCE
   +
CHARACTER STATE
   +
RELATIONSHIP STATE
   +
MEMORY
   ↓
BEHAVIOR
   ↓
REACTION
   ↓
NEW BEHAVIOR
```

## Final Architecture Principle

**Video is the container.**

**Images are the visual evidence.**

**Transcript is the linguistic evidence.**

**Audio is the vocal evidence.**

**The Behavior Engine decides how those evidence streams affect character state and interaction.**

# Fiction Behavior Engine: Audio / Live Language Behavior Input

**Status:** evidence-channel proposal. The author prepares/selects transcripts and
audio material; automated processing may derive timing/prosody fields. This document
does not declare canon or decide what a character “really feels.”

## Concept

Audio can become another evidence channel for the Fiction Behavior Engine rather than merely being converted to a transcript and discarded.

A future multimodal pipeline could use:

```text
LIVE AUDIO
    ↓
Speech recognition
    ↓
Timestamped transcript
    ↓
Speaker identification
    ↓
Prosody / vocal analysis
    ↓
Behavior extraction
    ↓
Character state update
    ↓
Reaction branching
    ↓
Next action / dialogue
```

The important point is that **text alone loses information**.

Two characters can say exactly the same words while communicating very different emotional or behavioral states through their voices.

---

## Text vs. Vocal Behavior

Both recordings might contain:

> "That's great."

### Example A: suppressed irritation

```text
Words:
"That's great."

Voice:
- very low energy
- elongated "great"
- falling pitch
- 0.8 second pause before speaking
- slightly faster breathing

Possible behavioral interpretation:
- sarcasm
- suppressed irritation
```

### Example B: genuine excitement

```text
Words:
"That's great."

Voice:
- high pitch
- rapid delivery
- rising intonation
- energetic volume

Possible behavioral interpretation:
- genuine excitement
```

The words are identical, but the behavioral evidence is different.

---

# Two Parallel Evidence Channels

## 1. Linguistic Channel

```json
{
  "speaker": "Rainee",
  "text": "That's great.",
  "timestamp": 12.43
}
```

## 2. Vocal Channel

```json
{
  "speaker": "Rainee",
  "timestamp": 12.43,
  "pitch": "elevated",
  "energy": "high",
  "speechRate": "fast",
  "pauseBefore": 0.12,
  "pauseAfter": 0.04,
  "intonation": "rising",
  "voiceQuality": "bright"
}
```

The behavior engine can combine both representations.

```text
             AUDIO
               │
       ┌───────┴────────┐
       ↓                ↓
   TRANSCRIPT       VOICE DATA
       │                │
       └───────┬────────┘
               ↓
       BEHAVIOR INTERPRETER
               ↓
       CHARACTER STATE
               ↓
        REACTION BRANCHES
```

---

# Why Not Convert Everything to Text?

For a first implementation:

```text
Audio → Transcript → Behavior
```

is completely reasonable.

However, an advanced engine should preserve:

```text
Audio → Transcript + Acoustic Features
```

because otherwise the system throws away information that distinguishes spoken dialogue from written dialogue.

Useful acoustic / vocal evidence can include:

- pitch
- pitch movement
- volume / energy
- speech rate
- pauses
- hesitation
- duration
- intonation
- voice quality
- laughter
- sighs
- nervous vocalizations
- interruptions
- overlapping speech
- changes in speaking speed
- changes in vocal intensity

These should be treated as **evidence**, not automatically as absolute emotional truth.

---

# Two-Character Interaction Example

Suppose Rainee says:

> "I'm perfectly fine."

The engine should not necessarily treat the sentence as proof that Rainee is fine.

It could receive:

```text
Rainee says:
"I'm perfectly fine."

Text interpretation:
- explicit claim of being fine

Vocal evidence:
- unusually fast speech
- elevated pitch
- short pause
- nervous laugh

Rainee state:
- embarrassed
- defensive

Noir's interpretation:
- Rainee is probably hiding something

Noir response tendency:
- tease rather than directly confront

Rainee reaction:
- defend harder

Noir reaction:
- tease again

→ emergent interaction
```

The important architectural distinction is:

**What the character says ≠ necessarily what the character feels ≠ necessarily what the other character believes.**

That separation can produce more believable interactions.

---

# Proposed Audio Evidence Object

A future `Audio Evidence` object could look like:

```json
{
  "type": "audio_evidence",
  "speaker": "Rainee",

  "transcript": "I'm perfectly fine.",

  "timing": {
    "start": 12.43,
    "duration": 1.82
  },

  "prosody": {
    "pitch": "high",
    "energy": "medium-high",
    "rate": "fast",
    "intonation": "rising"
  },

  "nonverbal": [
    "nervous_laugh",
    "short_pause"
  ],

  "behavioralInterpretation": [
    "defensive",
    "embarrassed",
    "attempting_to_control_perception"
  ]
}
```

## Boundary packaging

When this object crosses an app boundary, the detailed audio object is the envelope
`payload` and keeps its source link:

```json
{
  "schema_version": "1.0",
  "id": "fiction:audio_evidence:scene_014_line_03",
  "type": "audio_evidence",
  "label": "Rainee vocal behavior — scene 014 line 03",
  "origin_app": "mining_app",
  "provenance": {
    "source_ids": ["mining:capture:scene_014_line_03"],
    "capture_mode": "manual_capture_automated_processing"
  },
  "evidence_links": ["mining:capture:scene_014_line_03"],
  "payload": { "speaker": "Rainee", "transcript": "I'm perfectly fine." }
}
```

The local `audio_evidence` example above remains useful for engine design; it is not
a separate boundary contract.

The `behavioralInterpretation` field should be treated as an inference generated from the evidence rather than an objective measurement.

---

# Integration With the Fiction Behavior Engine

Audio should become another input type alongside the existing evidence system.

Possible evidence channels:

```text
SOURCE MEDIA
     │
     ├── Transcript
     ├── Episode Anchors
     ├── Behavioral Observations
     ├── Images / Visual Evidence
     ├── Audio Evidence
     └── Transformation / State Data
             │
             ↓
       BEHAVIOR INTERPRETER
             │
             ↓
       CHARACTER STATE
             │
             ↓
       RELATIONSHIP STATE
             │
             ↓
       REACTION BRANCHING
             │
             ↓
       INTERACTION SIMULATION
             │
             ↓
          PROSE
```

This keeps audio from becoming a separate writing system. It becomes another source of evidence for the same behavioral engine.

---

# Character State Interaction

A future engine could represent each character as having several simultaneous layers:

```text
CHARACTER
│
├── Spoken Words
├── Intended Meaning
├── Vocal Delivery
├── Internal State
├── Public Behavior
├── Private Goal
├── Interpretation of Other Characters
└── Current Relationship State
```

For example:

```text
Rainee

Words:
"I'm perfectly fine."

Actual internal state:
embarrassed

Public behavior:
defensive

Vocal delivery:
too fast

Private goal:
hide embarrassment

Noir's interpretation:
"She's obviously embarrassed."

Noir's goal:
get Rainee to admit it

Noir's tactic:
teasing

Rainee's predicted response:
stronger denial
```

This creates a causal chain instead of simply generating the next line of dialogue.

---

# Important Design Rule

The audio analyzer should **not directly decide what the character feels**.

Instead:

```text
Audio Evidence
      ↓
Observable Features
      ↓
Possible Interpretations
      ↓
Character Schema
      ↓
Current State
      ↓
Behavior Selection
```

For example, a high-pitched voice could indicate excitement, fear, embarrassment, theatrical exaggeration, or simply a character's normal speaking style.

The character's established behavior schema must determine how that evidence is interpreted.

This is especially important for characters with unusual personalities or transformation states.

---

# Transformation-State Compatibility

For shapeshifting characters, audio can be associated with a specific transformation state.

Example:

```text
Rainee
│
├── State 0: Pre-Glamor Rainee
│   └── normal vocal behavior
│
├── State 1: Glamour Rainee
│   └── confident / theatrical vocal behavior
│
└── State 2: Ultra-Luxury Diaper / Stewie State
    └── altered speech patterns
        ├── exaggerated delivery
        ├── rapid reactions
        ├── theatrical indignation
        └── distinctive vocal rhythm
```

The same sentence could therefore produce different behavioral interpretations depending on the active state.

---

# Future Live Interaction Architecture

A real-time version could eventually operate like:

```text
MICROPHONE
    ↓
Speech / Speaker Detection
    ↓
Transcript + Timestamps
    ↓
Acoustic Feature Extraction
    ↓
Character-State Resolver
    ↓
Behavior Branch Generator
    ↓
Response Selection
    ↓
Dialogue Generation
    ↓
Text-to-Speech
    ↓
Character Voice
```

This would turn the Fiction Behavior Engine from a static writing assistant into a **live character interaction simulator**.

---

# Core Principle

The goal is not:

> "Turn audio into text and give the text to the AI."

The stronger architecture is:

> **Preserve everything useful from the audio, convert it into structured evidence, and let the character behavior system decide what that evidence means.**

That allows:

```text
WORDS
+
VOICE
+
TIMING
+
NONVERBAL SOUNDS
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

This is the same causal architecture as the rest of the Fiction Behavior Engine, just with **audio added as another evidence source**.

# Princess Sari / Princess Sari Cheryl — Transformation Worked Example

**Status:** planning example; preserves Rain's current modeling choice

**Visual reference status:** The five linked images below are **early drafts of the
node layouts**, included to communicate the concept. They are not final UI sketches,
locked visual designs, or an implementation specification.

## 1. Core identity decision

The current board model is one installed **Princess Sari character group** with
internal Level 1 persona/state nodes. Cheryl is a distinct behavior-bearing persona
inside that group, while Level 0 external switches select which state of the same
person is active.

```text
Level 0 — external master board
└── Princess Sari group [name provisional]
    ├── Crazy Girl state switch
    └── Rush Dog state switch

Level 1 — installed inside the group
└── Princess Sari
    ├── Akane Base
    ├── Relationship / Transformation Node
    └── Cheryl Persona
```

This avoids creating a new top-level character every time a saved state is named.
If a future story requires Cheryl to exist as an independently selected external
character, the graph can expose her through a separate Level 0 character node while
retaining the shared internal group and state data.

## 2. Sari's current base

Princess Sari's base character is an **Akane-based** construction. Akane is source
or reference data contributing to Sari's behavior; it is not automatically a name
that should appear in generated prose.

The useful character-research fields from the old notes are:

- personality and behavioral traits
- speech and vocal patterns
- motivations and habits
- relationships and relationship-specific behavior
- sample dialogue and representative scenes
- differences between the source character and the constructed character

These should be captured as evidence or derived signals, not copied directly into
Sari's dialogue.

### Sari's power boundary

The old notes distinguish Sari's pre-existing mimicry from the later Eidolessa
technology:

```text
Red Chaos Emerald
├── voice mimicry
├── appearance mimicry
└── recall of previously used appearances

Eidolessa avatar technology
├── independent avatar creation
├── distinctive persona development
├── accumulated persona memories
└── non-humanoid forms, such as a car
```

The Red Chaos Emerald is a power of Sari and her twin Princess Sall-li; it is not a
general species capability. The important system distinction is that mimicry and
appearance recall do not automatically create an independent character. The
Eidolessa process is what introduces a new behavior-bearing persona.

## 3. Cheryl as a distinct internal persona

Cheryl is a distinct behavior-bearing persona created through Sari's
transformation/persona process. In the default board model, Cheryl is an internal
Level 1 node inside the Princess Sari group and can become dominant in a scene. It
can be exposed as a separate external character node only when a story requires
that behavior.

```text
Princess Sari
    │
    └── transformation / persona-creation relationship
             │
             ▼
Princess Sari Cheryl
```

The transformation may change appearance, voice, priorities, reactions, sexual or
romantic behavior, comedic function, and interaction strategy. Shared memory does
not mean identical behavior: Sari and Cheryl can remember related events while
interpreting and acting on them differently.

In the current lore, Cheryl's creation is accidental rather than a deliberately
designed copy. The Eidolessa process accelerates or externalizes aspects of Sari's
cognition, producing a Cheryl-like form while retaining selected anthropomorphic
features such as ears and skin coloration. This is project lore, not mined evidence.

### Sari/Cheryl personality delta

The transformation should not be modeled as “Sari, but with a different name.” The
current working contrast is:

| Dimension | Princess Sari | Princess Sari Cheryl |
|---|---|---|
| Social presence | More passive or background-oriented | More assertive and behaviorally forward |
| Behavioral source | Akane-based Sari data | Cheryl/Archer-derived data plus Sari continuity |
| Sexual behavior | Sari's own established rules | More sexually adventurous; exact interpretation remains author-controlled |
| Authority | Sari's active Sari state | Cheryl has authority over Cheryl's own behavior when Cheryl is dominant |

Any detailed claim about Cheryl's original sexuality or BDSM behavior must be
verified against the mined Archer/Cheryl source data before becoming a fixed rule.

## 4. Dominance options

There are multiple valid authoring strategies. They are alternatives, not required
to be merged into one universal mechanism.

### Option A — internal persona states with external switches (default)

Keep Akane Base and Cheryl Persona inside the installed Princess Sari group, and use
Level 0 switches to select the saved state:

```text
Princess Sari group
├── Crazy Girl state
└── Rush Dog state
```

The scene selects which state is active. The underlying Sari group and internal
persona nodes remain the same.

### Option B — separately exposed Cheryl character node

If a story needs Cheryl to function as an independently selected character, expose
her as a separate Level 0 character node linked to the same installed group:

```text
Level 0
├── Princess Sari
└── Cheryl Persona [same-person/state link]
```

The link preserves shared memory and provenance. It does not duplicate or erase the
internal Sari/Cheryl data.

### Option C — linked nodes with shared sub-nodes

Keep two Level 1 characters, but connect them to shared Level 2 or Level 3 nodes
for memory, physical continuity, speech, or transformation rules. Sari-native and
Cheryl-native behavior remains local to each character.

This matches the current network interpretation of transformation states: forms can
be separate characters while still sharing selected sub-nodes.

## 5. Internal versus external relationships

Relationship types inside a character structure should not be confused with
relationships between characters.

```text
Princess Sari Cheryl — internal composition
├── Cheryl persona data
├── Akane-derived reference data
├── Dog/Rush trait
├── shared-memory link
├── dominance rule
└── transformation rule

Princess Sari Cheryl — external social graph
├── Princess Sari
├── Princess Sall-li
├── other characters
├── world/location nodes
└── scene-specific relationships
```

Internal links explain how the character is constructed or changes state. External
links explain how the character behaves toward people, objects, places, and events.
They may use the same graph infrastructure, but they need different relationship
types and should not be treated as interchangeable evidence.

## 6. Dog / Rush personality trait attachment

The dog/Rush personality is an attached trait or behavior node, not automatically a
replacement character identity.

```text
Princess Sari Cheryl
└── Level 2: Cheryl-dominant state
    └── attached trait: Dog / Rush personality
```

The trait can affect physical instincts, sensory attention, posture, comedic
reactions, impulsivity, pursuit behavior, vocabulary, and vocalization.

The author can attach the trait to Cheryl only, Sari only, both, or a particular
transformation state. The attachment should record its target and scope so that
“Cheryl with dog/Rush behavior” does not become “Sari is permanently a dog.”

## 7. Sall-li and transformation comedy

Princess Sall-li is Sari's twin sister and should remain a separate Level 1
character. She can function as an external relationship node and as an observer of
Sari's transformation.

The dog-form comedy example is useful as relationship evidence: Sall-li's reaction
to Sari Cheryl's dog behavior helps define both characters. It should be stored as a
scene or sibling-interaction example, not as a permanent personality rule for every
dog transformation.

## 8. Transformation and persona technology

The old notes describe Eidolessa technology as creating an alternative mental realm
in which a persona develops memories, experiences, and personality traits. The
meaningful architectural principle is:

> A transformation can create a new behavior-bearing identity, not merely change
> the character's appearance.

The Eidolessa are currently described as a beautiful lesbian kenomimi fox
civilization. This is project world lore to be refined; it should not be treated as
mined source evidence.

## 9. Naming and reference rules

Names are separate data from identity and behavior. The same character may be
addressed as Sari, Cheri, or Cheryl, but aliases should resolve to the selected
node/state for that scene.

Reference names such as Akane or Cheryl Tunt belong in metadata, provenance, or audit
fields unless the scenario explicitly requires them to appear in prose.

## 10. Assumption filtering / structural transposition

The old text contributed three rule domains that should remain distinct:

1. **Data-collection rules** — what evidence is gathered and how it is labeled.
2. **Prose rules** — how approved behavior is expressed in narration and dialogue.
3. **Change rules** — how transformations, dominance changes, overrides, and
   relationship-state transitions occur.

It also distinguished **focused extraction** (only the scenes involving a character)
from **extension references** (selected traits borrowed from another character or
performer). An extension reference must remain explicitly analogical or supplemental
so it cannot silently become direct canon for the target character.

The old “Nullification Node” idea is retained here as a possible function rather than
a fixed node type. Its purpose would be to remove source-specific assumptions before
applying a new identity or archetype:

```text
source character data
→ filter source-specific assumptions
→ preserve underlying behavior/action structure
→ apply a new identity or archetype
→ reconstruct relationships
```

Possible filters include names, pronouns, and gender-coded social assumptions. This
must not delete the source evidence; it creates a derived interpretation that remains
traceable to the original.

## 11. Board-level organization

The sketches show each saved configuration as a Level 0 Group Node with a visible
Level 1 internal network. The configuration name can therefore be explicit:

```text
Level 0 — configured group
└── Princess Sari Crazy Girl
    └── Level 1 internal network
        ├── Princess Sari [dominant]
        ├── Shared [active]
        ├── Cheryl [active]
        ├── Rush / Dog [off]
        ├── Transformation
        └── Akane [passive]
```

Another Level 0 configuration can show the Rush/Dog variant:

```text
Level 0 — configured group
└── Princess Sari Crazy Girl Rush Dog
    └── Level 1 internal network
        ├── Princess Sari [dominant]
        ├── Shared [active]
        ├── Cheryl [passive]
        ├── Rush / Dog [extended]
        ├── Transformation
        └── Akane [passive]
```

These configured groups can be variants or instances of the same underlying Sari
graph. An external Level 0 Relationship Node can connect them to other configured
groups—for example, a Twin Sisters relationship connecting Sari to a Princess
Sall-li Rouge group. That external relationship is distinct from the internal Shared
and Transformation nodes.

The Level 1 Relationship/Transformation Node resolves how Akane Base, Cheryl, and
the attached modifiers relate internally. The Level 0 group configuration records
the resulting state used by a story. The status words shown in the sketches—such as
dominant, active, passive, extended, and off—are node-state values, not new node
types.

The Transformation Node can contain process evidence from other shows about gradual
state change—for example calming down, taking medication, or moving between
personality states. That evidence describes the transition path, while the saved
state preset describes the resolved state used by a story.

## 12. Early node-layout drafts

These images are retained as visual thinking artifacts. They clarify the intended
Level 0/Level 1 relationship, configuration variants, internal transformation
network, and external Twin Sisters relationship, but remain subject to revision.

1. [Princess Sari base — early draft](assets/sari_cheryl_early_drafts/01_princess_sari_base_early_draft.png)
2. [Crazy Girl configuration — early draft](assets/sari_cheryl_early_drafts/02_crazy_girl_configuration_early_draft.png)
3. [Rush Dog configuration — early draft](assets/sari_cheryl_early_drafts/03_rush_dog_configuration_early_draft.png)
4. [Normal group variation — early draft](assets/sari_cheryl_early_drafts/04_normal_group_variation_early_draft.png)
5. [Twin Sisters external relationship — early draft](assets/sari_cheryl_early_drafts/05_twin_sisters_external_relationship_early_draft.png)

## 13. Open authoring decisions

Story-specific configurations should be saved as named state presets rather than
duplicating or rewriting the character graph. See
`Node_Activation_and_Story_State_Presets.md` for the proposed activation model and
the two worked states:

- **Crazy Girl configuration:** Princess Sari dominant, Cheryl active, Rush/Dog off,
  Akane passive.
- **Rush Dog configuration:** Princess Sari dominant, Cheryl passive, Rush/Dog
  extended, Akane passive.

- Does Cheryl retain all of Sari's memories, or only selected memories?
- Can Sari and Cheryl communicate internally?
- Can Sari override Cheryl when Cheryl is dominant?
- Is the dog/Rush trait permanent for Cheryl or active only in selected scenes?
- Which relationships are shared, and which belong only to Cheryl?
- What event activates or deactivates the Cheryl character?

These are story rules, not reasons to collapse the two characters into one node.

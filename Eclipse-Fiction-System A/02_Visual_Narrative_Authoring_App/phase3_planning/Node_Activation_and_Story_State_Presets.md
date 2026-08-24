# Node Activation and Story-State Presets

**Status:** working proposal

## Purpose

One character graph should be reusable across multiple stories without duplicating
the character or permanently rewriting its nodes. A story-specific configuration
selects which nodes contribute to the current character state.

This is especially useful for Princess Sari Cheryl:

```text
Shared character graph
├── Princess Sari / Akane Base
├── Cheryl persona
├── Dog / Rush personality
├── shared memory
├── transformation rules
└── relationship data

Saved state presets
├── Princess Sari — Crazy Girl Mode
└── Princess Sari — Rush Dog Mode
```

## Board hierarchy

The sketches clarify that a saved configuration is represented as a **Level 0 Group
Node** containing its own visible Level 1 internal network. The Level 0 label can be
the configured character name, such as “Princess Sari,” “Princess Sari Crazy Girl,”
or “Princess Sari Crazy Girl Rush Dog.” These are configured group instances or
variants, not necessarily unrelated characters.

```text
Level 0 — configured Group Node
└── Princess Sari Crazy Girl [timeline / story context]
    │
    └── Level 1 — internal network
        ├── Princess Sari [dominant]
        ├── Shared [active]
        ├── Cheryl [active or passive]
        ├── Rush / Dog [extended or off]
        ├── Transformation [process resolver]
        └── Akane [active, passive, or off]
```

Different configurations can be displayed as separate Level 0 Group Nodes while
remaining linked to the same underlying character/evidence graph. The configuration
records which Level 1 nodes are dominant, active, passive, extended, or off.

An external Level 0 Relationship Node connects configured groups to each other. For
example, a **Twin Sisters** Relationship Node can connect the Princess Sari group to
a separate Princess Sall-li Rouge group. The external relationship is not the same
as the internal Shared or Transformation nodes inside either group.

## Node activation states

Every optional behavior, reference, trait, or relationship contribution should have
an explicit activation state:

| State | Meaning |
|---|---|
| `active` | The node contributes to the cooked character/story state. |
| `bypassed` | The node remains connected and visible but contributes no behavior or data to the current cook. |
| `off` | The node is excluded from the current computation, while remaining available in the graph and presets. |

The distinction between `bypassed` and `off` is provisional. A practical UI may
eventually expose only one visible Off control while preserving the difference in
the data model. The important requirement is that turning a node off must not delete
it or disconnect it.

For a behavior trait such as Dog/Rush, bypass means “pass through the character
without adding this trait.” For a dominance node, the active state is selected by
the state preset rather than by deleting the other states.

## Worked state presets

### Princess Sari Crazy Girl configuration

```text
Princess Sari: dominant
Cheryl:        active
Rush / Dog:    off
Akane:         passive
```

This is the first configuration shown in the sketches: Sari is the dominant/root
character, Cheryl is active, the Rush/Dog extension is off, and Akane is passive.

### Princess Sari Crazy Girl Rush Dog configuration

```text
Princess Sari: dominant
Cheryl:        passive
Rush / Dog:    extended
Akane:         passive
```

This is the second configuration shown in the sketches: the Rush/Dog extension is
enabled while Cheryl is passive and Akane remains passive. The two configurations
share the same underlying graph and evidence; only the Level 1 statuses and saved
Level 0 configuration change.

## Internal Level 1 relationship and transformation process

The internal Level 1 Relationship or Transformation Node controls the relationship
between Akane Base and Cheryl Persona:

```text
Princess Sari character group
├── Akane Base [dominant]
├── Relationship / Transformation Node
└── Cheryl Persona [passive]
```

The dominance can be reversed by changing the configuration of the Level 0 Group
Node. The Level 1 relationship node remains the place where the internal
character-state resolution is represented.

The Transformation Node should handle how in-between states happen, not just store
the final appearance. It may contain transcript and scene evidence about processes
such as calming down, taking medication, losing or regaining control, gradual
personality change, or acquiring and shedding a behavioral state. That evidence
describes the transition path, while the saved state preset describes the resolved
state used by a particular story or scene.

## Preset data shape

The exact schema is not locked, but the portable meaning should be approximately:

```json
{
  "id": "state:princess_sari:rush_dog",
  "label": "Princess Sari — Rush Dog Mode",
  "target_character_group": "group:princess_sari",
  "scope": "story_or_scene",
  "node_states": {
    "node:akane_base": { "activation": "active", "dominance": "sleep" },
    "node:cheryl_persona": { "activation": "active", "dominance": "dominant" },
    "node:dog_rush": { "activation": "active", "dominance": null }
  },
  "created_from": "character:princess_sari_cheryl",
  "provenance": [],
  "notes": "Story-specific configuration; does not duplicate or rewrite source nodes."
}
```

The preset should reference node IDs rather than copy their data. This keeps updates
to the shared character graph available to every story while preserving the ability
to freeze or version a story's configuration.

## Recommended organization features

1. **Named state presets.** Save a complete configuration under a human-readable
   name instead of requiring the author to remember every switch.
2. **Preset diff.** Show exactly what changed between Crazy Girl Mode and Rush Dog
   Mode: Dog/Rush `off → active`; all other settings unchanged.
3. **Scope.** Allow a preset to apply at project, story, chapter, scene, or beat
   level. The narrowest active scope should override the broader one.
4. **Inheritance.** Let a story preset inherit the shared character graph, then
   override only selected node states.
5. **Cook/output preview.** Before generation, show the resolved active stack and
   explain why each node is active, bypassed, or off.
6. **No silent mutation.** Switching presets must not rewrite the base character,
   delete dominated nodes, or erase evidence.
7. **Conflict warnings.** Flag invalid states such as two mutually exclusive
   personas both being dominant, or a trait requiring a persona that is off.
8. **Versioning and provenance.** Record who created a preset, which graph version it
   used, and which nodes were changed after it was saved.

## Relevant prior art

This proposal follows two established patterns:

- Houdini uses a **Bypass** flag to make a node have no effect while leaving it in
  the network, and uses switches to select between alternative branches. See
  [SideFX network organization](https://www.sidefx.com/docs/houdini/network/organize.html).
- Pixar USD uses **variant sets** and **variant selections** to package alternatives
  inside one asset and choose which alternative is composed. See the
  [USD Quickstart Guide](https://openusd.org/files/USD_Quickstart_Guide.pdf).

Eclipse can combine these patterns: bypass/off controls handle individual node
participation, while named presets act like story-specific variant selections.

## Open decisions

- Whether `bypassed` and `off` remain separate in the final UI.
- Whether presets apply to a whole story or can change at beat level.
- Whether a preset stores a live reference to the graph or a versioned snapshot.
- How the Fiction Engine receives the resolved active stack.
- Whether activation changes become part of the narrative event log.

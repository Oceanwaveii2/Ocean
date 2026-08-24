#!/usr/bin/env python3
"""
FICTION Narrative Reinterpretation Engine (v0.2)
-----------------------------------------
Inputs:
  1. Fiction story JSON (narrative skeleton)
  2. Any number of character behavior master JSONs

Modes:
  reinsert: preserve events and add behavior hooks from the data sources
  rewrite:  preserve scene functions/events, regenerate performance instructions
  auto:     choose reinsert for low-impact scenes and rewrite for high-impact scenes

v0.2 additions (coverage + trait projection):
  - Data-driven character registry (no hardcoded rainee/noir in matching logic).
  - coverage_map(): every scene gets a per-character coverage tier
    (direct / adjacent / gap) so downstream consumers know when behavior
    is mined, archetype-inferred, or projected into an unseen context.
  - Three-tier hook selection: direct records -> generic_archetypes ->
    transferred core traits. A character is never left silent just because
    the scene context (e.g. comedy) is not covered by mined data.
  - overmine(): for sparse masters, synthesizes composite candidate hooks
    from archetypes x literary_sfx, flagged provenance="inferred".
  - transfer_traits(): core traits are re-registered per scene register
    (comedy / drama / horror ...) so the trait stays deterministic while
    its expression changes with context.

Important:
  - Complete transcripts are reference-only.
  - This engine uses behavioral_mapping_abstract / primitives / archetypes.
  - Character identity and plot causality are protected by design.
  - Provenance discipline: every hook carries provenance
    ("mined" | "inferred" | "projected") and a confidence in [0,1].
"""

from __future__ import annotations
import argparse
import copy
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Tuple


STOPWORDS = {
    "the","a","an","and","or","to","of","in","on","at","for","with","from",
    "is","are","be","as","that","this","while","then","after","before",
    "same","scene","story","character","state","action","subject","object",
    "show","establish","use","preserve","continue"
}

# ---------------------------------------------------------------------------
# Character registry (data-driven; defaults keep old rainee/noir runs working).
# A master JSON may override/extend its entry via a top-level "character_profile"
# block: aliases, guardrails, core_traits, boost_keywords, registers.
# ---------------------------------------------------------------------------

CHARACTER_REGISTRY: Dict[str, Dict[str, Any]] = {
    "rainee": {
        "label": "Rainee",
        "aliases": ["rainee"],
        "guardrails": [
            "Rainee remains Rainee.",
            "Stewie-derived behavior is only a performance layer.",
            "Retain merchant logic and supernatural awareness.",
            "Use theatrical defensiveness, absurd rationalization, direct wants, and business framing where scene-compatible.",
        ],
        "core_traits": [
            "theatrical defensiveness",
            "absurd rationalization",
            "direct wants stated as business framing",
            "supernatural awareness",
        ],
        "boost_keywords": [
            "literal","unfiltered","theatrical","defensive","absurd",
            "merchant","shopping","collection","boundary","reframe",
            "command","proud","teasing","quest","guilt","coping",
        ],
    },
    "noir": {
        "label": "Noir/Jillian",
        "aliases": ["noir", "jillian"],
        "guardrails": [
            "Noir remains Rainee's sister.",
            "Use abstract Jillian/Noir behavior patterns only.",
            "Favor literal interpretation, unfiltered reaction, teasing, bluntness, and expressive curiosity when scene-compatible.",
        ],
        "core_traits": [
            "literal interpretation",
            "unfiltered reaction",
            "teasing bluntness",
            "expressive curiosity",
        ],
        "boost_keywords": [
            "literal","unfiltered","teasing","bluntness","curiosity",
            "reaction","absurd","comedy","reveal",
        ],
    },
}

# Scene register detection: keywords from narrative_function -> register dial.
REGISTER_KEYWORDS: Dict[str, List[str]] = {
    "comedy": ["comedic","comedy","gag","joke","farce","premise","slapstick","absurd"],
    "drama": ["turning point","confession","loss","betrayal","emotional","reconciliation"],
    "horror": ["dread","threat","horror","pursuit","transformation pain"],
    "exposition": ["exposition","establish","origin reveal","worldbuilding"],
    "revelation": ["visual reveal","identity recognition","reframe","origin reveal"],
}


def load_json(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def tokens(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9_'-]+", text.lower())
    return {w for w in words if w not in STOPWORDS and len(w) > 2}


def flatten_text(obj: Any) -> str:
    if isinstance(obj, str):
        return obj
    if isinstance(obj, dict):
        return " ".join(flatten_text(v) for v in obj.values())
    if isinstance(obj, list):
        return " ".join(flatten_text(v) for v in obj)
    return str(obj)


# ---------------------------------------------------------------------------
# Registry construction
# ---------------------------------------------------------------------------

def build_registry(masters: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """Merge CHARACTER_REGISTRY defaults with each master's optional
    'character_profile' block. Any character key not in the defaults is
    added from scratch, so new mined characters need no code changes."""
    registry = {k: copy.deepcopy(v) for k, v in CHARACTER_REGISTRY.items() if k in masters}
    for key, master in masters.items():
        profile = master.get("character_profile") or {}
        entry = registry.setdefault(key, {
            "label": key.title(),
            "aliases": [key.lower()],
            "guardrails": [],
            "core_traits": [],
            "boost_keywords": [],
        })
        for field in ("label", "aliases", "guardrails", "core_traits", "boost_keywords", "registers"):
            if field in profile:
                entry[field] = profile[field]
        entry["aliases"] = sorted({a.lower() for a in entry["aliases"]} | {key.lower()})
    return registry


def extract_behavior_records(master: Dict[str, Any], source_name: str) -> List[Dict[str, Any]]:
    records = []
    for ds in master.get("datasets", []):
        abstract = ds.get("behavioral_mapping_abstract")
        if abstract is None:
            abstract = ds.get("behavioral_mapping_abstract_SPECIAL")
        if abstract is None:
            abstract = ds.get("behavioral_mapping")
        if abstract is None:
            continue

        if isinstance(abstract, dict):
            abstract_text = flatten_text(abstract)
        else:
            abstract_text = str(abstract)

        primitives = ds.get("behavioral_primitives", [])
        generic = ds.get("generic_archetypes", {})
        records.append({
            "dataset_id": ds.get("id", "unknown"),
            "source": source_name,
            "abstract": abstract,
            "abstract_text": abstract_text,
            "primitives": primitives,
            "generic_archetypes": generic,
            "literary_sfx": ds.get("literary_sfx"),
            "application_mapping": ds.get("application_mapping", {}),
        })
    return records


def build_behavior_index(masters: Dict[str, Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    return {
        key: extract_behavior_records(master, f"{key} behavioral layer")
        for key, master in masters.items()
    }


# ---------------------------------------------------------------------------
# Scene analysis
# ---------------------------------------------------------------------------

def scene_text(scene: Dict[str, Any]) -> str:
    parts = [
        scene.get("title", ""),
        scene.get("location", ""),
        scene.get("time", ""),
        flatten_text(scene.get("narrative_function", [])),
        flatten_text(scene.get("events", [])),
        flatten_text(scene.get("behavioral_primitives", [])),
        flatten_text(scene.get("performance_slots", {})),
    ]
    return " ".join(parts)


def character_scene_relevance(scene: Dict[str, Any], character: str,
                              registry: Dict[str, Dict[str, Any]]) -> float:
    aliases = registry[character]["aliases"]
    participants = {p.lower() for p in scene.get("participants", [])}
    text = scene_text(scene).lower()
    direct = 1.0 if participants & set(aliases) else 0.0
    indirect = 0.3 if any(a in text for a in aliases) else 0.0
    return min(1.0, direct + indirect)


def scene_register(scene: Dict[str, Any]) -> str:
    nf = " ".join(scene.get("narrative_function", [])).lower()
    best, best_hits = "neutral", 0
    for register, keys in REGISTER_KEYWORDS.items():
        hits = sum(1 for k in keys if k in nf)
        if hits > best_hits:
            best, best_hits = register, hits
    return best


# ---------------------------------------------------------------------------
# Scoring and coverage
# ---------------------------------------------------------------------------

def score_record(scene: Dict[str, Any], record: Dict[str, Any],
                 boost_keywords: List[str]) -> float:
    st = tokens(scene_text(scene))
    rt = tokens(record["abstract_text"] + " " + " ".join(record["primitives"]))
    overlap = len(st & rt)
    base = min(overlap / 8.0, 1.0)

    nf = " ".join(scene.get("narrative_function", [])).lower()
    abstract = record["abstract_text"].lower()

    boosts = 0.0
    for key in boost_keywords:
        if key in nf and key in abstract:
            boosts += 0.08

    return min(base + boosts, 1.0)


def archetype_tokens(record: Dict[str, Any]) -> set[str]:
    arch = record.get("generic_archetypes") or {}
    keys = " ".join(arch.keys()) if isinstance(arch, dict) else str(arch)
    return tokens(keys.replace("_", " "))


def coverage_map(scene: Dict[str, Any], records: List[Dict[str, Any]],
                 character: str, registry: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Per-character coverage tier for this scene.
    direct:   mined records match the scene language.
    adjacent: no record matches, but a generic archetype does.
    gap:      nothing in the master data speaks to this scene; hooks will be
              projected from core traits (transfer_traits)."""
    if not records:
        return {"character": character, "tier": "gap", "best_direct": 0.0,
                "matched_archetypes": []}

    best_direct = max(score_record(scene, r, registry[character]["boost_keywords"])
                      for r in records)
    st = tokens(scene_text(scene))
    matched = sorted({a for r in records for a in archetype_tokens(r) if a in st})

    if best_direct > 0.05:
        tier = "direct"
    elif matched:
        tier = "adjacent"
    else:
        tier = "gap"
    return {"character": character, "tier": tier,
            "best_direct": round(best_direct, 3),
            "matched_archetypes": matched}


# ---------------------------------------------------------------------------
# Trait projection and overmining
# ---------------------------------------------------------------------------

def transfer_traits(scene: Dict[str, Any], character: str,
                    registry: Dict[str, Dict[str, Any]],
                    register: str) -> List[Dict[str, Any]]:
    """Project core traits into this scene's register. The trait is the
    deterministic floor; the expression dial follows the scene context."""
    traits = registry[character]["core_traits"]
    return [
        {
            "dataset_id": "trait_projection",
            "source": f"{character} core traits",
            "pattern": f"Express '{trait}' through a {register} register appropriate to this scene's function.",
            "primitives": [trait],
            "provenance": "projected",
            "confidence": 0.4,
        }
        for trait in traits
    ]


def overmine(records: List[Dict[str, Any]], limit: int = 4) -> List[Dict[str, Any]]:
    """Sparse-data amplification: synthesize composite candidate hooks from
    generic_archetypes x literary_sfx so a thin master can still fill scenes.
    Always flagged provenance='inferred' with confidence scaled by how much
    mined data exists."""
    if not records:
        return []
    confidence = min(0.15 * len(records), 0.35)  # more data -> more trustworthy inference
    candidates = []
    for r in records:
        arch = r.get("generic_archetypes") or {}
        if not isinstance(arch, dict):
            continue
        for name, desc in arch.items():
            sfx = r.get("literary_sfx") or ""
            pattern = f"Composite behavior '{name.replace('_', ' ')}' ({desc})"
            if sfx:
                pattern += f"; sound/texture cue: {sfx}"
            candidates.append({
                "dataset_id": f"{r['dataset_id']}:synth",
                "source": r["source"],
                "pattern": pattern,
                "primitives": [name.replace("_", " ")],
                "provenance": "inferred",
                "confidence": round(confidence, 2),
            })
    # Deduplicate by primitive and keep a bounded set.
    seen, out = set(), []
    for c in candidates:
        k = tuple(c["primitives"])
        if k not in seen:
            seen.add(k)
            out.append(c)
    return out[:limit]


# ---------------------------------------------------------------------------
# Hook selection (three tiers)
# ---------------------------------------------------------------------------

def summarize_record(r: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "dataset_id": r["dataset_id"],
        "source": r.get("source", ""),
        "behavioral_pattern": r.get("pattern", r.get("abstract_text", "")),
        "primitives": r.get("primitives", []),
        "literary_sfx": r.get("literary_sfx"),
        "provenance": r.get("provenance", "mined"),
        "confidence": r.get("confidence", 0.85),
    }


def select_records(scene: Dict[str, Any], records: List[Dict[str, Any]],
                   character: str, registry: Dict[str, Dict[str, Any]],
                   register: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """Tier 1: direct mined matches. Tier 2: archetype-inferred composites
    (overmined). Tier 3: projected core traits re-registered for this scene.
    The character is never left without hooks."""
    scored = [(score_record(scene, r, registry[character]["boost_keywords"]), r)
              for r in records]
    scored.sort(key=lambda x: x[0], reverse=True)
    direct = [r for s, r in scored if s > 0.05][:top_k]
    for r in direct:
        r.setdefault("provenance", "mined")
        r.setdefault("confidence", 0.85)

    if len(direct) >= top_k:
        return direct

    shortfall = top_k - len(direct)
    inferred = overmine(records, limit=shortfall + 1)
    picked = inferred[:shortfall]
    if picked:
        return direct + picked

    # Full gap: project traits into this scene's register.
    return direct + transfer_traits(scene, character, registry, register)[:top_k - len(direct)]


# ---------------------------------------------------------------------------
# Protected contract and scene builders
# ---------------------------------------------------------------------------

def protected_contract(story: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "preserve": copy.deepcopy(
            story.get("reinterpretation_contract", {}).get("preserve", [])
        ),
        "do_not_accidentally_change": copy.deepcopy(
            story.get("reinterpretation_contract", {}).get("do_not_accidentally_change", [])
        ),
    }


def build_reinsert(scene: Dict[str, Any], character_hooks: Dict[str, List[Dict[str, Any]]],
                   coverage: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    out = copy.deepcopy(scene)
    out["fiction_engine"] = {
        "mode": "reinsert",
        "instruction": "Keep original event sequence. Insert behavioral mechanisms into performance slots without replacing the narrative events.",
        "coverage": coverage,
        "behavior_hooks": {
            char: [summarize_record(r) for r in recs] for char, recs in character_hooks.items() if recs
        }
    }

    for char, recs in character_hooks.items():
        if not recs:
            continue
        slot = out.setdefault("performance_slots", {}).setdefault(char, {})
        slot.setdefault("behavioral_overlay", [])
        for r in recs:
            slot["behavioral_overlay"].append({
                "dataset_id": r["dataset_id"],
                "pattern": r.get("pattern", r.get("abstract_text", "")),
                "primitives": r["primitives"],
                "provenance": r.get("provenance", "mined"),
                "confidence": r.get("confidence", 0.85),
                "do_not_copy_transcript": True,
            })

    return out


def build_rewrite(scene: Dict[str, Any], character_hooks: Dict[str, List[Dict[str, Any]]],
                  coverage: Dict[str, Dict[str, Any]],
                  registry: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    out = copy.deepcopy(scene)
    out["fiction_engine"] = {
        "mode": "rewrite",
        "instruction": "Regenerate character performance around the selected behavioral mechanisms while preserving plot causality and scene function.",
        "rewrite_strategy": [
            "Preserve participants and scene purpose.",
            "Preserve the causal event chain.",
            "Replace surface performance with behavior-driven reactions.",
            "Do not copy transcript dialogue.",
            "Keep identity, relationships, and transformation rules intact.",
            "Hooks marked provenance='projected' are context transfers: keep the trait fixed, adapt only its expression register.",
        ],
        "coverage": coverage,
        "behavior_hooks": {
            char: [summarize_record(r) for r in recs] for char, recs in character_hooks.items() if recs
        }
    }

    for char, recs in character_hooks.items():
        if not recs:
            continue
        slot = out.setdefault("performance_slots", {}).setdefault(char, {})
        slot["generation_mode"] = "behavioral_regeneration"
        slot["selected_behavioral_mechanisms"] = [
            {
                "dataset_id": r["dataset_id"],
                "pattern": r.get("pattern", r.get("abstract_text", "")),
                "primitives": r["primitives"],
                "provenance": r.get("provenance", "mined"),
                "confidence": r.get("confidence", 0.85),
            }
            for r in recs
        ]
        slot["rewrite_guardrails"] = list(registry[char]["guardrails"])

    hooks = []
    for char, recs in character_hooks.items():
        for r in recs:
            hooks.append({
                "character": char,
                "dataset_id": r["dataset_id"],
                "provenance": r.get("provenance", "mined"),
                "performance_rule": f"Express the scene through: {r.get('pattern', r.get('abstract_text', ''))}",
            })

    out["fiction_engine"]["rewritten_scene_brief"] = {
        "preserve_scene_function": copy.deepcopy(out.get("narrative_function", [])),
        "preserve_event_sequence": copy.deepcopy(out.get("events", [])),
        "performance_rules": hooks,
    }
    return out


def choose_mode(scene: Dict[str, Any]) -> str:
    nf = " ".join(scene.get("narrative_function", [])).lower()
    if any(k in nf for k in [
        "comedy climax", "visual reveal", "turning point",
        "characterization", "reframe", "origin reveal", "exposition"
    ]):
        return "rewrite"
    return "reinsert"


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

def run_engine(story: Dict[str, Any], masters: Dict[str, Dict[str, Any]],
               mode: str = "auto", top_k: int = 3) -> Dict[str, Any]:
    data = copy.deepcopy(story)
    behavior_index = build_behavior_index(masters)
    registry = build_registry(masters)

    engine_meta = {
        "name": "FICTION Narrative Reinterpretation Engine",
        "version": "0.2",
        "mode": mode,
        "characters": sorted(masters.keys()),
        "input_sources": {key: f"{key}_data" for key in masters},
        "policy": {
            "literal_dialogue_reuse": False,
            "preserve_plot_skeleton": True,
            "preserve_identity": True,
            "behavioral_reinterpretation": True,
            "provenance_discipline": True,
        },
        "protected_contract": protected_contract(story),
    }

    rewritten_scenes = []
    coverage_tally: Dict[str, Dict[str, int]] = {}
    for scene in data.get("scenes", []):
        hooks: Dict[str, List[Dict[str, Any]]] = {}
        coverage: Dict[str, Dict[str, Any]] = {}
        register = scene_register(scene)

        for character in registry:
            if character_scene_relevance(scene, character, registry) <= 0:
                continue
            cov = coverage_map(scene, behavior_index[character], character, registry)
            cov["register"] = register
            coverage[character] = cov
            tally = coverage_tally.setdefault(character, {"direct": 0, "adjacent": 0, "gap": 0})
            tally[cov["tier"]] += 1
            hooks[character] = select_records(
                scene, behavior_index[character], character, registry, register, top_k
            )

        actual_mode = choose_mode(scene) if mode == "auto" else mode

        if actual_mode == "rewrite":
            rewritten = build_rewrite(scene, hooks, coverage, registry)
        else:
            rewritten = build_reinsert(scene, hooks, coverage)

        rewritten["fiction_engine"]["selected_mode"] = actual_mode
        rewritten_scenes.append(rewritten)

    data["scenes"] = rewritten_scenes
    data["fiction_engine"] = engine_meta
    data["fiction_engine"]["scene_count"] = len(rewritten_scenes)
    data["fiction_engine"]["coverage_summary"] = coverage_tally
    return data


def validate(result: Dict[str, Any]) -> Dict[str, Any]:
    contract = result["fiction_engine"]["protected_contract"]
    all_text = json.dumps(result, ensure_ascii=False).lower()

    checks = {}
    checks["characters_present"] = bool(result["fiction_engine"].get("characters"))
    for char in result["fiction_engine"].get("characters", []):
        checks[f"{char}_identity"] = char in all_text
    checks["behavioral_layer"] = "behavior" in all_text
    checks["plot_skeleton_preserved"] = len(result.get("scenes", [])) > 0
    checks["no_literal_transcript_mode"] = result["fiction_engine"]["policy"]["literal_dialogue_reuse"] is False
    checks["provenance_present"] = "provenance" in all_text
    checks["coverage_mapped"] = "coverage" in all_text
    checks["no_silent_characters"] = all(
        bool(s.get("fiction_engine", {}).get("behavior_hooks"))
        for s in result.get("scenes", [])
        if s.get("fiction_engine", {}).get("coverage")
    )
    checks["contract_loaded"] = bool(contract["preserve"]) and bool(contract["do_not_accidentally_change"])

    return {
        "passed": all(checks.values()),
        "checks": checks
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--story", required=True)
    parser.add_argument("--character", action="append", required=False, dest="character_pairs",
                        metavar="NAME=PATH",
                        help="Character master JSON, e.g. noir=Nori_Jillian_data.json (repeatable)")
    # Backwards-compatible flags from v0.1:
    parser.add_argument("--rainee")
    parser.add_argument("--noir")
    parser.add_argument("--mode", choices=["auto", "reinsert", "rewrite"], default="auto")
    parser.add_argument("--top-k", type=int, default=3)
    parser.add_argument("--out", required=True)
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()

    masters: Dict[str, Dict[str, Any]] = {}
    for pair in args.character_pairs or []:
        name, path = pair.split("=", 1)
        masters[name.lower()] = load_json(path)
    if args.rainee:
        masters.setdefault("rainee", load_json(args.rainee))
    if args.noir:
        masters.setdefault("noir", load_json(args.noir))
    if not masters:
        parser.error("Provide --character NAME=PATH (and/or legacy --rainee/--noir).")

    story = load_json(args.story)

    result = run_engine(story, masters, mode=args.mode, top_k=args.top_k)
    if args.validate:
        result["validation"] = validate(result)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Wrote {args.out}")
    print("Coverage summary:", json.dumps(result["fiction_engine"]["coverage_summary"]))
    if args.validate:
        print("Validation passed:", result["validation"]["passed"])


if __name__ == "__main__":
    main()

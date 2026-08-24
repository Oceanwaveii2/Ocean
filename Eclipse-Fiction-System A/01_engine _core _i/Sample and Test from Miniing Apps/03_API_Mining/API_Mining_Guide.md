# API Mining Guide — Mining Behavior Data via LLM APIs

How to run the mining step of the fiction engine as API calls *(alternate driver — 2026-08-22: the agent session is the default runtime; use this path for unattended/batch mining only)*: raw media in, behavior-master dataset JSON out, fully compatible with the engine core in `../01_Engine_Core/`.

---

## 1. What API mining is

The engine needs **behavior master** files (`Rainee_data.json`, `Nori_Jillian_data.json` are examples). Those files are built from mined clips. API mining automates that step: send a clip (transcript text, or video frames to a vision model) to an LLM API with a fixed system prompt, and get back one dataset object in exactly the schema the engine joins on.

```
clip list ──► [mining API call per clip] ──► dataset objects ──► merge ──► behavior master JSON
                    ▲                                                        │
             fixed system prompt                              plugs into Fiction_story.json
```

Everything is endpoint-agnostic: any OpenAI-compatible chat-completions API works (DeepSeek, Qwen/DashScope, OpenAI, local via Ollama/LM Studio). For video mining use a vision-capable model (e.g., Qwen-VL — see `QWEN_Vision_API_Eclipse_Reference.html` in the parent doc hub).

---

## 2. Target output schema (what every mined clip must return)

One object per clip, matching the existing masters exactly. Fields the engine joins on are marked **JOIN KEY** — mining calls that omit them are wasted calls.

```json
{
  "id": "prefix_short_name",                     // unique, master's id_prefix + descriptor
  "provenance": {                                 // optional but recommended
    "file": "source_clip.mp4",
    "timecode": "00:00-00:10"
  },
  "complete_transcript_source": [                 // FOR REFERENCE ONLY, never generation source
    { "speaker": "role_archetype_name", "text": "..." }
  ],
  "behavioral_mapping_abstract": {                // JOIN KEY (pattern)
    "pattern": "snake_case_pattern_name",
    "DO_NOT_SAY_LITERALLY": "…banned literal line…",
    "DO_SAY_ABSTRACT": "…abstract behavioral description…"
  },
  "literary_sfx": "palette terms only (pffffffft!, braaaap!, VROOOOM whirrr…) — never hertz/frequency",
  "generic_archetypes": {                         // JOIN KEY (archetype → role)
    "archetype_name": "one-line abstract function"
  },
  "application_mapping": {                        // JOIN KEY (target character)
    "target_character": "…",
    "target_state": "…",
    "source_character": "…",
    "use_as": "behavioral/comedic reference",
    "identity_preservation": true
  }
}
```

**Non-negotiable mining rules** (enforce in the prompt AND validate after):
- Transcripts are reference-only; generation never reuses literal lines.
- Archetypes are generic (`child_genius`, `unfiltered_discloser`…) — no target-character names inside clip content (prevents identity contamination).
- Bodily/comedy SFX use literary palette terms only.

---

## 3. The mining system prompt (text mode)

Send once as the system message; the clip transcript goes in the user message.

```
You are a behavioral mining engine for a character reinterpretation system.
You extract REUSABLE ABSTRACT BEHAVIOR PATTERNS from media clips. You do not
write stories and you never copy dialogue for reuse.

Given a clip transcript (speakers labeled with generic archetype names),
return ONE JSON object with exactly these fields:
- id: "<PREFIX>_<short_snake_case_name>"
- complete_transcript_source: the transcript, unchanged, reference only
- behavioral_mapping_abstract: { pattern, DO_NOT_SAY_LITERALLY (the most
  quotable literal line, banned), DO_SAY_ABSTRACT (the same behavior stated
  abstractly, no specifics) }
- literary_sfx: any bodily/comedic sounds as literary terms (pffffffft!,
  braaaap!, pooooot!, whoa-chains, VROOOOM) — NEVER hertz/frequency wording
- generic_archetypes: map each speaker to a generic archetype and one-line
  abstract function; NEVER use real character or target-character names
- application_mapping: target_character "<NAME>", source_character "<NAME>",
  use_as "behavioral/comedic reference", identity_preservation true

Rules:
1. The value is the MECHANISM (timing, escalation, misfire, reframe), not the
   wording. If a pattern can be described without the literal topic, do so.
2. One clip = one primary pattern. Do not split or merge.
3. Output JSON only. No commentary.
```

**Vision mode (video clips):** same system prompt plus — "You will receive video frames and/or audio description. First reconstruct a minimal transcript with generic archetype speakers, then proceed exactly as above. Note frame-derived uncertainty in provenance."

---

## 4. Batch workflow

1. **Clip manifest** — a JSON list of `{id, file, timecode}` (the episode index in `../04_Reference_Sources/family-guy-episode-index.md` feeds this).
2. **Loop** — one API call per clip; write each result to `mined/<id>.json` immediately (idempotent, resumable: skip ids that already exist on disk).
3. **Validate each result** — reject and retry (max 2 retries) if: JSON parse fails; `id` collides; `generic_archetypes` is empty or contains target-character names; `DO_NOT_SAY_LITERALLY` missing; SFX contains "Hz"/"hertz".
4. **Merge** — assemble datasets under the master header (project name, total count, header overrides: character lore, orientation, special clip overrides, priority order). Deduplicate by id — never duplicate an existing dataset id (the Rainee master's compilation note is the precedent).
5. **Spot-check pass** — one extra API call per ~10 datasets: "Here are 10 mined datasets. Flag any that share a pattern with an earlier one, leak literal lines into DO_SAY_ABSTRACT, or misuse an archetype."

Minimal Python shape (OpenAI-compatible):

```python
import os, json, pathlib, requests

API_BASE = os.environ["API_BASE"]          # e.g. https://api.deepseek.com/v1
API_KEY  = os.environ["API_KEY"]
MODEL    = os.environ["MINING_MODEL"]

def mine(clip):
    out = pathlib.Path(f"mined/{clip['id']}.json")
    if out.exists(): return                    # resume support
    r = requests.post(f"{API_BASE}/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"model": MODEL,
              "temperature": 0.3,
              "messages": [
                  {"role": "system", "content": SYSTEM_PROMPT},
                  {"role": "user",   "content": json.dumps(clip)}],
              "response_format": {"type": "json_object"}},
        timeout=120)
    data = json.loads(r.json()["choices"][0]["message"]["content"])
    validate(data)                             # rules from step 3
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False))
```

---

## 5. Where mined data enters the engine

Mined datasets flow into the pipeline at two points (see `Fiction_Engine_Guide.md` section 3):

- **Stage 4 (archetype slotting)** — `generic_archetypes` joins to story roles via `archetype_role_map`.
- **Stage 5 (dataset retrieval)** — `behavioral_mapping_abstract.pattern` joins to narrative functions.

A dataset with a weak/missing archetype cannot bind to anything — which is why archetype quality is the single most important field to enforce during mining.

---

## 6. Configuration checklist

- [ ] `API_BASE`, `API_KEY`, `MODEL` set (env vars, never hardcode keys)
- [ ] Vision model configured if mining video directly
- [ ] System prompt pinned in version control; changes logged
- [ ] `mined/` output dir with resume support
- [ ] Validator running (schema + archetype-name leakage + SFX rules + id collisions)
- [ ] Merge step preserves header overrides and dedupes by id
- [ ] Temperature low (0.2–0.4): mining is extraction, not creativity — creativity belongs to the emergence layer at generation time

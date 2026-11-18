#!/usr/bin/env python3
"""
Developer-Only Offline Lesson Generator for CoderBhai / ByteSized-Edu
Uses local Ollama with qwen2.5-coder:7b to generate high-quality, static LessonNode JSON
matched to src/types/index.ts for inclusion in src/data/courses.ts.

Usage:
    python3 scripts/generate-lesson.py --course c --unit c-unit-1 --node-id c-pointers-101 --topic "Pointers & Addresses"
"""

import argparse
import json
import sys
import urllib.error
import urllib.request
from typing import Any, Dict, List

ALLOWED_ICONS = {"star", "book", "target", "trophy", "code", "zap", "bug", "terminal"}
ALLOWED_CHARACTERS = {"byte", "ada", "turing", "junior", "lin"}
ALLOWED_MOODS = {"happy", "teaching", "thinking", "cheering", "surprised"}
ALLOWED_Q_TYPES = {"tap-to-fill", "spot-the-bug", "predict-output", "concept-match"}


def build_generation_prompt(course: str, unit: str, node_id: str, topic: str) -> str:
    return f"""You are an expert curriculum engineer for ByteSized-Edu, a gamified Duolingo-style coding learning platform.
Generate a complete, pedagogical LessonNode in JSON format for the following topic:

Target Course: {course}
Unit ID: {unit}
Node ID: {node_id}
Topic: {topic}

The JSON MUST conform strictly to this TypeScript schema:
{{
  "id": "{node_id}",
  "unitId": "{unit}",
  "title": "Short punchy lesson title (e.g. Memory Addresses & Pointers)",
  "description": "Engaging 1-sentence description of what the user will master",
  "iconType": "code", // One of: "star", "book", "target", "trophy", "code", "zap", "bug", "terminal"
  "teachingIntro": {{
    "title": "Core Concept Title",
    "subtitle": "Bite-sized Mental Model",
    "characterId": "byte", // One of: "byte", "ada", "turing", "junior", "lin"
    "steps": [
      {{
        "characterId": "byte",
        "characterMood": "teaching", // "happy", "teaching", "thinking", "cheering", "surprised"
        "speech": "Clear, friendly explanation of the intuition in 2-3 sentences.",
        "codeSnippet": "#include <stdio.h>\\n...",
        "anatomy": [
          {{ "token": "*p", "explanation": "Dereferences the pointer to read the stored value" }}
        ]
      }}
    ]
  }},
  "questions": [
    {{
      "id": "{node_id}-q1",
      "type": "tap-to-fill",
      "prompt": "Fill in the blanks to complete the code",
      "explanation": "Clear explanation of why this is correct",
      "xpReward": 15,
      "codeTemplate": "int x = 42;\\nint *ptr = {{blank1}}x;",
      "options": ["&", "*", "->", "."],
      "blanks": [{{ "id": "blank1", "correctValue": "&" }}]
    }},
    {{
      "id": "{node_id}-q2",
      "type": "spot-the-bug",
      "prompt": "Find the line containing a bug",
      "explanation": "Explain what went wrong",
      "xpReward": 20,
      "codeLines": ["int main() {{", "  int a = 10;", "  int *p = a;", "  return 0;", "}}"],
      "bugLineIndex": 2,
      "bugExplanation": "You cannot assign an integer directly to a pointer without the address-of operator (&)"
    }},
    {{
      "id": "{node_id}-q3",
      "type": "predict-output",
      "prompt": "What does this code print?",
      "explanation": "Trace output step by step",
      "xpReward": 15,
      "codeSnippet": "int x = 5;\\nint *p = &x;\\n*p = 10;\\nprintf(\\"%d\\\\n\\", x);",
      "options": [
        {{ "id": "opt1", "text": "5", "isCorrect": false }},
        {{ "id": "opt2", "text": "10", "isCorrect": true }},
        {{ "id": "opt3", "text": "0", "isCorrect": false }}
      ]
    }},
    {{
      "id": "{node_id}-q4",
      "type": "concept-match",
      "prompt": "Match each pointer concept to its role",
      "explanation": "Summary of concepts",
      "xpReward": 25,
      "pairs": [
        {{ "id": "p1", "term": "& operator", "definition": "Gets the address of a variable in memory" }},
        {{ "id": "p2", "term": "* operator", "definition": "Dereferences an address to access its target value" }}
      ]
    }}
  ]
}}

Generate 4 high-quality questions covering the topic using tap-to-fill, spot-the-bug, predict-output, and concept-match. Return ONLY pure valid JSON with no markdown formatting or extra text."""


def validate_lesson_node(node: Dict[str, Any]) -> List[str]:
    """Validates the generated dictionary against the LessonNode schema."""
    errors: List[str] = []

    for req in ("id", "unitId", "title", "description", "iconType", "questions"):
        if req not in node:
            errors.append(f"Missing required top-level field: '{req}'")

    if node.get("iconType") not in ALLOWED_ICONS:
        errors.append(f"Invalid iconType: '{node.get('iconType')}'. Allowed: {ALLOWED_ICONS}")

    questions = node.get("questions")
    if not isinstance(questions, list) or len(questions) == 0:
        errors.append("'questions' must be a non-empty list")
    else:
        for idx, q in enumerate(questions):
            q_id = q.get("id", f"index-{idx}")
            q_type = q.get("type")
            if q_type not in ALLOWED_Q_TYPES:
                errors.append(f"Question '{q_id}' has invalid type '{q_type}'")
                continue

            for field in ("prompt", "explanation", "xpReward"):
                if field not in q:
                    errors.append(f"Question '{q_id}' missing '{field}'")

            if q_type == "tap-to-fill":
                if "codeTemplate" not in q or "options" not in q or "blanks" not in q:
                    errors.append(f"Question '{q_id}' (tap-to-fill) missing codeTemplate/options/blanks")
            elif q_type == "spot-the-bug":
                if "codeLines" not in q or "bugLineIndex" not in q:
                    errors.append(f"Question '{q_id}' (spot-the-bug) missing codeLines/bugLineIndex")
            elif q_type == "predict-output":
                if "codeSnippet" not in q or "options" not in q:
                    errors.append(f"Question '{q_id}' (predict-output) missing codeSnippet/options")
            elif q_type == "concept-match":
                if "pairs" not in q or not isinstance(q.get("pairs"), list):
                    errors.append(f"Question '{q_id}' (concept-match) missing pairs")

    return errors


def generate_with_ollama(
    ollama_url: str,
    model: str,
    prompt: str,
) -> Dict[str, Any]:
    """Calls local Ollama endpoint using urllib and returns parsed JSON."""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.2,
        },
    }

    req = urllib.request.Request(
        ollama_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            raw_response = data.get("response", "{}")
            return json.loads(raw_response)
    except urllib.error.URLError as e:
        print(
            f"\n[Ollama Connection Error] Could not reach local Ollama at {ollama_url}: {e}\n"
            f"Please ensure Ollama is installed and running:\n"
            f"  1. Start Ollama: 'ollama serve'\n"
            f"  2. Pull model:   'ollama pull {model}'\n",
            file=sys.stderr,
        )
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"\n[JSON Parse Error] Ollama response could not be parsed as JSON: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Offline Lesson Node Generator for CoderBhai / ByteSized-Edu using local Ollama"
    )
    parser.add_argument("--course", default="c", help="Course ID (c, cpp, python, oop, dsa, algorithms)")
    parser.add_argument("--unit", default="c-unit-1", help="Parent Unit ID (e.g. c-unit-1)")
    parser.add_argument("--node-id", default="c-pointers-101", help="Target unique Lesson Node ID")
    parser.add_argument("--topic", default="Pointers and Memory Addresses", help="Topic to generate lesson on")
    parser.add_argument("--model", default="qwen2.5-coder:7b", help="Local Ollama model name")
    parser.add_argument("--ollama-url", default="http://localhost:11434/api/generate", help="Local Ollama API URL")
    parser.add_argument("--output", default=None, help="Optional output .json filepath to save result")

    args = parser.parse_args()

    print(f"[*] Generating lesson node for topic: '{args.topic}' ({args.course} / {args.unit})...")
    print(f"[*] Using local Ollama model '{args.model}' at {args.ollama_url}...")

    prompt = build_generation_prompt(args.course, args.unit, args.node_id, args.topic)
    node = generate_with_ollama(args.ollama_url, args.model, prompt)

    errors = validate_lesson_node(node)
    if errors:
        print("\n[Validation Warning] Generated node had schema inconsistencies:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)

    formatted_json = json.dumps(node, indent=2, ensure_ascii=False)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(formatted_json)
        print(f"[+] Lesson node saved successfully to: {args.output}")
    else:
        print("\n=== GENERATED LESSON NODE JSON ===\n")
        print(formatted_json)


if __name__ == "__main__":
    main()

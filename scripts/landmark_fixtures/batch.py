from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


VALID_ROLES = {"primary", "diagnostic", "supporting"}


@dataclass(frozen=True)
class FixtureRequest:
    fixture_id: str
    gesture: str
    role: str
    input_path: Path
    description: str

    @property
    def output_name(self) -> str:
        return f"{self.fixture_id}.fixture.json"


def load_manifest(path: Path, project_root: Path) -> list[FixtureRequest]:
    try:
        document: Any = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise ValueError(f"Manifest is not valid JSON: {error}") from error

    if not isinstance(document, dict) or document.get("schemaVersion") != 1:
        raise ValueError("Manifest schemaVersion must be 1.")
    entries = document.get("fixtures")
    if not isinstance(entries, list) or not entries:
        raise ValueError("Manifest fixtures must be a non-empty list.")

    requests: list[FixtureRequest] = []
    ids: set[str] = set()
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict):
            raise ValueError(f"Fixture {index + 1} must be an object.")
        values = {
            key: entry.get(key)
            for key in ("id", "gesture", "role", "input", "description")
        }
        if any(
            not isinstance(value, str) or not value.strip()
            for value in values.values()
        ):
            raise ValueError(f"Fixture {index + 1} has a missing or invalid field.")
        fixture_id = values["id"]
        role = values["role"]
        if fixture_id in ids:
            raise ValueError(f"Duplicate fixture id: {fixture_id}")
        if role not in VALID_ROLES:
            raise ValueError(f"Invalid role for {fixture_id}: {role}")
        ids.add(fixture_id)
        requests.append(
            FixtureRequest(
                fixture_id=fixture_id,
                gesture=values["gesture"],
                role=role,
                input_path=project_root / values["input"],
                description=values["description"],
            )
        )
    return requests


def inspect_fixture(path: Path) -> tuple[int, int, int, bool]:
    document = json.loads(path.read_text(encoding="utf-8"))
    extraction = document["extraction"]
    return (
        len(document["frames"]),
        int(extraction["trimmedStartMs"]),
        int(extraction["trimmedEndMs"]),
        bool(extraction["motionDetected"]),
    )


def render_report(rows: list[dict[str, Any]]) -> str:
    lines = [
        "# Practitioner Fixture Batch Report",
        "",
        "Generated fixtures are development artifacts. Review each one in the M2 Landmark Laboratory.",
        "",
        "| Fixture | Gesture | Role | Result | Frames | Retained range | Motion | Visual QA |",
        "|---|---|---|---|---:|---:|---|---|",
    ]
    for row in rows:
        frames = str(row.get("frames", "-"))
        retained = row.get("retained", "-")
        motion = row.get("motion", "-")
        lines.append(
            f"| `{row['id']}` | {row['gesture']} | {row['role']} | {row['result']} "
            f"| {frames} | {retained} | {motion} | [ ] |"
        )
    lines.extend(
        [
            "",
            "## Visual QA checks",
            "",
            "- Meaningful movement is not cut off at either edge.",
            "- Pose and hand landmarks remain aligned with the practitioner.",
            "- No severe landmark jumps or persistent left/right hand swaps occur.",
            "- The complete gesture is present without long unintended edge pauses.",
            "",
        ]
    )
    return "\n".join(lines)

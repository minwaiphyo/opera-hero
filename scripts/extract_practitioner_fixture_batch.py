from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from typing import Any

from landmark_fixtures.batch import inspect_fixture, load_manifest, render_report


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = PROJECT_ROOT / "scripts/landmark_fixtures/practitioner_fixture_manifest.json"
DEFAULT_OUTPUT = PROJECT_ROOT / "local-artifacts/landmark-fixtures"


def main() -> int:
    arguments = parse_arguments()
    try:
        requests = load_manifest(arguments.manifest, PROJECT_ROOT)
    except (OSError, ValueError) as error:
        print(f"Batch extraction failed: {error}", file=sys.stderr)
        return 1

    selected = [
        request
        for request in requests
        if not arguments.only or request.fixture_id in arguments.only
    ]
    unknown = arguments.only - {request.fixture_id for request in requests}
    if unknown:
        print(f"Batch extraction failed: unknown fixture id(s): {', '.join(sorted(unknown))}", file=sys.stderr)
        return 1

    arguments.output_dir.mkdir(parents=True, exist_ok=True)
    rows: list[dict[str, Any]] = []
    failed = False
    for request in selected:
        output = arguments.output_dir / request.output_name
        row: dict[str, Any] = {
            "id": request.fixture_id,
            "gesture": request.gesture,
            "role": request.role,
        }
        if not request.input_path.is_file():
            row["result"] = "FAILED: source missing"
            failed = True
        elif output.is_file() and not arguments.force:
            row["result"] = "reused"
        else:
            print(f"Extracting {request.fixture_id}...")
            command = [
                sys.executable,
                str(PROJECT_ROOT / "scripts/extract_landmark_fixture.py"),
                "--input", str(request.input_path),
                "--output", str(output),
                "--id", request.fixture_id,
                "--description", request.description,
            ]
            completed = subprocess.run(command, cwd=PROJECT_ROOT, check=False)
            row["result"] = (
                "generated"
                if completed.returncode == 0
                else "FAILED: extraction error"
            )
            failed = failed or completed.returncode != 0
        if output.is_file():
            try:
                frames, start_ms, end_ms, motion_detected = inspect_fixture(output)
                row.update(
                    frames=frames,
                    retained=f"{start_ms}-{end_ms} ms",
                    motion="yes" if motion_detected else "no",
                )
            except (KeyError, OSError, TypeError, ValueError):
                row["result"] = "FAILED: invalid output"
                failed = True
        rows.append(row)

    report = arguments.output_dir / "batch-report.md"
    report.write_text(render_report(rows), encoding="utf-8")
    print(f"Wrote QA report to {report}")
    return 1 if failed else 0


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract the curated practitioner fixture batch."
    )
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--only", action="append", default=[], metavar="FIXTURE_ID")
    parser.add_argument("--force", action="store_true", help="Regenerate existing outputs.")
    arguments = parser.parse_args()
    arguments.only = set(arguments.only)
    return arguments


if __name__ == "__main__":
    raise SystemExit(main())

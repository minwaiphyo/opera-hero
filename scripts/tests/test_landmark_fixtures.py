from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from scripts.landmark_fixtures.batch import load_manifest, render_report
from scripts.landmark_fixtures.fixture import build_fixture
from scripts.landmark_fixtures.motion import find_edge_trim


class EdgeTrimTests(unittest.TestCase):
    def test_trims_only_stationary_edges_with_padding(self) -> None:
        timestamps = list(range(0, 1100, 100))
        energy = [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0]

        result = find_edge_trim(
            timestamps,
            energy,
            threshold=0.5,
            sustain_ms=200,
            padding_ms=100,
        )

        self.assertTrue(result.detected)
        self.assertEqual((result.start_ms, result.end_ms), (200, 800))

    def test_preserves_an_internal_stationary_pause(self) -> None:
        timestamps = list(range(0, 1500, 100))
        energy = [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0]

        result = find_edge_trim(
            timestamps,
            energy,
            threshold=0.5,
            sustain_ms=200,
            padding_ms=0,
        )

        self.assertEqual((result.start_ms, result.end_ms), (200, 1000))
        self.assertLessEqual(result.start_index, 5)
        self.assertGreaterEqual(result.end_index, 7)

    def test_keeps_the_complete_sequence_when_no_motion_is_detected(self) -> None:
        result = find_edge_trim(
            [0, 100, 200, 300],
            [0, 0, 0, 0],
            threshold=0.5,
            sustain_ms=200,
            padding_ms=100,
        )

        self.assertFalse(result.detected)
        self.assertEqual((result.start_index, result.end_index), (0, 3))


class FixtureTests(unittest.TestCase):
    def test_rebases_selected_frames_and_records_trim_metadata(self) -> None:
        frames = [
            {"offsetMs": 0, "hands": []},
            {"offsetMs": 100, "hands": []},
            {"offsetMs": 200, "hands": []},
            {"offsetMs": 300, "hands": []},
        ]
        trim = find_edge_trim(
            [0, 100, 200, 300],
            [0, 1, 1, 0],
            threshold=0.5,
            sustain_ms=100,
            padding_ms=0,
        )

        fixture = build_fixture(
            fixture_id="opening-door-example",
            description="Test fixture",
            source_path=Path("OpeningDoor.mp4"),
            source_duration_ms=400,
            sample_fps=20,
            frames=frames,
            trim=trim,
            motion_threshold=0.5,
            sustain_ms=100,
            padding_ms=0,
        )

        self.assertEqual(fixture["source"], "practitioner-reference")
        self.assertFalse(fixture["containsRecordedImagery"])
        self.assertEqual(
            [frame["offsetMs"] for frame in fixture["frames"]], [0, 100]
        )
        self.assertEqual(fixture["extraction"]["trimmedStartMs"], 100)
        self.assertEqual(fixture["extraction"]["trimmedEndMs"], 200)


class BatchManifestTests(unittest.TestCase):
    def test_loads_curated_fixture_roles_and_resolves_paths(self) -> None:
        manifest = Path("scripts/landmark_fixtures/practitioner_fixture_manifest.json")

        requests = load_manifest(manifest, Path.cwd())

        self.assertEqual(len(requests), 9)
        self.assertEqual(
            {request.role for request in requests},
            {"primary", "diagnostic", "supporting"},
        )
        self.assertEqual(
            requests[0].output_name,
            "opening-door-normal-take-1.fixture.json",
        )

    def test_rejects_duplicate_ids(self) -> None:
        document = {
            "schemaVersion": 1,
            "fixtures": [
                {
                    "id": "same",
                    "gesture": "one",
                    "role": "primary",
                    "input": "one.mp4",
                    "description": "One",
                },
                {
                    "id": "same",
                    "gesture": "two",
                    "role": "primary",
                    "input": "two.mp4",
                    "description": "Two",
                },
            ],
        }
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "manifest.json"
            path.write_text(json.dumps(document), encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "Duplicate fixture id"):
                load_manifest(path, Path.cwd())

    def test_report_contains_manual_qa_column(self) -> None:
        report = render_report(
            [
                {
                    "id": "fixture",
                    "gesture": "gesture",
                    "role": "primary",
                    "result": "generated",
                    "frames": 10,
                    "retained": "0-500 ms",
                    "motion": "yes",
                }
            ]
        )

        self.assertIn("| Visual QA |", report)
        self.assertIn("| [ ] |", report)


if __name__ == "__main__":
    unittest.main()

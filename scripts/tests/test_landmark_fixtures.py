from __future__ import annotations

import unittest
from pathlib import Path

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


if __name__ == "__main__":
    unittest.main()

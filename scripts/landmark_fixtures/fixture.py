from __future__ import annotations

from pathlib import Path
from typing import Any

from .motion import TrimResult


def build_fixture(
    *,
    fixture_id: str,
    description: str,
    source_path: Path,
    source_duration_ms: int,
    sample_fps: float,
    frames: list[dict[str, Any]],
    trim: TrimResult,
    motion_threshold: float,
    sustain_ms: int,
    padding_ms: int,
) -> dict[str, Any]:
    selected = frames[trim.start_index : trim.end_index + 1]
    origin_ms = int(selected[0]["offsetMs"])
    replay_frames = [
        {**frame, "offsetMs": int(frame["offsetMs"]) - origin_ms}
        for frame in selected
    ]
    return {
        "schemaVersion": 1,
        "id": fixture_id,
        "description": description,
        "source": "practitioner-reference",
        "containsRecordedImagery": False,
        "extraction": {
            "sourceFile": source_path.name,
            "sourceDurationMs": source_duration_ms,
            "sampleFps": sample_fps,
            "trimmedStartMs": trim.start_ms,
            "trimmedEndMs": trim.end_ms,
            "motionDetected": trim.detected,
            "motionThreshold": motion_threshold,
            "motionSustainMs": sustain_ms,
            "edgePaddingMs": padding_ms,
        },
        "frames": replay_frames,
    }

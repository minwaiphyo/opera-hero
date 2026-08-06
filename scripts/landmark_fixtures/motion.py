from __future__ import annotations

from dataclasses import dataclass
from math import hypot
from statistics import median
from typing import Any


@dataclass(frozen=True)
class TrimResult:
    start_index: int
    end_index: int
    start_ms: int
    end_ms: int
    detected: bool


def calculate_motion_energy(frames: list[dict[str, Any]]) -> list[float]:
    """Return body-scale-normalized landmark velocity for each frame."""
    if not frames:
        return []

    energies = [0.0]
    previous_points = _normalized_points(frames[0])
    previous_ms = _timestamp_ms(frames[0])

    for frame in frames[1:]:
        timestamp_ms = _timestamp_ms(frame)
        elapsed_seconds = max((timestamp_ms - previous_ms) / 1000.0, 0.001)
        points = _normalized_points(frame)
        shared = previous_points.keys() & points.keys()
        if shared:
            distances = [
                hypot(
                    points[key][0] - previous_points[key][0],
                    points[key][1] - previous_points[key][1],
                )
                / elapsed_seconds
                for key in shared
            ]
            energies.append(float(median(distances)))
        else:
            energies.append(0.0)
        previous_points = points
        previous_ms = timestamp_ms

    return energies


def smooth_motion_energy(values: list[float], radius: int = 2) -> list[float]:
    if radius < 0:
        raise ValueError("Smoothing radius must not be negative.")
    return [
        sum(values[max(0, index - radius) : index + radius + 1])
        / len(values[max(0, index - radius) : index + radius + 1])
        for index in range(len(values))
    ]


def find_edge_trim(
    timestamps_ms: list[int],
    motion_energy: list[float],
    *,
    threshold: float,
    sustain_ms: int,
    padding_ms: int,
) -> TrimResult:
    """Trim only leading/trailing inactivity; keep everything between the edges."""
    if not timestamps_ms or len(timestamps_ms) != len(motion_energy):
        raise ValueError("Timestamps and motion energy must be non-empty and aligned.")
    if any(right <= left for left, right in zip(timestamps_ms, timestamps_ms[1:])):
        raise ValueError("Timestamps must be strictly increasing.")

    active_runs = _sustained_runs(
        timestamps_ms,
        [value >= threshold for value in motion_energy],
        sustain_ms,
    )
    if not active_runs:
        return TrimResult(
            start_index=0,
            end_index=len(timestamps_ms) - 1,
            start_ms=timestamps_ms[0],
            end_ms=timestamps_ms[-1],
            detected=False,
        )

    wanted_start_ms = max(timestamps_ms[0], timestamps_ms[active_runs[0][0]] - padding_ms)
    wanted_end_ms = min(timestamps_ms[-1], timestamps_ms[active_runs[-1][1]] + padding_ms)
    start_index = _first_at_or_after(timestamps_ms, wanted_start_ms)
    end_index = _last_at_or_before(timestamps_ms, wanted_end_ms)
    return TrimResult(
        start_index=start_index,
        end_index=end_index,
        start_ms=timestamps_ms[start_index],
        end_ms=timestamps_ms[end_index],
        detected=True,
    )


def _sustained_runs(
    timestamps_ms: list[int], active: list[bool], sustain_ms: int
) -> list[tuple[int, int]]:
    runs: list[tuple[int, int]] = []
    run_start: int | None = None
    for index, is_active in enumerate(active + [False]):
        if is_active and run_start is None:
            run_start = index
        elif not is_active and run_start is not None:
            run_end = index - 1
            if timestamps_ms[run_end] - timestamps_ms[run_start] >= sustain_ms:
                runs.append((run_start, run_end))
            run_start = None
    return runs


def _normalized_points(frame: dict[str, Any]) -> dict[str, tuple[float, float]]:
    pose_landmarks = frame.get("pose", {}).get("landmarks", [])
    center_x, center_y, scale = _body_reference(pose_landmarks)
    points: dict[str, tuple[float, float]] = {}

    for index in (11, 12, 13, 14, 15, 16):
        if index < len(pose_landmarks):
            landmark = pose_landmarks[index]
            points[f"pose-{index}"] = (
                (float(landmark["x"]) - center_x) / scale,
                (float(landmark["y"]) - center_y) / scale,
            )

    for hand_index, hand in enumerate(frame.get("hands", [])):
        handedness = hand.get("reportedHandedness", f"unknown-{hand_index}")
        for landmark_index, landmark in enumerate(hand.get("landmarks", [])):
            points[f"hand-{handedness}-{landmark_index}"] = (
                (float(landmark["x"]) - center_x) / scale,
                (float(landmark["y"]) - center_y) / scale,
            )
    return points


def _body_reference(landmarks: list[dict[str, Any]]) -> tuple[float, float, float]:
    if len(landmarks) <= 12:
        return 0.0, 0.0, 1.0
    left = landmarks[11]
    right = landmarks[12]
    center_x = (float(left["x"]) + float(right["x"])) / 2.0
    center_y = (float(left["y"]) + float(right["y"])) / 2.0
    scale = hypot(float(left["x"]) - float(right["x"]), float(left["y"]) - float(right["y"]))
    return center_x, center_y, max(scale, 0.01)


def _timestamp_ms(frame: dict[str, Any]) -> int:
    return int(frame["offsetMs"])


def _first_at_or_after(values: list[int], target: int) -> int:
    return next(index for index, value in enumerate(values) if value >= target)


def _last_at_or_before(values: list[int], target: int) -> int:
    return max(index for index, value in enumerate(values) if value <= target)

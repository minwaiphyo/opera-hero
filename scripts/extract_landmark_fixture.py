from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from landmark_fixtures.fixture import build_fixture
from landmark_fixtures.motion import (
    calculate_motion_energy,
    find_edge_trim,
    smooth_motion_energy,
)


def main() -> int:
    arguments = parse_arguments()
    try:
        frames, duration_ms = extract_frames(arguments)
        if not frames:
            raise RuntimeError("No landmark frames were extracted from the video.")

        energy = smooth_motion_energy(calculate_motion_energy(frames))
        timestamps = [int(frame["offsetMs"]) for frame in frames]
        trim = find_edge_trim(
            timestamps,
            energy,
            threshold=arguments.motion_threshold,
            sustain_ms=arguments.motion_sustain_ms,
            padding_ms=arguments.edge_padding_ms,
        )
        fixture = build_fixture(
            fixture_id=arguments.id,
            description=arguments.description,
            source_path=arguments.input,
            source_duration_ms=duration_ms,
            sample_fps=arguments.sample_fps,
            frames=frames,
            trim=trim,
            motion_threshold=arguments.motion_threshold,
            sustain_ms=arguments.motion_sustain_ms,
            padding_ms=arguments.edge_padding_ms,
        )
        arguments.output.parent.mkdir(parents=True, exist_ok=True)
        arguments.output.write_text(
            json.dumps(fixture, indent=2) + "\n", encoding="utf-8"
        )
        print(
            f"Wrote {len(fixture['frames'])} frames to {arguments.output} "
            f"(source {trim.start_ms}–{trim.end_ms} ms)."
        )
        if not trim.detected:
            print(
                "Warning: no sustained edge motion was detected; the complete "
                "sequence was retained.",
                file=sys.stderr,
            )
        return 0
    except (OSError, RuntimeError, ValueError) as error:
        print(f"Fixture extraction failed: {error}", file=sys.stderr)
        return 1


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract a trimmed Opera Hero landmark replay fixture."
    )
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--id", required=True)
    parser.add_argument("--description", required=True)
    parser.add_argument("--sample-fps", type=float, default=20.0)
    parser.add_argument("--motion-threshold", type=float, default=0.12)
    parser.add_argument("--motion-sustain-ms", type=int, default=250)
    parser.add_argument("--edge-padding-ms", type=int, default=400)
    parser.add_argument(
        "--pose-model",
        type=Path,
        default=Path("public/models/pose_landmarker_lite.task"),
    )
    parser.add_argument(
        "--hand-model",
        type=Path,
        default=Path("public/models/hand_landmarker.task"),
    )
    arguments = parser.parse_args()
    if arguments.sample_fps <= 0:
        parser.error("--sample-fps must be positive.")
    if arguments.motion_threshold < 0:
        parser.error("--motion-threshold must not be negative.")
    return arguments


def extract_frames(arguments: argparse.Namespace) -> tuple[list[dict[str, Any]], int]:
    try:
        import cv2
        import mediapipe as mp
        from mediapipe.tasks import python
        from mediapipe.tasks.python import vision
    except ImportError as error:
        raise RuntimeError(
            "MediaPipe and OpenCV are required. Create a virtual environment and "
            "install requirements-fixtures.txt."
        ) from error

    if not arguments.input.is_file():
        raise RuntimeError(f"Input video does not exist: {arguments.input}")
    for model in (arguments.pose_model, arguments.hand_model):
        if not model.is_file():
            raise RuntimeError(f"Model does not exist: {model}")

    capture = cv2.VideoCapture(str(arguments.input))
    source_fps = float(capture.get(cv2.CAP_PROP_FPS))
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    if not capture.isOpened() or source_fps <= 0:
        capture.release()
        raise RuntimeError(f"Could not decode video: {arguments.input}")

    duration_ms = round(frame_count / source_fps * 1000)
    pose_options = vision.PoseLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=str(arguments.pose_model)),
        running_mode=vision.RunningMode.VIDEO,
        num_poses=1,
    )
    hand_options = vision.HandLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=str(arguments.hand_model)),
        running_mode=vision.RunningMode.VIDEO,
        num_hands=2,
    )

    frames: list[dict[str, Any]] = []
    next_sample_ms = 0.0
    frame_index = 0
    try:
        with vision.PoseLandmarker.create_from_options(pose_options) as pose_landmarker:
            with vision.HandLandmarker.create_from_options(hand_options) as hand_landmarker:
                while True:
                    ok, bgr_frame = capture.read()
                    if not ok:
                        break
                    timestamp_ms = round(frame_index / source_fps * 1000)
                    frame_index += 1
                    if timestamp_ms + 0.001 < next_sample_ms:
                        continue
                    next_sample_ms += 1000.0 / arguments.sample_fps
                    rgb_frame = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
                    image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
                    pose_result = pose_landmarker.detect_for_video(image, timestamp_ms)
                    hand_result = hand_landmarker.detect_for_video(image, timestamp_ms)
                    frames.append(_to_replay_frame(timestamp_ms, pose_result, hand_result))
    finally:
        capture.release()
    return frames, duration_ms


def _to_replay_frame(timestamp_ms: int, pose_result: Any, hand_result: Any) -> dict[str, Any]:
    frame: dict[str, Any] = {
        "offsetMs": timestamp_ms,
        "hands": [],
    }
    if pose_result.pose_landmarks:
        frame["pose"] = {
            "landmarks": [_landmark(value) for value in pose_result.pose_landmarks[0]],
            "worldLandmarks": [
                _landmark(value) for value in pose_result.pose_world_landmarks[0]
            ],
        }
    for index, landmarks in enumerate(hand_result.hand_landmarks):
        category = hand_result.handedness[index][0]
        frame["hands"].append(
            {
                "landmarks": [_landmark(value) for value in landmarks],
                "worldLandmarks": [
                    _landmark(value) for value in hand_result.hand_world_landmarks[index]
                ],
                "reportedHandedness": str(category.category_name).lower(),
                "handednessScore": round(float(category.score), 6),
            }
        )
    return frame


def _landmark(value: Any) -> dict[str, float]:
    return {
        "x": round(float(value.x), 6),
        "y": round(float(value.y), 6),
        "z": round(float(value.z), 6),
        "visibility": round(float(getattr(value, "visibility", 1.0) or 0.0), 6),
    }


if __name__ == "__main__":
    raise SystemExit(main())

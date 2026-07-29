import { useEffect, useRef } from "react";
import type { LandmarkFrame, NormalizedLandmark } from "../../vision/landmarkTypes";

const POSE_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [7, 8],
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
];

type LandmarkPreviewProps = {
  frame: LandmarkFrame | null;
  showPose: boolean;
  showHands: boolean;
};

export function LandmarkPreview({
  frame,
  showPose,
  showHands,
}: LandmarkPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    drawBackdrop(context, canvas.width, canvas.height);
    if (showPose && frame?.pose) {
      drawLandmarks(
        context,
        frame.pose.landmarks,
        POSE_CONNECTIONS,
        "#f3cc7e",
        canvas.width,
        canvas.height,
      );
    }
    if (showHands && frame) {
      for (const hand of frame.hands) {
        drawLandmarks(
          context,
          hand.landmarks,
          HAND_CONNECTIONS,
          "#79d6bc",
          canvas.width,
          canvas.height,
        );
      }
    }
  }, [frame, showHands, showPose]);

  return (
    <div className="landmark-preview">
      <canvas
        aria-label="Simulated pose and hand landmark preview"
        height={540}
        ref={canvasRef}
        width={960}
      />
      <span className="simulation-badge">Simulated data</span>
      {!frame && (
        <div className="landmark-preview-empty">
          <strong>Landmark stream is stopped</strong>
          <p>Start the simulator to verify the M2 contracts and diagnostics.</p>
        </div>
      )}
    </div>
  );
}

function drawBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#08050d";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(243, 204, 126, 0.08)";
  context.lineWidth = 1;
  for (let x = 0; x <= width; x += width / 12) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += height / 8) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function drawLandmarks(
  context: CanvasRenderingContext2D,
  landmarks: readonly NormalizedLandmark[],
  connections: ReadonlyArray<readonly [number, number]>,
  color: string,
  width: number,
  height: number,
): void {
  context.strokeStyle = color;
  context.lineWidth = 3;
  for (const [fromIndex, toIndex] of connections) {
    const from = landmarks[fromIndex];
    const to = landmarks[toIndex];
    if (!from || !to) {
      continue;
    }
    context.beginPath();
    context.moveTo(from.x * width, from.y * height);
    context.lineTo(to.x * width, to.y * height);
    context.stroke();
  }

  context.fillStyle = color;
  for (const landmark of landmarks) {
    context.beginPath();
    context.arc(landmark.x * width, landmark.y * height, 4, 0, Math.PI * 2);
    context.fill();
  }
}

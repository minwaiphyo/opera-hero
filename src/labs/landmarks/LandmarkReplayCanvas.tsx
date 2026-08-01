import { useEffect, useRef } from "react";
import { renderLandmarkFrame } from "../../vision/renderLandmarkFrame";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";

export function LandmarkReplayCanvas({
  frame,
}: {
  frame: VisionLandmarkFrame | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d") ?? null;
    if (!context) {
      return;
    }
    if (!frame) {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      return;
    }
    renderLandmarkFrame(frame, context);
  }, [frame]);

  return (
    <canvas
      aria-label="Landmark replay canvas"
      className="landmark-replay-canvas"
      height={720}
      ref={canvasRef}
      width={1280}
    />
  );
}

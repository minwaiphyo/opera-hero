/**
 * The Opera Hero game. Route: `/game`.
 *
 * Runs the real pipeline end to end — the booth camera opens on load, the vision worker
 * tracks the visitor, pressing Start begins a session, and the approved capture policy
 * and gesture evaluators produce the score. There is no simulated mode.
 */

import { useRef } from "react";
import "./gameplay.css";
import { VisitorMirror } from "./runtime/VisitorMirror";
import { useGameRuntime } from "./runtime/useGameRuntime";
import { GameShell } from "./ui/GameShell";

export function GamePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { view, actions, camera, read, tracking } = useGameRuntime(videoRef);

  return (
    <>
      {/*
        A single hidden video element is the source for both the vision worker and the
        on-screen mirror. It runs on every screen, including attract, so the visitor can
        see themselves before they commit and tracking is warm the moment they press
        Start. Its frames are never recorded or uploaded.
      */}
      <video
        aria-hidden="true"
        autoPlay
        className="camera-source"
        muted
        playsInline
        ref={videoRef}
      />
      <GameShell
        actions={actions}
        cameraStage={<VisitorMirror read={read} videoRef={videoRef} />}
        status={
          <p className="camera-state" data-ready={camera.ready && tracking}>
            <span aria-hidden="true" />
            {cameraLabel(camera.ready, tracking, camera.failure !== null)}
          </p>
        }
        view={view}
      />
    </>
  );
}

/** Plain-language camera state, so it is never a mystery whether the booth can see you. */
function cameraLabel(ready: boolean, tracking: boolean, failed: boolean): string {
  if (failed && !ready) {
    return "Camera unavailable";
  }
  if (!ready) {
    return "Starting camera…";
  }
  return tracking ? "Camera live" : "Loading tracking…";
}

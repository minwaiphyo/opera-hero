import { useEffect, useRef } from "react";
import type { CameraSession, CameraStatus } from "../../camera/cameraTypes";
import { usePoseOverlay, type PoseOverlayStatus } from "./usePoseOverlay";

type CameraPreviewProps = {
  session: CameraSession | null;
  status: CameraStatus;
  onVideoElement?: (element: HTMLVideoElement | null) => void;
};

export function CameraPreview({
  session,
  status,
  onVideoElement,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseStatus = usePoseOverlay(videoRef, canvasRef, Boolean(session));

  useEffect(() => {
    onVideoElement?.(videoRef.current);
    return () => onVideoElement?.(null);
  }, [onVideoElement]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.srcObject = session?.stream ?? null;
    if (session) {
      void video.play().catch(() => undefined);
    }

    return () => {
      video.srcObject = null;
    };
  }, [session]);

  return (
    <div className={`lab-camera-preview ${session ? "active" : status}`}>
      <video
        aria-label="Camera laboratory live preview"
        autoPlay
        muted
        playsInline
        ref={videoRef}
      />
      <canvas aria-hidden="true" className="pose-overlay" ref={canvasRef} />
      {session && (
        <span className={`pose-badge ${poseStatus}`}>
          {poseMessage(poseStatus)}
        </span>
      )}
      {!session && (
        <div className="lab-camera-empty">
          <span aria-hidden="true" />
          <strong>{previewTitle(status)}</strong>
          <p>{previewMessage(status)}</p>
        </div>
      )}
      {session && <span className="live-badge">Live · local only</span>}
    </div>
  );
}

function poseMessage(status: PoseOverlayStatus): string {
  if (status === "loading") {
    return "Pose model loading";
  }
  if (status === "tracking") {
    return "Pose overlay on";
  }
  if (status === "error") {
    return "Pose model failed";
  }
  return "Pose overlay off";
}

function previewTitle(status: CameraStatus): string {
  if (status === "requesting-permission") {
    return "Waiting for permission";
  }
  if (status === "starting") {
    return "Starting camera";
  }
  if (status === "interrupted") {
    return "Camera interrupted";
  }
  if (status === "error") {
    return "Camera unavailable";
  }
  return "Preview is stopped";
}

function previewMessage(status: CameraStatus): string {
  if (status === "requesting-permission") {
    return "Respond to the browser camera prompt.";
  }
  if (status === "interrupted") {
    return "The active camera ended or was disconnected.";
  }
  if (status === "error") {
    return "Review the diagnostic message and retry when ready.";
  }
  return "Choose a camera and start the stream when ready.";
}

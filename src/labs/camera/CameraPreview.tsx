import { useEffect, useRef } from "react";
import type { CameraSession, CameraStatus } from "../../camera/cameraTypes";

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
      {session && (
        <>
          <div className="framing-guide" aria-hidden="true">
            <div className="framing-head" />
            <div className="framing-shoulders" />
            <div className="framing-hand framing-hand-left" />
            <div className="framing-hand framing-hand-right" />
            <span>Position head, shoulders and hands inside the guide</span>
          </div>
          <span className="guide-badge">Positioning guide</span>
        </>
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

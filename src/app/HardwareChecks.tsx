import { useEffect, useRef, useState } from "react";

type CameraState =
  | "idle"
  | "requesting"
  | "active"
  | "stopped"
  | "denied"
  | "unavailable"
  | "error";

type AudioState = "idle" | "playing" | "passed" | "error";

const cameraMessages: Record<CameraState, string> = {
  idle: "Camera access has not been requested.",
  requesting: "Waiting for Chrome camera permission…",
  active: "Live preview active. Confirm the image and camera indicator.",
  stopped: "Camera stopped. Confirm the camera indicator has switched off.",
  denied: "Camera permission was denied. Allow it in Chrome site settings and retry.",
  unavailable: "No usable camera was found, or another application is using it.",
  error: "The camera could not be started. Check Chrome and Windows camera settings.",
};

export function HardwareChecks() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraLabel, setCameraLabel] = useState("Integrated camera expected");
  const [audioState, setAudioState] = useState<AudioState>("idle");

  const stopCamera = () => {
    const stream = streamRef.current;
    stream?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraState("stopped");
  };

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void audioContextRef.current?.close();
    },
    [],
  );

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable");
      return;
    }

    setCameraState("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack?.label) {
        setCameraLabel(videoTrack.label);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState("active");
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";

      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraState("denied");
      } else if (
        name === "NotFoundError" ||
        name === "NotReadableError" ||
        name === "OverconstrainedError"
      ) {
        setCameraState("unavailable");
      } else {
        setCameraState("error");
      }
    }
  };

  const testAudio = async () => {
    setAudioState("playing");

    try {
      await audioContextRef.current?.close();
      const AudioContextConstructor =
        window.AudioContext ??
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextConstructor) {
        setAudioState("error");
        return;
      }

      const context = new AudioContextConstructor();
      audioContextRef.current = context;
      await context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.45);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
      gain.gain.setValueAtTime(0.12, now + 0.38);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.62);

      oscillator.addEventListener(
        "ended",
        () => {
          void context.close();
          if (audioContextRef.current === context) {
            audioContextRef.current = null;
          }
          setAudioState("passed");
        },
        { once: true },
      );
    } catch {
      setAudioState("error");
    }
  };

  return (
    <section aria-labelledby="hardware-check-title">
      <div className="section-heading">
        <div>
          <p className="section-number">03</p>
          <h2 id="hardware-check-title">Manual hardware checks</h2>
        </div>
        <span className="tag">Local only</span>
      </div>

      <div className="hardware-grid">
        <article className="hardware-card">
          <div className="check-header">
            <div>
              <p className="check-kicker">Camera permission</p>
              <h3>{cameraLabel}</h3>
            </div>
            <span className={`check-state ${cameraState}`}>{cameraState}</span>
          </div>

          <div className={`camera-preview ${cameraState}`}>
            <video
              aria-label="Integrated camera preview"
              autoPlay
              muted
              playsInline
              ref={videoRef}
            />
            {cameraState !== "active" && (
              <div className="camera-placeholder" aria-hidden="true">
                <span />
                <p>Camera preview</p>
              </div>
            )}
          </div>

          <p className="check-message" role="status">
            {cameraMessages[cameraState]}
          </p>

          <div className="button-row">
            <button
              className="primary-button"
              disabled={
                cameraState === "requesting" || cameraState === "active"
              }
              onClick={() => void startCamera()}
              type="button"
            >
              {cameraState === "stopped" ? "Start camera again" : "Test camera"}
            </button>
            <button
              className="secondary-button"
              disabled={cameraState !== "active"}
              onClick={stopCamera}
              type="button"
            >
              Stop camera
            </button>
          </div>

          <p className="privacy-note">
            Video stays in this browser tab. It is not recorded, uploaded, or
            stored.
          </p>
        </article>

        <article className="hardware-card audio-card">
          <div className="check-header">
            <div>
              <p className="check-kicker">Audio output</p>
              <h3>Local two-note tone</h3>
            </div>
            <span className={`check-state ${audioState}`}>{audioState}</span>
          </div>

          <div className={`audio-visualizer ${audioState}`} aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => (
              <span key={index} />
            ))}
          </div>

          <p className="check-message" role="status">
            {audioState === "idle" &&
              "Use the button to verify the intended laptop speakers."}
            {audioState === "playing" && "Playing a short local tone…"}
            {audioState === "passed" &&
              "Tone finished. Confirm that you heard it clearly."}
            {audioState === "error" &&
              "Audio could not play. Check mute, volume, and output-device settings."}
          </p>

          <div className="button-row">
            <button
              className="primary-button"
              disabled={audioState === "playing"}
              onClick={() => void testAudio()}
              type="button"
            >
              {audioState === "passed" ? "Play tone again" : "Test audio"}
            </button>
          </div>

          <p className="privacy-note">
            The tone is synthesized locally and uses no downloaded audio file.
          </p>
        </article>
      </div>
    </section>
  );
}

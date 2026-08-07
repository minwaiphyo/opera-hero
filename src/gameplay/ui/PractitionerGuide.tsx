/**
 * The practitioner's demonstration.
 *
 * Plays the movement the visitor is about to be scored against. The clip and its trim
 * come from the same take the gesture's committed reference was derived from — see
 * `scripts/build_practitioner_guides.mjs`, which cuts `public/guides/<gesture-id>.mp4`
 * and reads the length out of the reference itself, so no duration is restated here.
 *
 * The props are the whole contract:
 *
 *   gestureId   which movement to show
 *   playing     whether it should be running
 *   restartKey  changes per attempt; playback returns to the top of the movement
 *
 * The clips are committed under `public/guides/`, so a fresh checkout can run the booth
 * without the restricted source footage. The fallback below stays regardless: if a file
 * is ever missing or unplayable the frame shows the gesture glyph rather than an empty
 * rectangle, and the game stays playable — the movement's written steps are on the learn
 * screen either way.
 */

import { useEffect, useRef, useState } from "react";
import { COPY, gestureFor, type Gesture } from "../content";
import type { GestureId } from "../contract";
import { GestureGlyph } from "./components/Ornaments";

export type PractitionerGuideProps = {
  gestureId: GestureId;
  playing: boolean;
  restartKey: string | null;
  /** `full` for the learn screen, `compact` beside the visitor during an attempt. */
  size?: "full" | "compact";
};

export function PractitionerGuide({
  gestureId,
  playing,
  restartKey,
  size = "full",
}: PractitionerGuideProps) {
  const gesture: Gesture = gestureFor(gestureId);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Which gesture's video failed, rather than a flag to reset: each gesture is a separate
  // file, so a missing one says nothing about the next.
  const [failedGesture, setFailedGesture] = useState<GestureId | null>(null);
  const available = failedGesture !== gestureId;
  const source = `/guides/${gestureId}.mp4`;

  // Every attempt starts at the top of the movement, not wherever the loop had reached.
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
    }
  }, [restartKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (playing) {
      // Muted, so autoplay is permitted; a rejection still must not reach the visitor.
      const started: Promise<void> | undefined = video.play();
      if (started) {
        void started.catch(() => undefined);
      }
      return;
    }
    video.pause();
  }, [playing, gestureId]);

  return (
    <figure className={`guide guide--${size}`}>
      <div className={`guide-frame accent-${gesture.accent}`}>
        {available ? (
          <video
            aria-label={`${gesture.name} demonstration`}
            autoPlay={playing}
            className="guide-video"
            loop
            muted
            onError={() => {
              console.warn(
                `Practitioner guide missing at ${source}. ` +
                  "Run: node scripts/build_practitioner_guides.mjs",
              );
              setFailedGesture(gestureId);
            }}
            playsInline
            poster={`/guides/${gestureId}.jpg`}
            ref={videoRef}
            src={source}
          />
        ) : (
          <div className="guide-placeholder">
            <GestureGlyph
              className="guide-glyph"
              motif={gesture.motif}
              playing={playing}
            />
            <p className="guide-placeholder-title" lang="zh-Hant">
              {gesture.chinese}
            </p>
            <p className="guide-placeholder-note">{COPY.guideUnavailable}</p>
          </div>
        )}
        <span aria-hidden="true" className="guide-corner guide-corner--tl" />
        <span aria-hidden="true" className="guide-corner guide-corner--tr" />
        <span aria-hidden="true" className="guide-corner guide-corner--bl" />
        <span aria-hidden="true" className="guide-corner guide-corner--br" />
      </div>
      <figcaption className="guide-caption">{gesture.name}</figcaption>
    </figure>
  );
}

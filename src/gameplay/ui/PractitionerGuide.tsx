/**
 * The practitioner's demonstration.
 *
 * PLACEHOLDER — the real footage is being filmed and will be supplied separately.
 *
 * ── Swapping in the real video ────────────────────────────────────────────────
 * The props below are the whole contract, so replacing this is a one-file change:
 *
 *   gestureId   which movement to show
 *   playing     whether it should be running
 *   restartKey  changes per attempt; restart playback from the top when it does
 *
 * Drop the file in `public/guides/<gesture-id>.mp4`, then replace the placeholder
 * body with:
 *
 *   <video
 *     autoPlay={playing}
 *     className="guide-video"
 *     loop
 *     muted
 *     playsInline
 *     ref={videoRef}                       // seek to 0 when restartKey changes
 *     src={`/guides/${gestureId}.mp4`}
 *   />
 *
 * Keep the surrounding frame, the caption and the step list: they are sized for
 * reading at one to two metres and the layout depends on the aspect ratio being
 * held by `.guide-frame`.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { gestureFor, type Gesture } from "../content";
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
  size = "full",
}: PractitionerGuideProps) {
  const gesture: Gesture = gestureFor(gestureId);

  return (
    <figure className={`guide guide--${size}`}>
      <div className={`guide-frame accent-${gesture.accent}`}>
        <div className="guide-placeholder">
          <GestureGlyph className="guide-glyph" motif={gesture.motif} playing={playing} />
          <p className="guide-placeholder-title" lang="zh-Hant">
            {gesture.chinese}
          </p>
          <p className="guide-placeholder-note">Practitioner video coming soon</p>
        </div>
        <span aria-hidden="true" className="guide-corner guide-corner--tl" />
        <span aria-hidden="true" className="guide-corner guide-corner--tr" />
        <span aria-hidden="true" className="guide-corner guide-corner--bl" />
        <span aria-hidden="true" className="guide-corner guide-corner--br" />
      </div>
      <figcaption className="guide-caption">{gesture.name}</figcaption>
    </figure>
  );
}

/**
 * The visitor screens.
 *
 * All presentational: they take props and emit callbacks, and import nothing from the
 * camera, the vision worker, or the gesture evaluators. `cameraStage` is a slot, so no
 * screen ever touches a video frame.
 *
 * Every screen shows the visitor their own live image. In an unmanned booth that mirror
 * is what proves the stage is awake and what tells people where to stand.
 */

import type { ReactNode } from "react";
import {
  bandFor,
  COPY,
  gestureFor,
  RECOVERY,
  UNSEEN,
  type Gesture,
} from "../content";
import type { GameScore, GameView, TrackingPrompt } from "../contract";
import { CloudRule, GestureGlyph } from "./components/Ornaments";
import { Button, Meter, ScoreDial, TrackingHint } from "./components/Pieces";
import { PractitionerGuide } from "./PractitionerGuide";

/** The visitor's mirror, framed as a moon gate. */
export function Mirror({
  children,
  label,
  size = "full",
  badge,
}: {
  children: ReactNode;
  label?: string;
  size?: "full" | "compact";
  badge?: ReactNode;
}) {
  return (
    <div className={`mirror mirror--${size}`}>
      <div className="mirror-gate">
        <div aria-hidden="true" className="mirror-ring" />
        {children}
        {badge}
      </div>
      {label ? <p className="mirror-label">{label}</p> : null}
    </div>
  );
}

export function AttractScreen({
  cameraStage,
  onStart,
}: {
  cameraStage: ReactNode;
  onStart: () => void;
}) {
  return (
    <section className="screen screen--attract" aria-labelledby="title">
      <div className="attract-copy">
        <p className="eyebrow">{COPY.subtitle}</p>
        <h1 className="title" id="title">
          {COPY.title}
        </h1>
        <p className="title-chinese" lang="zh-Hant">
          {COPY.chineseTitle}
        </p>
        <p className="lede">{COPY.intro}</p>
        <p className="invitation">
          <span>{COPY.invitation}</span>
          <span lang="zh-Hant">{COPY.chineseInvitation}</span>
        </p>
        <Button label={COPY.start} onClick={onStart} />
        <p className="privacy">{COPY.privacy}</p>
      </div>
      <Mirror label={COPY.mirrorLabel}>{cameraStage}</Mirror>
    </section>
  );
}

export function LearnScreen({
  gesture,
  attemptKey,
  cameraStage,
  prompt,
  onReady,
}: {
  gesture: Gesture;
  attemptKey: string | null;
  cameraStage: ReactNode;
  prompt: TrackingPrompt;
  onReady: () => void;
}) {
  return (
    <section
      className={`screen screen--learn accent-${gesture.accent}`}
      aria-labelledby="title"
    >
      {/*
        Everything about the movement lives in the left column — its name, the
        demonstration, the steps — which leaves the whole height of the right column to
        the visitor's own image. This is the screen where somebody works out where to
        stand, so that image is the largest thing on it.
      */}
      <div className="learn-panes">
        <div className="learn-pane learn-pane--guide">
          <header className="learn-head">
            <p className="eyebrow">
              <span lang="zh-Hant">{gesture.act}</span> · {COPY.watchLabel}
            </p>
            <h1 className="title title--compact" id="title">
              {gesture.name}
              <span lang="zh-Hant">{gesture.chinese}</span>
            </h1>
            <p className="lede">{gesture.meaning}</p>
          </header>

          <PractitionerGuide gestureId={gesture.id} playing restartKey={attemptKey} />

          <ol className="steps">
            {gesture.steps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>

          <div className="learn-cues">
            <TrackingHint prompt={prompt} />
            <Button autoFocus label={COPY.ready} onClick={onReady} />
          </div>
        </div>

        <div className="learn-pane">
          <Mirror label={COPY.mirrorLabel}>{cameraStage}</Mirror>
        </div>
      </div>
    </section>
  );
}

/**
 * Countdown and attempt share one layout so nothing moves under the visitor when capture
 * begins. Guide, mirror, countdown and cue are all visible without scrolling.
 */
export function PerformScreen({
  gesture,
  view,
  cameraStage,
  onStop,
}: {
  gesture: Gesture;
  view: GameView;
  cameraStage: ReactNode;
  onStop: () => void;
}) {
  const recording = view.screen === "attempt";

  return (
    <section
      className={`screen screen--perform accent-${gesture.accent}`}
      aria-labelledby="title"
      data-phase={view.screen}
    >
      {/*
        The heading sits with the guide rather than above both panes, and the cancel
        action is lifted out of the flow. Every row of chrome across the screen comes
        straight off the height of the visitor's own image, which is what they are
        actually watching while they perform.
      */}
      <div className="perform-panes">
        <div className="perform-pane perform-pane--guide">
          <header className="perform-head">
            <h1 className="title title--compact" id="title">
              {gesture.name}
              <span lang="zh-Hant">{gesture.chinese}</span>
            </h1>
            <p className="lede">{gesture.steps[0]}</p>
          </header>

          <PractitionerGuide
            gestureId={gesture.id}
            playing
            restartKey={view.attemptKey}
            size="compact"
          />
        </div>
        <div className="perform-pane">
          <Mirror
            badge={
              recording ? (
                <p className="recording">
                  <span aria-hidden="true" />
                  {COPY.recording}
                </p>
              ) : null
            }
            label={COPY.mirrorLabel}
          >
            {cameraStage}
          </Mirror>
        </div>
      </div>

      {view.countdownSeconds !== null ? (
        <div
          aria-live="assertive"
          className="countdown"
          data-testid="countdown"
          role="status"
        >
          <strong key={view.countdownSeconds}>{view.countdownSeconds}</strong>
          <span lang="zh-Hant">{COPY.countdownCue}</span>
          <em>{COPY.countdownHint}</em>
        </div>
      ) : null}

      {view.trackingPrompt !== "ready" ? (
        <div className="perform-hint">
          <TrackingHint prompt={view.trackingPrompt} />
        </div>
      ) : null}

      <div className="perform-foot">
        <Button label={COPY.stop} onClick={onStop} variant="quiet" />
      </div>
    </section>
  );
}

/**
 * The result.
 *
 * Two rules: no pass mark anywhere, and insufficient tracking is never shown as poor
 * performance — when we could not see the visitor we say so and offer another go.
 */
export function ResultScreen({
  gesture,
  score,
  lastLevel,
  cameraStage,
  onNext,
  onRetry,
}: {
  gesture: Gesture;
  score: GameScore | null;
  lastLevel: boolean;
  cameraStage: ReactNode;
  onNext: () => void;
  onRetry: () => void;
}) {
  if (!score || score.trackingStatus === "insufficient") {
    return (
      <section className="screen screen--unseen" aria-labelledby="title">
        <GestureGlyph className="unseen-glyph" motif={gesture.motif} />
        <h1 className="title title--compact" id="title">
          {UNSEEN.title}
        </h1>
        <p className="title-chinese" lang="zh-Hant">
          {UNSEEN.chinese}
        </p>
        <p className="lede">{UNSEEN.body}</p>
        <Mirror label={COPY.mirrorLabel} size="compact">
          {cameraStage}
        </Mirror>
        <div className="row">
          <Button autoFocus label={COPY.retry} onClick={onRetry} />
          <Button label={lastLevel ? COPY.finish : COPY.next} onClick={onNext} variant="secondary" />
        </div>
      </section>
    );
  }

  const band = bandFor(score.overallScore);

  return (
    <section
      className={`screen screen--result accent-${gesture.accent}`}
      aria-labelledby="title"
    >
      <header className="result-head">
        <p className="eyebrow">
          <span lang="zh-Hant">{gesture.act}</span> · {gesture.name}
        </p>
        <h1 className="title title--compact" id="title">
          {band.label}
        </h1>
      </header>

      <ScoreDial chinese={band.chinese} label={COPY.scoreLabel} score={score.overallScore} />

      <div className="result-detail">
        <p className="lede">{band.body}</p>
        <Meter label={COPY.completenessLabel} value={score.movementCompleteness} />
        <Meter
          label={COPY.coverageLabel}
          tone={score.trackingStatus === "limited" ? "cinnabar" : "jade"}
          value={score.trackingCoverage}
        />
        <p className="note">{gesture.note}</p>
        <p className="note note--quiet">{COPY.supportive}</p>
        <div className="row">
          <Button autoFocus label={lastLevel ? COPY.finish : COPY.next} onClick={onNext} />
          <Button label={COPY.retry} onClick={onRetry} variant="secondary" />
        </div>
      </div>
    </section>
  );
}

export function CompleteScreen({
  cameraStage,
  onFinish,
}: {
  cameraStage: ReactNode;
  onFinish: () => void;
}) {
  return (
    <section className="screen screen--complete" aria-labelledby="title">
      <div className="complete-copy">
        <h1 className="title" id="title">
          {COPY.completeTitle}
        </h1>
        <p className="title-chinese" lang="zh-Hant">
          {COPY.completeChinese}
        </p>
        <p className="lede">{COPY.completeBody}</p>
        <ul className="performed">
          {[1, 2, 3].map((level) => {
            const gesture = gestureFor(
              level === 1 ? "orchid-finger" : level === 2 ? "opening-door" : "water-sleeves",
            );
            return (
              <li className={`accent-${gesture.accent}`} key={gesture.id}>
                <GestureGlyph className="performed-glyph" motif={gesture.motif} />
                <strong>{gesture.name}</strong>
                <span lang="zh-Hant">{gesture.chinese}</span>
              </li>
            );
          })}
        </ul>
        <Button autoFocus label={COPY.finish} onClick={onFinish} />
      </div>
      <Mirror label={COPY.mirrorLabel} size="compact">
        {cameraStage}
      </Mirror>
    </section>
  );
}

/** The single visitor-facing failure surface. Raw errors never reach it. */
export function RecoveryScreen({
  message,
  prompt,
  cameraStage,
  onRetry,
  onQuit,
}: {
  message: string | null;
  prompt: TrackingPrompt;
  cameraStage: ReactNode;
  onRetry: () => void;
  onQuit: () => void;
}) {
  return (
    <section className="screen screen--recovery" aria-labelledby="title">
      <div className="recovery-panel">
        <CloudRule className="recovery-rule" />
        <h1 className="title title--compact" id="title">
          {RECOVERY.title}
        </h1>
        <p className="title-chinese" lang="zh-Hant">
          {RECOVERY.chinese}
        </p>
        <p className="lede">{message ?? RECOVERY.body}</p>
        {prompt !== "ready" ? <TrackingHint prompt={prompt} /> : null}
        <div className="row">
          <Button autoFocus label={RECOVERY.retry} onClick={onRetry} />
          <Button label={RECOVERY.quit} onClick={onQuit} variant="secondary" />
        </div>
      </div>
      <Mirror label={COPY.mirrorLabel} size="compact">
        {cameraStage}
      </Mirror>
    </section>
  );
}

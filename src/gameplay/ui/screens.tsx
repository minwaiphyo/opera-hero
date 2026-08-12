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
  finaleFor,
  GESTURES,
  RECOVERY,
  UNSEEN,
  type Gesture,
} from "../content";
import type { GameScore, GameView, GestureId, TrackingPrompt } from "../contract";
import { CloudRule, GestureGlyph } from "./components/Ornaments";
import { Button, ScoreDial, TrackingHint } from "./components/Pieces";
import { PractitionerGuide } from "./PractitionerGuide";

/** The visitor's mirror, framed as a moon gate. */
export function Mirror({
  children,
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
    </div>
  );
}

export function AttractScreen({
  cameraStage,
  onStart,
  onTutorial,
}: {
  cameraStage: ReactNode;
  onStart: () => void;
  onTutorial: () => void;
}) {
  return (
    <section className="screen screen--attract" aria-labelledby="title">
      <div className="attract-copy">
        <h1 className="attract-wordmark" id="title">
          {COPY.title}
          <span lang="zh-Hant">{COPY.chineseTitle}</span>
        </h1>
        <p className="attract-subtitle">{COPY.subtitle}</p>
        <p className="invitation">{COPY.invitation}</p>
        <div className="menu-actions">
          <Button autoFocus label={COPY.start} onClick={onStart} />
          <Button label={COPY.howToPlay} onClick={onTutorial} variant="secondary" />
        </div>
        <p className="privacy">{COPY.privacy}</p>
      </div>
      <Mirror label={COPY.mirrorLabel}>{cameraStage}</Mirror>
    </section>
  );
}

export function CalibrationScreen({
  cameraStage,
  progress,
  prompt,
  onCancel,
}: {
  cameraStage: ReactNode;
  progress: number;
  prompt: TrackingPrompt;
  onCancel: () => void;
}) {
  const positioned = prompt === "ready";
  return (
    <section className="screen screen--calibration" aria-labelledby="title">
      <header className="calibration-head">
        <p className="eyebrow">Before you perform</p>
        <h1 className="title title--compact" id="title">Find your stage position</h1>
        <p className="lede">
          Make sure your full upper body and arms fit comfortably in the mirror.
        </p>
      </header>

      <div className="calibration-stage">
        <Mirror label={COPY.mirrorLabel}>{cameraStage}</Mirror>
        <div className="calibration-direction">
          {positioned ? (
            <div aria-live="polite" className="calibration-hold" role="status">
              <strong>Stand still</strong>
              <span>Hold your position while we prepare the stage.</span>
              <div aria-hidden="true" className="calibration-progress">
                <span style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </div>
          ) : (
            <TrackingHint prompt={prompt} />
          )}
        </div>
      </div>

      <div className="calibration-action">
        <Button label={COPY.stop} onClick={onCancel} variant="quiet" />
      </div>
    </section>
  );
}

/**
 * The tutorial: a preview of all three movements before the visitor commits.
 *
 * No camera stage and no scoring here — this screen is read and watched, not performed.
 * Each movement shows its demonstration and its three steps, exactly as they will appear
 * in the game itself, so nothing about the performance is a surprise.
 */
export function TutorialScreen({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <section className="screen screen--tutorial" aria-labelledby="title">
      <header className="tutorial-head">
        <h1 className="title title--compact" id="title">
          {COPY.tutorialTitle}
        </h1>
        <ol className="tutorial-howto">
          {COPY.tutorialSteps.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </header>

      <ol className="tutorial-movements">
        {GESTURES.map((gesture) => (
          <li className={`tutorial-movement accent-${gesture.accent}`} key={gesture.id}>
            <header className="tutorial-movement-head">
              <h2 className="title title--compact">
                {gesture.name}
                <span lang="zh-Hant">{gesture.chinese}</span>
              </h2>
            </header>
            <PractitionerGuide
              gestureId={gesture.id}
              playing
              restartKey={gesture.id}
              size="compact"
            />
            <ol className="steps">
              {gesture.steps.map((step, index) => (
                <li key={step}>
                  <span aria-hidden="true">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>

      <div className="row tutorial-actions">
        <Button autoFocus label={COPY.playNow} onClick={onStart} />
        <Button label={COPY.back} onClick={onBack} variant="secondary" />
      </div>
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
      <header className="play-toolbar">
        <h1 className="title title--compact" id="title">
          {gesture.name}
          <span lang="zh-Hant">{gesture.chinese}</span>
        </h1>
      </header>

      <div className="play-hint">
        <TrackingHint prompt={prompt} />
      </div>

      <div className="learn-panes">
        <div className="learn-pane learn-pane--guide">
          <PractitionerGuide gestureId={gesture.id} playing restartKey={attemptKey} />

          <ol className="steps">
            {gesture.steps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>

        </div>

        <div className="learn-pane learn-pane--mirror">
          <Mirror label={COPY.mirrorLabel}>{cameraStage}</Mirror>
          <div className="mirror-action">
            <Button autoFocus label={COPY.ready} onClick={onReady} />
          </div>
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
      <header className="play-toolbar">
        <h1 className="title title--compact" id="title">
          {gesture.name}
          <span lang="zh-Hant">{gesture.chinese}</span>
        </h1>
      </header>

      <div className="play-hint">
        <TrackingHint prompt={view.trackingPrompt} />
      </div>

      <div className="perform-panes">
        <div className="perform-pane perform-pane--guide">
          <PractitionerGuide
            gestureId={gesture.id}
            playing={recording}
            restartKey={view.attemptKey}
            size="compact"
          />
          <ol className="steps">
            {gesture.steps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="perform-pane perform-pane--mirror">
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
          <div className="mirror-action">
            <Button label={COPY.stop} onClick={onStop} variant="quiet" />
          </div>
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
        <aside className="cultural-insight">
          <p className="eyebrow">Behind the movement</p>
          <strong>{gesture.meaning}</strong>
          <p>{gesture.note}</p>
        </aside>
        <div className="row">
          <Button autoFocus label={lastLevel ? COPY.finish : COPY.next} onClick={onNext} />
          <Button label={COPY.retry} onClick={onRetry} variant="secondary" />
        </div>
      </div>
    </section>
  );
}

/**
 * The curtain call. No mirror: the performance is over, and the last thing the visitor
 * should be looking at is the three movements they just performed, not themselves.
 */
export function CompleteScreen({
  onFinish,
  scores,
}: {
  onFinish: () => void;
  scores: Partial<Record<GestureId, GameScore>>;
}) {
  const values = GESTURES.flatMap((gesture) => {
    const score = scores[gesture.id];
    return score ? [score.overallScore] : [];
  });
  const average = values.length > 0
    ? values.reduce((sum, score) => sum + score, 0) / values.length
    : 0;
  const finale = finaleFor(average);

  return (
    <section className="screen screen--complete" aria-labelledby="title">
      <div className="complete-copy">
        <h1 className="title" id="title">
          {COPY.completeTitle}
        </h1>
        <p className="title-chinese" lang="zh-Hant">
          {COPY.completeChinese}
        </p>
        <div className="finale-message">
          <strong>{finale.title}</strong>
          {finale.body ? <p>{finale.body}</p> : null}
        </div>
        <ul className="performed">
          {GESTURES.map((gesture) => {
            const score = scores[gesture.id];
            return (
              <li className={`accent-${gesture.accent}`} key={gesture.id}>
                <GestureGlyph className="performed-glyph" motif={gesture.motif} />
                <strong>{gesture.name}</strong>
                <span lang="zh-Hant">{gesture.chinese}</span>
                <em>{score ? `${Math.round(score.overallScore * 100)}%` : "—"}</em>
              </li>
            );
          })}
        </ul>
        <Button autoFocus label={COPY.finish} onClick={onFinish} />
      </div>
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
